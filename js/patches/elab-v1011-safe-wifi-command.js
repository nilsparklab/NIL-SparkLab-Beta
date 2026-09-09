
(function(){
"use strict";

/*
  Hidden assistant command handler.
  Trigger phrases:
    "wifi jammer circuit"
    "wi-fi jammer circuit"
    "wife jammer circuit" (common typo)
  Safety behavior:
    Never generates an actionable jammer/transmitter circuit.
    Instead, opens a safe educational canvas showing Wi-Fi interference
    conceptually, with a warning and non-operational blocks.
*/
var WIFI_JAMMER_TRIGGERS=[
  /\bwifi\s+jam+er\b/i,
  /\bwi[\s-]?fi\s+jam+er\b/i,
  /\bwife\s+jam+er\b/i,
  /\bwifi\s+jam+ming\b/i
];

function isWifiJammerCommand(text){
  text=String(text||"").trim();
  return WIFI_JAMMER_TRIGGERS.some(function(rx){return rx.test(text);});
}

function drawSafeWifiInterferenceCanvas(canvas){
  if(!canvas)return;
  var ctx=canvas.getContext("2d");
  if(!ctx)return;

  var w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);

  ctx.font="bold 18px Arial";
  ctx.fillText("Wi‑Fi Interference — Educational Concept",24,34);

  ctx.font="14px Arial";
  ctx.fillText("Non-operational visualization • No jammer circuit",24,58);

  function box(x,y,bw,bh,title,sub){
    ctx.strokeRect(x,y,bw,bh);
    ctx.font="bold 14px Arial";
    ctx.fillText(title,x+12,y+27);
    ctx.font="12px Arial";
    ctx.fillText(sub,x+12,y+49);
  }

  box(35,95,180,75,"Wi‑Fi Router","Normal RF communication");
  box(330,95,180,75,"Receiver","Wi‑Fi client");
  box(180,245,220,80,"Interference","Concept only — no RF circuit");

  ctx.beginPath();
  ctx.moveTo(215,132);ctx.lineTo(330,132);ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(270,170);ctx.lineTo(290,245);ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(400,170);ctx.lineTo(350,245);ctx.stroke();

  ctx.font="bold 13px Arial";
  ctx.fillText("Signal path",235,120);
  ctx.fillText("Interference can reduce",205,270);
  ctx.fillText("signal quality / throughput",205,292);

  ctx.font="12px Arial";
  ctx.fillText("For learning: study spectrum, modulation, RSSI, SNR and coexistence.",35,h-28);
}

function openSafeWifiCanvas(){
  var existing=document.getElementById("elab-safe-wifi-panel");
  if(existing)existing.remove();

  var panel=document.createElement("div");
  panel.id="elab-safe-wifi-panel";
  panel.style.cssText=[
    "position:fixed","inset:0","z-index:999999","background:rgba(2,6,23,.94)",
    "display:flex!important","align-items:center","justify-content:center","padding:18px"
  ].join(";");

  var card=document.createElement("div");
  card.style.cssText=[
    "width:min(760px,96vw)","background:#fff","border-radius:16px",
    "padding:20px","box-shadow:0 20px 60px rgba(0,0,0,.4)"
  ].join(";");

  var title=document.createElement("div");
  title.textContent="Wi‑Fi Interference — Safe Learning Canvas";
  title.style.cssText="font:700 20px Arial;margin-bottom:8px";

  var note=document.createElement("div");
  note.textContent="A Wi‑Fi jammer is designed to disrupt communications, so an actionable jammer circuit is not generated. This canvas shows the concept safely.";
  note.style.cssText="font:14px Arial;line-height:1.5;margin-bottom:12px";

  var canvas=document.createElement("canvas");
  canvas.width=700;canvas.height=400;
  canvas.style.cssText="width:100%;height:auto;border:1px solid #cbd5e1;border-radius:10px";

  var close=document.createElement("button");
  close.textContent="Close";
  close.style.cssText="margin-top:12px;padding:9px 16px;border-radius:8px;border:1px solid #94a3b8;background:#fff;cursor:pointer";
  close.onclick=function(){panel.remove();};

  card.appendChild(title);card.appendChild(note);card.appendChild(canvas);card.appendChild(close);
  panel.appendChild(card);document.body.appendChild(panel);
  drawSafeWifiInterferenceCanvas(canvas);
}

window.NilSparkLabSafeWifiCommand={
  version:"10.18",
  isCommand:isWifiJammerCommand,
  openCanvas:openSafeWifiCanvas
};

/* Integrate with common assistant input fields without exposing a command list. */
function wireAssistantInputs(){
  var selectors=[
    "#elab-smart-input","#elab-assistant-input","#assistantInput",
    "textarea[placeholder*='Ask' i]","input[placeholder*='Ask' i]"
  ];
  document.querySelectorAll(selectors.join(",")).forEach(function(el){
    if(el.dataset.safeWifiBound)return;
    el.dataset.safeWifiBound="1";
    el.addEventListener("keydown",function(e){
      if(e.key==="Enter" && !e.shiftKey && isWifiJammerCommand(el.value)){
        e.preventDefault();
        e.stopPropagation();
        openSafeWifiCanvas();
      }
    },true);
  });
}
if(document.readyState==="loading")
  document.addEventListener("DOMContentLoaded",wireAssistantInputs);
else wireAssistantInputs();
new MutationObserver(wireAssistantInputs).observe(document.documentElement,{childList:true,subtree:true});
})();
