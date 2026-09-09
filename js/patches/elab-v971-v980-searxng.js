
(function(){
"use strict";
// This bridge only works when a local SearXNG instance is running on the
// same machine (developer/self-hosted use). On a real deployment
// (github.io, pages.dev, netlify.app, or any non-localhost host) there is
// no such service to reach, so it's disabled by default in production
// rather than issuing a network call that can never succeed.
var SEARXNG_LOCAL={
  enabled:false,
  endpoint:"",
  timeoutMs:8000,
  maxResults:10,
  format:"json",
  paidFallback:false,
  executeRetrievedCode:false
};

async function localSearXNGSearch(query,options){
  options=options||{};
  if(!SEARXNG_LOCAL.enabled)return {version:"9.71",status:"DISABLED"};
  var q=String(query||"").trim();
  if(!q)return {version:"9.71",status:"NEEDS_QUERY"};
  var u=new URL(SEARXNG_LOCAL.endpoint);
  u.searchParams.set("q",q+" circuit schematic diagram");
  u.searchParams.set("format",SEARXNG_LOCAL.format);
  u.searchParams.set("safesearch","1");
  var controller=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort();},SEARXNG_LOCAL.timeoutMs):null;
  try{
    var r=await fetch(u.toString(),{
      method:"GET",credentials:"omit",
      signal:controller?controller.signal:undefined
    });
    if(timer)clearTimeout(timer);
    if(!r.ok)return {version:"9.71",status:"HTTP_ERROR",httpStatus:r.status};
    var d=await r.json();
    var results=Array.isArray(d.results)?d.results:[];
    return {version:"9.71",status:"SEARCH_COMPLETE",
      results:results.slice(0,SEARXNG_LOCAL.maxResults).map(function(x){
        return {title:x.title||"",url:x.url||null,
          description:x.content||"",source:"local-searxng",
          engine:x.engine||null};
      }),
      security:{paidFallback:false,executeRetrievedCode:false}};
  }catch(e){
    if(timer)clearTimeout(timer);
    return {version:"9.71",status:"LOCAL_SEARCH_UNAVAILABLE",
      message:String(e&&e.message||e),
      hint:"Start the bundled local SearXNG service."};
  }
}

function rankLocalCircuitResults(results){
  return (results||[]).map(function(x){
    var t=(String(x.title)+" "+String(x.description)+" "+String(x.url)).toLowerCase();
    var score=0;
    if(/circuit|schematic|diagram/.test(t))score+=40;
    if(/kicad|spice|ltspice|netlist|schematic/.test(t))score+=35;
    if(/datasheet|application note|reference design/.test(t))score+=15;
    return Object.assign({},x,{circuitScore:Math.min(100,score)});
  }).sort(function(a,b){return b.circuitScore-a.circuitScore;});
}

async function getLocalCircuitSearch(query){
  var r=await localSearXNGSearch(query);
  if(r.status!=="SEARCH_COMPLETE")return r;
  return {version:"10.18",status:r.results.length?"RESULTS_FOUND":"NO_RESULTS",
    results:rankLocalCircuitResults(r.results),
    provider:"SearXNG-local",paidFallback:false};
}

window.NilSparkLabSearXNGV980={
  version:"10.18",config:SEARXNG_LOCAL,
  search:localSearXNGSearch,
  rank:rankLocalCircuitResults,
  getCircuit:getLocalCircuitSearch
};
})();
