
(function(){
"use strict";

var PUBLIC_SEARCH={
  enabled:false,
  paidApi:false,
  apiKeyRequired:false,
  providers:["public-web"],
  maxResults:10,
  timeoutMs:8000,
  executeRetrievedCode:false
};

/* v9.81 — public-search query */
function publicSearchQuery(query){
  var q=String(query||"").trim();
  return {
    version:"9.81",query:q,
    searchTerms:[
      q+" circuit diagram schematic",
      q+" circuit schematic PDF",
      q+" KiCad schematic",
      q+" SPICE netlist"
    ],
    paidApi:false
  };
}

/* v9.82 — public web resolver */
async function publicWebSearch(query,options){
  options=options||{};
  var q=String(query||"").trim();
  if(!q)return {version:"9.82",status:"NEEDS_QUERY"};

  /*
   Public endpoint is intentionally configurable. No API key is sent.
   Default points to the local SearXNG/public-search bridge.
  */
  var endpoint=options.endpoint||"";
  if(!PUBLIC_SEARCH.enabled || !endpoint)return {version:"9.82",status:"DISABLED",message:"Search backend is not configured."};
  try{
    var u=new URL(endpoint);
    u.searchParams.set("q",q+" circuit schematic diagram");
    u.searchParams.set("format","json");
    u.searchParams.set("safesearch","1");

    var controller=typeof AbortController!=="undefined"?new AbortController():null;
    var timer=controller?setTimeout(function(){controller.abort();},PUBLIC_SEARCH.timeoutMs):null;

    var r=await fetch(u.toString(),{
      method:"GET",
      credentials:"omit",
      signal:controller?controller.signal:undefined
    });
    if(timer)clearTimeout(timer);

    if(!r.ok)return {version:"9.82",status:"PUBLIC_SEARCH_ERROR",httpStatus:r.status};

    var d=await r.json();
    var results=Array.isArray(d.results)?d.results:[];

    return {
      version:"9.82",status:"PUBLIC_SEARCH_COMPLETE",
      results:results.slice(0,PUBLIC_SEARCH.maxResults).map(function(x){
        return {
          title:x.title||"",
          url:x.url||null,
          description:x.content||"",
          engine:x.engine||"public",
          sourceType:"public-web",
          license:"unknown"
        };
      }),
      paidApi:false,
      executeRetrievedCode:false
    };
  }catch(e){
    if(e&&e.name==="AbortError")
      return {version:"9.82",status:"SEARCH_TIMEOUT"};
    return {
      version:"9.82",status:"PUBLIC_SEARCH_UNAVAILABLE",
      message:String(e&&e.message||e),
      note:"No paid API or API key is used."
    };
  }
}

/* v9.83 — circuit relevance */
function rankPublicCircuits(results){
  return (results||[]).map(function(x){
    var t=String(
      (x.title||"")+" "+
      (x.description||"")+" "+
      (x.url||"")
    ).toLowerCase();

    var score=0;
    if(/circuit|schematic|diagram/.test(t))score+=35;
    if(/kicad|spice|ltspice|netlist/.test(t))score+=30;
    if(/pdf|datasheet|reference design/.test(t))score+=15;
    if(/github|gitlab/.test(t))score+=10;

    return Object.assign({},x,{
      circuitRelevance:Math.min(100,score)
    });
  }).sort(function(a,b){
    return b.circuitRelevance-a.circuitRelevance;
  });
}

/* v9.84 — public source safety gate */
function publicSourceSafety(result){
  result=result||{};
  var url=String(result.url||"");
  var safeUrl=/^https?:\/\//i.test(url);

  return {
    version:"9.84",
    status:safeUrl?"ACCEPTED":"REJECTED",
    url:url,
    executeRetrievedCode:false,
    parseOnly:true,
    provenanceRequired:true
  };
}

/* v9.85 — source package */
function publicCircuitSource(result){
  var gate=publicSourceSafety(result);
  if(gate.status!=="ACCEPTED")return null;

  return {
    version:"9.85",
    title:result.title||"Circuit source",
    url:result.url,
    description:result.description||"",
    sourceType:"public-web",
    license:result.license||"unknown",
    relevance:Number(result.circuitRelevance||0),
    verified:false
  };
}

/* v9.86 — public-search assistant */
async function findPublicCircuit(query,options){
  var search=await publicWebSearch(query,options);

  if(search.status!=="PUBLIC_SEARCH_COMPLETE")
    return {
      version:"9.86",
      status:search.status,
      paidApi:false
    };

  var ranked=rankPublicCircuits(search.results);
  var sources=ranked.map(publicCircuitSource).filter(Boolean);

  return {
    version:"9.86",
    status:sources.length?"CIRCUIT_SOURCES_FOUND":"NO_CIRCUIT_SOURCE",
    sources:sources.slice(0,10),
    paidApi:false,
    automaticBilling:false
  };
}

/* v9.87 — extraction handoff */
function publicExtractionHandoff(source){
  if(!source)return {version:"9.87",status:"NO_SOURCE"};

  return {
    version:"9.87",
    status:"READY",
    source:source,
    preferredFormats:[
      "kicad_sch",
      "spice",
      "asc",
      "svg",
      "pdf",
      "image"
    ],
    executeRetrievedCode:false
  };
}

/* v9.88 — verification requirement */
function publicVerificationGate(source,extracted){
  return {
    version:"9.88",
    source:source||null,
    extracted:!!extracted,
    verified:false,
    message:"Circuit must be parsed and electrically checked before being labelled verified."
  };
}

/* v9.89 — complete public-search pipeline */
async function publicCircuitAssistant(query,options){
  var found=await findPublicCircuit(query,options);
  var best=found.sources&&found.sources[0]||null;

  return {
    version:"9.89",
    query:query,
    status:found.status,
    bestSource:best,
    alternatives:(found.sources||[]).slice(1,5),
    extraction:publicExtractionHandoff(best),
    verification:publicVerificationGate(best,false),
    payment:{
      paidApi:false,
      apiKeyRequired:false,
      automaticBilling:false
    }
  };
}

/* v10.19 — FINAL Public Circuit Search */
async function searchPublicCircuit(query,options){
  return await publicCircuitAssistant(query,options);
}

window.NilSparkLabPublicCircuitV990={
  version:"10.18",
  config:PUBLIC_SEARCH,
  query:publicSearchQuery,
  search:publicWebSearch,
  rank:rankPublicCircuits,
  safety:publicSourceSafety,
  findCircuit:findPublicCircuit,
  assistant:publicCircuitAssistant,
  searchCircuit:searchPublicCircuit
};
})();
