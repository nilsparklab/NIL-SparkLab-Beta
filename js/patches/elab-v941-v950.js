
(function(){
"use strict";

/* v9.41 — provider adapter registry */
var PROVIDERS={
  custom:{endpoint:"/api/v1/search",enabled:false},
  webSearch:{endpoint:"/api/v1/search",enabled:false},
  circuitIndex:{endpoint:"/api/v1/search",enabled:false}
};
function providerStatus(){
  return {version:"9.41",providers:Object.keys(PROVIDERS).map(function(k){
    return {name:k,enabled:!!PROVIDERS[k].enabled,endpoint:PROVIDERS[k].endpoint};
  })};
}

/* v9.42 — normalized search request */
function normalizedRequest(q,opts){
  opts=opts||{};
  return {version:"9.42",q:String(q||"").trim(),
    maxResults:Math.min(Number(opts.maxResults||10),25),
    intent:"circuit_diagram",
    formats:["kicad_sch","spice","asc","svg","pdf","image"],
    safety:{parseOnly:true,noCodeExecution:true}};
}

/* v9.43 — provider call with strict timeout */
async function callProvider(name,q,opts){
  var p=PROVIDERS[name];
  if(!p||!p.enabled)return {version:"9.43",status:"PROVIDER_DISABLED",provider:name};
  var req=normalizedRequest(q,opts);
  if(!req.q)return {version:"9.43",status:"NEEDS_QUERY"};
  var c=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=c?setTimeout(function(){c.abort();},10000):null;
  try{
    var r=await fetch(p.endpoint,{method:"POST",
      headers:{"Content-Type":"application/json"},
      credentials:"same-origin",body:JSON.stringify(req),
      signal:c?c.signal:undefined});
    if(timer)clearTimeout(timer);
    if(!r.ok)return {version:"9.43",status:"HTTP_ERROR",httpStatus:r.status};
    var d=await r.json();
    return {version:"9.43",status:"SUCCESS",provider:name,
      results:Array.isArray(d.results)?d.results:[],request:req};
  }catch(e){
    if(timer)clearTimeout(timer);
    return {version:"9.43",status:"ERROR",provider:name,
      message:String(e&&e.message||e)};
  }
}

/* v9.44 — multi-provider merge */
function mergeProviderResults(all){
  var map={},out=[];
  (all||[]).forEach(function(r){
    (r.results||[]).forEach(function(x){
      var key=x.url||x.title||JSON.stringify(x);
      if(!map[key]){map[key]=true;out.push(Object.assign({},x,{providers:[r.provider]}));}
      else{
        out.forEach(function(y){if((y.url||y.title||"")===key){
          y.providers=y.providers||[];if(y.providers.indexOf(r.provider)<0)y.providers.push(r.provider);
        }});
      }
    });
  });
  return {version:"9.44",results:out};
}

/* v9.45 — circuit relevance ranking */
function relevanceRank(results){
  return (results||[]).map(function(x){
    var s=0,t=(String(x.title||"")+" "+String(x.description||"")+" "+String(x.format||"")).toLowerCase();
    if(/schematic|circuit|diagram/.test(t))s+=30;
    if(/kicad|spice|ltspice|netlist/.test(t))s+=30;
    if(x.diagramUrl)s+=20;
    if(x.sourceType==="manufacturer"||x.sourceType==="open-source")s+=15;
    if(x.license&&x.license!=="unknown")s+=5;
    return Object.assign({},x,{relevance:Math.min(100,s)});
  }).sort(function(a,b){return b.relevance-a.relevance;});
}

/* v9.46 — source delivery record */
function deliveryRecord(x){
  x=x||{};
  return {version:"9.46",title:x.title||"Circuit",
    sourceUrl:x.url||null,diagramUrl:x.diagramUrl||null,
    format:x.format||"unknown",license:x.license||"unknown",
    providers:x.providers||[],relevance:Number(x.relevance||0),
    verified:false,provenanceRequired:true};
}

/* v9.47 — safe artifact handoff */
function artifactHandoff(x){
  var type=String(x&&x.format||"").toLowerCase();
  var allowed=["kicad_sch","spice","asc","svg","pdf","image"];
  return {version:"9.47",status:allowed.indexOf(type)>=0?"ACCEPTED":"REVIEW_REQUIRED",
    artifact:x||null,parseOnly:true,execute:false};
}

/* v9.48 — assistant response */
function sourceAwareAnswer(query,ranked){
  var best=ranked&&ranked[0]?deliveryRecord(ranked[0]):null;
  return {version:"9.48",query:query,
    status:best?"SOURCE_AVAILABLE":"NO_SOURCE",
    best:best,alternatives:(ranked||[]).slice(1,5),
    statement:best?"Source found; verification status is shown explicitly."
      :"No suitable circuit source found."};
}

/* v9.49 — online search orchestrator */
async function searchCircuitOnline(query,opts){
  var calls=[];
  for(var k in PROVIDERS){
    if(PROVIDERS[k].enabled)calls.push(await callProvider(k,query,opts));
  }
  var merged=mergeProviderResults(calls).results;
  var ranked=relevanceRank(merged);
  return {version:"9.49",status:ranked.length?"RESULTS_FOUND":"NO_RESULTS",
    providerCalls:calls,results:ranked};
}

/* v10.19 — Online Circuit Source Engine */
async function getCircuitSource(query,opts){
  var result=await searchCircuitOnline(query,opts);
  var answer=sourceAwareAnswer(query,result.results);
  var handoff=answer.best?artifactHandoff(answer.best):null;
  return {version:"10.18",query:query,status:answer.status,
    providerStatus:providerStatus(),answer:answer,handoff:handoff,
    security:{parseOnly:true,executeRetrievedCode:false,
      provenanceRequired:true}};
}
window.NilSparkLabOnlineCircuitV950={
 version:"10.18",providerStatus:providerStatus,
 normalizedRequest:normalizedRequest,callProvider:callProvider,
 mergeProviderResults:mergeProviderResults,relevanceRank:relevanceRank,
 deliveryRecord:deliveryRecord,artifactHandoff:artifactHandoff,
 sourceAwareAnswer:sourceAwareAnswer,searchCircuitOnline:searchCircuitOnline,
 getCircuitSource:getCircuitSource
};
})();
