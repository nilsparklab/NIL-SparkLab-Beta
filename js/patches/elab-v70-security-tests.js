
(() => {
  "use strict";

  const VERSION = "7.0";
  const tests = [];
  const record = (name, passed, detail = "") =>
    tests.push(Object.freeze({ name, passed: !!passed, detail: String(detail) }));

  function run() {
    tests.length = 0;
    const api = window.NilSparkLabIOSecurity;
    const dom = window.NilSparkLabDOMSecurity;

    record("IO security API available", !!api);
    record("DOM security API available", !!dom);

    if (api) {
      try {
        record("Oversized input rejected",
          api.text("x".repeat(api.limits.text + 1)) === null);
      } catch (e) { record("Oversized input rejected", false, e.message); }

      try {
        record("Unsafe javascript URL rejected",
          api.url("javascript:alert(1)") === null);
      } catch (e) { record("Unsafe javascript URL rejected", false, e.message); }

      try {
        let blocked = false;
        try { api.validateData({ constructor: { polluted: true } }); }
        catch (_) { blocked = true; }
        record("Prototype-pollution key blocked", blocked);
      } catch (e) { record("Prototype-pollution key blocked", false, e.message); }

      try {
        const html = api.sanitizeHTML(
          '<div onclick="alert(1)">ok</div><script>alert(1)<\/script>'
        );
        record("Executable HTML sanitized",
          html !== null && !/<script\b/i.test(html) && !/\bonclick\s*=/i.test(html));
      } catch (e) { record("Executable HTML sanitized", false, e.message); }
    }

    if (dom) {
      try {
        record("Unsafe attribute boundary",
          dom.attribute("onclick", "alert(1)") === null);
      } catch (e) { record("Unsafe attribute boundary", false, e.message); }

      try {
        record("Unsafe URL attribute boundary",
          dom.attribute("href", "javascript:alert(1)") === null);
      } catch (e) { record("Unsafe URL attribute boundary", false, e.message); }
    }

    return Object.freeze({
      version: VERSION,
      passed: tests.filter(t => t.passed).length,
      failed: tests.filter(t => !t.passed).length,
      total: tests.length,
      tests: Object.freeze(tests.slice())
    });
  }

  window.NilSparkLabSecurityTests = Object.freeze({ version: VERSION, run,
    results: () => Object.freeze(tests.slice()) });

  window.dispatchEvent(new CustomEvent("nilsparklab:security-tests-ready",
    { detail: { version: VERSION } }));
})();
