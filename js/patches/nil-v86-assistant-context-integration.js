
(function(){
  'use strict';

  function syncLiveContext(){
    try{
      if(window.NIL_ASSISTANT_CONTEXT && typeof window.NIL_ASSISTANT_CONTEXT.captureLiveBuilderContext==='function'){
        window.NIL_ASSISTANT_CONTEXT.captureLiveBuilderContext();
      }
    }catch(_){}
  }

  function installConversationBridge(){
    if(typeof window.askAI!=='function' || window.askAI.__nilContextWrapped) return false;
    var original=window.askAI;
    function wrapped(question){
      syncLiveContext();
      try{
        if(window.NIL_ASSISTANT_CONTEXT) window.NIL_ASSISTANT_CONTEXT.pushConversation('user',String(question||''));
      }catch(_){}
      var answer=original.apply(this,arguments);
      try{
        if(window.NIL_ASSISTANT_CONTEXT) window.NIL_ASSISTANT_CONTEXT.pushConversation('assistant',String(answer||''));
      }catch(_){}
      return answer;
    }
    wrapped.__nilContextWrapped=true;
    wrapped.__nilOriginal=original;
    window.askAI=wrapped;
    return true;
  }

  syncLiveContext();
  if(!installConversationBridge()){
    document.addEventListener('DOMContentLoaded',installConversationBridge,{once:true});
  }
  window.NILAssistantContextIntegration=Object.freeze({
    version:'v86',
    sync:syncLiveContext,
    install:installConversationBridge
  });
})();
