
(function(){
  "use strict";

  const LIMITS = Object.freeze({
    maxProjectBytes: 2 * 1024 * 1024,
    maxComponents: 200,
    maxWires: 400,
    maxString: 4096,
    maxArray: 1000
  });

  const BAD_PATTERNS = [
    /<\s*script\b/i,
    /<\s*iframe\b/i,
    /<\s*object\b/i,
    /<\s*embed\b/i,
    /\bon(?:error|load|click|mouseover|focus|pointer\w*)\s*=/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /srcdoc\s*=/i,
    /document\s*\.\s*(cookie|domain)/i,
    /localStorage\s*\.\s*(setItem|removeItem|clear)\s*\(/i,
    /sessionStorage\s*\.\s*(setItem|removeItem|clear)\s*\(/i
  ];

  function safeString(v){
    return typeof v === "string" && v.length <= LIMITS.maxString;
  }

  function scanString(v){
    if(!safeString(v)) return false;
    return !BAD_PATTERNS.some(rx => rx.test(v));
  }

  function deepScan(value, depth){
    if(depth > 8) return false;
    if(typeof value === "string") return scanString(value);
    if(value === null || typeof value !== "object") return true;
    if(Array.isArray(value)){
      if(value.length > LIMITS.maxArray) return false;
      return value.every(v => deepScan(v, depth + 1));
    }
    const keys = Object.keys(value);
    if(keys.length > LIMITS.maxArray) return false;
    return keys.every(k => scanString(k) && deepScan(value[k], depth + 1));
  }

  // Compatibility API only. Project structure validation is owned by the
  // canonical NilSparkLabSecurity validator below; this layer retains only its
  // independent text-size/legacy safety checks.
  window.NilSparkLabSecurityV6 = Object.freeze({
    version: "6.0",
    limits: LIMITS,
    scanString,
    deepScan,
    validateImportText(text){
      if(typeof text !== "string") return {ok:false,reason:"Not text"};
      if(text.length > LIMITS.maxProjectBytes) return {ok:false,reason:"Project exceeds 2 MB limit"};
      if(!scanString(text)) return {ok:false,reason:"Potentially unsafe content detected"};
      try{
        const obj = JSON.parse(text);
        const canonical = window.NilSparkLabSecurity && window.NilSparkLabSecurity.validateProject;
        if(typeof canonical !== "function") return {ok:false,reason:"Canonical project validator unavailable"};
        const result = canonical(obj);
        return result && result.ok
          ? {ok:true,project:result.value}
          : {ok:false,reason:(result && result.error) || "Project schema/security validation failed"};
      }catch(e){
        return {ok:false,reason:"Invalid project JSON"};
      }
    }
  });

  // Guard common dynamic HTML sinks when a plain string is supplied.
  // Existing application markup generated through trusted DOM APIs is left alone.
  const originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function(position, text){
    if(typeof text === "string" && !scanString(text)){
      console.warn("NilSparkLab Security: blocked unsafe HTML insertion.");
      return;
    }
    return originalInsertAdjacentHTML.call(this, position, text);
  };

  // Block dangerous URL assignments through the common anchor/image/script
  // attributes without interfering with ordinary relative/https URLs.
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value){
    const n = String(name).toLowerCase();
    if((n === "href" || n === "src" || n === "action" || n === "formaction") &&
       typeof value === "string" &&
       /^(?:javascript|vbscript):/i.test(value.trim())){
      console.warn("NilSparkLab Security: blocked dangerous URL.");
      return;
    }
    return originalSetAttribute.call(this, name, value);
  };

  // Security telemetry stays local; no network exfiltration.
  const securityState = {
    blocked: 0,
    lastIssue: null,
    startedAt: Date.now()
  };
  window.NilSparkLabSecurityState = securityState;

  function block(reason){
    securityState.blocked++;
    securityState.lastIssue = String(reason || "blocked");
    console.warn("NilSparkLab Security:", securityState.lastIssue);
  }

  // Safe JSON parsing helper for modules that opt into it.
  window.NilSparkLabSafeJSON = Object.freeze({
    parse(text){
      const canonical = window.NilSparkLabSecurity && window.NilSparkLabSecurity.validateImportText;
      if(typeof canonical !== "function") { block("canonical project validator unavailable"); return null; }
      const result = canonical(text);
      if(!result.ok){
        block(result.reason);
        return null;
      }
      return result.project;
    }
  });

  // Keep security status compact and unobtrusive.
  document.addEventListener("DOMContentLoaded", function(){
    if(document.getElementById("elab-v600-security-badge")) return;
    
  });

})();
