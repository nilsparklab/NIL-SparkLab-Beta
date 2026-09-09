
(function(){
"use strict";

/* v9.31 — configurable trusted search backend */
var SEARCH_BACKEND={
  enabled:true,
  endpoint:"/api/v1/search",
  method:"POST",
  timeoutMs:12000,
  maxResults:10,
  sameOrigin:true,
  executeRetrievedCode:false
};

/* v9.32 — backend request envelope */
function makeSearchRequest(query,options){
  options=options||{};
  return {version:"9.32",query:String(query||"").trim(),
    domains:Array.isArray(options.domains)?options.domains:[],
    maxResults:Math.min(Number(options.maxResults||SEARCH_BACKEND.maxResults),50),
    filters:{schematic:true,netlist:true,datasheet:true,publicSources:true},
    security:{parseOnly:true,executeRetrievedCode:false}};
}

/* v9.33 — actual backend search call */
async function searchOnline(query,options){
  var req=makeSearchRequest(query,options);
  if(!SEARCH_BACKEND.enabled)return {version:"9.33",status:"DISABLED"};
  if(!req.query)return {version:"9.33",status:"NEEDS_QUERY"};
  var controller=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort();},SEARCH_BACKEND.timeoutMs):null;
  try{
    var r=await fetch(SEARCH_BACKEND.endpoint,{
      method:SEARCH_BACKEND.method,
      headers:{"Content-Type":"application/json"},
      credentials:SEARCH_BACKEND.sameOrigin?"same-origin":"omit",
      body:JSON.stringify(req),
      signal:controller?controller.signal:undefined
    });
    if(timer)clearTimeout(timer);
    if(!r.ok)return {version:"9.33",status:"HTTP_ERROR",httpStatus:r.status};
    var data=await r.json();
    return {version:"9.33",status:"SEARCH_COMPLETE",request:req,
      results:Array.isArray(data.results)?data.results:[],
      provider:data.provider||"backend",
      provenanceRequired:true};
  }catch(e){
    if(timer)clearTimeout(timer);
    return {version:"9.33",status:"BACKEND_UNAVAILABLE",
      message:String(e&&e.message||e),
      endpoint:SEARCH_BACKEND.endpoint};
  }
}

/* v9.34 — result safety/provenance validation */
function validateOnlineResults(results){
  var issues=[];
  (Array.isArray(results)?results:[]).forEach(function(x){
    if(!x.url||!/^https?:\/\//i.test(String(x.url)))issues.push("Invalid source URL.");
    if(x.content && /<script\b|javascript:|vbscript:/i.test(String(x.content)))
      issues.push("Executable source content rejected.");
  });
  return {version:"9.34",status:issues.length?"REVIEW_REQUIRED":"SAFE",
    issues:issues,executeRetrievedCode:false};
}

/* v9.35 — diagram candidate ranking */
function rankDiagramResults(results){
  return (Array.isArray(results)?results:[]).map(function(x){
    var score=0;
    if(x.hasSchematic)score+=35;
    if(/kicad|spice|schematic|netlist/i.test(String(x.format||"")+" "+String(x.title||"")))score+=30;
    if(x.sourceType==="manufacturer")score+=20;
    if(x.license&&x.license!=="unknown")score+=15;
    return Object.assign({},x,{diagramScore:Math.min(100,score)});
  }).sort(function(a,b){return b.diagramScore-a.diagramScore;});
}

/* v9.36 — direct diagram delivery package */
function diagramPackage(result){
  result=result||{};
  return {version:"9.36",
    title:result.title||"Circuit diagram",
    sourceUrl:result.url||null,
    diagramUrl:result.diagramUrl||null,
    format:result.format||"unknown",
    sourceType:result.sourceType||"unknown",
    license:result.license||"unknown",
    reconstructionAvailable:!!result.reconstructable,
    verification:"NOT_VERIFIED_UNLESS_EXPLICITLY_PASSED"};
}

/* v9.37 — search + select + deliver */
async function findCircuitDiagram(query,options){
  var search=await searchOnline(query,options);
  if(search.status!=="SEARCH_COMPLETE")return search;
  var safe=validateOnlineResults(search.results);
  if(safe.status==="REVIEW_REQUIRED")
    return {version:"9.37",status:"BLOCKED",security:safe};
  var ranked=rankDiagramResults(search.results);
  var selected=ranked[0]||null;
  return {version:"9.37",status:selected?"DIAGRAM_FOUND":"NO_DIAGRAM_FOUND",
    selected:selected?diagramPackage(selected):null,
    results:ranked.slice(0,10),provenanceRequired:true};
}

/* v9.38 — reconstruction handoff */
async function retrieveForReconstruction(query,options){
  var found=await findCircuitDiagram(query,options);
  if(found.status!=="DIAGRAM_FOUND")return found;
  var x=found.selected;
  return {version:"9.38",status:"RECONSTRUCTION_HANDOFF",
    source:x,parserPreference:["kicad_sch","spice","asc","svg","pdf","image"],
    executeRetrievedCode:false};
}

/* v9.39 — assistant-friendly answer package */
function assistantDiagramResponse(request,result){
  return {version:"9.39",request:request,
    status:result.status,
    answerMode:"source_aware",
    source:result.selected||null,
    alternatives:result.results||[],
    claims:{internetSearched:true,
      sourceShown:!!result.selected,
      verified:false}};
}

/* v10.19 — Online Circuit Assistant */
async function onlineCircuitAssistant(request,options){
  var result=await findCircuitDiagram(request,options);
  return assistantDiagramResponse(request,result);
}

window.NilSparkLabOnlineCircuitV940={
  version:"10.18",config:SEARCH_BACKEND,
  makeSearchRequest:makeSearchRequest,searchOnline:searchOnline,
  validateOnlineResults:validateOnlineResults,rankDiagramResults:rankDiagramResults,
  diagramPackage:diagramPackage,findCircuitDiagram:findCircuitDiagram,
  retrieveForReconstruction:retrieveForReconstruction,
  assistantDiagramResponse:assistantDiagramResponse,
  onlineCircuitAssistant:onlineCircuitAssistant
};
})();
