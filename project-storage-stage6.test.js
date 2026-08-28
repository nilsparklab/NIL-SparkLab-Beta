// NIL SparkLab Stage 6 — deterministic Project/Storage integration tests.
// Tests the actual UCDM APIs and the storage envelope used by ProjectCore.
const fs = require('fs');
const vm = require('vm');
const ucdmSource = fs.readFileSync(__dirname + '/js/ucdm/ucdm.js','utf8');
const sandbox = { window:{}, console, JSON, Set, Map, Date, Object, Array, Number, String, Error };
vm.createContext(sandbox);
vm.runInContext(ucdmSource, sandbox);
const U = sandbox.window.NILSparkLabUCDM;
const legacy = {
  id:'project_stage6', name:'Stage 6 Circuit', savedAt:'2026-08-28T00:00:00Z',
  circuit:{components:[
    {id:'v1',type:'source',terminals:['+','-'],x:0,y:0,v:12},
    {id:'r1',type:'resistor',terminals:['T1','T2'],x:100,y:0,r:470}
  ],wires:[
    {id:'w1',from:{compId:'v1',term:'+'},to:{compId:'r1',term:'T1'}},
    {id:'w2',from:{compId:'r1',term:'T2'},to:{compId:'v1',term:'-'}}
  ]}, simulation:{status:'normal'}
};
function assert(ok,msg){if(!ok)throw new Error(msg)}
const u = U.migrate(legacy);
assert(U.validate(u).valid,'migrated UCDM invalid');
const envelope = {version:'6.21',name:legacy.name,savedAt:legacy.savedAt,circuit:legacy.circuit,simulation:legacy.simulation,ucdm:JSON.parse(U.serialize(u))};
const stored = JSON.stringify(envelope);
const loaded = JSON.parse(stored);
const canonical = U.deserialize(typeof loaded.ucdm==='string'?loaded.ucdm:JSON.stringify(loaded.ucdm));
const restored = U.toLegacy(canonical);
assert(restored.components.length===2,'component count changed');
assert(restored.wires.length===2,'wire count changed');
assert(restored.components.find(c=>c.id==='r1').r===470,'component property lost');
assert(loaded.name===legacy.name && loaded.savedAt===legacy.savedAt,'project metadata lost');
console.log('Stage 6 project/storage tests: PASS');
