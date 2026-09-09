
(() => {
  "use strict";

  const VERSION = "6.7";
  const MAX_HTML = 512 * 1024;
  const blocked = /(?:javascript|vbscript|data|file):/i;
  const state = { rejectedHTML: 0, rejectedAttributes: 0 };

  const emit = (type, detail) => {
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: { type, detail: String(detail || ""), version: VERSION }
      }));
    } catch (_) {}
  };

  // Explicit HTML boundary for future modules.
  // It does not monkey-patch innerHTML globally, avoiding regressions.
  function safeFragment(value) {
    const html = String(value ?? "");
    if (html.length > MAX_HTML) {
      state.rejectedHTML++;
      emit("html-too-large", "HTML fragment exceeded limit");
      return null;
    }
    return html;
  }

  function safeAttribute(name, value) {
    const n = String(name || "").toLowerCase();
    const v = String(value ?? "");
    if (/^on[a-z]+$/i.test(n)) {
      state.rejectedAttributes++;
      emit("event-handler-attribute-rejected", n);
      return null;
    }
    if (["href", "src", "action", "formaction"].includes(n) && blocked.test(v)) {
      state.rejectedAttributes++;
      emit("unsafe-url-attribute-rejected", n);
      return null;
    }
    return v;
  }

  window.NilSparkLabDOMSecurity = Object.freeze({
    version: VERSION,
    fragment: safeFragment,
    attribute: safeAttribute,
    state: () => Object.freeze({ ...state })
  });

  window.dispatchEvent(new CustomEvent("nilsparklab:dom-security-ready", {
    detail: { version: VERSION }
  }));
})();
