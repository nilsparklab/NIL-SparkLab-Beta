const fs=require('fs'),vm=require('vm');
const sandbox={window:{ElectroLabBuilderState:{components:[{id:'v1',type:'source',terminals:['+','-'],x:0,y:0,value:12},{id:'r1',type:'resistor',terminals:['T1','T2'],x:10,y:0,value:1000}],wires:[{id:'w1',from:{compId:'v1',term:'+'},to:{compId:'r1',term:'T1'}},{id:'w2',from:{compId:'r1',term:'T2'},to:{compId:'v1',term:'-'}}]}},console};
vm.createContext(sandbox); vm.runInContext(fs.readFileSync(__dirname+'/js/ucdm/ucdm.js','utf8'),sandbox); const U=sandbox.window.NILSparkLabUCDM; const results=[];
function t(name,fn){try{if(!fn())throw Error('false');results.push([name,'PASS']);}catch(e){results.push([name,'FAIL',e.message]);}}
const legacy={circuitId:'t1',components:[{id:'v1',type:'source',terminals:['+','-'],x:0,y:0,value:12},{id:'r1',type:'resistor',terminals:['T1','T2'],x:10,y:0,value:1000}],wires:[{id:'w1',from:{compId:'v1',term:'+'},to:{compId:'r1',term:'T1'}},{id:'w2',from:{compId:'r1',term:'T2'},to:{compId:'v1',term:'-'}}]};
const m=U.normalize(legacy);
t('creation',()=>!!m&&m.schema==='NIL-SparkLab-UCDM');
t('validation',()=>U.validate(m).valid);
const txt=U.serialize(m); t('serialization',()=>typeof txt==='string'); const d=U.deserialize(txt); t('deserialization',()=>d.circuitId===m.circuitId); t('round-trip',()=>JSON.stringify(d)===JSON.stringify(m));
t('legacy migration',()=>U.validate(U.migrate({version:'5.62',circuit:{components:legacy.components,wires:legacy.wires}})).valid);
t('builder adapter',()=>U.validate(U.fromBuilder()).valid);
t('duplicate component rejected',()=>{try{U.normalize({components:[{id:'x',type:'resistor'},{id:'x',type:'resistor'}],connections:[]});return false}catch(e){return true}});
t('invalid type rejected',()=>{const x=U.normalize({components:[{id:'x',type:'resistor',terminals:['T1','T2']}],connections:[]}); x.components[0].type='not_a_component'; return !U.validate(x).valid});
t('bad pin rejected',()=>{try{U.normalize({components:[{id:'x',type:'resistor',terminals:['T1','T2']}],connections:[{from:{compId:'x',term:'BAD'},to:{compId:'x',term:'T2'}}]});return false}catch(e){return true}});
t('self test',()=>Object.values(U.selfTest()).every(Boolean));
console.table(results); if(results.some(x=>x[1]==='FAIL')) process.exit(1);

// Real-builder-shape and legacy-project compatibility checks.
const realBuilder = {
  components:[
    {id:'c1',name:'9V Battery',terminals:['+ (Pos)','- (Gnd)'],type:'source',v:9,x:20,y:20},
    {id:'c2',name:'Resistor',terminals:['T1','T2'],type:'resistor',r:470,x:180,y:20},
    {id:'c3',name:'Red LED',terminals:['Anode (+)','Cathode (-)'],type:'led',vf:2,x:340,y:20}
  ],
  wires:[
    {id:'w1',from:{compId:'c1',term:'+ (Pos)'},to:{compId:'c2',term:'T1'}},
    {id:'w2',from:{compId:'c2',term:'T2'},to:{compId:'c3',term:'Anode (+)'}},
    {id:'w3',from:{compId:'c3',term:'Cathode (-)'},to:{compId:'c1',term:'- (Gnd)'}}
  ]
};
sandbox.window.ElectroLabBuilderState.components=realBuilder.components;
sandbox.window.ElectroLabBuilderState.wires=realBuilder.wires;
t('real builder shape',()=>U.validate(U.fromBuilder()).valid);
t('real builder round-trip',()=>{const x=U.fromBuilder(), y=U.deserialize(U.serialize(x)); return JSON.stringify(x)===JSON.stringify(y)});
t('legacy metadata preserved',()=>{const x=U.migrate({version:'5.62',name:'Legacy Circuit',savedAt:'2026-08-28T00:00:00Z',circuit:realBuilder}); return x.metadata.name==='Legacy Circuit' && x.metadata.savedAt==='2026-08-28T00:00:00Z' && U.validate(x).valid});
console.table(results); if(results.some(x=>x[1]==='FAIL')) process.exit(1);
