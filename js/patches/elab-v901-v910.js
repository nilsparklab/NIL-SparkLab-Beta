
(function(){
"use strict";

/* v9.01 — retrieval adapter contract */
function retrievalAdapter(query,options){
  options=options||{};
  return {version:"9.01",query:String(query||""),
    domains:options.domains||[],maxResults:Math.min(Number(options.maxResults||10),50),
    safeMode:true,executeRetrievedCode:false,status:"RETRIEVAL_REQUEST_READY"};
}

/* v9.02 — source normalization */
function normalizeSources(results){
  results=Array.isArray(results)?results:[];
  return results.map(function(x){
    return {title:x.title||null,url:x.url||null,
      sourceType:x.sourceType||"unknown",license:x.license||"unknown",
      snippet:x.snippet||"",retrievedAt:x.retrievedAt||new Date().toISOString()};
  });
}

/* v9.03 — source deduplication */
function deduplicateSources(results){
  var seen={},out=[];
  normalizeSources(results).forEach(function(x){
    var key=x.url||x.title||Math.random().toString(36);
    if(!seen[key]){seen[key]=true;out.push(x);}
  });
  return {version:"9.03",sources:out,count:out.length};
}

/* v9.04 — document extraction adapter */
function documentExtractor(asset){
  return {version:"9.04",asset:asset||null,
    accepted:["pdf","png","jpg","jpeg","webp","svg"],
    stages:["parse","render","OCR","symbol detection","wire detection","value extraction"],
    sandbox:true,status:asset?"EXTRACTION_REQUEST_READY":"NEEDS_ASSET"};
}

/* v9.05 — schematic symbol recognizer contract */
function symbolRecognizer(elements){
  elements=Array.isArray(elements)?elements:[];
  return {version:"9.05",
    symbols:elements.map(function(x){
      return {type:x.type||"unknown",ref:x.ref||null,
        bbox:x.bbox||null,confidence:Number(x.confidence||0)};
    }),
    status:"SYMBOL_REVIEW_READY"};
}

/* v9.06 — wire/net extraction */
function wireExtractor(lines){
  lines=Array.isArray(lines)?lines:[];
  return {version:"9.06",
    nets:lines.filter(function(x){return x.from&&x.to;}).map(function(x){
      return {from:String(x.from),to:String(x.to),confidence:Number(x.confidence||0)};
    }),
    status:"NET_EXTRACTION_READY"};
}

/* v9.07 — extraction confidence fusion */
function confidenceFusion(symbols,nets,source){
  var s=Array.isArray(symbols)?symbols:[], n=Array.isArray(nets)?nets:[];
  var avg=function(a){return a.length?a.reduce(function(t,x){return t+Number(x.confidence||0);},0)/a.length:0;};
  var score=Math.round((avg(s)*0.45+avg(n)*0.35+Number(source||0)*0.20));
  return {version:"9.07",score:Math.max(0,Math.min(100,score)),
    status:score>=85?"HIGH":score>=60?"MEDIUM":"LOW",
    humanReviewRequired:score<85};
}

/* v9.08 — external-data security boundary */
function externalDataGuard(text){
  text=String(text||"");
  var issues=[];
  if(text.length>5000000)issues.push("External data exceeds safe size limit.");
  if(/<script\b|javascript:|vbscript:|onerror\s*=/i.test(text))
    issues.push("Executable content rejected.");
  return {version:"9.08",status:issues.length?"BLOCKED":"SAFE",
    issues:issues,networkExecution:false,codeExecution:false};
}

/* v9.09 — connector result package */
function connectorPackage(query,results,extracted){
  var sources=deduplicateSources(results).sources;
  return {version:"9.09",query:query,sources:sources,
    extraction:extracted||null,provenanceRequired:true,
    verified:false};
}

/* v9.11 — retrieval/extraction orchestrator */
function generate(query,options,results,extracted){
  var req=retrievalAdapter(query,options);
  var guard=externalDataGuard(JSON.stringify(results||[]));
  if(guard.status==="BLOCKED")
    return {version:"9.11",status:"BLOCKED",request:req,security:guard};
  var pkg=connectorPackage(query,results,extracted);
  return {version:"9.11",status:"READY_FOR_ANALYSIS",
    request:req,security:guard,package:pkg};
}
window.NilSparkLabUniversalV910={
 version:"9.11",retrievalAdapter:retrievalAdapter,
 normalizeSources:normalizeSources,deduplicateSources:deduplicateSources,
 documentExtractor:documentExtractor,symbolRecognizer:symbolRecognizer,
 wireExtractor:wireExtractor,confidenceFusion:confidenceFusion,
 externalDataGuard:externalDataGuard,connectorPackage:connectorPackage,
 generate:generate
};
})();
