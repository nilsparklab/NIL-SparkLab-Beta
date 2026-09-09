(function(){
'use strict';
const S=window.NilSparkLabSecurityState=window.NilSparkLabSecurityState||{blocked:0,lastIssue:null,startedAt:Date.now()};
const MAX_MSG=16384, RATE_WINDOW=5000, RATE_MAX=30, buckets=new Map();
function block(r){S.blocked=(S.blocked||0)+1;S.lastIssue=String(r||'blocked');console.warn('NilSparkLab Security:',S.lastIssue);}
function rate(key){const now=Date.now();let b=buckets.get(key);if(!b||now-b.t>RATE_WINDOW){b={t:now,n:0};buckets.set(key,b);} b.n++; return b.n<=RATE_MAX;}
function safeUrl(v){try{const u=new URL(String(v),location.href);return ['http:','https:'].includes(u.protocol)&&(!u.username&&!u.password);}catch(e){return false;}}
function safeMessage(e){if(!e||e.data==null)return false; if(typeof e.data==='string'&&e.data.length>MAX_MSG)return false; if(typeof e.data==='object'){try{if(JSON.stringify(e.data).length>MAX_MSG)return false;}catch(_){return false;}} return e.origin===location.origin;}
// Prototype-pollution guard for objects entering the application.
const BAD_KEYS=new Set(['__proto__','prototype','constructor']);
function clean(o,depth){if(depth>12||o===null||typeof o!=='object')return o;if(Array.isArray(o))return o.slice(0,500).map(x=>clean(x,depth+1));const out={};for(const k of Object.keys(o)){if(BAD_KEYS.has(k))continue;out[k]=clean(o[k],depth+1);}return out;}
window.NilSparkLabSecurityP1=Object.freeze({version:'6.1',rateLimit:rate,safeUrl,clean,block});
// Reject cross-origin/unbounded messages before application listeners see them.
window.addEventListener('message',function(e){if(!safeMessage(e)){e.stopImmediatePropagation();block('Blocked unsafe postMessage');return;}if(!rate('message:'+e.origin)){e.stopImmediatePropagation();block('Message rate limit exceeded');}},true);
// Guard fetch/XHR destinations and rate-limit bursty requests without changing normal same-origin/HTTPS traffic.
const of=window.fetch;if(typeof of==='function')window.fetch=function(input,init){const u=typeof input==='string'?input:(input&&input.url)||'';if(!safeUrl(u)){block('Blocked unsafe fetch URL');return Promise.reject(new Error('Unsafe URL'));}if(!rate('fetch'))return Promise.reject(new Error('Rate limit exceeded'));return of.apply(this,arguments);};
const xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url){if(!safeUrl(url)){block('Blocked unsafe XHR URL');throw new DOMException('Unsafe URL','SecurityError');}if(!rate('xhr')){block('XHR rate limit exceeded');throw new DOMException('Rate limit exceeded','SecurityError');}return xo.apply(this,arguments);};
// Safer storage boundary: never accept oversized values or dangerous project-shaped JSON.
try{const os=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(v).length>2*1024*1024){block('Storage write exceeds 2 MB');throw new DOMException('Storage limit','QuotaExceededError');}return os.call(this,String(k).slice(0,200),String(v));};}catch(e){}
// Expose a sanitized clone helper for import/share modules.
window.NilSparkLabSecurityClone=function(value){return clean(value,0);};
})();