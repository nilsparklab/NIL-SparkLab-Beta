const fs=require('fs'), vm=require('vm');
const sandbox={window:{},console,JSON,Set,Map,Date,Object,Array,Number,String,Error,Math};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/js/ucdm/ucdm.js','utf8'),sandbox);
const U=sandbox.window.NILSparkLabUCDM;
vm.runInContext(fs.readFileSync(__dirname+'/js/simulation/ucdm-simulation-adapter.js','utf8'),sandbox);
const A=sandbox.window.NILSparkLabUCDMSimulationAdapter;
function assert(x,m){if(!x)throw new Error(m)}
const base={circuitId:'real-builder-shaped',components:[
{id:'v1',type:'source',x:0,y:0,terminals:['+','-'],value:12},
{id:'r1',type:'resistor',x:100,y:0,terminals:['T1','T2'],r:470,value:470}
],wires:[
{id:'w1',from:{compId:'v1',term:'+'},to:{compId:'r1',term:'T1'}},
{id:'w2',from:{compId:'r1',term:'T2'},to:{compId:'v1',term:'-'}}]};
const m=U.fromLegacy(base); const before=JSON.stringify(m);
assert(U.validate(m).valid,'valid circuit rejected');
const input=A.toSimulationInput(m);
assert(input.components.length===2 && input.wires.length===2,'mapping lost data');
assert(input.components[1].r===470,'resistor value lost');
assert(JSON.stringify(m)===before,'UCDM mutated');
const parallel=U.fromLegacy({circuitId:'parallel',components:[...base.components,{id:'r2',type:'resistor',x:100,y:100,terminals:['T1','T2'],r:1000}],wires:[
{id:'w1',from:{compId:'v1',term:'+'},to:{compId:'r1',term:'T1'}},{id:'w2',from:{compId:'v1',term:'+'},to:{compId:'r2',term:'T1'}},{id:'w3',from:{compId:'r1',term:'T2'},to:{compId:'v1',term:'-'}},{id:'w4',from:{compId:'r2',term:'T2'},to:{compId:'v1',term:'-'}}]});
assert(A.compatibility(parallel).supported,'parallel circuit unsupported');
const bad=U.fromLegacy(base); bad.components[0].type='timer_555';
assert(!A.compatibility(bad).supported,'unsupported component accepted');
let threw=false; try{A.toSimulationInput(bad)}catch(e){threw=true} assert(threw,'unsupported conversion did not reject');
console.log('Stage 7 UCDM simulation adapter tests: PASS');

// Verify the real adapter invocation consumes the derived input through the
// existing Builder state bridge, and that the original Builder arrays are restored.
let seen = null;
const originalComponents = [{id:'old',type:'resistor'}];
const originalWires = [{id:'oldw'}];
sandbox.window.ElectroLabBuilderState = {
  _components: originalComponents,
  _wires: originalWires,
  get components(){ return this._components; },
  get wires(){ return this._wires; },
  replace(components,wires){ this._components=components; this._wires=wires; }
};
sandbox.window.runBuilderSim = function(){
  seen = {components:sandbox.window.ElectroLabBuilderState.components, wires:sandbox.window.ElectroLabBuilderState.wires};
  return {ok:true};
};
const beforeRun=JSON.stringify(m);
const ran=A.run(m);
assert(ran.result && ran.result.ok,'existing simulation was not invoked');
assert(seen && seen.components.length===2 && seen.wires.length===2,'derived input did not reach simulation boundary');
assert(seen.components[1].r===470,'derived resistor value did not reach simulation');
assert(sandbox.window.ElectroLabBuilderState.components===originalComponents,'Builder components were not restored');
assert(sandbox.window.ElectroLabBuilderState.wires===originalWires,'Builder wires were not restored');
assert(JSON.stringify(m)===beforeRun,'UCDM mutated during run');
console.log('Stage 7 bridge call-boundary test: PASS');

// Stage 8: explicit simulation contract, deterministic conversion, failure recovery,
// save/load-equivalent round trip, and invalid-input call suppression.
assert(A.contractVersion==='1.0','simulation contract version missing');
const input2=A.toSimulationInput(U.deserialize(U.serialize(m)));
assert(JSON.stringify(input)===JSON.stringify(input2),'adapter output is not deterministic');
assert(input.contractVersion==='1.0' && input.nodes.length>0 && input.ucdmVersion==='1.0','explicit simulation contract incomplete');
assert(A.validateSimulationInput(input).valid,'valid simulation contract rejected');

let calls=0;
const originalRun = sandbox.window.runBuilderSim;
sandbox.window.runBuilderSim=function(){ calls++; return {ok:true}; };
const badModel=U.deserialize(U.serialize(m));
badModel.connections[0].source.pinId='missing-pin';
let badRejected=false;
try{ A.run(badModel); }catch(e){ badRejected=true; }
assert(badRejected,'invalid UCDM was not rejected before simulation');
assert(calls===0,'simulation was called with invalid UCDM');
const invalidValueModel=U.deserialize(U.serialize(m));
invalidValueModel.components[1].value={bad:true};
let invalidValueRejected=false;
try{ A.toSimulationInput(invalidValueModel); }catch(e){ invalidValueRejected=true; }
assert(invalidValueRejected,'invalid component value was not rejected by simulation contract');
sandbox.window.runBuilderSim=originalRun;

const throwComponents=[{id:'stable',type:'resistor'}];
const throwWires=[{id:'stablew'}];
sandbox.window.ElectroLabBuilderState={
  _components:throwComponents,
  _wires:throwWires,
  get components(){return this._components;},
  get wires(){return this._wires;},
  replace(components,wires){this._components=components;this._wires=wires;}
};
sandbox.window.runBuilderSim=function(){ throw new Error('controlled simulation failure'); };
let failureCaught=false;
try{ A.run(m); }catch(e){ failureCaught=true; }
assert(failureCaught,'controlled simulation failure did not propagate safely');
assert(sandbox.window.ElectroLabBuilderState.components===throwComponents,'Builder components not restored after simulation failure');
assert(sandbox.window.ElectroLabBuilderState.wires===throwWires,'Builder wires not restored after simulation failure');
assert(JSON.stringify(m)===beforeRun,'UCDM changed after simulation failure');

let recovered=false;
sandbox.window.runBuilderSim=function(){ recovered=true; return {ok:true}; };
A.run(m);
assert(recovered,'simulation could not be retried after failure');
assert(sandbox.window.ElectroLabBuilderState.components===throwComponents,'Builder state leaked after recovery run');
assert(sandbox.window.ElectroLabBuilderState.wires===throwWires,'Builder wires leaked after recovery run');

// Save/load-equivalent contract preservation: serialize -> deserialize -> adapter.
const roundTripModel=U.deserialize(U.serialize(m));
const roundTripInput=A.toSimulationInput(roundTripModel);
assert(JSON.stringify(roundTripInput)===JSON.stringify(input),'save/load-equivalent simulation contract changed');

// Legacy compatibility: legacy-shaped data must still migrate into valid UCDM.
const legacyMigrated=U.migrate(base);
assert(U.validate(legacyMigrated).valid,'legacy migration no longer reaches valid UCDM');
assert(A.validateSimulationInput(A.toSimulationInput(legacyMigrated)).valid,'legacy-migrated UCDM cannot satisfy simulation contract');

console.log('Stage 8 simulation contract/determinism/recovery tests: PASS');
