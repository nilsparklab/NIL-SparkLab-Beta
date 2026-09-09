
(function(){
"use strict";

/* v9.21 — backend response schema */
function validateSearchResponse(data){
  data=data||{};
  var issues=[];
  if(!Array.isArray(data.results))issues.push("results must be an array.");
  (data.results||[]).forEach(function(x){
    if(!x.url)issues.push("Search result missing URL.");
    if(x.url && !/^https?:\/\//i.test(String(x.url)))issues.push("Invalid source URL.");
  });
  return {version:"9.21",status:issues.length?"INVALID":"VALID",
    issues:issues};
}

/* v9.22 — real source retrieval contract */
async function retrieveSource(url,options){
  options=options||{};
  if(!/^https?:\/\//i.test(String(url||"")))
    return {version:"9.22",status:"INVALID_URL"};
  var maxBytes=Math.min(Number(options.maxBytes||5000000),5000000);
  try{
    var r=await fetch(url,{method:"GET",credentials:"omit"});
    if(!r.ok)return {version:"9.22",status:"HTTP_ERROR",httpStatus:r.status};
    var type=(r.headers.get("content-type")||"").toLowerCase();
    var text=await r.text();
    if(text.length>maxBytes)return {version:"9.22",status:"SIZE_LIMIT"};
    return {version:"9.22",status:"SOURCE_RETRIEVED",url:url,
      contentType:type,text:text,execute:false,parseOnly:true};
  }catch(e){
    return {version:"9.22",status:"RETRIEVAL_ERROR",message:String(e&&e.message||e)};
  }
}

/* v9.23 — native schematic preference */
function detectNativeFormat(url,contentType){
  var u=String(url||"").toLowerCase(),t=String(contentType||"").toLowerCase();
  if(/\.kicad_sch(\?|$)/.test(u)||/kicad/i.test(t))return "kicad_sch";
  if(/\.sch(\?|$)/.test(u))return "sch";
  if(/\.asc(\?|$)/.test(u))return "ltspice_asc";
  if(/\.cir(\?|$)|\.sp(\?|$)/.test(u))return "spice";
  if(/pdf/i.test(t)||/\.pdf(\?|$)/.test(u))return "pdf";
  if(/image|svg/i.test(t)||/\.(png|jpg|jpeg|svg)(\?|$)/.test(u))return "image";
  return "unknown";
}

/* v9.24 — KiCad schematic parser contract */
function parseKiCadSchematic(text){
  text=String(text||"");
  var valid=/\(\s*kicad_sch\b/.test(text);
  var wires=(text.match(/\(\s*wire\b/g)||[]).length;
  var symbols=(text.match(/\(\s*symbol\b/g)||[]).length;
  var junctions=(text.match(/\(\s*junction\b/g)||[]).length;
  var labels=(text.match(/\(\s*(?:label|global_label|hierarchical_label)\b/g)||[]).length;
  return {version:"9.24",format:"kicad_sch",status:valid?"PARSED":"INVALID",
    counts:{symbols:symbols,wires:wires,junctions:junctions,labels:labels},
    sourceFormatValidated:valid};
}

/* v9.25 — SPICE parser contract */
function parseSpice(text){
  text=String(text||"");
  var lines=text.split(/\r?\n/).filter(function(x){return /^\s*[RCLDQVUMXI]\w+/i.test(x);});
  return {version:"9.25",format:"spice",status:lines.length?"PARSED":"NO_DEVICES",
    deviceLines:lines.slice(0,5000),count:lines.length};
}

/* v9.26 — schematic-to-canonical circuit model */
function canonicalFromNative(parsed,format){
  parsed=parsed||{};
  return {version:"9.26",format:format||"unknown",
    components:parsed.components||[],
    nets:parsed.nets||[],
    sourceVerifiedStructure:parsed.status==="PARSED",
    reconstruction:"NATIVE_FORMAT_PARSE"};
}

/* v9.27 — source-to-circuit pipeline */
async function fetchAndParseCircuit(url){
  var source=await retrieveSource(url);
  if(source.status!=="SOURCE_RETRIEVED")return source;
  var format=detectNativeFormat(url,source.contentType);
  var parsed;
  if(format==="kicad_sch")parsed=parseKiCadSchematic(source.text);
  else if(format==="spice"||format==="ltspice_asc")parsed=parseSpice(source.text);
  else parsed={version:"9.27",format:format,status:"EXTRACTION_REQUIRED"};
  return {version:"9.27",status:"PARSE_COMPLETE",source:source,format:format,parsed:parsed};
}

/* v9.28 — multi-source agreement */
function sourceAgreement(circuits){
  circuits=Array.isArray(circuits)?circuits:[];
  var counts=circuits.map(function(x){
    var c=x&&x.parsed&&x.parsed.counts;
    return c?{symbols:c.symbols||0,wires:c.wires||0}:null;
  }).filter(Boolean);
  var agree=counts.length>1&&counts.every(function(x){
    return x.symbols===counts[0].symbols&&x.wires===counts[0].wires;
  });
  return {version:"9.28",status:agree?"AGREEMENT":"NO_AGREEMENT",
    comparableSources:counts.length,structuralAgreement:agree};
}

/* v9.29 — final verification gate */
function onlineVerificationGate(model,sourceInfo){
  var issues=[];
  if(!model||!model.sourceVerifiedStructure)issues.push("Native structure not verified.");
  if(!sourceInfo||!sourceInfo.url)issues.push("Source provenance missing.");
  return {version:"9.29",status:issues.length?"REVIEW_REQUIRED":"SOURCE_STRUCTURE_VERIFIED",
    issues:issues,noSimulationClaim:true};
}

/* v10.19 — universal online circuit pipeline */
async function provide(request,searchResponse){
  var validation=validateSearchResponse(searchResponse);
  if(validation.status!=="VALID")
    return {version:"10.18",status:"INVALID_SEARCH_RESPONSE",validation:validation};
  var results=searchResponse.results||[];
  var parsed=[];
  for(var i=0;i<Math.min(results.length,5);i++){
    if(results[i].url)parsed.push(await fetchAndParseCircuit(results[i].url));
  }
  var usable=parsed.filter(function(x){return x.status==="PARSE_COMPLETE";});
  var agreement=sourceAgreement(usable);
  var first=usable[0]||null;
  var model=first&&first.parsed&&first.parsed.status==="PARSED"
    ?canonicalFromNative(first.parsed,first.format):null;
  var gate=onlineVerificationGate(model,first&&first.source);
  return {version:"10.18",request:request,status:usable.length?"CIRCUITS_RETRIEVED":"NO_PARSEABLE_CIRCUIT",
    sources:results,parsed:parsed,agreement:agreement,model:model,verification:gate,
    security:{executeDownloadedCode:false,parseOnly:true,maxSources:5}};
}
window.NilSparkLabOnlineCircuitV930={
  version:"10.18",validateSearchResponse:validateSearchResponse,
  retrieveSource:retrieveSource,detectNativeFormat:detectNativeFormat,
  parseKiCadSchematic:parseKiCadSchematic,parseSpice:parseSpice,
  canonicalFromNative:canonicalFromNative,fetchAndParseCircuit:fetchAndParseCircuit,
  sourceAgreement:sourceAgreement,onlineVerificationGate:onlineVerificationGate,
  provide:provide
};
})();
