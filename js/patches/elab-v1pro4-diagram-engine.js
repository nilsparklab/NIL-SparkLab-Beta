
(() => {
"use strict";

/*
 * v1 PRO.4 defines an assistant-driven educational diagram contract.
 * The assistant can request a diagram specification from natural language,
 * while the renderer turns that specification into a safe SVG/canvas visual.
 * No privileged/admin capability is exposed by this feature.
 */
const DIAGRAM_TYPES = Object.freeze([
  "transfer_diagram",
  "working_diagram",
  "circuit_diagram",
  "kvl_diagram",
  "kcl_diagram",
  "block_diagram",
  "waveform_diagram",
  "component_diagram",
  "flow_diagram"
]);

const TOPICS = Object.freeze({
  transfer:["transformer","energy transfer","power transfer","signal transfer","transfer"],
  working:["working","how it works","principle","operation"],
  circuit:["circuit","circuit diagram","schematic"],
  kvl:["kvl","kirchhoff voltage law","kirchhoff voltage"],
  kcl:["kcl","kirchhoff current law","kirchhoff current"],
  block:["block diagram","blocks"],
  waveform:["waveform","signal","ac waveform","dc waveform"],
  component:["component","resistor","capacitor","inductor","diode","led"],
  flow:["flowchart","flow diagram","process"]
});

function detectDiagramRequest(text){
  const t=String(text||"").toLowerCase();
  const matches=[];
  for(const [type,words] of Object.entries(TOPICS)){
    if(words.some(w=>t.includes(w))) matches.push(type);
  }
  if(!matches.length) return {requested:false,types:[]};

  const typeMap={transfer:"transfer_diagram",working:"working_diagram",circuit:"circuit_diagram",
    kvl:"kvl_diagram",kcl:"kcl_diagram",block:"block_diagram",waveform:"waveform_diagram",
    component:"component_diagram",flow:"flow_diagram"};

  return {
    requested:true,
    types:[...new Set(matches.map(x=>typeMap[x]))],
    wantsExplanation:/working|how it works|principle|explain|समझा|काम/.test(t),
    wantsDiagram:/diagram|दिया?gram|दाय?gram|दाइय?gram|schematic|चित्र|दिखा/.test(t)
  };
}

function createDiagramSpec(type,title,items=[]){
  if(!DIAGRAM_TYPES.includes(type)) throw new Error("Unsupported diagram type");
  return Object.freeze({
    type,title:String(title||"Electrical Diagram"),
    items:Array.isArray(items)?items.slice(0,50):[],
    safeRenderer:true
  });
}

function renderSvg(spec){
  if(!spec || !DIAGRAM_TYPES.includes(spec.type)) return "";
  const title=String(spec.title||"Electrical Diagram").replace(/[<>&"]/g,"");
  const labels=(spec.items||[]).map(x=>String(x).replace(/[<>&"]/g,"")).slice(0,8);
  const rows=labels.map((x,i)=>`<text x="30" y="${65+i*28}" font-size="14">${x}</text>`).join("");
  return `<svg viewBox="0 0 700 300" role="img" aria-label="${title}">
    <rect x="10" y="10" width="680" height="280" rx="14" fill="none" stroke="currentColor"/>
    <text x="30" y="42" font-size="18" font-weight="700">${title}</text>${rows}
  </svg>`;
}

window.NilSparkLabV1PRO4Diagrams = Object.freeze({
  version:"1 PRO.4",
  types:DIAGRAM_TYPES,
  detectDiagramRequest,
  createDiagramSpec,
  renderSvg,
  status(){
    return {
      version:"1 PRO.4",
      assistantDiagramRequests:true,
      kvlKclDiagrams:true,
      circuitDiagrams:true,
      workingDiagrams:true,
      transferDiagrams:true,
      safeDiagramRenderer:true,
      anonymousUsage:true,
      adminServerAuthorizationRequired:true
    };
  }
});
})();
