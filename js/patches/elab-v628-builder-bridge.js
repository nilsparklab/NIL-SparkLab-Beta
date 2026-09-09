
(function(){
"use strict";
function canUseBuilder(){
 return !!(window.NilSparkLabBuilder && typeof window.NilSparkLabBuilder.addComponent==="function");
}
function build(c){
 if(!c || !c.components) return {ok:false,error:"No compiled topology."};
 if(!canUseBuilder()) return {ok:false,error:"Builder bridge is not exposed by the current page yet.",preview:c};
 var added=[];
 c.components.forEach(function(x){
   try{
     var result=window.NilSparkLabBuilder.addComponent({type:x.type,ref:x.ref});
     added.push({ref:x.ref,result:result});
   }catch(e){added.push({ref:x.ref,error:String(e.message||e)});}
 });
 return {ok:true,added:added,topology:c.nets||[]};
}
window.NilSparkLabBuilderBridge={version:"9.11",build:build,canUseBuilder:canUseBuilder};
})();
