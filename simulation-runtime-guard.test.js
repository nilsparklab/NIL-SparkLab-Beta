const fs=require('fs'), vm=require('vm');
const sandbox={window:{},console,JSON,Set,Map,Object,Array,Number,String,Error,Math};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/js/simulation/simulation-runtime-guard.js','utf8'),sandbox);
const G=sandbox.window.NILSparkLabSimulationRuntimeGuard;
function assert(x,m){if(!x)throw new Error(m)}
const base=[{id:'v1',type:'source',terminals:['+','-'],v:12},{id:'r1',type:'resistor',terminals:['T1','T2'],r:470,value:470}];
const wires=[{id:'w1',from:{compId:'v1',term:'+'},to:{compId:'r1',term:'T1'}},{id:'w2',from:{compId:'r1',term:'T2'},to:{compId:'v1',term:'-'}}];
assert(G.validate(base,wires).valid,'valid circuit rejected');
for(const bad of [
  [{id:'r1',type:'resistor',terminals:['T1','T2'],r:0}],
  [{id:'r1',type:'resistor',terminals:['T1','T2'],r:-1}],
  [{id:'r1',type:'resistor',terminals:['T1','T2'],r:NaN}],
  [{id:'r1',type:'resistor',terminals:['T1','T2'],r:Infinity}],
  [{id:'r1',type:'resistor',terminals:['T1','T2'],r:470},{id:'r1',type:'resistor',terminals:['T1','T2'],r:100}]
]) assert(!G.validate(bad,[]).valid,'invalid numeric/identity input accepted');
assert(!G.validate(base,[{from:{compId:'missing',term:'T1'},to:{compId:'r1',term:'T2'}}]).valid,'invalid wire accepted');
assert(G.validate(base,wires).valid,'deterministic valid input failed');
const a=JSON.stringify(G.validate(base,wires)), b=JSON.stringify(G.validate(base,wires));
assert(a===b,'guard is not deterministic');
console.log('Stage 9 runtime guard tests: PASS');
