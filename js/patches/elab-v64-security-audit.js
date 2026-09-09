
(() => {
  "use strict";

  const VERSION = "6.4";
  const MAX = Object.freeze({
    jsonBytes: 512 * 1024,
    depth: 24,
    nodes: 25000,
    stringBytes: 512 * 1024
  });

  const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);
  const blockedSchemes = /^(?:javascript|vbscript|data|file):/i;

  const results = [];
  const record = (name, passed, detail = "") => {
    results.push(Object.freeze({ name, passed: !!passed, detail: String(detail) }));
  };

  const bytes = v => {
    try { return new TextEncoder().encode(String(v)).byteLength; }
    catch (_) { return String(v).length; }
  };

  function validateTree(value, depth = 0, state = { nodes: 0 }, seen = new WeakSet()) {
    if (++state.nodes > MAX.nodes) throw new Error("node limit exceeded");
    if (depth > MAX.depth) throw new Error("depth limit exceeded");
    if (value === null || typeof value !== "object") return true;
    if (seen.has(value)) throw new Error("cyclic object");
    seen.add(value);

    if (Array.isArray(value)) {
      for (const item of value) validateTree(item, depth + 1, state, seen);
    } else {
      for (const key of Object.keys(value)) {
        if (blockedKeys.has(key)) throw new Error("dangerous key");
        validateTree(value[key], depth + 1, state, seen);
      }
    }
    return true;
  }

  function safeURL(value) {
    try {
      const u = new URL(String(value), location.href);
      if (blockedSchemes.test(u.protocol)) return null;
      return u;
    } catch (_) { return null; }
  }

  function safeJSON(value) {
    if (bytes(value) > MAX.jsonBytes) throw new Error("payload too large");
    const parsed = JSON.parse(String(value));
    validateTree(parsed);
    return parsed;
  }

  // Deterministic regression tests for previously hardened attack surfaces.
  function runSecuritySelfTest() {
    results.length = 0;

    try { record("unsafe URL blocked", safeURL("javascript:alert(1)") === null); }
    catch (_) { record("unsafe URL blocked", false); }

    try {
      let ok = false;
      try { validateTree(JSON.parse('{"__proto__":{"polluted":true}}')); }
      catch (_) { ok = true; }
      record("prototype-pollution payload rejected", ok);
    } catch (_) { record("prototype-pollution payload rejected", false); }

    try {
      let ok = false;
      try { validateTree({ a: { b: { c: {} } } }, 25); }
      catch (_) { ok = true; }
      record("excessive object depth rejected", ok);
    } catch (_) { record("excessive object depth rejected", false); }

    try {
      let ok = false;
      try { safeJSON("x".repeat(MAX.jsonBytes + 1)); }
      catch (_) { ok = true; }
      record("oversized JSON rejected", ok);
    } catch (_) { record("oversized JSON rejected", false); }

    try {
      const obj = {}; obj.self = obj;
      let ok = false;
      try { validateTree(obj); } catch (_) { ok = true; }
      record("cyclic structure rejected", ok);
    } catch (_) { record("cyclic structure rejected", false); }

    try {
      const benign = safeJSON('{"type":"circuit","components":[]}');
      record("benign JSON accepted", !!benign && benign.type === "circuit");
    } catch (_) { record("benign JSON accepted", false); }

    const passed = results.filter(r => r.passed).length;
    return Object.freeze({
      version: VERSION,
      passed,
      total: results.length,
      ok: passed === results.length,
      results: results.slice()
    });
  }

  // Minimal audit API: no user data or circuit contents are logged.
  window.NilSparkLabSecurityAudit = Object.freeze({
    version: VERSION,
    run: runSecuritySelfTest,
    getLastResults: () => results.slice()
  });

  window.addEventListener("DOMContentLoaded", () => {
    try {
      const report = runSecuritySelfTest();
      window.dispatchEvent(new CustomEvent("nilsparklab:security-audit", {
        detail: report
      }));
    } catch (_) {}
  }, { once: true });

})();
