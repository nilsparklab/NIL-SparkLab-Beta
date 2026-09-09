
(() => {
  "use strict";

  const VERSION = "6.8";
  const MAX_SCRIPT_TEXT = 256 * 1024;
  const state = {
    unsafeScriptNodes: 0,
    unsafeURLNodes: 0,
    oversizedScriptNodes: 0
  };

  const emit = (type, detail) => {
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: { type, detail: String(detail || ""), version: VERSION }
      }));
    } catch (_) {}
  };

  // Audit only: do not remove or rewrite existing application scripts.
  // This avoids breaking simulator logic while exposing violations to QA.
  function auditScript(node) {
    if (!node || node.nodeType !== 1) return;
    const text = node.textContent || "";
    if (text.length > MAX_SCRIPT_TEXT) {
      state.oversizedScriptNodes++;
      emit("script-too-large", "Script node exceeded audit limit");
    }
    if (node.hasAttribute("onclick") || node.hasAttribute("onload") ||
        node.hasAttribute("onerror") || node.hasAttribute("onchange")) {
      state.unsafeScriptNodes++;
      emit("inline-event-handler", node.tagName.toLowerCase());
    }
    const src = node.getAttribute("src") || "";
    if (/^(?:javascript|vbscript|data|file):/i.test(src)) {
      state.unsafeURLNodes++;
      emit("unsafe-script-url", src.slice(0, 80));
    }
  }

  function auditDocument(root = document) {
    try {
      root.querySelectorAll("script").forEach(auditScript);
    } catch (_) {}
  }

  window.NilSparkLabCSPAudit = Object.freeze({
    version: VERSION,
    audit: auditDocument,
    state: () => Object.freeze({ ...state })
  });

  // Observe dynamically inserted script elements for security telemetry.
  try {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node && node.nodeType === 1) {
            if (node.matches?.("script")) auditScript(node);
            node.querySelectorAll?.("script").forEach(auditScript);
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (_) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => auditDocument(), { once: true });
  } else {
    auditDocument();
  }

  window.dispatchEvent(new CustomEvent("nilsparklab:csp-hardening-ready", {
    detail: { version: VERSION }
  }));
})();
