
(function(){'use strict';
  function addStudyQuickActions(){var host=document.getElementById('elab-sa-chips');if(!host)return;var extras=[['Study Topics','study topics'],['Basic Electricity','basic electricity'],['Transformer','transformer principle'],['KCL & KVL','kcl kvl']];extras.forEach(function(x){if(host.querySelector('[data-sa-q="'+x[1]+'"]'))return;var b=document.createElement('button');b.type='button';b.className='sa-chip';b.setAttribute('data-sa-q',x[1]);b.textContent=x[0];host.appendChild(b);});}
  document.addEventListener('click',function(e){if(e.target.closest('#elab-smart-assistant-btn'))setTimeout(addStudyQuickActions,30);});
  window.addEventListener('nilsparklab:study-quiz-complete',function(){try{if(window.NILStudyMode)window.NILStudyMode.render('');}catch(e){}});
})();
