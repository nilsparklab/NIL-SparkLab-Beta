
(function(){
  "use strict";

  function boot(){
    var mic=document.getElementById("elab-assistant-mic");
    var panel=document.getElementById("elab-smart-panel");
    if(!mic || !panel) return false;

    var input=document.getElementById("elab-sa-input") ||
      panel.querySelector("input, textarea");
    var SR=window.SpeechRecognition || window.webkitSpeechRecognition;

    mic.style.display="grid";
    mic.type="button";
    mic.setAttribute("aria-label","Voice input");
    mic.title="Tap to speak";

    if(!input){
      mic.disabled=true;
      mic.title="Assistant input not found";
      return true;
    }

    if(!SR){
      mic.disabled=false;
      mic.title="Voice input needs a supported browser (Chrome/Chromium)";
      mic.setAttribute("aria-label","Voice input unavailable");
      mic.onclick=function(){
        if(window.toast) toast("Voice input needs Chrome/Chromium. Open the online HTTPS site and allow microphone access.");
      };
      return true;
    }

    var recognition=null;
    var listening=false;

    function resetMic(){
      listening=false;
      mic.disabled=false;
      mic.textContent="🎙️";
      mic.setAttribute("aria-label","Voice input");
      mic.title="Tap to speak";
      mic.removeAttribute("aria-busy");
      mic.classList.remove("is-listening");
    }

    function showMicError(code){
      var msg="Mic error";
      if(code==="not-allowed" || code==="service-not-allowed"){
        msg="Microphone permission denied. Allow microphone access for this site.";
      }else if(code==="audio-capture"){
        msg="Microphone not available. Check your device microphone.";
      }else if(code==="no-speech"){
        msg="No speech detected. Try again.";
      }else if(code==="network"){
        msg="Voice service/network unavailable. Check your connection.";
      }else if(code==="aborted"){
        msg="Voice input stopped.";
      }else if(code){
        msg="Mic error: "+code;
      }
      if(window.toast) toast(msg);
      else console.warn("NilSparkLab voice:",msg);
    }

    try{
      recognition=new SR();
      recognition.lang="en-IN";
      recognition.interimResults=false;
      recognition.continuous=false;
      recognition.maxAlternatives=1;
    }catch(err){
      mic.disabled=true;
      mic.title="Voice input could not be initialized";
      return true;
    }

    recognition.onstart=function(){
      listening=true;
      mic.disabled=false;
      mic.textContent="⏺";
      mic.setAttribute("aria-label","Listening");
      mic.title="Listening… tap again after speech finishes";
      mic.setAttribute("aria-busy","true");
      mic.classList.add("is-listening");
    };

    recognition.onresult=function(event){
      var text="";
      try{
        if(event.results && event.results[0] && event.results[0][0]){
          text=String(event.results[0][0].transcript||"").trim();
        }
      }catch(_){}
      if(!text) return;

      input.value=text;
      input.dispatchEvent(new Event("input",{bubbles:true}));
      input.focus();

      /* Voice should fill the Assistant search box; do not auto-submit. */
    };

    recognition.onerror=function(event){
      showMicError(event && event.error ? event.error : "unknown");
      resetMic();
    };

    recognition.onend=function(){
      resetMic();
    };

    mic.onclick=function(){
      if(listening) return;
      try{
        recognition.start();
      }catch(err){
        resetMic();
        if(window.toast) toast("Mic busy. Try again in a moment.");
      }
    };

    return true;
  }

  if(!boot()){
    document.addEventListener("DOMContentLoaded",boot,{once:true});
  }
})();
