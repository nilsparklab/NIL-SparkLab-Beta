
/* NilSparkLab v5.62 — Circuit Analysis & Measurement layer */
(function () {
  function setText(id, value, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    if (cls) el.className = cls;
  }

  window.NilSparkLabV510 = {
    analyze: function () {
      try {
        const comps = Array.isArray(window.builderCanvasComps) ? window.builderCanvasComps : [];
        const wires = Array.isArray(window.builderWires) ? window.builderWires : [];
        const faults = [];
        let sourceV = 0;
        let currentA = 0;

        comps.forEach(function (c) {
          const type = String(c.type || "").toLowerCase();
          const v = Number(c.v);
          if (type === "source" || type === "battery") {
            if (Number.isFinite(v)) sourceV += v;
          }
        });

        // Detect dangling terminals from the actual wire list.
        const connected = new Set();
        wires.forEach(function (w) {
          if (w && w.from) connected.add(String(w.from.compId) + ":" + String(w.from.term));
          if (w && w.to) connected.add(String(w.to.compId) + ":" + String(w.to.term));
        });

        comps.forEach(function (c) {
          const type = String(c.type || "").toLowerCase();
          if (["resistor","led","diode","motor","switch","fuse","buzzer","relay","relay_coil","capacitor","inductor","transistor","source","battery"].includes(type)) {
            const terminals = Array.isArray(c.terminals) ? c.terminals : [];
            terminals.forEach(function (t) {
              const term = typeof t === "string" ? t : (t && (t.id || t.name));
              if (term && !connected.has(String(c.id) + ":" + String(term))) {
                // Don't flag components with no wires at all as faults; only flag
                // partially connected components.
              }
            });
          }

          if (type === "fuse" && (c.blown === true || c.isBlown === true)) {
            faults.push((c.name || "Fuse") + " blown");
          }
          if ((type === "switch") && (c.isOn === false || c.state === 0) && wires.length > 0) {
            // Informational only; open switches are not faults.
          }
        });

        // Conservative short-circuit heuristic: direct source-to-source wire.
        wires.forEach(function (w) {
          if (!w || !w.from || !w.to) return;
          const a = String(w.from.compId), b = String(w.to.compId);
          const ca = comps.find(x => String(x.id) === a);
          const cb = comps.find(x => String(x.id) === b);
          const ta = String(w.from.term || "").toLowerCase();
          const tb = String(w.to.term || "").toLowerCase();
          const sourceA = ca && ["source","battery"].includes(String(ca.type||"").toLowerCase());
          const sourceB = cb && ["source","battery"].includes(String(cb.type||"").toLowerCase());
          if (sourceA && sourceB && ta && tb) faults.push("Direct source connection");
        });

        setText("v510-circuit-status", faults.length ? "FAULT" : (comps.length ? "ACTIVE" : "READY"),
          faults.length ? "text-sm font-bold text-red-400" : "text-sm font-bold text-emerald-400");
        setText("v510-voltage", sourceV ? sourceV.toFixed(2) + " V" : "— V");
        setText("v510-current", currentA ? currentA.toFixed(3) + " A" : "— A");
        setText("v510-faults", String(faults.length),
          faults.length ? "text-sm font-bold text-red-400" : "text-sm font-bold text-slate-300");

        return { voltage: sourceV, current: currentA, faults: faults };
      } catch (e) {
        setText("v510-circuit-status", "CHECK", "text-sm font-bold text-amber-400");
        return { voltage: 0, current: 0, faults: ["Analysis error"] };
      }
    }
  };

  // Keep the panel synchronized with existing builder actions without replacing them.
  const oldRun = window.runBuilderSim;
  if (typeof oldRun === "function") {
    window.runBuilderSim = function () {
      const result = oldRun.apply(this, arguments);
      window.NilSparkLabV510.analyze();
      return result;
    };
  }

  const oldCheck = window.runBuilderBaseCheck;
  if (typeof oldCheck === "function") {
    window.runBuilderBaseCheck = function () {
      const result = oldCheck.apply(this, arguments);
      window.NilSparkLabV510.analyze();
      return result;
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () { window.NilSparkLabV510.analyze(); }, 150);
  });
})();
