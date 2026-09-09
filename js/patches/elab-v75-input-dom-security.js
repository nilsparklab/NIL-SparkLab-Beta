
(() => {
  "use strict";

  const VERSION = "7.5";
  const MAX_EVENTS = 120;
  const events = [];

  const emit = (type, severity, detail) => {
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
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", { detail: event }));
    } catch (_) {}
    return event;
  };

  const text = (value, max = 2000) => {
    if (value === null || value === undefined) return "";
    return String(value).slice(0, max);
  };

  const safeText = (value, max = 2000) => {
    const input = text(value, max);
    return input.replace(/[<>]/g, "");
  };

  const validateCircuitValue = (value, options = {}) => {
    const max = Number.isFinite(options.maxLength) ? options.maxLength : 2000;
    const allowEmpty = options.allowEmpty !== false;
    const raw = text(value, max + 1);

    if (!allowEmpty && raw.trim() === "") {
      return Object.freeze({ ok: false, value: "", reason: "empty-input" });
    }
    if (raw.length > max) {
      emit("input-length-rejected", "medium", `Input exceeded ${max} characters`);
      return Object.freeze({ ok: false, value: "", reason: "length-limit" });
    }

    const suspicious = /<\s*script\b|javascript\s*:|on(?:error|load|click)\s*=|<\s*iframe\b/i.test(raw);
    if (suspicious) {
      emit("suspicious-input-rejected", "high", "Potential script/HTML injection pattern");
      return Object.freeze({ ok: false, value: "", reason: "suspicious-pattern" });
    }

    return Object.freeze({ ok: true, value: safeText(raw, max), reason: null });
  };

  const setText = (element, value, options) => {
    if (!(element instanceof Element)) {
      emit("invalid-dom-target", "medium", "setText received a non-DOM target");
      return false;
    }
    const result = validateCircuitValue(value, options);
    if (!result.ok) return false;
    element.textContent = result.value;
    return true;
  };

  const auditHtml = (htmlValue) => {
    const raw = text(htmlValue, 5000);
    const dangerous = /<\s*script\b|javascript\s*:|on[a-z]+\s*=|<\s*(iframe|object|embed|svg)\b/i.test(raw);
    if (dangerous) {
      emit("unsafe-html-detected", "high", "Potentially executable HTML detected");
    }
    return Object.freeze({ safe: !dangerous, length: raw.length });
  };

  window.NilSparkLabInputSecurity = Object.freeze({
    version: VERSION,
    validate: validateCircuitValue,
    setText,
    auditHtml,
    report: () => Object.freeze({
      version: VERSION,
      eventCount: events.length,
      highSeverity: events.filter(e => e.severity === "high").length,
      mediumSeverity: events.filter(e => e.severity === "medium").length
    }),
    events: () => Object.freeze(events.slice())
  });

  window.addEventListener("load", () => {
    emit("input-dom-security-ready", "info", "v7.5 validation and DOM safety layer initialized");
  }, { once: true });
})();
