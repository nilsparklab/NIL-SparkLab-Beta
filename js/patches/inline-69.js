
/* NilSparkLab v5.62 FINAL — polarity/current-flow synchronization patch */
(function () {
  "use strict";

  window.NilSparkLabCurrentFlow = {
    mode: "conventional",
    polarity: 1,

    setMode: function (mode) {
      this.mode = String(mode || "conventional").toLowerCase();
      this.refresh();
    },

    setPolarity: function (sign) {
      this.polarity = Number(sign) < 0 ? -1 : 1;
      this.refresh();
    },

    getDirection: function () {
      var d = this.polarity;
      if (this.mode.indexOf("electron") !== -1) d *= -1;
      return d;
    },

    refresh: function () {
      var direction = this.getDirection();
      document.documentElement.dataset.currentDirection =
        direction > 0 ? "forward" : "reverse";

      document.querySelectorAll("[data-current-flow]").forEach(function (el) {
        el.classList.toggle("flow-reverse", direction < 0);
        el.classList.toggle("flow-forward", direction > 0);
        el.style.setProperty("--current-flow-direction",
          direction > 0 ? "1" : "-1");
      });

      window.dispatchEvent(new CustomEvent("nilsparklab:current-direction", {
        detail: { direction: direction, mode: this.mode, polarity: this.polarity }
      }));
    }
  };

  /* CSS-based reversal for existing flow animations. */
  var style = document.createElement("style");
  style.textContent = `
    [data-current-flow].flow-reverse {
      animation-direction: reverse !important;
    }
    [data-current-flow].flow-forward {
      animation-direction: normal !important;
    }
    [data-current-flow] {
      --current-flow-direction: 1;
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("DOMContentLoaded", function () {
    window.NilSparkLabCurrentFlow.refresh();
  });
})();
