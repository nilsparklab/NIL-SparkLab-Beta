
(() => {
  "use strict";

  const MAX = Object.freeze({
    jsonBytes: 512 * 1024,
    textBytes: 512 * 1024,
    collection: 20000,
    depth: 24
  });

  const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

  function byteLength(value) {
    try { return new TextEncoder().encode(String(value)).byteLength; }
    catch { return String(value).length; }
  }

  function validateTree(value, depth = 0, seen = new WeakSet()) {
    if (depth > MAX.depth) throw new Error("Security: maximum object depth exceeded");
    if (value === null || typeof value !== "object") return;

    if (seen.has(value)) throw new Error("Security: cyclic structure rejected");
    seen.add(value);

    if (Array.isArray(value)) {
      if (value.length > MAX.collection) throw new Error("Security: collection limit exceeded");
      for (const item of value) validateTree(item, depth + 1, seen);
      return;
    }

    const keys = Object.keys(value);
    if (keys.length > MAX.collection) throw new Error("Security: property limit exceeded");
    for (const key of keys) {
      if (blockedKeys.has(key)) throw new Error("Security: dangerous key rejected");
      validateTree(value[key], depth + 1, seen);
    }
  }

  function safeParseJSON(input) {
    if (byteLength(input) > MAX.jsonBytes) throw new Error("Security: JSON payload too large");
    const parsed = JSON.parse(String(input));
    validateTree(parsed);
    return parsed;
  }

  function safeText(input) {
    if (byteLength(input) > MAX.textBytes) throw new Error("Security: text payload too large");
    return String(input);
  }

  // Rate-limit high-risk browser events without touching normal UI interaction.
  const buckets = new Map();
  function allow(key, limit = 30, windowMs = 10000) {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now - b.start >= windowMs) {
      buckets.set(key, { start: now, count: 1 });
      return true;
    }
    if (++b.count > limit) return false;
    return true;
  }

  window.addEventListener("message", event => {
    if (event.origin !== location.origin || event.source !== window) return;
    if (!allow("message", 60, 10000)) return;
    try {
      const raw = typeof event.data === "string" ? event.data : JSON.stringify(event.data);
      if (byteLength(raw) > MAX.jsonBytes) return;
      if (event.data && typeof event.data === "object") validateTree(event.data);
    } catch (_) {}
  }, true);

  // Harden storage writes against oversized values and unsafe structured objects.
  try {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (byteLength(value) > MAX.textBytes) throw new Error("Security: storage value too large");
      return nativeSetItem.call(this, String(key), String(value));
    };
  } catch (_) {}

  window.NilSparkLabSecurity = Object.freeze({
    ...(window.NilSparkLabSecurity || {}),
    version: "6.4",
    safeParseJSON,
    safeText,
    validateTree,
    allow
  });

  window.dispatchEvent(new CustomEvent("nilsparklab:security-ready", {
    detail: Object.freeze({ version: "6.4", mode: "hardened" })
  }));
})();
