
/* NilSparkLab v5.62 — stability bridge: keep the visual canvas, model state and
   current-flow direction synchronized after project restore/new-project actions. */
(function () {
  "use strict";

  // Expose the builder's lexical state safely to legacy analyzer modules.
  // This removes the old split-brain state where `builderCanvasComps` and
  // `window.builderCanvasComps` could disagree.
  try {
    Object.defineProperty(window, "builderCanvasComps", {
      configurable: true,
      get: function () { return builderCanvasComps; },
      set: function (v) { builderCanvasComps = Array.isArray(v) ? v : []; }
    });
    Object.defineProperty(window, "builderWires", {
      configurable: true,
      get: function () { return builderWires; },
      set: function (v) { builderWires = Array.isArray(v) ? v : []; }
    });
  } catch (e) { console.warn("NilSparkLab state bridge:", e); }

  function sync() {
    try {
      if (typeof renderBuilderCanvas === "function") {
        renderBuilderCanvas();
      }
    } catch (e) { console.warn("NilSparkLab render sync:", e); }
    try {
      if (typeof updateHomeFlow === "function") updateHomeFlow();
      if (window.NilSparkLabCurrentFlow && typeof homePolarity !== "undefined" && typeof homeFlowMode !== "undefined") {
        window.NilSparkLabCurrentFlow.setMode(homeFlowMode);
        window.NilSparkLabCurrentFlow.setPolarity(homePolarity);
      }
    } catch (e) { console.warn("NilSparkLab flow sync:", e); }
  }
  window.addEventListener("nilsparklab:project-loaded", sync);
  window.addEventListener("nilsparklab:new-project", sync);
  window.addEventListener("nilsparklab:circuit-restored", sync);
  window.addEventListener("nilsparklab:current-direction", function (e) {
    document.documentElement.dataset.currentDirection = e.detail.direction > 0 ? "forward" : "reverse";
  });
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(sync, 0);
  });
})();
