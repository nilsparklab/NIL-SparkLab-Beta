
(function(){
"use strict";

/* Route the Wi-Fi-jammer trigger to the access gate instead of the old
   directly-opened safe canvas. This listener runs in capture phase. */
function wifiTrigger(text){
  text=String(text||"").trim();
  return /\bwifi\s+jam+er\b/i.test(text) ||
         /\bwi[\s-]?fi\s+jam+er\b/i.test(text) ||
         /\bwife\s+jam+er\b/i.test(text) ||
         /\bwifi\s+jam+ming\b/i.test(text);
}

function requestAdvancedAccess(){
  if(window.NilSparkLabAdvancedEducationalAccess &&
     typeof window.NilSparkLabAdvancedEducationalAccess.open==="function"){
    window.NilSparkLabAdvancedEducationalAccess.open();
    return true;
  }
  return false;
}

function intercept(e){
  if(e.key!=="Enter" || e.shiftKey)return;
  var el=e.target;
  if(!el || !("value" in el))return;
  if(!wifiTrigger(el.value))return;

  /* Only intercept the exact educational trigger. */
  e.preventDefault();
  e.stopPropagation();
  if(typeof e.stopImmediatePropagation==="function")e.stopImmediatePropagation();
  requestAdvancedAccess();
}

document.addEventListener("keydown",intercept,true);

/* Also expose a clean programmatic route for the assistant. */
window.NilSparkLabSafeWifiV1013={
  version:"10.18",
  requestAccess:requestAdvancedAccess
};
})();
