
/* NilSparkLab v5.62 — Component Inspector + SVG element visuals */
(function () {
  let selected = null;

  function inspectorComps() {
    return Array.isArray(window.builderCanvasComps) ? window.builderCanvasComps : [];
  }
  function E(id) { return document.getElementById(id); }
  function n(v, fallback = null) {
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  }
  function type(c) { return String(c && c.type || "").toLowerCase(); }

  function properties(c) {
    const t = type(c);
    const p = [];
    if (["battery","source"].includes(t)) {
      p.push(["Voltage", (n(c.v ?? c.voltage, 0)).toFixed(2) + " V"]);
    }
    if (["resistor"].includes(t)) {
      p.push(["Resistance", (n(c.r ?? c.resistance, 0)).toFixed(2) + " Ω"]);
      if (n(c.power, null) !== null) p.push(["Power", n(c.power, 0).toFixed(3) + " W"]);
    }
    if (["capacitor"].includes(t)) {
      p.push(["Capacitance", (n(c.capacitance ?? c.c, 0)).toFixed(2) + " µF"]);
      p.push(["Voltage", (n(c.v ?? c.voltage, 0)).toFixed(2) + " V"]);
    }
    if (["inductor"].includes(t)) {
      p.push(["Inductance", (n(c.inductance ?? c.l, 0)).toFixed(2) + " mH"]);
      p.push(["Current", (n(c.current, 0)).toFixed(3) + " A"]);
    }
    if (["led","diode"].includes(t)) {
      p.push(["Forward voltage", (n(c.forwardVoltage ?? c.vf, t === "led" ? 2.0 : 0.7)).toFixed(2) + " V"]);
      p.push(["State", c.isOn ? "ON" : "OFF"]);
    }
    if (["motor","buzzer","relay","relay_coil"].includes(t)) {
      p.push(["State", c.isOn ? "ON" : "OFF"]);
      if (n(c.current, null) !== null) p.push(["Current", n(c.current, 0).toFixed(3) + " A"]);
    }
    if (t === "switch") p.push(["State", (c.isOn || c.state === 1) ? "CLOSED" : "OPEN"]);
    if (t === "fuse") {
      p.push(["Rating", n(c.rating ?? c.currentRating, 0) + " A"]);
      p.push(["Status", (c.blown || c.isBlown) ? "BLOWN" : "OK"]);
    }
    if (t === "transistor" || t === "npn") {
      p.push(["Type", "NPN"]);
      p.push(["State", c.isOn ? "ON" : "OFF"]);
    }
    return p;
  }

  function render() {
    const list = E("v513-component-list");
    if (!list) return;
    list.innerHTML = "";
    inspectorComps().forEach(c => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "rounded-lg border border-slate-800 bg-slate-950 p-2 text-left hover:border-cyan-500 transition";
      b.innerHTML = '<div class="text-xs font-bold text-slate-200"></div><div class="text-[10px] text-slate-500"></div>';
      b.children[0].textContent = c.name || c.type || "Component";
      b.children[1].textContent = String(c.type || "unknown").toUpperCase();
      b.addEventListener("click", () => { selected = c; renderDetail(); });
      list.appendChild(b);
    });
    if (selected && !comps().some(c => String(c.id) === String(selected.id))) selected = null;
    renderDetail();
  }

  function renderDetail() {
    const d = E("v513-component-detail");
    const tag = E("v513-selected-type");
    if (!d || !tag) return;
    if (!selected) {
      tag.textContent = "NO SELECTION";
      d.textContent = "Select a component to inspect it.";
      return;
    }
    tag.textContent = String(selected.type || "COMPONENT").toUpperCase();
    d.innerHTML = "";
    const title = document.createElement("div");
    title.className = "text-sm font-black text-white mb-2";
    title.textContent = selected.name || selected.type || "Component";
    d.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-2 md:grid-cols-4 gap-2";
    properties(selected).forEach(([k,v]) => {
      const cell = document.createElement("div");
      cell.className = "rounded border border-slate-800 p-2";
      cell.innerHTML = '<div class="text-[10px] text-slate-500"></div><div class="font-mono text-cyan-400 mt-1"></div>';
      cell.children[0].textContent = k;
      cell.children[1].textContent = v;
      grid.appendChild(cell);
    });
    d.appendChild(grid);
  }

  window.NilSparkLabV513 = {
    refresh: render,
    select: function(id) {
      selected = comps().find(c => String(c.id) === String(id)) || null;
      renderDetail();
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    render();
    setInterval(render, 1000);
  });
})();
