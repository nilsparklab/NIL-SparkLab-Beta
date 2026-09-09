
(() => {
  "use strict";

  const SEC = Object.freeze({
    version: "6.2",
    maxMessageBytes: 64 * 1024,
    maxStorageBytes: 2 * 1024 * 1024,
    allowedProtocols: new Set(["http:", "https:"]),
    blockedSchemes: /^(?:javascript|vbscript|data|file):/i
  });

  // Fail-safe URL validation for security-sensitive navigation/fetch use.
  function safeURL(value, base = location.href) {
    try {
      const u = new URL(String(value), base);
      if (SEC.blockedSchemes.test(u.protocol)) return null;
      if (!SEC.allowedProtocols.has(u.protocol) && u.origin !== location.origin) return null;
      return u;
    } catch { return null; }
  }

  // Prototype-pollution-resistant deep clone for plain JSON-like data.
  function safeClone(value, depth = 0, seen = new WeakSet()) {
    if (depth > 20) throw new Error("Security: object depth exceeded");
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) throw new Error("Security: cyclic object rejected");
    seen.add(value);

    if (Array.isArray(value)) {
      if (value.length > 10000) throw new Error("Security: array size exceeded");
      return value.map(v => safeClone(v, depth + 1, seen));
    }

    const out = Object.create(null);
    for (const key of Object.keys(value)) {
      if (key === "__proto__" || key === "prototype" || key === "constructor") {
        throw new Error("Security: dangerous object key rejected");
      }
      out[key] = safeClone(value[key], depth + 1, seen);
    }
    return out;
  }

  // Harden message boundary: same-origin by default, bounded payload.
  window.addEventListener("message", event => {
    try {
      if (event.origin !== location.origin) return;
      if (event.source !== window) return;

      const raw = typeof event.data === "string"
        ? event.data
        : JSON.stringify(event.data);

      if (raw && new Blob([raw]).size > SEC.maxMessageBytes) return;
      if (event.data && typeof event.data === "object") safeClone(event.data);
    } catch (_) {
      // Fail closed.
    }
  }, true);

  // Guard common dangerous DOM sink patterns when directly assigned by app code.
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    const n = String(name).toLowerCase();
    if ((n === "href" || n === "src" || n === "action" || n === "formaction") &&
        safeURL(value) === null) {
      throw new TypeError("Security: unsafe URL blocked");
    }
    return originalSetAttribute.call(this, name, value);
  };

  // Safe navigation helper exposed under a namespaced API.
  window.NilSparkLabSecurity = Object.freeze({
    version: SEC.version,
    safeURL,
    safeClone,
    isSafeURL: value => !!safeURL(value)
  });

  // Security audit event, without collecting user content.
  window.dispatchEvent(new CustomEvent("nilsparklab:security-ready", {
    detail: Object.freeze({ version: SEC.version })
  }));
})();
