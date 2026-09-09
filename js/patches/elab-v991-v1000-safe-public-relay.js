
(function(){
"use strict";

/*
 ZERO-CREDENTIAL POLICY
 - No API keys.
 - No billing/payment credentials.
 - No third-party account credentials.
 - Search relay is treated as disposable/untrusted.
 - Only metadata/text/URLs are accepted by default.
 - Downloaded executable content is never executed.
*/
var SAFE_PUBLIC_RELAY={
  enabled:true,
  endpoint:"/public-search",
  timeoutMs:7000,
  maxResults:8,
  maxTextBytes:20000,
  maxUrlLength:2048,
  allowDownloads:false,
  allowCodeExecution:false,
  allowCredentials:false,
  paidFallback:false
};

/* v9.91 — strict query envelope */
function makeSafeSearchRequest(query){
  var q=String(query||"").trim().slice(0,500);
  return {
    version:"9.91",
    query:q,
    intent:"circuit_information",
    output:["title","url","snippet"],
    maxResults:SAFE_PUBLIC_RELAY.maxResults,
    credentials:false,
    paidFallback:false
  };
}

/* v9.92 — URL safety */
function safePublicUrl(url){
  try{
    var u=new URL(String(url||""));
    if(!/^https?:$/i.test(u.protocol))return false;
    if(u.username||u.password)return false;
    if(u.href.length>SAFE_PUBLIC_RELAY.maxUrlLength)return false;
    return true;
  }catch(e){return false;}
}

/* v9.93 — result sanitizer */
function sanitizePublicResults(results){
  return (Array.isArray(results)?results:[]).slice(0,SAFE_PUBLIC_RELAY.maxResults)
    .map(function(x){
      var url=safePublicUrl(x&&x.url);
      return {
        title:String(x&&x.title||"").slice(0,500),
        url:url?String(x.url):null,
        snippet:String(x&&x.snippet||x&&x.description||"")
          .replace(/<script[\s\S]*?<\/script>/gi,"")
          .replace(/<[^>]*>/g,"")
          .slice(0,SAFE_PUBLIC_RELAY.maxTextBytes),
        source:"public-web",
        untrusted:true,
        executable:false
      };
    })
    .filter(function(x){return !!x.url;});
}

/* v9.94 — disposable relay call */
async function safePublicSearch(query){
  var req=makeSafeSearchRequest(query);
  if(!req.query)return {version:"9.94",status:"NEEDS_QUERY"};

  var controller=typeof AbortController!=="undefined"?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort();},SAFE_PUBLIC_RELAY.timeoutMs):null;

  try{
    var r=await fetch(SAFE_PUBLIC_RELAY.endpoint,{
      method:"POST",
      credentials:"omit",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(req),
      signal:controller?controller.signal:undefined
    });
    if(timer)clearTimeout(timer);
    if(!r.ok)return {version:"9.94",status:"RELAY_UNAVAILABLE",httpStatus:r.status};
    var data=await r.json();
    return {
      version:"9.94",
      status:"RELAY_SUCCESS",
      results:sanitizePublicResults(data.results),
      security:{credentials:false,paidFallback:false,execute:false}
    };
  }catch(e){
    if(timer)clearTimeout(timer);
    return {version:"9.94",status:"RELAY_UNAVAILABLE"};
  }
}

/* v9.95 — circuit relevance */
function rankCircuitPublicResults(results){
  return (results||[]).map(function(x){
    var t=(x.title+" "+x.snippet).toLowerCase(),score=0;
    if(/circuit|schematic|diagram/.test(t))score+=40;
    if(/kicad|spice|ltspice|netlist/.test(t))score+=30;
    if(/datasheet|reference design|application note/.test(t))score+=15;
    return Object.assign({},x,{circuitRelevance:Math.min(100,score)});
  }).sort(function(a,b){return b.circuitRelevance-a.circuitRelevance;});
}

/* v9.96 — source-only delivery */
function sourceOnlyCircuitAnswer(query,results){
  var ranked=rankCircuitPublicResults(results);
  return {
    version:"9.96",
    query:query,
    status:ranked.length?"PUBLIC_SOURCES_FOUND":"NO_PUBLIC_SOURCE",
    sources:ranked.slice(0,8),
    downloadedFiles:false,
    verificationRequired:true
  };
}

/* v9.97 — isolated handoff */
function isolatedCircuitHandoff(source){
  return {
    version:"9.97",
    status:source?"READY_FOR_SANDBOX_PARSING":"NO_SOURCE",
    source:source||null,
    isolation:"disposable-parser-sandbox",
    execute:false,
    writeToMainDatabase:false
  };
}

/* v9.98 — zero-payment guard */
function zeroPaymentGuard(){
  return {
    version:"9.98",
    apiKey:false,
    paymentCredential:false,
    automaticBilling:false,
    paidFallback:false
  };
}

/* v9.99 — assistant public search */
async function noCredentialPublicAssistant(query){
  var r=await safePublicSearch(query);
  if(r.status!=="RELAY_SUCCESS"){
    return {
      version:"9.99",
      status:"ONLINE_SEARCH_UNAVAILABLE",
      message:"Public search relay is unavailable. No paid fallback is used.",
      payment:zeroPaymentGuard()
    };
  }
  var answer=sourceOnlyCircuitAnswer(query,r.results);
  return {
    version:"9.99",
    status:answer.status,
    sources:answer.sources,
    handoff:isolatedCircuitHandoff(answer.sources[0]),
    payment:zeroPaymentGuard()
  };
}

/* v10.19 — FINAL NO-CREDENTIAL PUBLIC SEARCH CORE */
window.NilSparkLabSafePublicSearchV1000={
  version:"10.18",
  config:SAFE_PUBLIC_RELAY,
  search:safePublicSearch,
  sanitize:sanitizePublicResults,
  rank:rankCircuitPublicResults,
  answer:sourceOnlyCircuitAnswer,
  assistant:noCredentialPublicAssistant,
  paymentGuard:zeroPaymentGuard
};
})();
