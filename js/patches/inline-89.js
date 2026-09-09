
(function(){
"use strict";
var running=false,raf=0,start=0;

function comps(){try{return Array.isArray(window.builderCanvasComps)?window.builderCanvasComps:[];}catch(e){return[];}}
function typeOf(c){return String(c&&(c.type||c.kind||c.componentType)||"").toLowerCase().replace(/[\s-]+/g,"_");}
function num(c,keys,d){
  for(var i=0;i<keys.length;i++){
    var v=c&&c.properties&&c.properties[keys[i]]!=null?c.properties[keys[i]]:c&&c[keys[i]];
    v=Number(v);if(Number.isFinite(v))return v;
  }
  return d;
}
function find(list){return comps().find(function(c){return list.indexOf(typeOf(c))>=0;});}
function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}

function params(){
  var ac=find(["ac_source","generator"]);
  var bat=find(["battery","dc_source"]);
  var source=document.getElementById("elab-v573-source").value;
  var c=source==="ac"?ac:source==="battery"?bat:(ac||bat);
  var isAC=!!ac&&(source==="auto"||source==="ac");
  var f=isAC?num(c,["frequency"],50):0;
  var amp=isAC?num(c,["amplitude","voltage","v"],5):num(c,["voltage","v"],12);
  var wave=document.getElementById("elab-v573-wave").value;
  var r=find(["resistor"]), cap=find(["capacitor"]), ind=find(["inductor"]);
  var R=r?Math.max(.000001,num(r,["r","resistance"],1000)):null;
  var C=cap?Math.max(.000000001,num(cap,["capacitance","c"],10))*1e-6:null;
  var L=ind?Math.max(.000000001,num(ind,["inductance","l"],10))*1e-3:null;
  var tau=C&&R?R*C:L&&R?L/R:null;
  return {c:c,isAC:isAC,f:f,amp:amp,wave:wave,R:R,C:C,L:L,tau:tau};
}
function waveform(p,t){
  if(!p.isAC)return p.amp;
  var x=(p.f*t)%1;
  if(p.wave==="square")return x<.5?p.amp:-p.amp;
  if(p.wave==="triangle")return p.amp*(1-4*Math.abs(x-.5));
  return p.amp*Math.sin(2*Math.PI*p.f*t);
}
function draw(){
  if(!running)return;
  var cv=document.getElementById("elab-v573-canvas"),ctx=cv.getContext("2d"),w=cv.width,h=cv.height;
  var p=params(),mode=document.getElementById("elab-v573-mode").value;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle="rgba(71,85,105,.32)";
  for(var x=0;x<=w;x+=w/10){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(var y=0;y<=h;y+=h/8){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  var duration=p.isAC&&p.f>0?Math.max(1/p.f*4,.02):Math.max((p.tau||.1)*5,.2);
  var now=(performance.now()-start)/1000;
  ctx.strokeStyle="#22d3ee";ctx.lineWidth=2;ctx.beginPath();
  for(var i=0;i<w;i++){
    var t=(i/w)*duration;
    var yv;
    if(mode==="transient" && p.tau){
      var target=waveform(p,t);
      yv=target*(1-Math.exp(-t/p.tau));
    }else yv=waveform(p,t);
    var yy=h/2-yv*(h*.38/Math.max(p.amp,1));
    if(i===0)ctx.moveTo(i,yy);else ctx.lineTo(i,yy);
  }
  ctx.stroke();
  updateStats(p);
  raf=requestAnimationFrame(draw);
}
function updateStats(p){
  set("elab-v573-freq",p.isAC?p.f.toFixed(2)+" Hz":"DC");
  set("elab-v573-vpp",(p.isAC?2*p.amp:0).toFixed(2)+" V");
  set("elab-v573-rms",(p.isAC?p.amp/Math.sqrt(2):p.amp).toFixed(2)+" V");
  set("elab-v573-period",p.isAC?(1000/p.f).toFixed(2)+" ms":"∞");
  set("elab-v573-tau",p.tau?(p.tau*1000).toFixed(3)+" ms":"—");
  var r=document.getElementById("elab-v573-result");
  if(!p.c){r.className="result warn";r.textContent="No compatible source detected. Add an AC source, generator or battery.";return;}
  r.className="result ok";
  var notes=[];
  if(p.isAC)notes.push("AC waveform source detected.");
  else notes.push("DC source detected.");
  if(p.tau)notes.push("Time constant τ = "+(p.tau*1000).toFixed(3)+" ms.");
  if(document.getElementById("elab-v573-mode").value==="transient"&&!p.tau)notes.push("Transient mode needs R+C or R+L for a simple first-order model.");
  r.textContent=notes.join(" ");
}
function open(){var p=document.getElementById("elab-v573-analysis");p.classList.add("open");p.setAttribute("aria-hidden","false");running=true;start=performance.now();if(!raf)raf=requestAnimationFrame(draw);}
function close(){var p=document.getElementById("elab-v573-analysis");p.classList.remove("open");p.setAttribute("aria-hidden","true");running=false;if(raf)cancelAnimationFrame(raf);raf=0;}
window.NilSparkLabWaveformAnalysis={open:open,close:close,refresh:updateStats};
document.addEventListener("click",function(e){
  if(e.target.id==="elab-v573-close")close();
  if(e.target.id==="elab-v573-run"){running=true;start=performance.now();if(!raf)raf=requestAnimationFrame(draw);}
});
})();
