
/* NilSparkLab v5.62 — DMM measurement console */
(function () {
  const state = { mode: "V", probes: [null, null] };

  function el(id) { return document.getElementById(id); }
  function show(id, value) { const x = el(id); if (x) x.textContent = value; }

  function comps() {
    return Array.isArray(window.builderCanvasComps) ? window.builderCanvasComps : [];
  }
  function wires() {
    return Array.isArray(window.builderWires) ? window.builderWires : [];
  }

  function findComp(id) {
    return comps().find(c => String(c.id) === String(id));
  }

  function terminalKey(p) {
    return p ? String(p.compId) + ":" + String(p.term || "") : "";
  }

  function isConnected(a, b) {
    const targetA = terminalKey(a), targetB = terminalKey(b);
    return wires().some(w => {
      const x = terminalKey(w.from), y = terminalKey(w.to);
      return (x === targetA && y === targetB) || (x === targetB && y === targetA);
    });
  }

  function setWarning(msg) {
    const box = el("v511-warning");
    if (!box) return;
    box.textContent = msg || "";
    box.classList.toggle("hidden", !msg);
  }

  function componentResistance(c) {
    const r = Number(c && (c.r ?? c.resistance));
    if (Number.isFinite(r) && r > 0) return r;
    const type = String(c && c.type || "").toLowerCase();
    if (type === "led") return 330;
    if (type === "diode") return 1000;
    return Infinity;
  }

  function sourceVoltage() {
    return comps().reduce((sum, c) => {
      const type = String(c.type || "").toLowerCase();
      if (type === "source" || type === "battery") {
        const v = Number(c.v ?? c.voltage);
        return sum + (Number.isFinite(v) ? v : 0);
      }
      return sum;
    }, 0);
  }

  function v511Calculate() {
    setWarning("");
    const a = state.probes[0], b = state.probes[1];
    if (!a || !b) {
      setWarning("Select both probe terminals before measuring.");
      return;
    }

    const ca = findComp(a.compId), cb = findComp(b.compId);
    if (!ca || !cb) {
      setWarning("One or both probe terminals are no longer available.");
      return;
    }

    if (a.compId === b.compId && String(a.term) === String(b.term)) {
      setWarning("Both probes are on the same terminal.");
      show("v511-reading", "OL");
      return;
    }

    const connected = isConnected(a, b);
    const va = Number(ca.v ?? ca.voltage ?? 0);
    const vb = Number(cb.v ?? cb.voltage ?? 0);
    const dv = Math.abs((Number.isFinite(va) ? va : 0) - (Number.isFinite(vb) ? vb : 0));

    if (state.mode === "V") {
      show("v511-reading", dv.toFixed(2) + " V");
    } else if (state.mode === "Ω") {
      const r = componentResistance(ca);
      if (Number.isFinite(r)) show("v511-reading", r.toFixed(1) + " Ω");
      else show("v511-reading", connected ? "≈ 0 Ω" : "OL");
    } else if (state.mode === "CONT") {
      show("v511-reading", connected ? "BEEP" : "OPEN");
      setWarning(connected ? "Continuity detected." : "No continuity between selected terminals.");
    } else if (state.mode === "A") {
      const r = componentResistance(ca);
      const v = sourceVoltage();
      if (Number.isFinite(r) && r > 0) show("v511-reading", (v / r).toFixed(4) + " A");
      else {
        show("v511-reading", "OL");
        setWarning("Current cannot be calculated safely without a valid resistive path.");
      }
    }
  }

  function selectMode(mode) {
    state.mode = mode;
    show("v511-mode", mode);
    document.querySelectorAll(".v511-mode").forEach(btn => {
      const active = btn.dataset.v511Mode === mode;
      btn.classList.toggle("bg-cyan-500", active);
      btn.classList.toggle("text-slate-950", active);
      btn.classList.toggle("bg-slate-800", !active);
    });
  }

  window.NilSparkLabV511 = {
    selectProbe: function (compId, term) {
      const p = { compId: compId, term: term };
      if (!state.probes[0] || (state.probes[0].compId === compId && state.probes[0].term === term)) {
        state.probes[0] = p;
      } else {
        state.probes[1] = p;
      }
      show("v511-probe-a", state.probes[0] ? terminalKey(state.probes[0]) : "Not selected");
      show("v511-probe-b", state.probes[1] ? terminalKey(state.probes[1]) : "Not selected");
    },
    measure: v511Calculate,
    reset: function () {
      state.probes = [null, null];
      show("v511-probe-a", "Not selected");
      show("v511-probe-b", "Not selected");
      show("v511-reading", "—");
      setWarning("");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".v511-mode").forEach(btn => {
      btn.addEventListener("click", () => selectMode(btn.dataset.v511Mode));
    });
    const m = el("v511-measure");
    if (m) m.addEventListener("click", calculate);
  });
})();
