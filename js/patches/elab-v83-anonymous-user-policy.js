
(() => {
  "use strict";

  /*
   * USER ACCESS POLICY
   * Users do NOT need accounts or login.
   * No password, email, name, IP address, or user profile is required here.
   *
   * SECURITY POLICY
   * Owner/admin controls are separate from normal user access.
   * Client-side analytics are privacy-minimized and local-only.
   * Production owner authentication/authorization must be enforced server-side.
   */

  const KEY = "elab_v83_anonymous_session_v1";
  const MAX_EVENTS = 250;

  function makeId() {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (_) {}
    return "s_" + Date.now().toString(36) + "_" +
      Math.random().toString(36).slice(2, 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (data && data.sessionId && Array.isArray(data.events)) return data;
    } catch (_) {}
    return { sessionId: makeId(), startedAt: Date.now(), events: [] };
  }

  let state = load();

  function save() {
    try {
      state.events = state.events.slice(-MAX_EVENTS);
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (_) {
      /* Storage can be unavailable; app functionality must continue. */
    }
  }

  function track(type, detail) {
    const allowed = [
      "session_start", "section_view", "simulation_run",
      "assistant_open", "component_use", "error", "security_event"
    ];
    if (!allowed.includes(type)) return;

    state.events.push({
      type,
      time: Date.now(),
      detail: typeof detail === "string" ? detail.slice(0, 80) : undefined
    });
    save();
  }

  window.NilSparkLabAnonymousUser = Object.freeze({
    sessionId: () => state.sessionId,
    track,
    policy: Object.freeze({
      loginRequired: false,
      collectIdentity: false,
      collectEmail: false,
      collectPassword: false,
      collectIpInClient: false,
      localOnly: true
    })
  });

  track("session_start");

  /*
   * Prevent accidental credential collection by future UI additions.
   * This is a development guard, not a substitute for backend security.
   */
  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!form || !form.matches) return;
    const credentialFields = form.querySelectorAll(
      'input[type="password"], input[name*="email" i], input[autocomplete="password"]'
    );
    if (credentialFields.length && form.id !== "elab-v82-admin-lock") {
      console.warn("[NilSparkLab] Anonymous-user policy: credential form blocked.");
      event.preventDefault();
      track("security_event", "credential_form_blocked");
    }
  }, true);
})();
