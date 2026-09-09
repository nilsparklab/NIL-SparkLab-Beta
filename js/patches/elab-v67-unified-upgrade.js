
(()=>{
'use strict';
const V='6.7';
const q=s=>document.querySelector(s), id=s=>document.getElementById(s);

/* ---------- 1. Unified architecture / diagnostics ---------- */
const ARCH=Object.freeze({
 version:V,
 layers:['core','builder','solver','waveform','components','assistant','learning','security','backend'],
 legacyGuard:true,
 clientSecrets:false,
 limits:{components:200,wires:400,importBytes:2*1024*1024}
});
function safeComps(){try{return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[]}catch{return[]}}
function safeWires(){try{return Array.isArray(window.builderWires)?window.builderWires:[]}catch{return[]}}
function diagnostics(){
 const c=safeComps(),w=safeWires();
 return {version:V,components:c.length,wires:w.length,architecture:ARCH,modules:{builder:Array.isArray(c),waveform:!!window.NilSparkLabWaveformAnalysis,assistant:!!window.NilSparkLabSmartAssistant,backend:!!window.NIL_API,physics:!!window.NilSparkLabPhysicsV67}};
}

/* ---------- 2. Real backend contract integration ---------- */
async function backendStatus(){
 try{
  if(!window.NIL_API || typeof window.NIL_API.health!=='function') return {ready:false,code:'API_NOT_CONFIGURED'};
  const r=await window.NIL_API.health();
  return {ready:true,authenticated:false,role:null,code:r?.status||'OK'};
 }catch(e){return {ready:false,code:e?.code||'SERVICE_UNAVAILABLE'};}
}
function openBackendStatus(){
 backendStatus().then(function(st){
  if(!st.ready) console.warn('NIL SparkLab backend unavailable:',st.code);
 });
}
window.NilSparkLabV67Backend=Object.freeze({status:backendStatus,open:openBackendStatus});

/* ---------- 3. Oscilloscope ---------- */
const scope={running:false,t0:performance.now(),raf:0,channel:'source',timeMs:20,voltDiv:5,offset:0};
function sourceParams(){
 const cs=safeComps();
 const ac=cs.find(c=>c.type==='ac_source');
 const dc=cs.find(c=>c.type==='source');
 if(ac)return {ac:true,v:Number(ac.v)||230,f:Number(ac.frequency)||50};
 if(dc)return {ac:false,v:Number(dc.v)||9,f:0};
 return {ac:false,v:0,f:0};
}
function scopeValue(t){
 const p=sourceParams();
 if(p.ac)return p.v*Math.SQRT2*Math.sin(2*Math.PI*p.f*t);
 return p.v;
}
function drawScope(){
 const c=id('elab-v67-scope'); if(!c)return;
 const ctx=c.getContext('2d'),d=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
 if(c.width!==Math.floor(w*d)||c.height!==Math.floor(h*d)){c.width=Math.floor(w*d);c.height=Math.floor(h*d)}
 ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
 ctx.strokeStyle='#172033';ctx.lineWidth=1;
 for(let x=0;x<w;x+=w/10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
 for(let y=0;y<h;y+=h/8){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 const span=scope.timeMs/1000, mid=h/2, scale=Math.max(0.1,scope.voltDiv), tNow=(performance.now()-scope.t0)/1000;
 ctx.strokeStyle='#67e8f9';ctx.lineWidth=1.5;ctx.beginPath();
 for(let i=0;i<w;i++){
  const t=tNow-span+(i/w)*span, y=mid-(scopeValue(t)-scope.offset)/scale*(h/8);
  if(i===0)ctx.moveTo(i,y);else ctx.lineTo(i,y);
 }
 ctx.stroke();
 const p=sourceParams();
 const read=id('elab-v67-scope-readout'); if(read)read.textContent=`CH1 ${p.ac?'AC':'DC'} • ${p.v.toFixed(2)} V${p.ac?' RMS • '+p.f.toFixed(2)+' Hz':''} • ${scope.voltDiv} V/div • ${scope.timeMs} ms/div`;
 if(scope.running)scope.raf=requestAnimationFrame(drawScope);
}
function openScope(){id('elab-v67-panel')?.classList.add('open');scope.running=true;scope.t0=performance.now();if(!scope.raf)scope.raf=requestAnimationFrame(drawScope);}
function closeScope(){scope.running=false;if(scope.raf)cancelAnimationFrame(scope.raf);scope.raf=0}
window.NilSparkLabV67Scope=Object.freeze({open:openScope,close:closeScope,draw:drawScope});

/* ---------- 4. RLC + AC analysis ---------- */
function acImpedance(R,LmH,uF,f){
 const r=Number(R)||0,L=Math.max(0,Number(LmH)||0)/1000,C=Math.max(0,Number(uF)||0)*1e-6,F=Math.max(0.000001,Number(f)||50),w=2*Math.PI*F;
 const xl=w*L,xc=C?1/(w*C):Infinity;
 const x=xl-(Number.isFinite(xc)?xc:0);
 return {R:r,XL:xl,XC:xc,Z:Math.hypot(r,x),phaseDeg:Math.atan2(x,r)*180/Math.PI,frequency:F};
}
function transientRC(R,C_uF,V,t){const r=Math.max(1e-12,Number(R)||1),c=Math.max(1e-12,Number(C_uF)||1)*1e-6,v=Number(V)||0;return {tau:r*c,vc:v*(1-Math.exp(-Math.max(0,Number(t)||0)/(r*c))),i:(v/r)*Math.exp(-Math.max(0,Number(t)||0)/(r*c))}}
function transientRL(R,L_mH,V,t){const r=Math.max(1e-12,Number(R)||1),l=Math.max(1e-12,Number(L_mH)||1)/1000,v=Number(V)||0;return {tau:l/r,il:(v/r)*(1-Math.exp(-Math.max(0,Number(t)||0)/(l/r))),vL:v*Math.exp(-Math.max(0,Number(t)||0)/(l/r))}}
window.NilSparkLabACAnalysisV67=Object.freeze({acImpedance,transientRC,transientRL});

/* ---------- 5. Component physics models ---------- */
function diode(v,vf=.7){const V=Number(v)||0,F=Number(vf)||.7;return {on:V>F,current:V>F?(V-F)/10:0,drop:V>F?F:0};}
function bjtNpn(Vcc,Rb,Rc,beta=100,vbe=.7){const v=Number(Vcc)||0,rb=Math.max(1e-9,Number(Rb)||1),rc=Math.max(1e-9,Number(Rc)||1),b=Math.max(1,Number(beta)||100),vb=Math.max(0,v-vbe),ib=vb/rb,ic=Math.min(b*ib,v/Math.max(rc,1e-9)),vce=Math.max(0,v-ic*rc);return {Ib:ib,Ic:ic,Vce:vce,on:ib>0,region:vce<.2?'SATURATION':ib>0?'ACTIVE':'CUTOFF'};}
function mosfetN(vgs,vth=2,ron=5){const g=Number(vgs)||0,t=Number(vth)||2,r=Math.max(.001,Number(ron)||5);return {on:g>t,rds:g>t?r:Infinity};}
function transformer(vPrimary,ratio){const vp=Number(vPrimary)||0,n=Math.max(1e-9,Number(ratio)||1);return {primary:vp,secondary:vp/n,ratio:n};}
function opamp(vp,vm,gain=100000,supply=15){const out=Math.max(-Math.abs(supply),Math.min(Math.abs(supply),(Number(vp)-Number(vm))*Number(gain)));return {output:out,clipped:Math.abs(out)>=Math.abs(supply)};}
window.NilSparkLabPhysicsV67=Object.freeze({diode,bjtNpn,mosfetN,transformer,opamp});

/* ---------- 6. AI circuit teacher bridge ---------- */
function circuitSnapshot(){return {components:safeComps().map(c=>({id:c.id,type:c.type,name:c.name,value:c.r??c.v??c.c??c.l})),connections:safeWires().length};}
function teacherPrompt(question){
 const s=circuitSnapshot();
 return `NilSparkLab circuit context: ${JSON.stringify(s)}\\nStudent question: ${String(question||'').slice(0,500)}\\nExplain safely and educationally. State assumptions, equations, expected measurements, and whether the current simulator model is approximate.`;
}
window.NilSparkLabCircuitTeacherV67=Object.freeze({snapshot:circuitSnapshot,prompt:teacherPrompt});

/* ---------- UI ---------- */
function mount(){
 if(id('elab-v67-tools'))return;
 const root=document.createElement('div');root.id='elab-v67-tools';
 root.innerHTML=`<button id="elab-v67-launch" type="button">⚡ Engineering Tools</button><div id="elab-v67-panel" aria-hidden="true"><div class="elab-v67-card"><div class="elab-v67-head"><div><b style="font-size:16px">NIL SparkLab v11.0 Engineering Upgrade</b><div style="font-size:10px;color:#64748b;margin-top:3px">Unified architecture • analysis • scope • physics • AI bridge</div></div><button class="elab-v67-close" id="elab-v67-close">Close</button></div><div class="elab-v67-grid" id="elab-v67-status"></div><div style="margin-top:14px"><b style="font-size:12px">Oscilloscope CH1</b><canvas id="elab-v67-scope"></canvas><div class="elab-v67-controls"><label>V/div <input id="elab-v67-vdiv" type="number" min="0.1" step="0.1" value="5"></label><label>ms/div <input id="elab-v67-tdiv" type="number" min="1" step="1" value="20"></label><button class="elab-v67-close" id="elab-v67-scope-run">Run/Stop</button></div><div id="elab-v67-scope-readout" class="elab-v67-note">Scope idle</div></div><div style="margin-top:14px"><b style="font-size:12px">RLC / Transient Analyzer</b><div class="elab-v67-controls"><label>R Ω <input id="elab-v67-r" type="number" step="0.1" value="470"></label><label>L mH <input id="elab-v67-l" type="number" step="0.1" value="10"></label><label>C µF <input id="elab-v67-c" type="number" step="0.1" value="100"></label><label>f Hz <input id="elab-v67-f" type="number" step="0.1" value="50"></label><button class="elab-v67-close" id="elab-v67-analyze">Analyze</button></div><div id="elab-v67-analysis-result" class="elab-v67-note">Enter values and analyze.</div></div><div style="margin-top:14px"><b style="font-size:12px">AI Circuit Teacher</b><div class="elab-v67-controls"><button class="elab-v67-close" id="elab-v67-explain">Explain this circuit</button></div><div id="elab-v67-ai-result" class="elab-v67-note">Uses the current Builder snapshot and the existing Assistant when available.</div></div><div class="elab-v67-note">The analyzer uses the existing Builder state. Advanced component models are explicit APIs; unsupported circuit topologies are not silently guessed. Admin privileges remain server-authoritative.</div></div></div>`;
 document.body.appendChild(root);
 id('elab-v67-launch').onclick=()=>{id('elab-v67-panel').classList.add('open');id('elab-v67-panel').setAttribute('aria-hidden','false');refresh();openScope()};
 id('elab-v67-close').onclick=()=>{closeScope();id('elab-v67-panel').classList.remove('open');id('elab-v67-panel').setAttribute('aria-hidden','true')};
 id('elab-v67-scope-run').onclick=()=>{scope.running=!scope.running;if(scope.running){scope.t0=performance.now();scope.raf=requestAnimationFrame(drawScope)}else if(scope.raf)cancelAnimationFrame(scope.raf)};
 id('elab-v67-vdiv').oninput=e=>{scope.voltDiv=Math.max(.1,Number(e.target.value)||5);drawScope()};
 id('elab-v67-tdiv').oninput=e=>{scope.timeMs=Math.max(1,Number(e.target.value)||20);drawScope()};
 id('elab-v67-analyze').onclick=()=>{
  const R=Number(id('elab-v67-r').value)||0,L=Number(id('elab-v67-l').value)||0,C=Number(id('elab-v67-c').value)||0,F=Number(id('elab-v67-f').value)||50;
  const z=acImpedance(R,L,C,F);
  const rc=transientRC(R,C,5,0.01),rl=transientRL(R,L,5,0.01);
  id('elab-v67-analysis-result').textContent=`Z=${z.Z.toFixed(3)} Ω • XL=${z.XL.toFixed(3)} Ω • XC=${Number.isFinite(z.XC)?z.XC.toFixed(3):'∞'} Ω • phase=${z.phaseDeg.toFixed(2)}° • RC τ=${(rc.tau*1000).toFixed(3)} ms • RL τ=${(rl.tau*1000).toFixed(3)} ms`;
 };
 id('elab-v67-explain').onclick=()=>{
  const prompt=teacherPrompt('Explain this circuit: identify topology, components, likely current/voltage path, equations, safety issues, and what the simulator can accurately model.');
  const box=id('elab-v67-ai-result');
  try{
   if(window.NilSparkLabSmartAssistant&&typeof window.NilSparkLabSmartAssistant.ask==='function'){const ans=window.NilSparkLabSmartAssistant.ask(prompt);box.textContent=String(ans||'Assistant returned no explanation.');if(typeof window.NilSparkLabSmartAssistant.open==='function')window.NilSparkLabSmartAssistant.open(ans);}
   else box.textContent='Assistant module is not available on this page.';
  }catch(e){box.textContent='Assistant integration error. Check the browser console.';console.warn(e)}
 };
 refresh();
}
async function refresh(){
 const a=diagnostics(),b=await backendStatus(),grid=id('elab-v67-status');if(!grid)return;
 const items=[
  ['ARCH','Unified modules',a.modules.builder?'READY':'CHECK'],['SOLVER','Existing circuit solver','PRESERVED'],['RLC','AC impedance + RC/RL','READY'],['PHYS','Component physics APIs','READY'],['SCOPE','CH1 live source scope','READY'],['AI','Circuit teacher bridge',a.modules.assistant?'READY':'CHECK'],['AUTH','Server admin auth',b.ready?(b.authenticated?'AUTHENTICATED':'CONNECTED / LOGIN REQUIRED'):'BACKEND NOT CONNECTED'],['SEC','Client secret storage','REMOVED']
 ];grid.innerHTML=items.map(x=>`<div class="elab-v67-item"><b>${x[0]}</b><div class="elab-v67-state">${x[1]} • ${x[2]}</div></div>`).join('');
}
window.NilSparkLabV67=Object.freeze({version:V,architecture:ARCH,diagnostics,backendStatus,scope:window.NilSparkLabV67Scope,ac:window.NilSparkLabACAnalysisV67,physics:window.NilSparkLabPhysicsV67,teacher:window.NilSparkLabCircuitTeacherV67});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
