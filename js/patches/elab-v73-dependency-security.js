
(() => {
  "use strict";

  const VERSION = "7.3";
  const MAX_RESOURCES = 500;
  const resources = [];

  const emit = (type, severity = "info", detail = "") => {
    const event = Object.freeze({
      time: Date.now(),
      type: String(type),
      severity: String(severity),
      detail: String(detail),
      version: VERSION
    });
    try {
      window.dispatchEvent(new CustomEvent("nilsparklab:security-event", {
        detail: event
      }));
    } catch (_) {}
    return event;
  };

  const normalize = (value) => {
    try { return new URL(value, document.baseURI).href; }
    catch (_) { return String(value || ""); }
  };

  const isExternal = (url) => {
    try {
      return new URL(url, document.baseURI).origin !== location.origin;
    } catch (_) {
      return false;
    }
  };

  const scan = () => {
    resources.length = 0;

    document.querySelectorAll("script[src], link[href], img[src], iframe[src], source[src]").forEach((node) => {
      const attr = node.hasAttribute("src") ? "src" : "href";
      const raw = node.getAttribute(attr) || "";
      const url = normalize(raw);

      resources.push(Object.freeze({
        tag: node.tagName.toLowerCase(),
        type: node.getAttribute("rel") || node.getAttribute("type") || "",
        url,
        external: isExternal(url),
        integrity: node.getAttribute("integrity") || null,
        crossorigin: node.getAttribute("crossorigin") || null
      }));

      if (resources.length >= MAX_RESOURCES) return;
    });

    const externalWithoutIntegrity = resources.filter(
      r => r.external &&
           ["script", "link"].includes(r.tag) &&
           !r.integrity
    );

    if (externalWithoutIntegrity.length) {
      emit(
        "dependency-integrity-warning",
        "medium",
        `${externalWithoutIntegrity.length} external script/style resource(s) lack SRI integrity metadata`
      );
    } else {
      emit("dependency-integrity-check", "info", "No unverified external script/style resources detected");
    }

    return Object.freeze(resources.slice());
  };

  const getReport = () => Object.freeze({
    version: VERSION,
    totalResources: resources.length,
    externalResources: resources.filter(r => r.external).length,
    integrityProtected: resources.filter(r => r.integrity).length,
    externalWithoutIntegrity: resources.filter(
      r => r.external && ["script", "link"].includes(r.tag) && !r.integrity
    ).length
  });

  window.NilSparkLabDependencySecurity = Object.freeze({
    version: VERSION,
    scan,
    report: getReport,
    resources: () => Object.freeze(resources.slice())
  });

  window.addEventListener("load", () => {
    try { scan(); } catch (error) {
      emit("dependency-scan-failed", "high", error?.message || "Unknown scan failure");
    }
  }, { once: true });

  window.dispatchEvent(new CustomEvent("nilsparklab:dependency-security-ready", {
    detail: { version: VERSION }
  }));
})();
