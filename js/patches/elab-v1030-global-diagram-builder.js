
(function(){
  "use strict";

  /*
   * GOLDEN ARCHITECTURE:
   * Diagram Library -> one resolver -> one build transaction -> real Builder APIs/state.
   * Half-wave remains the reference topology and uses the same 3-component/3-wire recipe.
   */

  const RECIPES = Object.freeze({
    half_wave_rectifier:{
      title:"Half-wave Rectifier",
      components:[
        ["ac_source",{x:20,y:140,v:12,frequency:50}],
        ["diode",{x:210,y:100,vf:0.7}],
        ["resistor",{x:420,y:100,r:470}]
      ],
      connections:[
        [0,"L",1,"Anode (+)"],[1,"Cathode (-)",2,"T1"],[2,"T2",0,"N"]
      ]
    },
    led_series:{
      title:"LED Series Circuit",
      components:[
        ["battery",{x:30,y:120,v:9}],
        ["resistor",{x:220,y:60,r:470}],
        ["led",{x:420,y:120,vf:2,color:"Red"}]
      ],
      connections:[[0,"+ (Pos)",1,"T1"],[1,"T2",2,"Anode (+)"],[2,"Cathode (-)",0,"- (Gnd)"]]
    },
    led_parallel:{
      title:"LED Parallel / Ballast",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["resistor",{x:220,y:60,r:470}],
        ["led",{x:420,y:60,vf:2,color:"Red"}],
        ["resistor",{x:220,y:220,r:470}],
        ["led",{x:420,y:220,vf:2,color:"Green"}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],[1,"T2",2,"Anode (+)"],[2,"Cathode (-)",0,"- (Gnd)"],
        [0,"+ (Pos)",3,"T1"],[3,"T2",4,"Anode (+)"],[4,"Cathode (-)",0,"- (Gnd)"]
      ]
    },
    series_circuit:{
      title:"Series Circuit",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["resistor",{x:220,y:100,r:470}],
        ["lamp",{x:420,y:100,r:2300,power:10}]
      ],
      connections:[[0,"+ (Pos)",1,"T1"],[1,"T2",2,"In"],[2,"Out",0,"- (Gnd)"]]
    },
    parallel_circuit:{
      title:"Parallel Circuit",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["resistor",{x:240,y:60,r:470}],
        ["resistor",{x:240,y:220,r:1000}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],[1,"T2",0,"- (Gnd)"],
        [0,"+ (Pos)",2,"T1"],[2,"T2",0,"- (Gnd)"]
      ]
    },
    ohms:{
      title:"Ohm's Law Circuit",
      components:[
        ["battery",{x:30,y:140,v:9}],
        ["resistor",{x:260,y:100,r:470}]
      ],
      connections:[[0,"+ (Pos)",1,"T1"],[1,"T2",0,"- (Gnd)"]]
    },
    voltage_divider:{
      title:"Voltage Divider",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["resistor",{x:240,y:60,r:1000}],
        ["resistor",{x:240,y:220,r:1000}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],
        [1,"T2",2,"T1"],
        [2,"T2",0,"- (Gnd)"]
      ],
      note:"Vout is the real junction between R1.T2 and R2.T1."
    },
    wheatstone:{
      title:"Wheatstone Bridge",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["resistor",{x:220,y:40,r:1000}],
        ["resistor",{x:440,y:40,r:1000}],
        ["resistor",{x:220,y:240,r:1000}],
        ["resistor",{x:440,y:240,r:1000}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],[0,"+ (Pos)",2,"T1"],
        [1,"T2",3,"T1"],[2,"T2",4,"T1"],
        [3,"T2",0,"- (Gnd)"],[4,"T2",0,"- (Gnd)"]
      ],
      note:"Bridge midpoint nodes are the R1/R3 and R2/R4 junctions."
    },
    bridge_rectifier:{
      title:"Full-wave Bridge Rectifier",
      components:[
        ["ac_source",{x:20,y:140,v:12,frequency:50}],
        ["bridge_rectifier",{x:220,y:100,ratedA:2,ratedV:400,vf:0.7}],
        ["resistor",{x:440,y:100,r:470}]
      ],
      connections:[
        [0,"L",1,"AC1"],[1,"DC+",2,"T1"],[2,"T2",1,"DC-"],[1,"AC2",0,"N"]
      ]
    },
    motor_switch:{
      title:"Motor + Switch",
      components:[
        ["battery",{x:20,y:140,v:12}],
        ["switch",{x:220,y:70,closed:true}],
        ["motor",{x:440,y:120}]
      ],
      connections:[[0,"+ (Pos)",1,"In"],[1,"Out",2,"M+"],[2,"M-",0,"- (Gnd)"]]
    },
    rc_lowpass:{
      title:"RC Low-pass Filter",
      components:[
        ["battery",{x:20,y:140,v:5}],
        ["resistor",{x:220,y:100,r:1000}],
        ["capacitor",{x:440,y:220,c:100}]
      ],
      connections:[[0,"+ (Pos)",1,"T1"],[1,"T2",2,"+"],[2,"-",0,"- (Gnd)"]]
    },
    rc_highpass:{
      title:"RC High-pass Filter",
      components:[
        ["battery",{x:20,y:140,v:5}],
        ["capacitor",{x:220,y:100,c:100}],
        ["resistor",{x:440,y:220,r:1000}]
      ],
      connections:[[0,"+ (Pos)",1,"+"],[1,"-",2,"T1"],[2,"T2",0,"- (Gnd)"]]
    },
    rl_filter:{
      title:"RL Filter",
      components:[
        ["battery",{x:20,y:140,v:5}],
        ["resistor",{x:220,y:100,r:1000}],
        ["inductor",{x:440,y:100,l:10}]
      ],
      connections:[[0,"+ (Pos)",1,"T1"],[1,"T2",2,"L1"],[2,"L2",0,"- (Gnd)"]]
    },
    zener_regulator:{
      title:"Zener Regulator",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["resistor",{x:240,y:60,r:470}],
        ["zener_diode",{x:440,y:220,zenerV:5.1}]
      ],
      connections:[[0,"+ (Pos)",1,"T1"],[1,"T2",2,"Cathode (-)"],[2,"Anode (+)",0,"- (Gnd)"]]
    },
    7805:{
      title:"7805 Regulator",
      components:[
        ["battery",{x:20,y:140,v:9}],
        ["reg_7805",{x:260,y:100}],
        ["resistor",{x:500,y:100,r:1000}]
      ],
      connections:[[0,"+ (Pos)",1,"IN"],[1,"OUT",2,"T1"],[2,"T2",0,"- (Gnd)"],[1,"GND",0,"- (Gnd)"]]
    },
    opamp_inverting:{
      title:"Inverting Op-Amp",
      components:[
        ["battery",{x:20,y:140,v:5}],
        ["resistor",{x:220,y:60,r:1000}],
        ["op_amp",{x:460,y:120}],
        ["resistor",{x:700,y:60,r:10000}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],[1,"T2",2,"IN-"],
        [2,"OUT",3,"T1"],[3,"T2",2,"IN-"],
        [0,"- (Gnd)",2,"IN+"],[0,"+ (Pos)",2,"V+"],[0,"- (Gnd)",2,"V-"]
      ]
    },
    opamp_noninverting:{
      title:"Non-inverting Op-Amp",
      components:[
        ["battery",{x:20,y:140,v:5}],
        ["op_amp",{x:420,y:120}],
        ["resistor",{x:650,y:220,r:1000}],
        ["resistor",{x:650,y:60,r:10000}]
      ],
      connections:[
        [0,"+ (Pos)",1,"IN+"],[1,"OUT",3,"T1"],[3,"T2",1,"IN-"],
        [1,"IN-",2,"T1"],[2,"T2",0,"- (Gnd)"],
        [0,"+ (Pos)",1,"V+"],[0,"- (Gnd)",1,"V-"]
      ]
    },
    mosfet_switch:{
      title:"MOSFET Low-side Switch",
      components:[
        ["battery",{x:20,y:140,v:12}],
        ["resistor",{x:240,y:60,r:470}],
        ["mosfet_n",{x:500,y:120}],
        ["switch",{x:240,y:240,closed:true}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],[1,"T2",2,"Drain (D)"],
        [2,"Source (S)",0,"- (Gnd)"],[0,"+ (Pos)",3,"In"],[3,"Out",2,"Gate (G)"]
      ]
    },
    relay_driver:{
      title:"Relay Driver",
      components:[
        ["battery",{x:20,y:140,v:12}],
        ["resistor",{x:220,y:60,r:1000}],
        ["bjt_npn",{x:440,y:120}],
        ["relay",{x:660,y:100}]
      ],
      connections:[
        [0,"+ (Pos)",1,"T1"],[1,"T2",2,"B"],[2,"E",0,"- (Gnd)"],
        [0,"+ (Pos)",3,"Coil+"],[3,"Coil-",2,"C"]
      ]
    },
    nand:{
      title:"NAND Gate",
      components:[
        ["logic_in",{x:20,y:60,state:1}],["logic_in",{x:20,y:180,state:1}],
        ["gate_nand",{x:260,y:120}]
      ],
      connections:[[0,"OUT",2,"In A"],[1,"OUT",2,"In B"]]
    },
    nor:{
      title:"NOR Gate",
      components:[
        ["logic_in",{x:20,y:60,state:0}],["logic_in",{x:20,y:180,state:0}],
        ["gate_nor",{x:260,y:120}]
      ],
      connections:[[0,"OUT",2,"In A"],[1,"OUT",2,"In B"]]
    },
    xor:{
      title:"XOR Gate",
      components:[
        ["logic_in",{x:20,y:60,state:1}],["logic_in",{x:20,y:180,state:0}],
        ["gate_xor",{x:260,y:120}]
      ],
      connections:[[0,"OUT",2,"In A"],[1,"OUT",2,"In B"]]
    }
  });

  const ALIASES = Object.freeze({
    "led series circuit":"led_series",
    "led series ballast":"led_series",
    "led parallel / ballast":"led_parallel",
    "led parallel":"led_parallel",
    "series circuit":"series_circuit",
    "parallel circuit":"parallel_circuit",
    "parallel r idea":"parallel_circuit",
    "ohm's law circuit":"ohms",
    "ohms law circuit":"ohms",
    "voltage divider":"voltage_divider",
    "wheatstone bridge":"wheatstone",
    "half-wave rectifier":"half_wave_rectifier",
    "full-wave bridge rectifier":"bridge_rectifier",
    "bridge rectifier":"bridge_rectifier",
    "motor + switch":"motor_switch",
    "motor switch":"motor_switch",
    "rc low-pass filter":"rc_lowpass",
    "rc high-pass filter":"rc_highpass",
    "rl filter":"rl_filter",
    "zener regulator":"zener_regulator",
    "7805 regulator":"7805",
    "inverting op-amp":"opamp_inverting",
    "non-inverting op-amp":"opamp_noninverting",
    "mosfet low-side switch":"mosfet_switch",
    "relay driver":"relay_driver",
    "nand gate":"nand",
    "nor gate":"nor",
    "xor gate":"xor"
  });

  const UNSUPPORTED = Object.freeze({
    "center-tap rectifier":"Current Builder has no center-tap-specific rectifier component/model.",
    "transformer + dc supply":"Transformer exists, but the current Builder lacks a faithful multi-stage rectifier/regulator recipe matching the Diagram Library definition.",
    "buck converter":"Current Builder lacks the complete controlled-switch/inductor/diode/capacitor/load topology required for a faithful buck model.",
    "boost converter":"Current Builder lacks the complete controlled-switch/inductor/diode/capacitor/load topology required for a faithful boost model.",
    "common-emitter amplifier":"Current Builder has the transistor primitive but no validated amplifier recipe in the current application.",
    "h-bridge motor driver":"The current Builder has no validated four-switch H-bridge recipe; do not substitute the Motor + Switch circuit.",
    "motor forward / reverse":"The current Builder has no validated reversible motor topology recipe.",
    "dol starter":"Current Builder lacks a faithful three-phase DOL power/control model.",
    "star-delta starter":"Current Builder lacks a faithful three-phase star/delta contactor topology."
  });

  function norm(v){
    return String(v||"").toLowerCase().replace(/[–—]/g,"-").replace(/\s+/g," ").trim();
  }

  function resolveDiagramKey(value){
    const n=norm(value);
    if(RECIPES[n]) return n;
    return ALIASES[n] || null;
  }

  function toast(msg){
    try{if(typeof window.elabV575Toast==="function") return window.elabV575Toast(msg);}catch(_){}
    try{if(typeof window.toast==="function") return window.toast(msg);}catch(_){}
    console.info("NilSparkLab:",msg);
  }

  function openBuilder(){
    try{
      if(typeof window.showSection==="function"){ window.showSection("builder"); return true; }
    }catch(e){console.warn("Builder open failed",e);}
    const section=document.getElementById("sec-builder");
    if(!section) return false;
    document.querySelectorAll("section[id^='sec-']").forEach(x=>x.classList.add("hidden"));
    section.classList.remove("hidden");
    try{window.scrollTo({top:0,behavior:"smooth"});}catch(_){}
    return true;
  }

  function builderReady(){
    return !!document.getElementById("builder-canvas") &&
      typeof window.renderBuilderCanvas==="function" &&
      typeof window.addBuilderComp==="function" &&
      typeof window.handleTerminalClick==="function" &&
      Array.isArray(window.NilSparkLabBuilderState?.components) &&
      Array.isArray(window.NilSparkLabBuilderState?.wires);
  }

  function waitForBuilderReady(done){
    let attempts=0;
    function check(){
      attempts++;
      if(builderReady()){ done(); return; }
      if(attempts>=60){ toast("Builder is not ready. Automatic build cancelled."); return; }
      requestAnimationFrame(check);
    }
    check();
  }

  function validateState(expectedC,expectedW,title){
    const comps=window.NilSparkLabBuilderState.components;
    const wires=window.NilSparkLabBuilderState.wires;
    if(comps.length!==expectedC) throw new Error(`Expected ${expectedC} components, found ${comps.length}.`);
    if(wires.length!==expectedW) throw new Error(`Expected ${expectedW} wires, found ${wires.length}.`);
    const ids=new Set();
    comps.forEach(c=>{
      if(!c||!c.id) throw new Error("Builder component has no generated ID.");
      if(ids.has(c.id)) throw new Error(`Duplicate component ID: ${c.id}`);
      ids.add(c.id);
      if(!Array.isArray(c.terminals)) throw new Error(`Component ${c.id} has no terminals.`);
    });
    wires.forEach((w,i)=>{
      if(!w||!w.from||!w.to) throw new Error(`Wire ${i+1} is malformed.`);
      const fc=comps.find(c=>c.id===w.from.compId);
      const tc=comps.find(c=>c.id===w.to.compId);
      if(!fc) throw new Error(`Wire ${i+1} references missing component ${w.from.compId}.`);
      if(!tc) throw new Error(`Wire ${i+1} references missing component ${w.to.compId}.`);
      if(!fc.terminals.includes(w.from.term)) throw new Error(`Builder recipe terminal mismatch: ${fc.name||fc.type}.${w.from.term}`);
      if(!tc.terminals.includes(w.to.term)) throw new Error(`Builder recipe terminal mismatch: ${tc.name||tc.type}.${w.to.term}`);
    });
    return {components:comps.length,wires:wires.length,title};
  }

  function verifyVisible(expectedC,expectedW){
    const cards=document.querySelectorAll("#builder-canvas .canvas-comp-card").length;
    const groups=document.querySelectorAll("#builder-wire-svg > g").length;
    if(cards!==expectedC) throw new Error(`Rendered component-card mismatch: expected ${expectedC}, found ${cards}.`);
    if(groups!==expectedW) throw new Error(`Rendered wire mismatch: expected ${expectedW}, found ${groups}.`);
    const empty=document.getElementById("canvas-empty-text");
    if(empty && !empty.classList.contains("hidden")) throw new Error("Builder still reports an empty canvas.");
    return {cards,groups};
  }

  function buildDiagramInBuilder(input){
    const key=resolveDiagramKey(input);
    if(!key){
      const reason=UNSUPPORTED[norm(input)] || "No authoritative Builder recipe exists in the current file.";
      toast(`Unsupported diagram: ${input}. ${reason}`);
      return false;
    }
    const recipe=RECIPES[key];
    if(!recipe) return false;

    if(!openBuilder()){ toast("Builder section could not be opened."); return false; }

    waitForBuilderReady(()=>{
      try{
        /*
         * One transaction. No preset loader, no alternate state bridge,
         * no guessed IDs, no DOM-only circuit.
         */
        resetBuilder();

        const before=builderCanvasComps.length;
        recipe.components.forEach(item=>{
          addBuilderComp(item[0],item[1]||{});
        });

        const created=builderCanvasComps.slice(before);
        if(created.length!==recipe.components.length)
          throw new Error(`Component creation incomplete: expected ${recipe.components.length}, found ${created.length}.`);

        const ids=created.map(c=>c.id);
        if(ids.some(id=>!id)) throw new Error("Builder generated component ID missing.");

        recipe.connections.forEach(conn=>{
          const [a,at,b,bt]=conn;
          const ca=builderCanvasComps.find(c=>c.id===ids[a]);
          const cb=builderCanvasComps.find(c=>c.id===ids[b]);
          if(!ca) throw new Error(`Missing source component for connection ${a}.`);
          if(!cb) throw new Error(`Missing destination component for connection ${b}.`);
          if(!ca.terminals.includes(at)) throw new Error(`Builder recipe terminal mismatch: ${ca.name||ca.type}.${at}`);
          if(!cb.terminals.includes(bt)) throw new Error(`Builder recipe terminal mismatch: ${cb.name||cb.type}.${bt}`);
          handleTerminalClick(ids[a],at);
          handleTerminalClick(ids[b],bt);
        });

        renderBuilderCanvas();
        drawWires();

        const stateCheck=validateState(recipe.components.length,recipe.connections.length,recipe.title);
        const visibleCheck=verifyVisible(recipe.components.length,recipe.connections.length);

        const sel=document.getElementById("builder-preset-select");
        if(sel && Array.from(sel.options).some(o=>o.value===key)) sel.value=key;

        const st=document.getElementById("builder-status-text");
        if(st) st.innerText=`✓ ${recipe.title} built automatically · ${stateCheck.components} components · ${stateCheck.wires} wires`;

        try{window.scrollTo({top:0,behavior:"smooth"});}catch(_){}
        toast(`${recipe.title} built automatically in Builder.`);
        window.dispatchEvent(new CustomEvent("nilsparklab:diagram-builder-built",{detail:{
          key,components:stateCheck.components,wires:stateCheck.wires,visibleComponents:visibleCheck.cards,visibleWires:visibleCheck.groups
        }}));
      }catch(err){
        console.error("NilSparkLab Diagram Builder transaction failed:",err);
        try{resetBuilder();}catch(_){}
        const st=document.getElementById("builder-status-text");
        if(st) st.innerText=`✕ Failed to build ${recipe.title} in Builder.`;
        toast(`Failed to build ${recipe.title} in Builder: ${err.message||err}`);
      }
    });
    return true;
  }

  window.buildDiagramInBuilder=buildDiagramInBuilder;
  window.NilSparkLabDiagramBuilderV1030=Object.freeze({
    version:"10.30",
    recipes:RECIPES,
    resolve:resolveDiagramKey,
    build:buildDiagramInBuilder,
    unsupported:UNSUPPORTED
  });

})();
