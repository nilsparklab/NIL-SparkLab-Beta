
(function(){
"use strict";
var ONLINE_CONFIG={
  enabled:false,endpoint:"/api/v1/search",timeoutMs:10000,maxResults:10,
  allowedContent:["kicad_sch","kicad_pcb","spice","asc","pdf","svg","png","jpg","jpeg"],
  executeDownloadedCode:false
};
function buildOnlineQuery(request){
  var q=String(request||"").trim();
  return {version:"9.14",query:q,
    terms:[q,"schematic","circuit diagram","netlist","KiCad","SPICE"],
    maxResults:ONLINE_CONFIG.maxResults,safeMode:true};
}
async function liveCircuitSearch(request,options){
  options=options||{};
  var cfg=Object.assign({},ONLINE_CONFIG,options);
  if(!cfg.enabled)return {version:"9.15",status:"DISABLED"};
  var query=buildOnlineQuery(request);
  if(!query.query)return {version:"9.15",status:"NEEDS_QUERY"};
  var controller=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort();},cfg.timeoutMs):null;
  try{
    var response=await fetch(cfg.endpoint,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(query),signal:controller?controller.signal:undefined,
      credentials:"same-origin"
    });
    if(timer)clearTimeout(timer);
    if(!response.ok)return {version:"9.15",status:"HTTP_ERROR",httpStatus:response.status};
    var data=await response.json();
    return {version:"9.15",status:"RETRIEVED",query:query,
      results:Array.isArray(data.results)?data.results:[],
      provenanceRequired:true,executeDownloadedCode:false};
  }catch(e){
    if(timer)clearTimeout(timer);
    return {version:"9.15",status:"RETRIEVAL_UNAVAILABLE",
      message:String(e&&e.message||e),
      note:"Configure a trusted same-origin/backend retrieval endpoint."};
  }
}
function rankLiveSources(results){
  return (Array.isArray(results)?results:[]).map(function(x){
    var score=0;
    if(x.sourceType==="manufacturer")score+=40;
    if(x.sourceType==="open-source")score+=30;
    if(x.license&&x.license!=="unknown")score+=20;
    if(x.url)score+=10;
    if(x.hasSchematic)score+=10;
    return Object.assign({},x,{trustScore:Math.min(100,score)});
  }).sort(function(a,b){return b.trustScore-a.trustScore;});
}
function artifactGuard(artifact){
  artifact=artifact||{};
  var allowed=ONLINE_CONFIG.allowedContent.indexOf(String(artifact.type||"").toLowerCase())>=0;
  var size=Number(artifact.size||0);
  return {version:"9.17",status:allowed&&size<=5000000?"SAFE_TO_PARSE":"BLOCKED",
    type:artifact.type||"unknown",size:size,maxBytes:5000000,
    executeDownloadedCode:false,parseOnly:true};
}
function chooseCircuitArtifact(results){
  var ranked=rankLiveSources(results);
  var preferred=ranked.find(function(x){
    return /kicad_sch|spice|asc|schematic/i.test(String(x.format||"")+" "+String(x.title||""));
  })||ranked[0]||null;
  return {version:"9.18",status:preferred?"ARTIFACT_SELECTED":"NO_ARTIFACT",
    selected:preferred,preference:["native schematic","SPICE/netlist","SVG","PDF/image"]};
}
function onlineCircuitResult(request,retrieval){
  var results=retrieval&&Array.isArray(retrieval.results)?retrieval.results:[];
  var ranked=rankLiveSources(results);
  return {version:"9.19",request:request,
    status:retrieval&&retrieval.status==="RETRIEVED"?"SOURCES_FOUND":"NO_LIVE_SOURCES",
    sources:ranked.slice(0,ONLINE_CONFIG.maxResults),
    artifact:chooseCircuitArtifact(ranked),
    verification:"NOT_VERIFIED_UNTIL_PARSED_AND_CHECKED",provenanceRequired:true};
}
async function provideOnlineCircuit(request,options){
  var retrieval=await liveCircuitSearch(request,options);
  if(retrieval.status!=="RETRIEVED")
    return {version:"10.18",status:retrieval.status,
      message:"Live circuit search is not connected in this standalone file.",
      nextStep:"Connect /api/v1/search or another trusted backend connector.",
      security:{executeDownloadedCode:false,parseOnly:true}};
  return onlineCircuitResult(request,retrieval);
}
window.NilSparkLabOnlineCircuitV920={
  version:"10.18",config:ONLINE_CONFIG,buildOnlineQuery:buildOnlineQuery,
  liveCircuitSearch:liveCircuitSearch,rankLiveSources:rankLiveSources,
  artifactGuard:artifactGuard,chooseCircuitArtifact:chooseCircuitArtifact,
  onlineCircuitResult:onlineCircuitResult,provideOnlineCircuit:provideOnlineCircuit
};
})();
