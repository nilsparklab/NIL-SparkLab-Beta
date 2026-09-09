
(function(){
"use strict";

/*
  ZERO-COST POLICY
  No paid fallback is enabled by default.
  Free/public sources are tried first. If configured free quota is exhausted,
  search stops rather than switching to a paid provider.
*/
var FREE_SEARCH_POLICY={
  enabled:true,
  paidFallback:false,
  monthlyBudget:0,
  hardStopOnQuota:true,
  providers:{
    localLibrary:true,
    publicSources:true,
    freeApi:false
  }
};

/* v9.61 — local library first */
function localCircuitSearch(query){
  var q=String(query||"").toLowerCase().trim();
  var lib=Array.isArray(window.NilSparkLabCircuitLibrary)?window.NilSparkLabCircuitLibrary:[];
  var hits=lib.filter(function(x){
    var t=String((x.title||"")+" "+(x.tags||"")+" "+(x.description||"")).toLowerCase();
    return q && q.split(/\s+/).some(function(w){return w.length>2&&t.indexOf(w)>=0;});
  });
  return {version:"9.61",status:hits.length?"FOUND":"MISS",results:hits.slice(0,10)};
}

/* v9.62 — public-source resolver contract */
async function publicSourceSearch(query,options){
  options=options||{};
  if(!FREE_SEARCH_POLICY.providers.publicSources)
    return {version:"9.62",status:"DISABLED"};
  var endpoint=options.publicEndpoint||"/api/v1/search";
  try{
    var r=await fetch(endpoint,{
      method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({query:String(query||"").trim(),maxResults:10,
        intent:"circuit_diagram",paidFallback:false})
    });
    if(!r.ok)return {version:"9.62",status:"UNAVAILABLE",httpStatus:r.status};
    var d=await r.json();
    return {version:"9.62",status:"FOUND",
      results:Array.isArray(d.results)?d.results:[]};
  }catch(e){
    return {version:"9.62",status:"UNAVAILABLE",message:String(e&&e.message||e)};
  }
}

/* v9.63 — optional free API slot */
async function freeApiSearch(query,options){
  if(!FREE_SEARCH_POLICY.providers.freeApi)
    return {version:"9.63",status:"DISABLED"};
  options=options||{};
  var endpoint=options.endpoint||"/api/v1/search";
  try{
    var r=await fetch(endpoint,{method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({query:String(query||"").trim(),paidFallback:false})});
    if(!r.ok)return {version:"9.63",status:"UNAVAILABLE"};
    var d=await r.json();
    return {version:"9.63",status:"FOUND",results:Array.isArray(d.results)?d.results:[]};
  }catch(e){
    return {version:"9.63",status:"UNAVAILABLE"};
  }
}

/* v9.64 — result merge */
function mergeFreeResults(a,b,c){
  var all=[].concat(a||[],b||[],c||[]),seen={},out=[];
  all.forEach(function(x){
    var key=x.url||x.id||x.title||JSON.stringify(x);
    if(!seen[key]){seen[key]=true;out.push(x);}
  });
  return {version:"9.64",results:out};
}

/* v9.65 — circuit relevance ranking */
function rankFreeResults(results){
  return (results||[]).map(function(x){
    var text=String((x.title||"")+" "+(x.description||"")+" "+(x.format||"")).toLowerCase();
    var score=0;
    if(/circuit|schematic|diagram/.test(text))score+=35;
    if(/kicad|spice|ltspice|netlist/.test(text))score+=30;
    if(x.diagramUrl)score+=20;
    if(x.license&&x.license!=="unknown")score+=15;
    return Object.assign({},x,{relevance:Math.min(100,score)});
  }).sort(function(a,b){return b.relevance-a.relevance;});
}

/* v9.66 — provenance/license gate */
function freeSourceGate(x){
  x=x||{};
  return {version:"9.66",
    source:x.url||null,
    license:x.license||"unknown",
    provenanceRequired:true,
    redistributionDecision:
      /^(public-domain|cc0|mit|apache-2\.0|bsd|open-hardware)$/i.test(String(x.license||""))
      ?"REUSE_WITH_LICENSE":"REFERENCE_OR_RECONSTRUCT"};
}

/* v9.67 — quota hard stop */
function quotaGate(used,limit){
  used=Number(used||0);limit=Number(limit||0);
  return {version:"9.67",used:used,limit:limit,
    status:limit>0&&used>=limit?"STOP":"ALLOW",
    paidFallback:false};
}

/* v9.68 — search strategy */
async function zeroCostSearch(query,options){
  options=options||{};
  var local=localCircuitSearch(query);
  if(local.status==="FOUND")return {version:"9.68",route:"LOCAL",results:local.results};
  var pub=await publicSourceSearch(query,options);
  var free=await freeApiSearch(query,options);
  var merged=mergeFreeResults(pub.results,free.results,[]);
  var ranked=rankFreeResults(merged.results);
  return {version:"9.68",route:ranked.length?"PUBLIC_FREE":"NONE",
    results:ranked,paidFallback:false};
}

/* v9.69 — assistant response */
async function zeroCostCircuitAssistant(query,options){
  var result=await zeroCostSearch(query,options);
  if(!result.results||!result.results.length)
    return {version:"9.69",status:"NO_FREE_SOURCE",
      message:"No free/local circuit source found. Paid search is disabled."};
  var best=result.results[0];
  return {version:"9.69",status:"SOURCE_FOUND",route:result.route,
    source:best,alternatives:result.results.slice(1,5),
    verification:"NOT_VERIFIED_UNTIL_PARSED_AND_CHECKED",
    payment:{paidFallback:false,automaticBilling:false}};
}

/* v10.19 — ZERO-COST Circuit Search Engine */
async function getCircuit(query,options){
  var result=await zeroCostCircuitAssistant(query,options);
  return {version:"10.18",query:query,result:result,
    policy:{paidSearchDisabled:true,paidFallbackDisabled:true,
      hardStop:true,automaticBilling:false}};
}
window.NilSparkLabZeroCostV970={
 version:"10.18",policy:FREE_SEARCH_POLICY,
 localCircuitSearch:localCircuitSearch,
 publicSourceSearch:publicSourceSearch,
 freeApiSearch:freeApiSearch,
 mergeFreeResults:mergeFreeResults,
 rankFreeResults:rankFreeResults,
 freeSourceGate:freeSourceGate,
 quotaGate:quotaGate,
 zeroCostSearch:zeroCostSearch,
 zeroCostCircuitAssistant:zeroCostCircuitAssistant,
 getCircuit:getCircuit
};
})();
