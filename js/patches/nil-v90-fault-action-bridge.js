
(function(){
  'use strict';
  function runFaultFinder(){
    var input=document.getElementById('elab-sa-input');
    var symptom=input ? String(input.value||'').trim() : '';
    var api=window.NIL_FAULT_COPILOT;
    if(!api || typeof api.run!=='function'){
      var host=document.getElementById('elab-smart-content');
      if(host) host.innerHTML='<div class="sa-answer"><b>Fault Finder</b><br>Fault Finder is still loading. Please try again.</div>';
      return false;
    }
    api.run(symptom || 'Check my current circuit for faults');
    return true;
  }
  window.NIL_FAULT_ACTION_BRIDGE=Object.freeze({run:runFaultFinder});
})();
