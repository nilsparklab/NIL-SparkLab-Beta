
(function(){
"use strict";
var CONNECTED_GATEWAY={
  enabled:true,
  endpoint:"/api/v1/search",
  timeoutMs:12000,
  maxResults:10,
  provider:"server-side",
  clientNeverReceivesSearchKey:true,
  executeRetrievedCode:false
};
async function connectedCircuitSearch(query,options){
  options=options||{};
  var q=String(query||"").trim();
  if(!q)return {version:"10.18",status:"NEEDS_QUERY"};
  var controller=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort();},CONNECTED_GATEWAY.timeoutMs):null;
  try{
    var r=await fetch(CONNECTED_GATEWAY.endpoint,{
      method:"POST",credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        query:q,
        maxResults:Math.min(Number(options.maxResults||CONNECTED_GATEWAY.maxResults),25),
        intent:"circuit_diagram",
        formats:["kicad_sch","spice","asc","svg","pdf","image"],
        safety:{parseOnly:true,executeRetrievedCode:false}
      }),
      signal:controller?controller.signal:undefined
    });
    if(timer)clearTimeout(timer);
    if(!r.ok)return {version:"10.18",status:"GATEWAY_ERROR",httpStatus:r.status};
    var data=await r.json();
    return {version:"10.18",status:"CONNECTED",results:Array.isArray(data.results)?data.results:[],
      provider:data.provider||"server-side",provenanceRequired:true};
  }catch(e){
    if(timer)clearTimeout(timer);
    return {version:"10.18",status:"GATEWAY_UNAVAILABLE",
      message:String(e&&e.message||e)};
  }
}
window.NilSparkLabConnectedCircuitV960={
 version:"10.18",config:CONNECTED_GATEWAY,search:connectedCircuitSearch
};
})();
