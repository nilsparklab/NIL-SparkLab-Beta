
(function(){
  "use strict";
  window.NilSparkLabPhase1Regression=Object.freeze({
    run:function(){
      var out=[];
      function t(id,ok,detail){out.push({id:id,ok:!!ok,detail:detail||""});}
      var sec=window.NilSparkLabSecurity;
      t("canonical-validator",!!sec&&typeof sec.validateProject==="function");
      t("canonical-import-text",!!sec&&typeof sec.validateImportText==="function");
      if(sec&&typeof sec.validateProject==="function"){
        var valid={version:"5.62",name:"Regression",circuit:{components:[{id:"c1",type:"resistor",x:10,y:10,terminals:["T1","T2"],r:470}],wires:[]},simulation:{}};
        var good=sec.validateProject(valid);
        t("valid-project",good&&good.ok,good&&good.error);
        var bad=sec.validateProject({version:"5.62",circuit:{components:[{id:"c1",type:"resistor",x:10,y:10,terminals:["T1","T2"]},{id:"c1",type:"resistor",x:20,y:20}],wires:[]}});
        t("duplicate-id-rejected",!(bad&&bad.ok),bad&&bad.error);
        var pp=sec.validateProject({version:"5.62",circuit:{components:[{id:"c1",type:"resistor",x:10,y:10,terminals:["T1","T2"],constructor:"bad"}],wires:[]}});
        t("dangerous-key-rejected",!(pp&&pp.ok),pp&&pp.error);
      }
      t("canonical-builder-state",!!window.NilSparkLabBuilderState&&typeof window.NilSparkLabBuilderState.replace==="function"&&typeof window.NilSparkLabBuilderState.setWires==="function");
      t("canonical-history",typeof window.undoAction==="function"&&typeof window.redoAction==="function"&&typeof window.saveStateForUndo==="function");
      t("no-zoom-lock",!/user-scalable\s*=\s*no|max(?:imum)?-scale\s*=\s*1/i.test(document.querySelector('meta[name="viewport"]')?.getAttribute("content")||""));
      return {ok:out.every(function(x){return x.ok;}),tests:out};
    }
  });
})();
