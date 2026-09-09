
(function(){
  "use strict";
  if(window.NilSparkLabDialog) return;
  function iconSvg(kind){
    if(kind==='info') return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 10v6"></path><path d="M12 7h.01"></path></svg>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.7h3.4l7 7v3.6l-7 7h-3.4l-7-7v-3.6l7-7Z"></path><path d="M12 8v4"></path><path d="M12 15.8h.01"></path></svg>';
  }
  function openDialog(opts){
    opts=opts||{};
    if(document.querySelector('.elab-dialog-backdrop')) return Promise.resolve(false);
    var previous=document.activeElement;
    var backdrop=document.createElement('div'); backdrop.className='elab-dialog-backdrop';
    backdrop.setAttribute('role',opts.alertdialog?'alertdialog':'dialog'); backdrop.setAttribute('aria-modal','true');
    var card=document.createElement('div'); card.className='elab-dialog-card';
    var head=document.createElement('div'); head.className='elab-dialog-head';
    var icon=document.createElement('div'); icon.className='elab-dialog-icon'; icon.innerHTML=iconSvg(opts.danger?'danger':'info');
    var copy=document.createElement('div');
    var kicker=document.createElement('p'); kicker.className='elab-dialog-kicker'; kicker.textContent=opts.kicker||'NIL SparkLab';
    var title=document.createElement('h2'); title.className='elab-dialog-title'; title.id='elab-dialog-title'; title.textContent=opts.title||'Confirm action'; copy.append(kicker,title); head.append(icon,copy);
    var body=document.createElement('div'); body.className='elab-dialog-body';
    var msg=document.createElement('p'); msg.className='elab-dialog-message'; msg.id='elab-dialog-message'; msg.textContent=opts.message||''; body.append(msg);
    if(opts.componentName){var chip=document.createElement('div');chip.className='elab-dialog-component';chip.textContent=opts.componentName;body.append(chip);}
    var input=null;
    if(opts.input){input=document.createElement('input');input.className='elab-dialog-input';input.type='text';input.value=opts.value||'';input.placeholder=opts.placeholder||'';input.setAttribute('aria-label',opts.inputLabel||'Input');body.append(input);}
    var actions=document.createElement('div');actions.className='elab-dialog-actions';
    var cancel=document.createElement('button');cancel.type='button';cancel.textContent=opts.cancelText||'CANCEL';
    var primary=document.createElement('button');primary.type='button';primary.textContent=opts.okText||'OK';primary.className=opts.danger?'danger':'primary';
    actions.append(cancel,primary);card.append(head,body,actions);backdrop.setAttribute('aria-labelledby',title.id);backdrop.setAttribute('aria-describedby',msg.id);backdrop.append(card);document.body.appendChild(backdrop);
    var done=false,resolve;var promise=new Promise(function(r){resolve=r;});
    function close(result){if(done)return;done=true;document.removeEventListener('keydown',onKey,true);backdrop.remove();try{if(previous&&previous.focus)previous.focus();}catch(_){}resolve(result);}
    function onKey(e){if(e.key==='Escape'){e.preventDefault();close(opts.input?null:false);return;}if(e.key==='Enter'&&document.activeElement!==cancel){e.preventDefault();close(opts.input?(input?input.value:''):true);return;}if(e.key!=='Tab')return;var focusables=[cancel,primary];if(input)focusables.unshift(input);var first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    cancel.addEventListener('click',function(){close(opts.input?null:false);});primary.addEventListener('click',function(){close(opts.input?(input?input.value:''):true);});backdrop.addEventListener('click',function(e){if(e.target===backdrop&&opts.closeOnBackdrop)close(opts.input?null:false);});document.addEventListener('keydown',onKey,true);setTimeout(function(){try{(opts.input?input:cancel).focus();if(input)input.select();}catch(_){}},0);return promise;
  }
  window.NilSparkLabDialog=Object.freeze({
    confirm:function(message,opts){opts=Object.assign({},opts,{message:message,okText:(opts&&opts.okText)||'OK'});return openDialog(opts);},
    alert:function(message,opts){opts=Object.assign({},opts,{message:message,okText:'OK'});return openDialog(opts).then(function(){return true;});},
    prompt:function(message,value,opts){opts=Object.assign({},opts,{message:message,value:value||'',input:true,okText:(opts&&opts.okText)||'OK'});return openDialog(opts);}
  });
})();
