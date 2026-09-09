
(() => {
  "use strict";

  const VERSION = "7.8";
  const MAX_INPUT = 8000;
  const MAX_OUTPUT = 12000;
  const MAX_EVENTS = 150;
  const events = [];

  const emit = (type, severity, detail) => {
    const event = Object.freeze({
      time: Date.now(), type: String(type),
      severity: String(severity), detail: String(detail), version: VERSION
    });
    events.push(event);
    if (events.length > MAX_EVENTS) events.shift();
    try { window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {detail: event})); } catch (_) {}
    return event;
  };

  const blockedPatterns = [
    /<\s*script\b/i,
    /javascript\s*:/i,
    /\bon[a-z]+\s*=/i,
    /(?:ignore|disregard|bypass)\s+(?:all\s+)?(?:previous|system|security)\s+(?:instructions|rules)/i,
    /(?:reveal|show|print|dump)\s+(?:system|developer|hidden)\s+(?:prompt|instructions|secrets?)/i
  ];

  const validateInput = (input) => {
    const value = input == null ? "" : String(input);
    if (value.length > MAX_INPUT) {
      emit("assistant-input-size-rejected", "medium", "Assistant input exceeded maximum length");
      return Object.freeze({ok: false, reason: "size-limit", value: ""});
    }

    const match = blockedPatterns.find(pattern => pattern.test(value));
    if (match) {
      emit("assistant-injection-pattern-detected", "high", "Potential prompt/instruction injection pattern");
      return Object.freeze({ok: false, reason: "unsafe-pattern", value: ""});
    }

    return Object.freeze({ok: true, reason: null, value});
  };

  const validateOutput = (output) => {
    const value = output == null ? "" : String(output);
    if (value.length > MAX_OUTPUT) {
      emit("assistant-output-size-rejected", "medium", "Assistant output exceeded maximum length");
      return Object.freeze({ok: false, reason: "size-limit", value: ""});
    }

    if (/<\s*script\b|javascript\s*:|<\s*iframe\b|on[a-z]+\s*=/i.test(value)) {
      emit("assistant-output-unsafe-content", "high", "Potential executable content in assistant output");
      return Object.freeze({ok: false, reason: "unsafe-output", value: ""});
    }

    return Object.freeze({ok: true, reason: null, value});
  };

  const actions = new Map();

  const registerAction = (name, handler) => {
    if (typeof name !== "string" || !/^[a-z0-9._-]{1,64}$/i.test(name) || typeof handler !== "function") {
      emit("assistant-action-registration-rejected", "medium", "Invalid assistant action registration");
      return false;
    }
    if (actions.has(name)) {
      emit("assistant-action-duplicate", "medium", `Duplicate action: ${name}`);
      return false;
    }
    actions.set(name, handler);
    return true;
  };

  const executeAction = (name, args) => {
    if (!actions.has(name)) {
      emit("assistant-action-denied", "high", `Action not allowlisted: ${String(name)}`);
      return Object.freeze({ok: false, reason: "action-not-allowlisted"});
    }
    try {
      return Object.freeze({ok: true, result: actions.get(name)(args)});
    } catch (error) {
      emit("assistant-action-failed", "high", error?.message || "Action failure");
      return Object.freeze({ok: false, reason: "action-failed"});
    }
  };

  window.NilSparkLabAssistantSecurity = Object.freeze({
    version: VERSION,
    validateInput,
    validateOutput,
    registerAction,
    executeAction,
    allowedActions: () => Object.freeze(Array.from(actions.keys())),
    report: () => Object.freeze({
      version: VERSION,
      allowedActions: actions.size,
      eventCount: events.length,
      highSeverity: events.filter(e => e.severity === "high").length,
      mediumSeverity: events.filter(e => e.severity === "medium").length
    }),
    events: () => Object.freeze(events.slice())
  });

  window.addEventListener("load", () => {
    emit("assistant-security-boundary-ready", "info", "v7.8 assistant security boundary initialized");
  }, {once: true});
})();
