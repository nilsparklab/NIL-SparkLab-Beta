
// v5.55 FINAL FINAL initialization: keep Home flow state synchronized from first render.
document.addEventListener('DOMContentLoaded', function(){
  if (typeof updateHomeFlow === 'function') updateHomeFlow();
});
