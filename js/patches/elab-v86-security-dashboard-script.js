
(() => {
  "use strict";
  const panel = document.getElementById("elab-v86-security-dashboard");
  const checksBox = document.getElementById("elab-v86-checks");

  function getReport() {
    return window.NilSparkLabSecuritySelfCheck?.run?.() ||
      window.__ELAB_SECURITY_BOOT_REPORT__ || null;
  }

  function getSecurityEventCount() {
    try {
      const raw = localStorage.getItem("elab_v83_anonymous_session_v1");
      const data = raw ? JSON.parse(raw) : null;
      return Array.isArray(data?.events)
        ? data.events.filter(e => e?.type === "security_event").length
        : 0;
    } catch (_) { return 0; }
  }

  function render() {
    const report = getReport();
    if (!report) return;

    document.getElementById("elab-v86-score").textContent = report.score + "%";
    document.getElementById("elab-v86-passed").textContent =
      report.passed + "/" + report.total;
    document.getElementById("elab-v86-failed").textContent =
      (report.total - report.passed);
    document.getElementById("elab-v86-events").textContent =
      getSecurityEventCount();

    checksBox.textContent = "";
    report.checks.forEach(c => {
      const row = document.createElement("div");
      row.className = "elab-v86-check";
      const title = document.createElement("strong");
      title.textContent = (c.status ? "PASS • " : "CHECK • ") + c.id;
      const detail = document.createElement("div");
      detail.textContent = c.detail;
      detail.style.opacity = ".7";
      row.append(title, detail);
      checksBox.appendChild(row);
    });
  }

  function open() {
    /*
     * This method is intentionally not wired to a public button.
     * Production owner authentication must gate access server-side.
     */
    panel.classList.add("open");
    panel.setAttribute("aria-hidden","false");
    render();
  }

  function close() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden","true");
  }

  document.getElementById("elab-v86-run")?.addEventListener("click", render);
  document.getElementById("elab-v86-close")?.addEventListener("click", close);

  document.getElementById("elab-v86-export")?.addEventListener("click", () => {
    const report = getReport();
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nilsparklab-security-report-" + new Date().toISOString().slice(0,10) + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  window.NilSparkLabOwnerSecurityDashboard = Object.freeze({ open, close, render });
})();
