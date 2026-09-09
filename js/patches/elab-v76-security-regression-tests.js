
(() => {
  "use strict";

  const VERSION = "7.6";
  const results = [];
  const MAX_RESULTS = 200;

  const add = (name, passed, detail = "") => {
    const item = Object.freeze({
      name: String(name),
      passed: Boolean(passed),
      detail: String(detail),
      time: Date.now(),
      version: VERSION
    });
    results.push(item);
    if (results.length > MAX_RESULTS) results.shift();
    return item;
  };

  const test = (name, fn) => {
    try {
      return add(name, Boolean(fn()), "completed");
    } catch (error) {
      return add(name, false, error?.message || "test-error");
    }
  };

  const run = () => {
    results.length = 0;

    test("input-security-api", () =>
      !!window.NilSparkLabInputSecurity &&
      typeof window.NilSparkLabInputSecurity.validate === "function"
    );

    test("xss-rejection", () => {
      const api = window.NilSparkLabInputSecurity;
      if (!api) return false;
      return api.validate("<script>alert(1)<\/script>").ok === false;
    });

    test("javascript-url-rejection", () => {
      const api = window.NilSparkLabInputSecurity;
      if (!api) return false;
      return api.validate("javascript:alert(1)").ok === false;
    });

    test("safe-text-rendering", () => {
      const api = window.NilSparkLabInputSecurity;
      if (!api) return false;
      const el = document.createElement("div");
      return api.setText(el, "<b>test</b>") && el.innerHTML.indexOf("<b>") === -1;
    });

    test("unsafe-html-audit", () => {
      const api = window.NilSparkLabInputSecurity;
      if (!api) return false;
      return api.auditHtml("<script>x<\/script>").safe === false &&
             api.auditHtml("plain text").safe === true;
    });

    test("dependency-security-api", () =>
      !!window.NilSparkLabDependencySecurity &&
      typeof window.NilSparkLabDependencySecurity.scan === "function"
    );

    test("runtime-security-api", () =>
      !!window.NilSparkLabRuntimeSecurity &&
      typeof window.NilSparkLabRuntimeSecurity.check === "function"
    );

    test("failsafe-security-layer", () =>
      document.querySelector('[id*="v72"], script[id*="v72"]') !== null ||
      document.documentElement.innerHTML.indexOf("failsafe") !== -1
    );

    return Object.freeze({
      version: VERSION,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      total: results.length,
      results: Object.freeze(results.slice())
    });
  };

  const report = () => Object.freeze({
    version: VERSION,
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length
  });

  window.NilSparkLabSecurityTests = Object.freeze({
    version: VERSION,
    run,
    report,
    results: () => Object.freeze(results.slice())
  });

  window.addEventListener("load", () => {
    try {
      run();
    } catch (error) {
      add("test-runner-failure", false, error?.message || "unknown");
    }
  }, { once: true });
})();
