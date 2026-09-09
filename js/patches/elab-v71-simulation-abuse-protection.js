
(() => {
  "use strict";

  const VERSION = "7.1";
  const LIMITS = Object.freeze({
    components: 500,
    connections: 2000,
    simulationSteps: 100000,
    maxRunMs: 5000,
    recursionDepth: 32,
    payloadNodes: 25000
  });

  const state = {
    running: false,
    startedAt: 0,
    steps: 0,
    aborted: false,
    reason: ""
  };

  const emit = (type, detail = "") => {
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: { type, detail: String(detail), version: VERSION }
      }));
    } catch (_) {}
  };

  function validateCircuit(circuit) {
    if (!circuit || typeof circuit !== "object") {
      throw new Error("invalid circuit");
    }

    const components = Array.isArray(circuit.components) ? circuit.components : [];
    const connections = Array.isArray(circuit.connections) ? circuit.connections : [];

    if (components.length > LIMITS.components)
      throw new Error("component limit exceeded");
    if (connections.length > LIMITS.connections)
      throw new Error("connection limit exceeded");

    return true;
  }

  function start(maxSteps = LIMITS.simulationSteps, maxMs = LIMITS.maxRunMs) {
    if (state.running) throw new Error("simulation already running");

    state.running = true;
    state.startedAt = performance.now();
    state.steps = 0;
    state.aborted = false;
    state.reason = "";

    return {
      step() {
        if (!state.running) return false;
        state.steps++;

        if (state.steps > Math.min(maxSteps, LIMITS.simulationSteps))
          return abort("simulation step limit exceeded");

        if (performance.now() - state.startedAt > Math.min(maxMs, LIMITS.maxRunMs))
          return abort("simulation time limit exceeded");

        return true;
      },
      stop() {
        state.running = false;
        return true;
      }
    };
  }

  function abort(reason) {
    state.running = false;
    state.aborted = true;
    state.reason = String(reason);
    emit("simulation-aborted", reason);
    return false;
  }

  function safeDepth(depth) {
    if (!Number.isInteger(depth) || depth < 0 || depth > LIMITS.recursionDepth) {
      emit("recursion-limit", depth);
      return false;
    }
    return true;
  }

  window.NilSparkLabSimulationSecurity = Object.freeze({
    version: VERSION,
    limits: LIMITS,
    validateCircuit,
    start,
    abort,
    safeDepth,
    state: () => Object.freeze({ ...state })
  });

  window.dispatchEvent(new CustomEvent("nilsparklab:simulation-security-ready", {
    detail: { version: VERSION }
  }));
})();
