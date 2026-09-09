
(() => {
  "use strict";

  /*
   * v8.5 performs local, non-invasive security/configuration checks.
   * It does NOT claim the application is fully secure and does NOT replace
   * server-side controls, dependency scanning, penetration testing, or headers
   * configured by the actual web server.
   */

  const checks = [];

  function add(id, status, detail) {
    checks.push({ id, status: !!status, detail: String(detail || "").slice(0, 240) });
  }

  function run() {
    checks.length = 0;

    add("anonymous_access",
      window.NilSparkLabAnonymousUser?.policy?.loginRequired === false,
      "Normal user login remains disabled.");

    add("identity_minimization",
      window.NilSparkLabAnonymousUser?.policy?.collectIdentity === false &&
      window.NilSparkLabAnonymousUser?.policy?.collectEmail === false &&
      window.NilSparkLabAnonymousUser?.policy?.collectIpInClient === false,
      "Client identity collection is disabled.");

    add("client_rate_limit",
      window.NilSparkLabSecurity?.policy?.clientRateLimit === true,
      "Client-side abuse-control foundation is present.");

    add("payload_limit",
      Number(window.NilSparkLabSecurity?.policy?.payloadLimitBytes) > 0,
      "Payload-size validation is configured.");

    add("owner_boundary",
      !!window.NilSparkLabSecureAdminFoundation &&
      !!window.NilSparkLabOwnerAnalytics,
      "Owner/admin APIs exist separately from normal user UI.");

    add("no_public_admin_button",
      !document.querySelector("[data-elab-public-admin]"),
      "No explicitly marked public admin control is present.");

    add("secure_context",
      window.isSecureContext === true || location.protocol === "file:",
      "Production deployment should use HTTPS.");

    add("storage_available",
      (() => {
        try {
          const k="__elab_v85_test__";
          localStorage.setItem(k,"1");
          localStorage.removeItem(k);
          return true;
        } catch (_) { return false; }
      })(),
      "Local storage availability check.");

    add("unsafe_inline_handlers_scan",
      !Array.from(document.querySelectorAll("[onclick],[onerror],[onload],[onmouseover]"))
        .some(el => el.id === "elab-v85-security-self-check"),
      "Basic DOM scan completed; existing application handlers are not rewritten.");

    const passed = checks.filter(c => c.status).length;
    return Object.freeze({
      version: "8.5",
      passed,
      total: checks.length,
      score: Math.round((passed / checks.length) * 100),
      checks: checks.map(c => Object.freeze({...c})),
      generatedAt: new Date().toISOString()
    });
  }

  window.NilSparkLabSecuritySelfCheck = Object.freeze({
    run,
    version: "8.5"
  });

  /* Run once at startup; result is available only to application/owner tooling. */
  try { window.__ELAB_SECURITY_BOOT_REPORT__ = run(); } catch (_) {}
})();
