
/* NilSparkLab v5.62 — project save/load, autosave, import/export and
   simulation-state persistence */
(function () {
  "use strict";

  var KEY = "NilSparkLab_v5_61_project";
  var LEGACY_KEYS = ["NilSparkLab_v5_23_project", "NilSparkLab_v5_22_project"];
  var DEFAULT_NAME = "Untitled Circuit";

  function root() {
    return document.querySelector("[data-circuit-canvas]") ||
           document.querySelector("#circuit-builder") ||
           document.querySelector("main") || document.body;
  }

  function legacyProjectData() {
    for (var i = 0; i < LEGACY_KEYS.length; i++) {
      try {
        var raw = SafeStore.get(LEGACY_KEYS[i], null);
        if (raw) return raw;
      } catch (_) {}
    }
    return null;
  }

  function collect() {
    var r = root();
    var components = [];
    var wires = [];
    try { components = Array.isArray(builderCanvasComps) ? builderCanvasComps : []; } catch (_) {}
    try { wires = Array.isArray(builderWires) ? builderWires : []; } catch (_) {}
    return {
      version: window.NilSparkLabConfig?.projectFormat || "5.62",
      name: document.querySelector("[data-project-name]")?.value ||
            document.querySelector("[data-project-name]")?.textContent ||
            DEFAULT_NAME,
      html: r ? r.innerHTML : "",
      circuit: {
        components: JSON.parse(JSON.stringify(components)),
        wires: JSON.parse(JSON.stringify(wires))
      },
      simulation: {
        status: document.documentElement.dataset.circuitStatus || "normal",
        overcurrent: document.documentElement.dataset.overcurrent || "false",
        currentDirection: document.documentElement.dataset.currentDirection || "forward",
        homePolarity: typeof homePolarity !== "undefined" ? homePolarity : 1,
        homeFlowMode: typeof homeFlowMode !== "undefined" ? homeFlowMode : "conventional"
      },
      savedAt: new Date().toISOString()
    };
  }

  function save(name) {
    var data = collect();
    if (name) data.name = String(name);
    // Stage 6: persist a validated UCDM alongside the legacy circuit payload.
    // The legacy payload remains for backward compatibility while UCDM becomes
    // the canonical validated circuit representation for new saves.
    try {
      if (window.NILSparkLabUCDM && typeof window.NILSparkLabUCDM.fromBuilder === "function") {
        var ucdm = window.NILSparkLabUCDM.fromBuilder();
        ucdm.metadata = Object.assign({}, ucdm.metadata || {}, {
          name: data.name,
          savedAt: data.savedAt,
          projectVersion: data.version
        });
        var check = window.NILSparkLabUCDM.validate(ucdm);
        if (!check.valid) throw new Error(check.errors[0].message);
        data.ucdm = JSON.parse(window.NILSparkLabUCDM.serialize(ucdm));
      }
      SafeStore.set(KEY, JSON.stringify(data));
      document.documentElement.dataset.unsaved = "false";
      updateUI(data);
      return true;
    } catch (e) {
      console.warn("NilSparkLab save failed:", e);
      return false;
    }
  }

  function load(data) {
    if (!data) {
      try {
        data = JSON.parse(SafeStore.get(KEY, "null") || "null");
        if (!data) data = JSON.parse(legacyProjectData() || "null");
      } catch (e) { data = null; }
    }
    if (!data) return false;

    // Every project entering Builder state must pass the canonical validator first.
    try {
      var canonicalValidator = window.NilSparkLabSecurity && window.NilSparkLabSecurity.validateProject;
      if (typeof canonicalValidator !== "function") {
        console.warn("NilSparkLab: canonical project validator unavailable; load refused.");
        return false;
      }
      var validated = canonicalValidator(data);
      if (!validated || !validated.ok) {
        console.warn("NilSparkLab: project rejected by canonical validator.", validated && validated.error);
        return false;
      }
      data = validated.value;
    } catch (e) {
      console.warn("NilSparkLab: canonical project validation failed.", e);
      return false;
    }

    // Stage 6: prefer the validated UCDM payload when present. Legacy projects
    // continue through the existing validator/migration path unchanged.
    data = JSON.parse(JSON.stringify(data));
    if (data.ucdm && window.NILSparkLabUCDM && typeof window.NILSparkLabUCDM.deserialize === "function") {
      try {
        var canonical = window.NILSparkLabUCDM.deserialize(typeof data.ucdm === "string" ? data.ucdm : JSON.stringify(data.ucdm));
        if (typeof window.NILSparkLabUCDM.toLegacy === "function") {
          data.circuit = window.NILSparkLabUCDM.toLegacy(canonical);
        }
        if (canonical.metadata) {
          if (!data.name && canonical.metadata.name) data.name = canonical.metadata.name;
          if (!data.savedAt && canonical.metadata.savedAt) data.savedAt = canonical.metadata.savedAt;
        }
      } catch (e) {
        console.warn("NilSparkLab: UCDM project rejected; legacy payload fallback refused for malformed canonical data.", e);
        return false;
      }
    }
    if (!data.circuit) return false;
    if (!Array.isArray(data.circuit.components) || !Array.isArray(data.circuit.wires)) return false;
    data.version = window.NilSparkLabConfig?.projectFormat || "5.62";

    var r = root();
    if (!r) return false;

    // Restore the real circuit model first; HTML is only the visual shell.
    if (data.circuit && Array.isArray(data.circuit.components) && Array.isArray(data.circuit.wires)) {
      window.NilSparkLabBuilderState.replace(
        JSON.parse(JSON.stringify(data.circuit.components)),
        JSON.parse(JSON.stringify(data.circuit.wires))
      );
      if (typeof renderBuilderCanvas === "function") renderBuilderCanvas();
    } else {
      return false;
    }

    document.documentElement.dataset.circuitStatus =
      data.simulation?.status || "normal";
    document.documentElement.dataset.overcurrent =
      data.simulation?.overcurrent || "false";
    document.documentElement.dataset.currentDirection =
      data.simulation?.currentDirection || "forward";

    if (typeof data.simulation?.homePolarity === "number") homePolarity = data.simulation.homePolarity < 0 ? -1 : 1;
    if (data.simulation?.homeFlowMode) homeFlowMode = data.simulation.homeFlowMode === "electron" ? "electron" : "conventional";
    if (typeof updateHomeFlow === "function") updateHomeFlow();
    if (window.NilSparkLabCurrentFlow) {
      window.NilSparkLabCurrentFlow.setMode(homeFlowMode);
      window.NilSparkLabCurrentFlow.setPolarity(homePolarity);
    }

    document.documentElement.dataset.unsaved = "false";
    window.dispatchEvent(new CustomEvent("nilsparklab:project-loaded", { detail: data }));
    updateUI(data);
    return true;
  }

  function updateUI(data) {
    document.querySelectorAll("[data-project-name]").forEach(function (el) {
      if ("value" in el) el.value = data?.name || DEFAULT_NAME;
      else el.textContent = data?.name || DEFAULT_NAME;
    });
    document.querySelectorAll("[data-project-status]").forEach(function (el) {
      el.textContent = document.documentElement.dataset.unsaved === "true"
        ? "Unsaved changes" : "Saved";
    });
  }

  function markDirty() {
    document.documentElement.dataset.unsaved = "true";
    updateUI(collect());
  }

  function newProject() {
    var r = root();
    if (!r) return;
    try { window.NilSparkLabBuilderState.clear(); } catch (_) { return; }
    if (typeof renderBuilderCanvas === "function") renderBuilderCanvas();
    else r.innerHTML = "";
    if (typeof updateHomeFlow === "function") updateHomeFlow();
    document.documentElement.dataset.circuitStatus = "normal";
    document.documentElement.dataset.overcurrent = "false";
    document.documentElement.dataset.unsaved = "true";
    updateUI({name: DEFAULT_NAME});
    window.dispatchEvent(new CustomEvent("nilsparklab:new-project"));
  }

  function exportProject() {
    var data = collect();
    var blob = new Blob([JSON.stringify(data, null, 2)],
      {type: "application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (data.name || "NilSparkLab-Circuit")
      .replace(/[^\w\-]+/g, "_") + ".nilsparklab.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importProject(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var validator = window.NilSparkLabSecurity && window.NilSparkLabSecurity.validateProject;
        if (typeof validator !== "function") throw new Error("Canonical project validator unavailable");
        var checked = validator(data);
        if (!checked || !checked.ok) throw new Error(checked && checked.error || "Invalid project format");
        if (!load(checked.value)) throw new Error("Project load failed");
        save(checked.value.name);
      } catch (e) {
        NilSparkLabDialog.alert("Invalid NIL SparkLab project file.", {title:"Import Failed", alertdialog:true});
      }
    };
    reader.readAsText(file);
  }

  window.NilSparkLabProjectCore = {
    save: save,
    load: load,
    newProject: newProject,
    exportProject: exportProject,
    importProject: importProject,
    markDirty: markDirty,
    collect: collect
  };

  document.addEventListener("input", markDirty, true);
  document.addEventListener("change", markDirty, true);

  document.addEventListener("click", function (e) {
    var saveBtn = e.target.closest("[data-project-save]");
    var loadBtn = e.target.closest("[data-project-load]");
    var newBtn = e.target.closest("[data-project-new]");
    var exportBtn = e.target.closest("[data-project-export]");
    var importBtn = e.target.closest("[data-project-import]");

    if (saveBtn) {
      e.preventDefault();
      save();
    }
    if (loadBtn) {
      e.preventDefault();
      load();
    }
    if (newBtn) {
      e.preventDefault();
      if (document.documentElement.dataset.unsaved === "true") {
        NilSparkLabDialog.confirm("You have unsaved changes. Start a new project?", {title:"Start New Project?", okText:"START NEW", danger:true}).then(function(ok){ if(ok) newProject(); });
      } else newProject();
    }
    if (exportBtn) {
      e.preventDefault();
      exportProject();
    }
    if (importBtn) {
      e.preventDefault();
      var input = document.querySelector("input[type=file][data-project-file]");
      if (input) input.click();
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target.matches("input[type=file][data-project-file]"))
      importProject(e.target.files[0]);
  });

  /* Autosave every 15 seconds only after a real change. */
  var lastHash = "";
  setInterval(function () {
    if (document.documentElement.dataset.unsaved !== "true") return;
    var data = collect();
    var hash = "";
    try { hash = btoa(unescape(encodeURIComponent(JSON.stringify({name:data.name,circuit:data.circuit,simulation:data.simulation})))).slice(0, 200); }
    catch (e) { hash = data.html.length + ":" + data.html.slice(0, 40); }
    if (hash !== lastHash) {
      save(data.name);
      lastHash = hash;
    }
  }, 15000);

  window.addEventListener("beforeunload", function (e) {
    if (document.documentElement.dataset.unsaved === "true") {
      save();
      e.preventDefault();
      e.returnValue = "";
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    // FIX: guard against environments where localStorage is blocked/throws
    // (private browsing edge cases, sandboxed iframes) so this init block
    // doesn't crash and skip updateUI().
    var hasSaved = false;
    try { hasSaved = !!(SafeStore.get(KEY, null) || legacyProjectData()); } catch (e) { hasSaved = false; }
    document.documentElement.dataset.unsaved = hasSaved ? "false" : "true";
    updateUI();
  });
})();
