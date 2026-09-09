
(() => {
  "use strict";

  const VERSION = "7.2";
  const MAX_EVENTS = 200;
  const COOLDOWN_MS = 3000;
  const events = [];
  let abuseCount = 0;
  let cooldownUntil = 0;

  const emit = (type, severity = "info", detail = "") => {
    const event = Object.freeze({
      time: Date.now(),
      type: String(type),
      severity: String(severity),
      detail: String(detail),
      version: VERSION
    });
    events.push(event);
    if (events.length > MAX_EVENTS) events.shift();

    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: event
      }));
    } catch (_) {}
    return event;
  };

  function recordAbuse(reason = "security limit exceeded") {
    abuseCount++;
    const event = emit("abuse-detected", abuseCount >= 3 ? "high" : "medium", reason);
    if (abuseCount >= 3) {
      cooldownUntil = Date.now() + COOLDOWN_MS;
      emit("security-cooldown", "high", "Repeated security-limit violations");
    }
    return event;
  }

  function canRun() {
    if (Date.now() < cooldownUntil) return false;
    return true;
  }

  function safeReset(reason = "fail-safe reset") {
    try {
      window.NilSparkLabSimulationSecurity?.abort(reason);
    } catch (_) {}
    emit("fail-safe-reset", "high", reason);
    return true;
  }

  function clearTelemetry() {
    events.length = 0;
    abuseCount = 0;
    cooldownUntil = 0;
    emit("security-telemetry-cleared", "info");
  }

  window.NilSparkLabFailSafe = Object.freeze({
    version: VERSION,
    recordAbuse,
    canRun,
    safeReset,
    clearTelemetry,
    events: () => Object.freeze(events.slice()),
    state: () => Object.freeze({
      abuseCount,
      cooldownUntil,
      cooldownActive: Date.now() < cooldownUntil
    })
  });

  window.dispatchEvent(new CustomEvent("nilsparklab:failsafe-ready", {
    detail: { version: VERSION }
  }));
})();
