
(() => {
  "use strict";
  const panel = document.getElementById("elab-v81-admin-panel");
  const eventsBox = document.getElementById("elab-v81-events");
  const capabilityFactory = window.NilSparkLabOwnerAnalytics?.createOwnerCapability;
  const capability = capabilityFactory ? capabilityFactory() : null;

  const safe = (v) => String(v ?? "").replace(/[<>&"'`]/g, c => ({
    "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;", "'":"&#39;", "`":"&#96;"
  }[c]));

  function openOwnerPanel() {
    if (!capability || !window.NilSparkLabOwnerAnalytics?.enable(capability)) return false;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    refresh();
    return true;
  }

  function closeOwnerPanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  function refresh() {
    const api = window.NilSparkLabOwnerAnalytics;
    const report = api?.report(capability);
    const summary = api?.summary(capability);
    if (!report || !summary) return;

    document.getElementById("elab-v81-sessions").textContent = summary.uniqueSessions;
    document.getElementById("elab-v81-events-count").textContent = summary.totalEvents;
    document.getElementById("elab-v81-actions-count").textContent =
      Object.values(summary.actionCounts).reduce((a,b) => a+b, 0);
    document.getElementById("elab-v81-security-count").textContent =
      Object.entries(summary.actionCounts)
        .filter(([k]) => /security|denied|blocked|violation|auth/i.test(k))
        .reduce((a,[,b]) => a+b, 0);

    const all = report.sessions.flatMap(s => s.events).slice(-100).reverse();
    eventsBox.innerHTML = all.length
      ? all.map(e => `<div class="elab-v81-event"><b>${safe(e.type)}</b> · ${new Date(e.time).toLocaleString()}</div>`).join("")
      : `<div class="elab-v81-event">No activity yet.</div>`;
  }

  function exportOwnerReport() {
    const report = window.NilSparkLabOwnerAnalytics?.report(capability);
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `nilsparklab-owner-analytics-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  document.getElementById("elab-v81-refresh")?.addEventListener("click", refresh);
  document.getElementById("elab-v81-export")?.addEventListener("click", exportOwnerReport);
  document.getElementById("elab-v81-close")?.addEventListener("click", closeOwnerPanel);

  /* Deliberately not exposed as a public button or user-facing menu item. */
  window.__ELAB_OWNER_ANALYTICS__ = Object.freeze({
    open: openOwnerPanel,
    close: closeOwnerPanel,
    refresh
  });
})();
