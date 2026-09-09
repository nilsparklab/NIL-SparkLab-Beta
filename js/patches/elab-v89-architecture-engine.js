
(() => {
"use strict";

const controls = [
  ["ARCH-01","Trust boundary","CLIENT UNTRUSTED","Browser state must never be treated as proof of owner/admin identity."],
  ["ARCH-02","Anonymous access","ENABLED","Normal circuit/lab usage can remain available without account login."],
  ["ARCH-03","Owner authorization","SERVER REQUIRED","Owner/admin actions require server-side authentication and authorization."],
  ["ARCH-04","API validation","SERVER REQUIRED","Validate type, length, range and allowed values on every server/API boundary."],
  ["ARCH-05","Rate limiting","SERVER REQUIRED","Apply per-IP/session/user/API limits with abuse-aware responses."],
  ["ARCH-06","Audit logging","SERVER REQUIRED","Record security-relevant events without storing unnecessary sensitive data."],
  ["ARCH-07","Secrets","SERVER ONLY","Never put production secrets, private keys or privileged tokens in frontend code."],
  ["ARCH-08","Output safety","SERVER + CLIENT","Encode/sanitize untrusted output before rendering into HTML or other interpreters."],
  ["ARCH-09","Dependency security","CI REQUIRED","Run dependency, secret and vulnerability scans before release."],
  ["ARCH-10","Failure handling","FAIL CLOSED","Security failures should deny privileged operations rather than silently bypassing controls."]
];

window.NilSparkLabSecurityArchitecture = Object.freeze({
  version:"8.9",
  controls:controls.map(x=>x[0]),
  run(){
    return {
      version:"8.9",
      timestamp:new Date().toISOString(),
      controls:controls.map(([id,name,state,detail])=>({id,name,state,detail}))
    };
  }
});
})();
