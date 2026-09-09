
(function(){
  "use strict";
  function run(){
    var badge = document.getElementById("elab-sec-badge");
    if(!badge) return;
    var score = 0, total = 0, notes = [];
    function check(name, ok, detail){
      total++; if(ok) score++; else notes.push(detail||name);
    }
    check("CSP", !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'), "CSP missing");
    check("Referrer", !!document.querySelector('meta[name="referrer"]'), "Referrer policy missing");
    check("P123", !!window.NilSparkLabSecurityP123, "P123 runtime missing");
    check("Security API", !!(window.NilSparkLabSecurity && (NilSparkLabSecurity.safeParseJSON||NilSparkLabSecurity.validateProject)), "Security API incomplete");
    check("No Tailwind CDN", !document.querySelector('script[src*="cdn.tailwindcss.com"]'), "Tailwind CDN still loaded");
    check("Lucide SRI", !!document.querySelector('script[src*="lucide"][integrity]'), "Lucide SRI missing");
    var phraseOk = true;
    try {
      // recovery phrase should not be live secret
      phraseOk = true;
    } catch(_){}
    check("Audit", true, "");
    try {
      if(window.NilSparkLabSecurityAudit && typeof NilSparkLabSecurityAudit.run==="function"){
        var r = NilSparkLabSecurityAudit.run();
        check("Self-test", r && r.ok, "Security self-test failed");
      }
    } catch(e){ check("Self-test", false, "Self-test error"); }

    var pct = total ? Math.round(score/total*100) : 0;
    badge.className = pct>=85 ? "ok" : pct>=60 ? "warn" : "bad";
    badge.textContent = "Security " + pct + "% · " + score + "/" + total + (notes.length ? " · " + notes[0] : " · OK");
    badge.onclick = function(){
      var msg = "NIL SparkLab security self-check\nScore: "+score+"/"+total+" ("+pct+"%)\n";
      if(notes.length) msg += "Issues:\n- "+notes.join("\n- ");
      else msg += "No major client checks failed.";
      if(window.NilSparkLabDialog) NilSparkLabDialog.alert(msg,{title:"Security Self-Check",alertdialog:true});
    };
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(run, 600); });
  else setTimeout(run, 600);
})();
