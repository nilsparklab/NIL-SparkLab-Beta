
(() => {
  "use strict";

  /*
   * v8.4 SECURITY LAYER
   * Normal users remain anonymous: no login, email, password, or profile required.
   * This layer provides client-side defense-in-depth only.
   * Production abuse prevention must also be enforced server-side.
   */

  const WINDOW_MS = 60 * 1000;
  const MAX_ACTIONS = 45;
  const MAX_PAYLOAD = 4096;
  const actionTimes = new Map();

  function cleanText(value, max = 300) {
    if (typeof value !== "string") return "";
    return value
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .slice(0, max);
  }

  function allow(action = "generic") {
    const now = Date.now();
    const key = cleanText(action, 80) || "generic";
    const recent = (actionTimes.get(key) || []).filter(t => now - t < WINDOW_MS);
    if (recent.length >= MAX_ACTIONS) {
      try { window.NilSparkLabAnonymousUser?.track("security_event", "rate_limit:" + key); } catch (_) {}
      return false;
    }
    recent.push(now);
    actionTimes.set(key, recent);
    return true;
  }

  function validatePayload(value) {
    if (value == null) return true;
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      return serialized.length <= MAX_PAYLOAD;
    } catch (_) {
      return false;
    }
  }

  function safeSetText(node, value, max = 500) {
    if (!node || !("textContent" in node)) return false;
    node.textContent = cleanText(value, max);
    return true;
  }

  window.NilSparkLabSecurity = Object.freeze({
    allow,
    validatePayload,
    cleanText,
    safeSetText,
    policy: Object.freeze({
      anonymousUsers: true,
      loginRequired: false,
      clientRateLimit: true,
      payloadLimitBytes: MAX_PAYLOAD,
      identityCollection: false
    })
  });

  /*
   * Guard common high-risk sinks when the application explicitly opts in.
   * Existing application behavior is not rewritten globally to avoid regressions.
   */
  document.addEventListener("click", (event) => {
    const el = event.target?.closest?.("[data-elab-rate-limit]");
    if (el && !allow(el.getAttribute("data-elab-rate-limit"))) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener("error", (event) => {
    try {
      window.NilSparkLabAnonymousUser?.track(
        "error",
        cleanText(event?.message || "client_error", 120)
      );
    } catch (_) {}
  });

  window.addEventListener("unhandledrejection", (event) => {
    try {
      window.NilSparkLabAnonymousUser?.track(
        "error",
        cleanText(event?.reason?.message || "unhandled_rejection", 120)
      );
    } catch (_) {}
  });
})();
