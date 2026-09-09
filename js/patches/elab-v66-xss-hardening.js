
(() => {
  "use strict";

  const VERSION = "6.6";
  const MAX_TEXT = 512 * 1024;
  const BLOCKED_KEYS = new Set(["__proto__", "prototype", "constructor"]);
  const BLOCKED_SCHEMES = /^(?:javascript|vbscript|data|file):/i;

  const state = {
    rejectedHTML: 0,
    rejectedURL: 0,
    rejectedInput: 0
  };

  const emit = (type, detail) => {
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: { type, detail: String(detail || ""), version: VERSION }
      }));
    } catch (_) {}
  };

  const validText = (value) => {
    const s = String(value ?? "");
    if (s.length > MAX_TEXT) {
      state.rejectedInput++;
      emit("input-too-large", "text payload exceeded limit");
      return null;
    }
    return s;
  };

  const safeURL = (value) => {
    try {
      const u = new URL(String(value), location.href);
      if (BLOCKED_SCHEMES.test(u.protocol)) return null;
      if (!["http:", "https:", "mailto:", "tel:"].includes(u.protocol)) return null;
      return u;
    } catch (_) {
      return null;
    }
  };

  // Expose a small, explicit security API for future modules.
  // Existing application behavior is not overridden globally here.
  window.NilSparkLabXSSGuard = Object.freeze({
    version: VERSION,
    text: validText,
    url: (value) => {
      const ok = !!safeURL(value);
      if (!ok) {
        state.rejectedURL++;
        emit("unsafe-url", "URL rejected by XSS guard");
      }
      return ok;
    },
    state: () => Object.freeze({ ...state })
  });

  // Detect dangerous HTML-looking input before it reaches future application
  // boundaries. This is advisory by default to avoid breaking existing UI.
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (!el || !("value" in el)) return;
    const value = String(el.value || "");
    if (value.length > MAX_TEXT) {
      el.value = value.slice(0, MAX_TEXT);
      state.rejectedInput++;
      emit("input-truncated", "input length capped");
    }
  }, true);

  window.dispatchEvent(new CustomEvent("nilsparklab:xss-hardening-ready", {
    detail: { version: VERSION }
  }));
})();
