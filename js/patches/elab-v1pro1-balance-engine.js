
(() => {
"use strict";

/*
 * v1 PRO.1 keeps security as a release gate while shifting the next work
 * toward product features. It does not claim backend production security.
 */
const PLAN = Object.freeze({
  version:"1 PRO.1",
  securityStatus:"FOUNDATION_DEFINED_BACKEND_REQUIRED",
  featurePriority:[
    ["F-01","Assistant UX","NEXT","Make the assistant the main compact interaction layer on mobile."],
    ["F-02","Circuit intelligence","NEXT","Improve circuit-aware waveform/source/simulation behavior."],
    ["F-03","Learning mode","NEXT","Add guided explanations, hints and component learning."],
    ["F-04","Simulation quality","NEXT","Improve validation, error states and realistic simulation feedback."],
    ["F-05","Mobile UX","NEXT","Reduce screen clutter and keep controls touch-friendly."]
  ],
  securityMustFinish:[
    ["S-01","Real backend authentication","REQUIRED","Needed before calling Admin authentication production-ready."],
    ["S-02","RBAC + protected APIs","REQUIRED","Privileged actions must be server-authorized."],
    ["S-03","Rate limiting","REQUIRED","Protect authentication and privileged endpoints."],
    ["S-04","Audit logging","REQUIRED","Track security-relevant admin events safely."],
    ["S-05","Automated security tests","REQUIRED","Verify auth, authorization and regression behavior."]
  ]
});

window.NilSparkLabV1PRO1Plan = Object.freeze({
  version:"1 PRO.1",
  plan:PLAN,
  status(){
    return {
      version:"1 PRO.1",
      securityFoundation:true,
      productionSecurity:false,
      featureWorkRecommended:true,
      backendStillRequired:true
    };
  }
});
})();
