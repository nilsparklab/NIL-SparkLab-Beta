
(function(){
  'use strict';
  function augment(data, provider){
    try{
      if(!window.NIL_ASSISTANT_CITATIONS || !data) return data;
      var list = Array.isArray(data.results) ? data.results : (Array.isArray(data.items) ? data.items : []);
      var sources = window.NIL_ASSISTANT_CITATIONS.fromProviderResults(provider, list);
      if(data && typeof data === 'object' && !Array.isArray(data)){
        data.sources = sources;
      }
      return data;
    }catch(_){ return data; }
  }
  window.NIL_ASSISTANT_CITATION_INTEGRATION = Object.freeze({
    augment
  });
})();
