
/* NilSparkLab v5.62 — topology-aware live measurement layer */
(function () {
  const S = { last: null };

  function E(id) { return document.getElementById(id); }
  function set(id, value, cls) {
    const e = E(id); if (!e) return;
    e.textContent = value;
    if (cls) e.className = cls;
  }
  function listComps() { return Array.isArray(window.builderCanvasComps) ? window.builderCanvasComps : []; }
  function listWires() { return Array.isArray(window.builderWires) ? window.builderWires : []; }
  function typeOf(c) { return String(c && c.type || "").toLowerCase(); }
  function val(c, keys, fallback) {
    for (const k of keys) {
      const n = Number(c && c[k]);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  }

  function endpoints(w) {
    if (!w || !w.from || !w.to) return null;
    return [
      String(w.from.compId) + ":" + String(w.from.term || ""),
      String(w.to.compId) + ":" + String(w.to.term || "")
    ];
  }

  function topology() {
    const comps = listComps();
    const wires = listWires();
    const adj = new Map();
    const add = k => { if (!adj.has(k)) adj.set(k, new Set()); return adj.get(k); };
    wires.forEach(w => {
      const ep = endpoints(w);
      if (!ep) return;
      add(ep[0]).add(ep[1]);
      add(ep[1]).add(ep[0]);
    });
    return adj;
  }

  function sourceList(comps) {
    return comps.filter(c => typeOf(c) === "battery" || typeOf(c) === "source");
  }

  function resistance(c) {
    const t = typeOf(c);
    const r = val(c, ["r","resistance","ohms"], NaN);
    if (Number.isFinite(r) && r > 0) return r;
    if (t === "led") return 330;
    if (t === "diode") return 1000;
    if (t === "motor") return 20;
    if (t === "buzzer") return 40;
    if (t === "relay" || t === "relay_coil") return 60;
    if (t === "inductor") return 10;
    return NaN;
  }

  function isOpen(c) {
    const t = typeOf(c);
    if (t === "switch") return c.isOn === false || c.state === 0 || c.open === true;
    if (t === "fuse") return c.blown === true || c.isBlown === true;
    return false;
  }

  function analysisSourceVoltage(comps) {
    return sourceList(comps).reduce((s, c) => s + val(c, ["v","voltage"], 0), 0);
  }

  function analyze() {
    const comps = listComps(), wires = listWires(), adj = topology();
    const sources = sourceList(comps);
    const V = analysisSourceVoltage(comps);
    const faults = [];
    let req = NaN, current = 0, pathClosed = false;

    // Conservative equivalent-resistance estimate from series-like resistive components.
    const resistive = comps.filter(c => {
      const t = typeOf(c);
      return ["resistor","led","diode","motor","buzzer","relay","relay_coil","inductor"].includes(t) && !isOpen(c);
    });
    const rs = resistive.map(resistance).filter(Number.isFinite);
    if (rs.length) req = rs.reduce((a,b) => a+b, 0);

    const hasOpenControl = comps.some(isOpen);
    const hasSources = sources.length > 0;
    const hasTwoTermPath = wires.length >= Math.max(1, comps.length - 1);

    // A safe, intentionally conservative closed-path heuristic.
    pathClosed = hasSources && !hasOpenControl && hasTwoTermPath && rs.length > 0;

    if (hasSources && !pathClosed && wires.length) faults.push("OPEN CIRCUIT");
    if (sources.length > 1) {
      // Flag direct source-to-source connections.
      wires.forEach(w => {
        const a = comps.find(c => String(c.id) === String(w?.from?.compId));
        const b = comps.find(c => String(c.id) === String(w?.to?.compId));
        if (a && b && (typeOf(a) === "battery" || typeOf(a) === "source") &&
            (typeOf(b) === "battery" || typeOf(b) === "source")) faults.push("SOURCE SHORT");
      });
    }

    if (pathClosed && Number.isFinite(req) && req > 0) current = V / req;
    if (pathClosed && req === 0) faults.push("SHORT CIRCUIT");

    // Fuse protection estimate.
    comps.forEach(c => {
      if (typeOf(c) !== "fuse") return;
      const rating = val(c, ["rating","currentRating","maxCurrent"], NaN);
      if (!c.blown && !c.isBlown && Number.isFinite(rating) && current > rating) {
        faults.push("FUSE OVERCURRENT");
      }
    });

    set("v512-v", hasSources ? V.toFixed(2) + " V" : "—");
    set("v512-i", pathClosed ? current.toFixed(4) + " A" : "—");
    set("v512-r", Number.isFinite(req) ? req.toFixed(2) + " Ω" : "—");
    set("v512-path", pathClosed ? "CLOSED" : "OPEN",
        pathClosed ? "font-mono text-emerald-400" : "font-mono text-amber-400");
    set("v512-fault", faults.length ? [...new Set(faults)].join(" • ") : "NONE",
        faults.length ? "font-mono text-red-400" : "font-mono text-emerald-400");
    set("v512-engine-state", "ENGINE LIVE",
        "text-[10px] font-mono font-bold text-emerald-400");

    const box = E("v512-component-readings");
    if (box) {
      box.innerHTML = "";
      comps.forEach(c => {
        const r = resistance(c);
        if (!Number.isFinite(r) && !["capacitor","switch","fuse","battery","source"].includes(typeOf(c))) return;
        const drop = pathClosed && Number.isFinite(r) ? current * r : 0;
        const t = document.createElement("div");
        t.className = "rounded-lg border border-slate-800 bg-slate-950 p-3";
        const name = c.name || c.type || "Component";
        t.innerHTML =
          '<div class="text-xs font-bold text-slate-200"></div>' +
          '<div class="mt-1 text-[11px] text-slate-500">Voltage drop</div>' +
          '<div class="font-mono text-cyan-400"></div>';
        t.children[0].textContent = name;
        t.children[2].textContent = pathClosed && Number.isFinite(r) ? drop.toFixed(3) + " V" : "—";
        box.appendChild(t);
      });
    }

    S.last = { V, current, req, pathClosed, faults: [...new Set(faults)] };
    return S.last;
  }

  window.NilSparkLabV512 = { analyze };

  // Safely hook existing simulation/check functions without replacing their behavior.
  ["runBuilderSim", "runBuilderBaseCheck"].forEach(function (name) {
    const fn = window[name];
    if (typeof fn === "function") {
      window[name] = function () {
        const result = fn.apply(this, arguments);
        try { analyze(); } catch (_) {}
        return result;
      };
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(analyze, 200);
    setInterval(analyze, 700);
  });
})();
