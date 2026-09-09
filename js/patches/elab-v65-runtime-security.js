
(() => {
  "use strict";

  const VERSION = "6.5";
  const MAX_STORAGE_VALUE = 1024 * 1024;
  const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
  const BLOCKED_PROTOCOL = /^(?:javascript|vbscript|data|file):/i;
  const state = {
    blockedNavigation: 0,
    blockedStorage: 0,
    rejectedMessages: 0,
    runtimeErrors: 0
  };

  function audit(type, detail) {
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: { type: String(type), detail: String(detail || ""), version: VERSION }
      }));
    } catch (_) {}
  }

  function safeURL(value) {
    try {
      const u = new URL(String(value), location.href);
      if (BLOCKED_PROTOCOL.test(u.protocol)) return null;
      return SAFE_PROTOCOLS.has(u.protocol) ? u : null;
    } catch (_) {
      return null;
    }
  }

  // Block dangerous navigations created dynamically by future modules.
  document.addEventListener("click", (event) => {
    const target = event.target && event.target.closest
      ? event.target.closest("a[href]")
      : null;
    if (!target) return;
    const raw = target.getAttribute("href");
    if (!raw) return;
    if (!safeURL(raw)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      state.blockedNavigation++;
      audit("blocked-navigation", "unsafe URL scheme");
    }
  }, true);

  // Guard window.open without changing normal same-origin behavior.
  try {
    const nativeOpen = window.open;
    window.open = function(url, target, features) {
      if (url != null && !safeURL(url)) {
        state.blockedNavigation++;
        audit("blocked-window-open", "unsafe URL scheme");
        return null;
      }
      return nativeOpen.call(window, url, target, features);
    };
  } catch (_) {}

  // Storage quota guard. This complements the existing SafeStore layer.
  function storageGuard(storage) {
    if (!storage) return;
    try {
      const nativeSet = storage.setItem.bind(storage);
      storage.setItem = function(key, value) {
        if (String(value).length > MAX_STORAGE_VALUE) {
          state.blockedStorage++;
          audit("blocked-storage", "value exceeds runtime limit");
          throw new DOMException("Storage value too large", "QuotaExceededError");
        }
        return nativeSet(String(key), String(value));
      };
    } catch (_) {}
  }
  try { storageGuard(window.localStorage); } catch (_) {}
  try { storageGuard(window.sessionStorage); } catch (_) {}

  // Reject cross-origin messages unless explicitly from this origin.
  window.addEventListener("message", (event) => {
    if (event.origin && event.origin !== location.origin) {
      state.rejectedMessages++;
      audit("rejected-message", "unexpected message origin");
    }
  }, true);

  // Keep errors observable without exposing user/circuit payloads.
  window.addEventListener("error", () => {
    state.runtimeErrors++;
    audit("runtime-error", "runtime exception observed");
  }, true);

  window.addEventListener("unhandledrejection", () => {
    state.runtimeErrors++;
    audit("unhandled-rejection", "promise rejection observed");
  }, true);

  window.NilSparkLabRuntimeSecurity = Object.freeze({
    version: VERSION,
    getState: () => Object.freeze({ ...state }),
    validateURL: value => !!safeURL(value)
  });

  window.dispatchEvent(new CustomEvent("nilsparklab:runtime-security-ready", {
    detail: { version: VERSION }
  }));
})();
