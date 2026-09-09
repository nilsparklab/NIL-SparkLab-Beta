
(() => {
  "use strict";

  const VERSION = "7.9";
  const MAX_EVENTS = 300;
  const events = [];
  const ownerToken = Symbol("private-security-audit-owner");
  let ownerMode = false;

  const push = (type, severity, detail) => {
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

  /* Private-by-default: no visible UI is created by this layer.
     Security data is available only through an owner-held capability. */
  const enablePrivateAudit = (token) => {
    if (token !== ownerToken) {
      push("private-audit-access-denied", "high", "Unauthorized audit capability request");
      return false;
    }
    ownerMode = true;
    return true;
  };

  const privateReport = (token) => {
    if (token !== ownerToken || !ownerMode) {
      push("private-report-access-denied", "high", "Unauthorized private report request");
      return null;
    }

    const high = events.filter(e => e.severity === "high").length;
    const medium = events.filter(e => e.severity === "medium").length;
    const info = events.filter(e => e.severity === "info").length;

    return Object.freeze({
      version: VERSION,
      generatedAt: Date.now(),
      securityState: high ? "attention-required" : "nominal",
      counts: Object.freeze({ high, medium, info, total: events.length }),
      events: Object.freeze(events.slice())
    });
  };

  const securityScore = (token) => {
    const report = privateReport(token);
    if (!report) return null;
    const deductions = report.counts.high * 12 + report.counts.medium * 4;
    return Math.max(0, Math.min(100, 100 - deductions));
  };

  /* Owner-only capability is intentionally kept in closure scope.
     The normal page/user surface receives no report, dashboard, or DOM panel. */
  window.NilSparkLabPrivateSecurity = Object.freeze({
    createOwnerCapability: () => ownerToken,
    enable: enablePrivateAudit,
    report: privateReport,
    score: securityScore
  });

  push("private-security-audit-ready", "info", "Private security audit initialized; no user-facing security UI created");

  window.addEventListener("nilsparklab:security-event", (event) => {
    const d = event?.detail;
    if (!d || d.version === VERSION) return;
    /* Keep telemetry local to this page; do not transmit it anywhere. */
    if (events.length < MAX_EVENTS) {
      events.push(Object.freeze({
        time: Number(d.time) || Date.now(),
        type: String(d.type || "unknown"),
        severity: String(d.severity || "info"),
        detail: String(d.detail || ""),
        version: String(d.version || "external")
      }));
    }
  });
})();
