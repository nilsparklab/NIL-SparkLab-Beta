
(() => {
  "use strict";

  const VERSION = "6.9";
  const LIMITS = Object.freeze({
    text: 256 * 1024,
    array: 10000,
    objectKeys: 5000,
    depth: 24
  });
  const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);
  const unsafeURL = /^(?:javascript|vbscript|data|file):/i;
  const state = { rejected: 0, sanitized: 0 };

  const emit = (type, detail) => {
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: { type, detail: String(detail || ""), version: VERSION }
      }));
    } catch (_) {}
  };

  function safeText(value, max = LIMITS.text) {
    const s = String(value ?? "");
    if (s.length > max) {
      state.rejected++;
      emit("input-too-large", "Text input exceeded limit");
      return null;
    }
    return s;
  }

  function safeURL(value) {
    const s = String(value ?? "").trim();
    if (!s || unsafeURL.test(s)) {
      state.rejected++;
      emit("unsafe-url-input", s.slice(0, 80));
      return null;
    }
    return s;
  }

  function validateData(value, depth = 0, seen = new WeakSet()) {
    if (depth > LIMITS.depth) throw new Error("depth limit exceeded");
    if (value === null || typeof value !== "object") return true;
    if (seen.has(value)) throw new Error("cyclic data");
    seen.add(value);

    if (Array.isArray(value)) {
      if (value.length > LIMITS.array) throw new Error("array limit exceeded");
      for (const item of value) validateData(item, depth + 1, seen);
      return true;
    }

    const keys = Object.keys(value);
    if (keys.length > LIMITS.objectKeys) throw new Error("object key limit exceeded");
    for (const key of keys) {
      if (blockedKeys.has(key)) throw new Error("blocked object key");
      validateData(value[key], depth + 1, seen);
    }
    return true;
  }

  function sanitizeHTML(value) {
    const html = safeText(value);
    if (html === null) return null;

    // Security boundary: parse inertly and remove executable/active elements.
    const template = document.createElement("template");
    template.innerHTML = html;
    template.content.querySelectorAll(
      "script,iframe,object,embed,applet,base,meta,link,style"
    ).forEach(el => el.remove());

    template.content.querySelectorAll("*").forEach(el => {
      [...el.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = attr.value || "";
        if (name.startsWith("on") || ["src","href","action","formaction"].includes(name) && unsafeURL.test(val)) {
          el.removeAttribute(attr.name);
          state.sanitized++;
        }
      });
    });

    return template.innerHTML;
  }

  window.NilSparkLabIOSecurity = Object.freeze({
    version: VERSION,
    limits: LIMITS,
    text: safeText,
    url: safeURL,
    validateData,
    sanitizeHTML,
    state: () => Object.freeze({ ...state })
  });

  window.dispatchEvent(new CustomEvent("nilsparklab:io-security-ready", {
    detail: { version: VERSION }
  }));
})();
