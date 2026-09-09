
(() => {
  "use strict";

  const VERSION = "7.7";
  const MAX_JSON = 250000;
  const MAX_COMPONENTS = 500;
  const MAX_CONNECTIONS = 1000;
  const MAX_ID_LENGTH = 128;
  const events = [];

  const emit = (type, severity, detail) => {
    const event = Object.freeze({
      time: Date.now(), type: String(type),
      severity: String(severity), detail: String(detail), version: VERSION
    });
    events.push(event);
    if (events.length > 150) events.shift();
    try { window.dispatchEvent(new CustomEvent("nilsparklab:security-event", { detail: event })); } catch (_) {}
    return event;
  };

  const plainObject = (value) =>
    value !== null && typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

  const hasDangerousKey = (key) =>
    key === "__proto__" || key === "prototype" || key === "constructor";

  const deepValidate = (value, depth = 0, seen = new WeakSet()) => {
    if (depth > 20) return false;
    if (value && typeof value === "object") {
      if (seen.has(value)) return false;
      seen.add(value);
      if (!Array.isArray(value) && !plainObject(value)) return false;
      for (const [key, child] of Object.entries(value)) {
        if (hasDangerousKey(key)) return false;
        if (!deepValidate(child, depth + 1, seen)) return false;
      }
    }
    return true;
  };

  const validate = (input) => {
    let data = input;
    if (typeof input === "string") {
      if (input.length > MAX_JSON) {
        emit("circuit-size-rejected", "high", "Circuit JSON exceeds maximum size");
        return Object.freeze({ ok: false, reason: "size-limit" });
      }
      try { data = JSON.parse(input); }
      catch (_) {
        emit("circuit-json-rejected", "medium", "Malformed JSON");
        return Object.freeze({ ok: false, reason: "invalid-json" });
      }
    }

    if (!deepValidate(data)) {
      emit("circuit-schema-rejected", "high", "Unsafe object structure detected");
      return Object.freeze({ ok: false, reason: "unsafe-structure" });
    }

    const components = Array.isArray(data?.components) ? data.components : [];
    const connections = Array.isArray(data?.connections) ? data.connections : [];

    if (components.length > MAX_COMPONENTS || connections.length > MAX_CONNECTIONS) {
      emit("circuit-limit-rejected", "medium", "Component or connection limit exceeded");
      return Object.freeze({ ok: false, reason: "resource-limit" });
    }

    for (const item of [...components, ...connections]) {
      if (item && item.id !== undefined && String(item.id).length > MAX_ID_LENGTH) {
        emit("circuit-id-rejected", "medium", "Circuit identifier exceeds maximum length");
        return Object.freeze({ ok: false, reason: "id-limit" });
      }
    }

    return Object.freeze({
      ok: true,
      reason: null,
      componentCount: components.length,
      connectionCount: connections.length
    });
  };

  const cloneSafe = (input) => {
    const check = validate(input);
    if (!check.ok) return null;
    try {
      return structuredClone(input);
    } catch (_) {
      try { return JSON.parse(JSON.stringify(input)); }
      catch (error) {
        emit("circuit-clone-failed", "high", error?.message || "Clone failure");
        return null;
      }
    }
  };

  const exportSafe = (input) => {
    const copy = cloneSafe(input);
    if (copy === null) return null;
    try {
      const serialized = JSON.stringify(copy);
      if (serialized.length > MAX_JSON) {
        emit("circuit-export-rejected", "medium", "Export exceeds size limit");
        return null;
      }
      return serialized;
    } catch (error) {
      emit("circuit-export-failed", "high", error?.message || "Export failure");
      return null;
    }
  };

  window.NilSparkLabCircuitSecurity = Object.freeze({
    version: VERSION,
    validate,
    cloneSafe,
    exportSafe,
    limits: Object.freeze({
      maxJsonBytes: MAX_JSON,
      maxComponents: MAX_COMPONENTS,
      maxConnections: MAX_CONNECTIONS,
      maxIdLength: MAX_ID_LENGTH
    }),
    report: () => Object.freeze({
      version: VERSION,
      eventCount: events.length,
      highSeverity: events.filter(e => e.severity === "high").length,
      mediumSeverity: events.filter(e => e.severity === "medium").length
    })
  });

  window.addEventListener("load", () => {
    emit("circuit-state-security-ready", "info", "v7.7 secure circuit data layer initialized");
  }, { once: true });
})();
