
(() => {
  "use strict";

  const VERSION = "8.0";
  const MAX_EVENTS = 1000;
  const sessions = new Map();
  const ownerCapability = Symbol("nilsparklab-owner-analytics");
  let ownerMode = false;

  const now = () => Date.now();

  const sanitize = (value, max = 120) =>
    String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);

  const record = (type, data = {}) => {
    const event = {
      id: `${now()}-${Math.random().toString(36).slice(2, 9)}`,
      time: now(),
      type: sanitize(type, 60),
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [sanitize(k, 50), sanitize(v)])
      )
    };

    let session = sessions.get("local");
    if (!session) {
      session = {
        firstSeen: event.time,
        lastSeen: event.time,
        events: [],
        actions: Object.create(null)
      };
      sessions.set("local", session);
    }

    session.lastSeen = event.time;
    session.events.push(event);
    if (session.events.length > MAX_EVENTS) session.events.shift();
    session.actions[event.type] = (session.actions[event.type] || 0) + 1;
  };

  /* Anonymous/local analytics only.
     No names, emails, passwords, tokens, IPs, or message contents are collected here.
     No network request is made by this layer. */
  record("session_started");

  window.addEventListener("nilsparklab:analytics-event", (e) => {
    const d = e?.detail;
    if (!d) return;
    record(d.type || "user_action", d.data || {});
  });

  const enableOwnerMode = (capability) => {
    if (capability !== ownerCapability) {
      record("owner_access_denied");
      return false;
    }
    ownerMode = true;
    return true;
  };

  const getOwnerAnalytics = (capability) => {
    if (capability !== ownerCapability || !ownerMode) {
      record("analytics_access_denied");
      return null;
    }

    const session = sessions.get("local");
    if (!session) return null;

    const counts = Object.freeze({...session.actions});
    return Object.freeze({
      version: VERSION,
      generatedAt: now(),
      uniqueLocalSessions: 1,
      sessions: Object.freeze([Object.freeze({
        id: "local",
        firstSeen: session.firstSeen,
        lastSeen: session.lastSeen,
        actionCounts: counts,
        eventCount: session.events.length,
        events: Object.freeze(session.events.slice())
      })])
    });
  };

  const getOwnerSummary = (capability) => {
    const report = getOwnerAnalytics(capability);
    if (!report) return null;

    const actionCounts = {};
    for (const s of report.sessions) {
      for (const [key, value] of Object.entries(s.actionCounts)) {
        actionCounts[key] = (actionCounts[key] || 0) + value;
      }
    }

    return Object.freeze({
      version: VERSION,
      generatedAt: report.generatedAt,
      uniqueSessions: report.uniqueLocalSessions,
      totalEvents: report.sessions.reduce((n, s) => n + s.eventCount, 0),
      actionCounts: Object.freeze(actionCounts)
    });
  };

  /* Owner capability is not exposed as a plain secret in the DOM.
     A future authenticated admin backend should replace this local capability
     before using real multi-user production analytics. */
  window.NilSparkLabOwnerAnalytics = Object.freeze({
    createOwnerCapability: () => ownerCapability,
    enable: enableOwnerMode,
    summary: getOwnerSummary,
    report: getOwnerAnalytics
  });

  record("owner_analytics_ready");
})();
