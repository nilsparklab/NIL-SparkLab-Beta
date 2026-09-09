
/* NilSparkLab v5.62 FINAL — terminal snapping, connection validation,
   component rotation, meter helpers and circuit protection */
(function () {
  "use strict";

  window.NilSparkLabV520 = {
    snapDistance: 22,
    maxSafeCurrent: 10,

    snapPoint: function (x, y, terminals) {
      var best = null, bestD = this.snapDistance;
      (terminals || []).forEach(function (t) {
        var dx = x - Number(t.x), dy = y - Number(t.y);
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d <= bestD) { bestD = d; best = t; }
      });
      return best;
    },

    validateConnection: function (a, b) {
      if (!a || !b) return { valid: false, reason: "Missing terminal" };
      if (a.componentId && b.componentId && a.componentId === b.componentId)
        return { valid: false, reason: "Same-component connection" };
      if (a.id && b.id && a.id === b.id)
        return { valid: false, reason: "Same terminal connection" };
      return { valid: true, reason: "Valid connection" };
    },

    rotateComponent: function (el, degrees) {
      if (!el) return;
      var current = Number(el.dataset.rotation || 0);
      var next = (current + (Number(degrees) || 90)) % 360;
      if (next < 0) next += 360;
      el.dataset.rotation = String(next);
      el.style.transform = "rotate(" + next + "deg)";
      el.dispatchEvent(new CustomEvent("nilsparklab:component-rotated", {
        detail: { rotation: next }
      }));
    },

    meter: {
      voltage: function (voltage) {
        return { value: Number(voltage) || 0, unit: "V", mode: "parallel" };
      },
      current: function (current) {
        return { value: Number(current) || 0, unit: "A", mode: "series" };
      }
    },

    protect: function (current) {
      var i = Math.abs(Number(current) || 0);
      var tripped = i > this.maxSafeCurrent;
      document.documentElement.dataset.overcurrent = tripped ? "true" : "false";
      document.querySelectorAll("[data-circuit-protection]").forEach(function (el) {
        el.textContent = tripped ? "OVER CURRENT" : "PROTECTED";
      });
      return { tripped: tripped, current: i };
    }
  };

  var style = document.createElement("style");
  style.textContent = `
    [data-terminal].terminal-snap-target {
      outline: 2px solid currentColor;
      outline-offset: 3px;
      border-radius: 50%;
    }
    [data-connection-state="invalid"] {
      opacity: .72;
      filter: grayscale(.25);
    }
    [data-connection-state="valid"] {
      opacity: 1;
    }
    html[data-overcurrent="true"] [data-circuit-protection] {
      font-weight: 800;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("pointermove", function (e) {
    var terminals = Array.from(document.querySelectorAll("[data-terminal]"))
      .map(function (el) {
        var r = el.getBoundingClientRect();
        return { el: el, id: el.dataset.terminal, x: r.left + r.width/2,
                 y: r.top + r.height/2, componentId: el.dataset.componentId };
      });

    var target = window.NilSparkLabV520.snapPoint(e.clientX, e.clientY, terminals);
    terminals.forEach(function (t) {
      t.el.classList.toggle("terminal-snap-target", !!target && target.el === t.el);
    });
  }, { passive: true });

  document.addEventListener("dblclick", function (e) {
    var component = e.target.closest("[data-component]");
    if (component) window.NilSparkLabV520.rotateComponent(component, 90);
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-component]").forEach(function (el) {
      if (!el.dataset.rotation) el.dataset.rotation = "0";
    });
  });
})();
