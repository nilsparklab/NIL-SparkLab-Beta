
    // -------------------------------------------------------------
    // FIX #1: Crash-proof persistent storage.
    // Direct localStorage calls throw/behave unpredictably inside
    // sandboxed iframes (e.g. Claude artifacts) and in private-mode
    // browsing. This wrapper always falls back to an in-memory
    // object so the app never crashes, and still persists normally
    // in a regular browser tab.
    // -------------------------------------------------------------
    const SafeStore = (() => {
      const memory = {};
      let storageWorks = false;
      try {
        const testKey = '__nilsparklab_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        storageWorks = true;
      } catch (e) {
        storageWorks = false;
      }
      return {
        get(key, fallback) {
          if (storageWorks) {
            try {
              const v = window.localStorage.getItem(key);
              return v === null ? fallback : v;
            } catch (e) { /* fall through to memory */ }
          }
          return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
        },
        set(key, value) {
          memory[key] = value;
          if (storageWorks) {
            try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
          }
        }
      };
    })();

    // Sound Engine
    const SoundEngine = {
      ctx: null,
      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioContext();
        }
      },
      playClick() {
        try {
          this.init();
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
      },
      playBeep(freq = 2400, dur = 0.15) {
        try {
          this.init();
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + dur);
        } catch (e) {}
      },
      playSpark() {
        try {
          this.init();
          const bufferSize = this.ctx.sampleRate * 0.15;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
          noise.connect(gain);
          gain.connect(this.ctx.destination);
          noise.start();
        } catch (e) {}
      }
    };

    // Translations
    const translations = {
      en: {
        tagline: "Learn • Build • Simulate • Troubleshoot",
        navHome: "Home",
        navComponents: "Components",
        navStudy: "Study",
        navSymbols: "Symbols",
        navBuilder: "Circuit Builder",
        navIndustrial: "Industrial Lab",
        navProjects: "Projects",
        navFaults: "Fault Finder",
        navCalculators: "Calculators",
        navQuiz: "Quiz",
        navSafety: "Safety",
        progressLabel: "Progress:",
        heroBadge: "Virtual Engineering Lab",
        heroTitle1: "Learn Electrical & Electronics",
        heroTitle2: "By Interactive Simulation",
        heroDesc: "Explore a growing library of realistic components with standard symbols & wiring views. Trace live current flows, build custom circuits in the sandbox, simulate industrial motor starters, and troubleshoot faults.",
        btnStartBuilder: "Circuit Builder Sandbox",
        btnIndustrial: "Industrial Starters",
        btnTakeQuiz: "Take Lab Quiz",
        cardCompDesc: "3-View Inspector",
        cardSymTitle: "Symbol Library",
        cardSymDesc: "IEC & IEEE Schematics",
        cardBuildTitle: "Circuit Builder",
        cardBuildDesc: "Interactive Wires",
        cardIndTitle: "Industrial Lab",
        cardIndDesc: "DOL & Star-Delta",
        cardCalcTitle: "5 Calculators",
        cardCalcDesc: "Verified Physics Math",
        cardQuizTitle: "Scored Quizzes",
        liveCircuitHeading: "Live DC Series Circuit Simulation",
        liveCircuitSub: "Closed-Loop Current & Mathematical Telemetry Tracing",
        telemetryEmf: "Supply Voltage",
        telemetryCurrent: "Loop Current (I = V/R)",
        telemetryResPower: "Resistor Dissipation",
        telemetryTotPower: "Total Power (P=V×I)",
        compSub: "Search by name, terminals, category, or ratings",
        compClose: "CLOSE ✕",
        compReal: "1. Real Component",
        compSymbol: "2. Circuit Symbol",
        compWiring: "3. Terminal Wiring",
        compPrinciple: "Working Principle:",
        compPinout: "Terminal Pinout:",
        compRatings: "Ratings:",
        compMistakes: "Common Mistakes:",
        symHeading: "Schematic Circuit Symbols Library",
        symSub: "International standard IEC / IEEE schematic vector symbols",
        buildHeading: "Interactive Circuit Builder Sandbox",
        buildSub: "Tap and drag cards to position freely. Tap two green terminals to connect a wire.",
        btnRunSim: "Simulate Circuit",
        btnClear: "Clear Canvas",
        indHeading: "Industrial Electrical & Motor Control Lab",
        indSub: "Simulate industrial contactors, thermal overloads, and starter sequences",
        projHeading: "Practical Laboratory Projects",
        projSub: "Verified reference designs with interactive schematics and safety advice",
        faultHeading: "Find the Circuit Fault",
        faultSub: "Diagnose deliberate circuit errors and practice electrical troubleshooting",
        quizTitle: "Interactive Lab Knowledge Test",
        safeHeading: "Laboratory Safety Standards",
        safeSub: "Operating protocols for low-voltage experiments vs. mains isolation",
        safeBanner: "Safety Rule: NIL SparkLab simulations are strictly educational and operate under extra-low voltage (< 24V DC)."
      },
      hi: {
        tagline: "सीखें • बनाएं • सिमुलेट करें • गलती खोजें",
        navHome: "होम",
        navComponents: "कंपोनेंट्स",
        navStudy: "अध्ययन",
        navSymbols: "सर्किट Symbols",
        navBuilder: "सर्किट बिल्डर",
        navIndustrial: "इंडस्ट्रियल लैब",
        navProjects: "प्रोजेक्ट्स",
        navFaults: "फॉल्ट खोजें",
        navCalculators: "कैलकुलेटर",
        navQuiz: "प्रश्नोत्तरी (Quiz)",
        navSafety: "सुरक्षा",
        progressLabel: "प्रगति:",
        heroBadge: "वर्चुअल इंजीनियरिंग लैब",
        heroTitle1: "इलेक्ट्रिकल और इलेक्ट्रॉनिक्स सीखें",
        heroTitle2: "इंटरैक्टिव सिमुलेशन द्वारा",
        heroDesc: "कंपोनेंट्स एक्सप्लोर करें, सर्किट सिंबल समझें, करंट फ्लो को लाइव देखें, इंडस्ट्रियल स्टार्टर चलाएं और प्रैक्टिकल प्रोजेक्ट्स बनाएं।",
        btnStartBuilder: "सर्किट बिल्डर सैंडबॉक्स",
        btnIndustrial: "इंडस्ट्रियल स्टार्टर्स",
        btnTakeQuiz: "क्विज शुरू करें",
        cardCompDesc: "3-व्यू इंस्पेक्टर",
        cardSymTitle: "सिंबल लाइब्रेरी",
        cardSymDesc: "IEC/IEEE स्कीमेटिक्स",
        cardBuildTitle: "सर्किट बिल्डर",
        cardBuildDesc: "इंटरैक्टिव वायर कनेक्शन",
        cardIndTitle: "इंडस्ट्रियल लैब",
        cardIndDesc: "DOL एवं स्टार-डेल्टा",
        cardCalcTitle: "5 कैलकुलेटर",
        cardCalcDesc: "भौतिकी सूत्र गणना",
        cardQuizTitle: "प्रश्नोत्तरी टेस्ट",
        liveCircuitHeading: "लाइव DC सीरीज सर्किट सिमुलेशन",
        liveCircuitSub: "करंट फ्लो और लाइव टेलीमेट्री",
        telemetryEmf: "सप्लाई वोल्टेज (V)",
        telemetryCurrent: "लूप करंट (I = V/R)",
        telemetryResPower: "प्रतिरोधक पावर खपत",
        telemetryTotPower: "कुल सर्किट पावर (P=V×I)",
        compSub: "नाम, टर्मिनल, श्रेणी या रेटिंग से खोजें",
        compClose: "बंद करें ✕",
        compReal: "1. वास्तविक कंपोनेंट",
        compSymbol: "2. सर्किट सिंबल",
        compWiring: "3. टर्मिनल वायरिंग",
        compPrinciple: "कार्य सिद्धांत:",
        compPinout: "टर्मिनल पिनआउट:",
        compRatings: "रेटिंग:",
        compMistakes: "सामान्य गलतियाँ:",
        symHeading: "सर्किट सिंबल लाइब्रेरी",
        symSub: "अंतर्राष्ट्रीय मानक IEC/IEEE स्कीमेटिक सिंबल्स",
        buildHeading: "इंटरैक्टिव सर्किट बिल्डर सैंडबॉक्स",
        buildSub: "कार्ड्स को छूकर कहीं भी खिसकाएं। वायर जोड़ने के लिए दो हरे टर्मिनल्स पर बारी-बारी टैप करें।",
        btnRunSim: "सिमुलेशन शुरू करें",
        btnClear: "कैनवास साफ करें",
        indHeading: "इंडस्ट्रियल इलेक्ट्रिकल एवं मोटर कंट्रोल लैब",
        indSub: "कांटेक्टर, थर्मल ओवरलोड और मोटर स्टार्टर सिमुलेशन",
        projHeading: "प्रैक्टिकल लैब प्रोजेक्ट्स",
        projSub: "सत्यापित स्कीमेटिक्स और सुरक्षा निर्देशों के साथ प्रैक्टिकल डिजाइन्स",
        faultHeading: "सर्किट में फॉल्ट खोजें",
        faultSub: "गलत सर्किट्स का विश्लेषण करें और समस्या निवारण सीखें",
        quizTitle: "इंटरैक्टिव लैब ज्ञान परीक्षा",
        safeHeading: "प्रयोगशाला सुरक्षा मानक",
        safeSub: "कम वोल्टेज प्रयोग बनाम मेन्स आइसोलेशन सुरक्षा नियम",
        safeBanner: "सुरक्षा नियम: NIL SparkLab के सभी सिमुलेशन केवल शैक्षणिक हैं और कम वोल्टेज (< 24V DC) पर काम करते हैं।"
      }
    };

    // FIX: use SafeStore instead of raw localStorage
    // Rebrand migration: fall back to the old pre-rename key so existing
    // visitors don't lose their saved language preference.
    let currentLang = SafeStore.get('nilsparklab_lang', null);
    if (currentLang === null) {
      currentLang = SafeStore.get('electrolab_lang', 'en');
      if (currentLang !== 'en') SafeStore.set('nilsparklab_lang', currentLang);
    }

    function setLanguage(lang) {
      currentLang = lang;
      SafeStore.set('nilsparklab_lang', lang);
      document.documentElement.setAttribute('lang', lang === 'hi' ? 'hi' : 'en');
      document.getElementById('lang-btn-text').innerText = lang === 'en' ? 'EN | हिंदी' : 'हिंदी | EN';

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
          el.innerText = translations[lang][key];
        }
      });

      // Component Directory is data-driven, so refresh cards and filters too.
      const compPillLabels = lang === 'hi'
        ? {All:`सभी (${componentsDatabase.length})`, Passive:"निष्क्रिय", Semiconductor:"सेमीकंडक्टर", "IC / Control":"IC / कंट्रोल", Switching:"स्विचिंग", Protection:"सुरक्षा", Power:"पावर", Loads:"लोड", Sensors:"सेंसर", Measurement:"मापन"}
        : {All:`All (${componentsDatabase.length})`, Passive:"Passive", Semiconductor:"Semiconductors", "IC / Control":"IC / Control", Switching:"Switching", Protection:"Protection", Power:"Power", Loads:"Loads", Sensors:"Sensors", Measurement:"Measurement"};
      Object.entries(compPillLabels).forEach(([key,label]) => {
        const el = document.getElementById(`pill-${key}`);
        if (el) el.innerText = label;
      });
      const searchBox = document.getElementById('comp-search');
      if (searchBox) searchBox.placeholder = lang === 'hi' ? 'कंपोनेंट खोजें...' : 'Search components...';

      if (typeof componentsDatabase !== 'undefined') {
        filterComponents();
      }
      // Dynamic labels that depend on live data length also need refreshing on language change
      refreshDynamicLabels();
      // Notify dynamic modules (such as Study Mode) to rerender in the selected language.
      try { window.dispatchEvent(new CustomEvent('nil:languagechange', { detail: { lang: lang } })); } catch (e) {}
    }

    function toggleLanguage() {
      setLanguage(currentLang === 'en' ? 'hi' : 'en');
    }

    // -------------------------------------------------------------
    // FIX #2: Component database expanded to cover every filter
    // category (previously "Switching", "Protection", "Loads",
    // "Sensors" and "Measurement" pills showed an empty grid because
    // no components existed in those categories).
    // -------------------------------------------------------------
    const componentsDatabase = [
      { id: 'resistor', name: 'Carbon Film Resistor', cat: 'Passive', principle: 'Impedes current and drops voltage via Joule dissipation.', terminals: 'T1, T2 (Non-polarized)', ratings: '1/4W, 10Ω - 10MΩ', mistakes: 'Exceeding wattage rating causing burnouts.', realVisual: '<div class="text-amber-400 font-mono font-bold">[ RESISTOR 470Ω ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold tracking-widest text-lg">──/\\/\\/\\──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">[ T1 ] ──── RESISTOR ──── [ T2 ]</div>' },
      { id: 'potentiometer', name: 'Potentiometer', cat: 'Passive', principle: 'Three-terminal resistor forming an adjustable voltage divider.', terminals: 'Pin 1 (High), Wiper, Pin 3 (Low)', ratings: '10kΩ, 0.5W', mistakes: 'Connecting supply directly across Wiper and Ground.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ ROTARY POT ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──/\\/\\/\\── (Wiper ➔)</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Pin 1 • Wiper • Pin 3</div>' },
      { id: 'capacitor', name: 'Ceramic Capacitor', cat: 'Passive', principle: 'Stores energy as an electric field between two plates; blocks DC, passes AC.', terminals: 'Lead 1, Lead 2 (Non-polarized)', ratings: '100nF, 50V', mistakes: 'Confusing with polarized electrolytic types on reversed DC rails.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DISC CAP 100nF ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──| |──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Lead 1 ──── Lead 2</div>' },
      { id: 'electrolytic_cap', name: 'Electrolytic Capacitor', cat: 'Passive', principle: 'Polarized high-capacitance capacitor for smoothing/filtering DC rails.', terminals: 'Anode (+), Cathode (-)', ratings: '470µF, 25V', mistakes: 'Reverse-biasing causes venting/explosion.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ ELECTRO CAP 470µF ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──| (+ ──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Anode (+) ──── Cathode (-)</div>' },
      { id: 'inductor', name: 'Inductor / Choke', cat: 'Passive', principle: 'Opposes change in current via a magnetic field stored in a coil winding.', terminals: 'T1, T2', ratings: '10mH, 1A', mistakes: 'Ignoring back-EMF spikes when current is suddenly interrupted.', realVisual: '<div class="text-amber-400 font-mono font-bold">[ TOROID COIL ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──००००──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">T1 ──── T2</div>' },
      { id: 'ldr', name: 'Light Dependent Resistor (LDR)', cat: 'Sensors', principle: 'Resistance drops under photon exposure (photoconductivity).', terminals: 'Lead 1, Lead 2', ratings: '5kΩ Light / 1MΩ Dark', mistakes: 'Using in high-current paths directly.', realVisual: '<div class="text-amber-400 font-mono font-bold">[ LDR PHOTO-CELL ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[ LDR ]── ⇘⇘</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Lead 1 • Lead 2</div>' },
      { id: 'thermistor', name: 'NTC Thermistor', cat: 'Sensors', principle: 'Resistance decreases as temperature increases (Negative Temperature Coefficient).', terminals: 'Lead 1, Lead 2', ratings: '10kΩ @ 25°C', mistakes: 'Assuming linear response — NTC curves are exponential.', realVisual: '<div class="text-rose-300 font-mono font-bold">[ NTC BEAD 10K ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──/\\/\\/\\── t°</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Lead 1 • Lead 2</div>' },
      { id: 'hall_sensor', name: 'Hall Effect Sensor', cat: 'Sensors', principle: 'Outputs a voltage proportional to a nearby magnetic field.', terminals: 'VCC, GND, OUT', ratings: '5V supply, digital/linear out', mistakes: 'Ignoring supply polarity or pull-up requirement on open-drain output.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ TO-92 HALL IC ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ HALL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC • GND • OUT</div>' },
      { id: 'led', name: 'Light Emitting Diode (LED)', cat: 'Semiconductor', principle: 'Emits photons via electroluminescence when forward biased.', terminals: 'Anode (+), Cathode (-)', ratings: '2.0V - 3.2V Vf, 20mA', mistakes: 'Connecting directly across power rail without series resistor.', realVisual: '<div class="text-rose-400 font-mono font-bold">[ RED LED BULB ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──|>|── ⇗⇗</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Anode (+) ──── Cathode (-)</div>' },
      { id: 'diode_1n4007', name: '1N4007 Rectifier Diode', cat: 'Semiconductor', principle: 'Conducts current in one direction only (forward bias), blocks reverse.', terminals: 'Anode (+), Cathode (-, banded end)', ratings: '1000V PIV, 1A', mistakes: 'Installing backwards, blocking the intended current path entirely.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ 1N4007 DIODE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──|>|──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Anode (+) ──── Cathode (-)</div>' },
      { id: 'bjt_npn', name: '2N2222 NPN Transistor', cat: 'Semiconductor', principle: 'Current-controlled switch. Base current controls Collector-Emitter current.', terminals: 'Collector (C), Base (B), Emitter (E)', ratings: '40V Vceo, 800mA Ic', mistakes: 'Connecting Base directly without base resistor.', realVisual: '<div class="text-slate-300 font-mono">[ TO-92 NPN ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──( C B E )──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Collector • Base • Emitter</div>' },
      { id: 'bjt_pnp', name: '2N2907 PNP Transistor', cat: 'Semiconductor', principle: 'Conducts when Base is pulled below Emitter voltage (opposite polarity to NPN).', terminals: 'Collector (C), Base (B), Emitter (E)', ratings: '60V Vceo, 600mA Ic', mistakes: 'Wiring as if it were an NPN — current direction is reversed.', realVisual: '<div class="text-slate-300 font-mono">[ TO-92 PNP ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──( E B C )──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Emitter • Base • Collector</div>' },
      { id: 'mosfet_n', name: 'N-Channel MOSFET (IRF540)', cat: 'Semiconductor', principle: 'Voltage-controlled switch; Gate voltage creates a conductive channel between Drain and Source.', terminals: 'Gate (G), Drain (D), Source (S)', ratings: '100V Vds, 33A Id', mistakes: 'Leaving Gate floating causes unpredictable switching.', realVisual: '<div class="text-slate-300 font-mono">[ TO-220 MOSFET ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[ G|D|S ]──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Gate • Drain • Source</div>' },
      { id: 'zener_diode', name: 'Zener Diode', cat: 'Semiconductor', principle: 'Maintains approximately constant reverse voltage in breakdown; useful for regulation and references.', terminals: 'Anode (+), Cathode (-, banded)', ratings: '5.1V, 1W', mistakes: 'Running in breakdown without current limiting.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ ZENER 5.1V ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──|<|── Z</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Anode (+) • Cathode (-)</div>' },
      { id: 'schottky_diode', name: 'Schottky Diode', cat: 'Semiconductor', principle: 'Low-forward-voltage diode with fast switching, common in power conversion.', terminals: 'Anode (+), Cathode (-)', ratings: '40V, 1A, ~0.3V Vf', mistakes: 'Ignoring reverse-voltage rating.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ SCHOTTKY ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──|>|──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Anode (+) • Cathode (-)</div>' },
      { id: 'p_mosfet', name: 'P-Channel MOSFET', cat: 'Semiconductor', principle: 'High-side voltage-controlled switch using a P-channel conduction path.', terminals: 'Gate (G), Drain (D), Source (S)', ratings: '-60V Vds, -12A Id', mistakes: 'Incorrect source-referenced gate drive.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ TO-220 P-MOSFET ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[ G|D|S ]──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Gate • Drain • Source</div>' },
      { id: 'scr', name: 'SCR / Thyristor', cat: 'Semiconductor', principle: 'Latching semiconductor switch triggered by a gate pulse.', terminals: 'Anode (A), Cathode (K), Gate (G)', ratings: '600V, 8A', mistakes: 'Expecting the gate to turn an SCR off like a transistor.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ SCR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──|>|── G</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">A • K • G</div>' },
      { id: 'triac', name: 'TRIAC', cat: 'Semiconductor', principle: 'Bidirectional thyristor for AC power control.', terminals: 'MT1, MT2, Gate', ratings: '600V, 8A RMS', mistakes: 'Using inductive loads without suitable protection.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ TRIAC ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──▷◁── G</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">MT1 • MT2 • Gate</div>' },
      { id: 'diac', name: 'DIAC', cat: 'Semiconductor', principle: 'Bidirectional trigger device that conducts after breakover voltage.', terminals: 'T1, T2', ratings: '32V breakover, 2A peak', mistakes: 'Treating it as a normal rectifier diode.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIAC ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──▷◁──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">T1 • T2</div>' },
      { id: 'ic_741', name: 'µA741 Op-Amp', cat: 'IC / Control', principle: 'Classic general-purpose operational amplifier for analog signal conditioning.', terminals: 'V+, V-, IN+, IN-, OUT', ratings: '±5V to ±18V', mistakes: 'Exceeding common-mode or supply limits.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIP-8 µA741 ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──▷──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">V+ • V- • IN+ • IN- • OUT</div>' },
      { id: 'reg_7805', name: '7805 Voltage Regulator', cat: 'IC / Control', principle: 'Three-terminal linear regulator providing regulated +5V output.', terminals: 'IN, GND, OUT', ratings: '7-35V input, 5V output', mistakes: 'Ignoring heat dissipation at large voltage drops.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ 7805 TO-220 ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">IN ─[7805]─ OUT</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">IN • GND • OUT</div>' },
      { id: 'thermistor_ptc', name: 'PTC Thermistor', cat: 'Sensors', principle: 'Resistance increases as temperature rises; useful for sensing and protection.', terminals: 'Lead 1, Lead 2', ratings: '100Ω @ 25°C', mistakes: 'Assuming a linear resistance-temperature curve.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ PTC ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──/\/\── t°</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Lead 1 • Lead 2</div>' },
      { id: 'push_button', name: 'Momentary Push Button', cat: 'Switching', principle: 'Momentary normally-open switch that closes while pressed.', terminals: 'NO1, NO2', ratings: '250V AC, 3A', mistakes: 'Ignoring contact bounce in sensitive digital circuits.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ PUSH BUTTON ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──o/ o──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">NO1 • NO2</div>' },
      { id: 'dpdt_switch', name: 'DPDT Switch', cat: 'Switching', principle: 'Double-pole double-throw switch for routing two circuits.', terminals: 'COM1, A1, B1, COM2, A2, B2', ratings: '250V AC, 3A', mistakes: 'Cross-wiring poles during motor reversing.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DPDT SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──╲ ╱──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">COM1 • A1 • B1 • COM2 • A2 • B2</div>' },
      { id: 'ac_source', name: 'AC Voltage Source', cat: 'Power', principle: 'Generates configurable sinusoidal AC voltage.', terminals: 'L, N', ratings: '230V RMS, 50Hz', mistakes: 'Confusing RMS voltage with peak voltage.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ AC SOURCE 230V ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──( ~ )──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">L • N</div>' },
      { id: 'lamp', name: 'Indicator Lamp', cat: 'Loads', principle: 'Electrical load that converts energy primarily into visible light.', terminals: 'L, N', ratings: '230V, 10W', mistakes: 'Applying voltage above the lamp rating.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ INDICATOR LAMP ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──(X)──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">L • N</div>' },
      { id: 'ir_sensor', name: 'IR Proximity Sensor', cat: 'Sensors', principle: 'Uses infrared emission and reflection to detect nearby objects.', terminals: 'VCC, GND, OUT', ratings: '5V supply, digital output', mistakes: 'Ignoring ambient light and reflective-surface effects.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ IR SENSOR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">⇢ IR ⇠</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC • GND • OUT</div>' },
      { id: 'thermocouple', name: 'Thermocouple Sensor', cat: 'Sensors', principle: 'Produces a small voltage related to temperature difference through the Seebeck effect.', terminals: 'T+, T-', ratings: 'Type-K, -200°C to 1260°C', mistakes: 'Ignoring cold-junction compensation.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ TYPE-K THERMOCOUPLE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──T──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">T+ • T-</div>' },
      { id: 'schmitt_trigger', name: 'Schmitt Trigger', cat: 'IC / Control', principle: 'Comparator with hysteresis that cleans slow or noisy digital transitions.', terminals: 'VCC, GND, IN, OUT', ratings: '5V logic', mistakes: 'Ignoring hysteresis when interpreting thresholds.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ SCHMITT TRIGGER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──▷≋──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC • GND • IN • OUT</div>' },
      { id: 'pt100', name: 'PT100 RTD', cat: 'Sensors', principle: 'Precision resistance temperature detector with predictable temperature response.', terminals: 'Lead 1, Lead 2', ratings: '100Ω @ 0°C', mistakes: 'Using long leads without considering lead resistance.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ PT100 RTD ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[ RTD ]──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Lead 1 • Lead 2</div>' },
      { id: 'reed_switch', name: 'Reed Switch', cat: 'Switching', principle: 'Magnetically actuated switch that opens or closes when a magnetic field is applied.', terminals: 'NO1, NO2', ratings: '100V, 0.5A', mistakes: 'Exceeding contact current or using it for high inrush loads.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ REED SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──o  o──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">NO1 • NO2</div>' },
      { id: 'op_amp', name: 'LM358 Op-Amp', cat: 'IC / Control', principle: 'High-gain differential amplifier used for comparison, amplification, and filtering.', terminals: 'V+, V-, IN+, IN-, OUT', ratings: 'Dual supply 3-32V', mistakes: 'Forgetting negative feedback, causing the output to rail/saturate.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIP-8 LM358 ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──▷──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">V+ • V- • IN+ • IN- • OUT</div>' },
      { id: 'timer_555', name: '555 Timer IC', cat: 'IC / Control', principle: 'Versatile timing IC used for astable oscillators and monostable pulse generation.', terminals: 'GND, TRIG, OUT, RESET, CTRL, THR, DIS, VCC', ratings: '4.5V - 16V supply', mistakes: 'Leaving RESET floating (must be tied high for normal operation).', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIP-8 555 TIMER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ 555 ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">8-pin DIP: GND-THR-DIS-etc.</div>' },
      { id: 'microcontroller', name: 'ATmega328P Microcontroller', cat: 'IC / Control', principle: 'Programmable digital logic core (as used in Arduino Uno) executing stored instructions.', terminals: 'VCC, GND, RESET, I/O Pins ×20', ratings: '5V, 16MHz', mistakes: 'Driving high-current loads directly from I/O pins without a driver stage.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIP-28 ATMEGA328P ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ MCU ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC • GND • RESET • I/O×20</div>' },
      { id: 'relay', name: 'SPDT Relay', cat: 'Switching', principle: 'Electromagnetic coil pulls an armature to mechanically switch a separate power circuit.', terminals: 'Coil +, Coil -, COM, NO, NC', ratings: '12V coil, 10A contacts', mistakes: 'Omitting a flyback diode across the coil, causing inductive voltage spikes.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ 12V SPDT RELAY ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ COIL ]⊸NO/NC</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Coil+ • Coil- • COM • NO • NC</div>' },
      { id: 'switch_spst', name: 'SPST Toggle Switch', cat: 'Switching', principle: 'Mechanically makes/breaks a single circuit path.', terminals: 'In, Out', ratings: '250V AC, 3A', mistakes: 'Switching the neutral instead of the live conductor on mains circuits.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ TOGGLE SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──o  o──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">In ──── Out</div>' },
      { id: 'contactor', name: '3-Phase Contactor', cat: 'Switching', principle: 'Heavy-duty electromagnetic switch for controlling motor/industrial loads.', terminals: 'Coil A1/A2, L1/L2/L3, T1/T2/T3', ratings: '230V coil, 9-32A contacts', mistakes: 'Undersizing contact rating for motor starting (inrush) current.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ 3-POLE CONTACTOR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ K1 ]≡≡≡</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">A1/A2 Coil • L1-L3 • T1-T3</div>' },
      { id: 'fuse', name: 'Glass Cartridge Fuse', cat: 'Protection', principle: 'A thin wire melts and opens the circuit once current exceeds its rating, protecting downstream components.', terminals: 'T1, T2', ratings: '5A, 250V, Fast-Blow', mistakes: 'Replacing with a higher-rated fuse than the wiring/load can safely handle.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ GLASS FUSE 5A ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[≈]──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">T1 ──── T2</div>' },
      { id: 'mcb', name: 'Miniature Circuit Breaker (MCB)', cat: 'Protection', principle: 'Resettable thermal-magnetic switch that trips on overload or short-circuit current.', terminals: 'Line In, Load Out', ratings: '16A, 230V, Type B/C', mistakes: 'Selecting the wrong trip curve (B/C/D) for the connected load type.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIN-RAIL MCB ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──/ ⚡ /──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Line In ──── Load Out</div>' },
      { id: 'olr', name: 'Thermal Overload Relay (OLR)', cat: 'Protection', principle: 'Bimetallic strips heat and bend under sustained overcurrent, tripping an auxiliary contact to de-energize the motor contactor.', terminals: 'L1/L2/L3 In, T1/T2/T3 Out, 95-96 Aux', ratings: '9-13A adjustable', mistakes: 'Setting the trip current far above the motor nameplate full-load amps.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ THERMAL OLR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ OLR ]≈≈≈</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">L1-L3 In • T1-T3 Out • 95/96</div>' },
      { id: 'mov_varistor', name: 'MOV Varistor', cat: 'Protection', principle: 'Resistance drops sharply above a threshold voltage, clamping transient voltage spikes to protect downstream circuitry.', terminals: 'Lead 1, Lead 2', ratings: '275V AC, clamps ~700V', mistakes: 'Leaving unprotected by a fuse — MOVs can fail short and overheat.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ MOV 275V ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[MOV]──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Lead 1 • Lead 2</div>' },
      { id: 'bat_9v', name: '9V Alkaline Battery (PP3)', cat: 'Power', principle: 'Chemical cell producing direct current potential.', terminals: 'Positive (+), Negative (-)', ratings: '9.0V DC, 500mAh', mistakes: 'Direct short-circuiting causing thermal damage.', realVisual: '<div class="text-slate-200 font-mono font-bold bg-slate-800 p-2 rounded">[ 9V PP3 BATTERY ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──[ + | - ]──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">(+) Positive • (-) Ground</div>' },
      { id: 'transformer', name: 'Step-Down Transformer', cat: 'Power', principle: 'Transfers AC energy between two coils via mutual induction, changing voltage by turns-ratio.', terminals: 'Primary L/N, Secondary +/-', ratings: '230V→12V, 50/60Hz', mistakes: 'Connecting mains-rated primary to the low-voltage secondary side.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ 230V-12V XFMR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">||)( ||</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Primary L/N • Secondary +/-</div>' },
      { id: 'bridge_rectifier', name: 'Bridge Rectifier', cat: 'Power', principle: 'Four diodes arranged to convert full-wave AC into pulsating DC.', terminals: 'AC~, AC~, DC+, DC-', ratings: '2A, 400V', mistakes: 'Swapping the AC and DC terminal pairs during wiring.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ BRIDGE RECTIFIER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ ⟷ ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">AC~ • AC~ • DC+ • DC-</div>' },
      { id: 'dc_motor', name: 'DC Motor', cat: 'Loads', principle: 'Converts electrical energy to rotational mechanical energy via the motor effect (F = BIL).', terminals: 'M+, M-', ratings: '12V, 200mA no-load', mistakes: 'Switching direction without allowing the motor to fully stop (mechanical/electrical stress).', realVisual: '<div class="text-slate-200 font-mono font-bold">[ 12V DC MOTOR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──( M )──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">M+ ──── M-</div>' },
      { id: 'buzzer', name: 'Piezo Buzzer', cat: 'Loads', principle: 'A piezoelectric ceramic disc vibrates under an applied AC or pulsed DC signal to produce sound.', terminals: 'Positive (+), Negative (-)', ratings: '5V, 85dB', mistakes: 'Driving continuously from a GPIO pin without a transistor for louder/active buzzers.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ PIEZO BUZZER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──( )))──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Positive (+) • Negative (-)</div>' },
      { id: 'incandescent_bulb', name: 'Incandescent Bulb', cat: 'Loads', principle: 'A tungsten filament resists current and glows white-hot, radiating light and heat.', terminals: 'Contact, Shell (Neutral)', ratings: '230V, 60W', mistakes: 'Touching the hot glass envelope immediately after switching off.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ 60W BULB ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">──(X)──</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Contact • Shell (Neutral)</div>' },
      { id: 'multimeter', name: 'Digital Multimeter', cat: 'Measurement', principle: 'Measures voltage, current, or resistance by switching internal shunt/divider networks based on selected mode.', terminals: 'VΩmA (Red probe), COM (Black probe)', ratings: 'Auto-range, CAT III 600V', mistakes: 'Leaving the meter on Amps mode while probing across a voltage source — creates a short circuit.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ DIGITAL DMM ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">( A/V )</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VΩmA (Red) • COM (Black)</div>' },
      { id: 'oscilloscope_probe', name: 'Oscilloscope Probe (1x/10x)', cat: 'Measurement', principle: 'Captures a voltage waveform over time and displays it against a calibrated grid.', terminals: 'Tip (Signal), Ground Clip', ratings: '10:1 attenuation, 300V CAT II', mistakes: 'Forgetting to compensate the probe, distorting square-wave measurements.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ SCOPE PROBE 10X ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">⤳ ⏚</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Tip (Signal) • Ground Clip</div>' },
      { id: 'clamp_meter', name: 'AC Clamp Meter', cat: 'Measurement', principle: 'Measures current non-invasively by sensing the magnetic field around a single conductor.', terminals: 'Jaw (clamps around one wire)', ratings: '0-600A AC', mistakes: 'Clamping around both conductors of a cable at once, causing fields to cancel to ~0A.', realVisual: '<div class="text-slate-200 font-mono font-bold">[ CLAMP METER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">( ⊂I⊃ )</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Jaw around single conductor</div>' }
,

      // ===== DIPLOMA PHASE A EXPANSION: 40 COMPONENTS =====
      { id: "dc_shunt_motor", name: "DC Shunt Motor", cat: "Loads", principle: "Field winding is connected in parallel with the armature, giving nearly constant speed under normal load changes.", terminals: "A1, A2, F1, F2", ratings: "Typical lab machine; ratings vary", mistakes: "Applying incorrect field/armature polarity or running without required field excitation.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DC SHUNT MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DC SHUNT MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">A1, A2, F1, F2</div>" },
      { id: "dc_series_motor", name: "DC Series Motor", cat: "Loads", principle: "Field winding is in series with the armature, producing very high starting torque.", terminals: "A1, A2, S1, S2", ratings: "Typical lab machine; ratings vary", mistakes: "Running a series motor with no mechanical load can cause dangerous overspeed.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DC SERIES MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DC SERIES MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">A1, A2, S1, S2</div>" },
      { id: "dc_compound_motor", name: "DC Compound Motor", cat: "Loads", principle: "Uses both shunt and series field windings to combine torque and speed regulation characteristics.", terminals: "A1, A2, F1, F2, S1, S2", ratings: "Typical lab machine; ratings vary", mistakes: "Incorrect cumulative/differential field connection changes motor behavior.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DC COMPOUND MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DC COMPOUND MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">A1, A2, F1, F2, S1, S2</div>" },
      { id: "dc_generator", name: "DC Generator", cat: "Loads", principle: "Converts mechanical energy into DC electrical energy using electromagnetic induction and a commutator.", terminals: "Armature, Field terminals", ratings: "Typical lab machine; ratings vary", mistakes: "Connecting output before correct excitation and speed are established.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DC GENERATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DC GENERATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Armature, Field terminals</div>" },
      { id: "single_phase_induction_motor", name: "Single-Phase Induction Motor", cat: "Loads", principle: "Creates a rotating magnetic effect using main and auxiliary windings with a starting method.", terminals: "Main winding, Auxiliary winding, Capacitor (if used)", ratings: "230 V AC; rating varies", mistakes: "Incorrect capacitor or winding connection can overheat the motor.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SINGLE-PHASE INDUCTION MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SINGLE-PHASE INDUCTION MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Main winding, Auxiliary winding, Capacitor (if used)</div>" },
      { id: "three_phase_induction_motor", name: "Three-Phase Induction Motor", cat: "Loads", principle: "A three-phase stator creates a rotating magnetic field that induces rotor current and torque.", terminals: "U/V/W or T1/T2/T3; frame earth", ratings: "230/400 V AC; rating varies", mistakes: "Wrong phase sequence reverses rotation; never bypass overload protection.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ THREE-PHASE INDUCTION MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ THREE-PHASE INDUCTION MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">U/V/W or T1/T2/T3; frame earth</div>" },
      { id: "synchronous_motor", name: "Synchronous Motor", cat: "Loads", principle: "Rotor locks to the rotating stator field and runs at synchronous speed when properly excited.", terminals: "Three-phase stator, field/excitation", ratings: "Lab ratings vary", mistakes: "Improper starting or excitation can cause pull-out and overheating.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SYNCHRONOUS MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SYNCHRONOUS MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Three-phase stator, field/excitation</div>" },
      { id: "alternator", name: "Alternator / Synchronous Generator", cat: "Loads", principle: "Converts mechanical shaft power into AC electrical power by electromagnetic induction.", terminals: "U/V/W output; field terminals", ratings: "Lab ratings vary", mistakes: "Incorrect excitation, speed or synchronization can damage equipment.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ ALTERNATOR / SYNCHRONOUS GENERATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ ALTERNATOR / SYNCHRONOUS GENERATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">U/V/W output; field terminals</div>" },
      { id: "universal_motor", name: "Universal Motor", cat: "Loads", principle: "Series-wound motor designed to operate from AC or DC supplies at high speed.", terminals: "Supply terminals; brush/field circuit", ratings: "230 V class; appliance dependent", mistakes: "Operating without proper load/control can cause excessive speed and brush wear.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ UNIVERSAL MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ UNIVERSAL MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply terminals; brush/field circuit</div>" },
      { id: "stepper_motor", name: "Stepper Motor", cat: "Loads", principle: "Moves in discrete angular steps as phase windings are energized in sequence.", terminals: "Phase A+/A-, B+/B- or coil terminals", ratings: "5–24 V common; driver dependent", mistakes: "Driving coils directly without a suitable current-limited driver.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ STEPPER MOTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ STEPPER MOTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Phase A+/A-, B+/B- or coil terminals</div>" },
      { id: "step_up_transformer", name: "Step-Up Transformer", cat: "Power", principle: "Raises AC voltage according to the turns ratio while transferring energy through mutual induction.", terminals: "Primary L/N; Secondary terminals", ratings: "Turns ratio and insulation dependent", mistakes: "Treating secondary voltage as safe without checking insulation and isolation.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ STEP-UP TRANSFORMER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ STEP-UP TRANSFORMER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary L/N; Secondary terminals</div>" },
      { id: "auto_transformer", name: "Auto Transformer", cat: "Power", principle: "Uses a single tapped winding to provide a variable or transformed AC voltage.", terminals: "Input, common, tap/output", ratings: "Lab/industrial ratings vary", mistakes: "It does not provide galvanic isolation from the supply.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ AUTO TRANSFORMER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ AUTO TRANSFORMER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Input, common, tap/output</div>" },
      { id: "isolation_transformer", name: "Isolation Transformer", cat: "Power", principle: "Transfers AC power magnetically while providing galvanic isolation between primary and secondary.", terminals: "Primary L/N; isolated secondary", ratings: "1:1 common; ratings vary", mistakes: "Assuming isolation removes all electrical hazards.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ ISOLATION TRANSFORMER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ ISOLATION TRANSFORMER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary L/N; isolated secondary</div>" },
      { id: "current_transformer_ct", name: "Current Transformer (CT)", cat: "Power", principle: "Produces a reduced secondary current proportional to primary current for metering and protection.", terminals: "Primary conductor/window; S1, S2", ratings: "Common secondary 1 A or 5 A", mistakes: "Never leave a CT secondary open while primary current is flowing.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ CURRENT TRANSFORMER (CT) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CURRENT TRANSFORMER (CT) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary conductor/window; S1, S2</div>" },
      { id: "potential_transformer_pt", name: "Potential Transformer (PT)", cat: "Power", principle: "Produces a reduced, isolated voltage proportional to system voltage for metering and protection.", terminals: "Primary; secondary terminals", ratings: "Ratio/insulation dependent", mistakes: "Applying a voltage above the rated primary insulation level.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ POTENTIAL TRANSFORMER (PT) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ POTENTIAL TRANSFORMER (PT) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary; secondary terminals</div>" },
      { id: "ammeter", name: "Ammeter", cat: "Measurement", principle: "Measures current and is connected in series with the circuit being measured.", terminals: "A/mA input, COM", ratings: "Range and burden voltage dependent", mistakes: "Connecting an ammeter directly across a voltage source.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ AMMETER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ AMMETER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">A/mA input, COM</div>" },
      { id: "voltmeter", name: "Voltmeter", cat: "Measurement", principle: "Measures potential difference and is connected in parallel across two points.", terminals: "V input, COM", ratings: "Range and input impedance dependent", mistakes: "Using an insufficient voltage range or wrong terminals.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ VOLTMETER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ VOLTMETER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">V input, COM</div>" },
      { id: "wattmeter", name: "Wattmeter", cat: "Measurement", principle: "Measures real electrical power using voltage and current sensing elements.", terminals: "Current coil, potential coil", ratings: "AC/DC model dependent", mistakes: "Incorrect current/potential coil wiring gives wrong readings or damage.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ WATTMETER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ WATTMETER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Current coil, potential coil</div>" },
      { id: "energy_meter", name: "Energy Meter", cat: "Measurement", principle: "Integrates electrical power over time to measure energy consumption, usually in kWh.", terminals: "Line, load, neutral or phase terminals", ratings: "Single/three-phase model dependent", mistakes: "Incorrect terminal sequence or bypass wiring.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ ENERGY METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ ENERGY METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line, load, neutral or phase terminals</div>" },
      { id: "megger", name: "Megger / Insulation Tester", cat: "Measurement", principle: "Applies a controlled high test voltage to measure insulation resistance.", terminals: "LINE, EARTH, GUARD", ratings: "250/500/1000 V test ranges vary", mistakes: "Testing energized circuits or sensitive electronics connected to the equipment.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ MEGGER / INSULATION TESTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ MEGGER / INSULATION TESTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">LINE, EARTH, GUARD</div>" },
      { id: "earth_tester", name: "Earth Resistance Tester", cat: "Measurement", principle: "Measures grounding electrode resistance using dedicated test electrodes or clamp methods.", terminals: "E, P, C terminals (method dependent)", ratings: "Range/method dependent", mistakes: "Testing with poor probe placement or parallel earth paths unaccounted for.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ EARTH RESISTANCE TESTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ EARTH RESISTANCE TESTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">E, P, C terminals (method dependent)</div>" },
      { id: "lcr_meter", name: "LCR Meter", cat: "Measurement", principle: "Measures inductance, capacitance and resistance using an AC test signal.", terminals: "HI/LO or Kelvin terminals", ratings: "Frequency/range dependent", mistakes: "Measuring in-circuit parts without isolating parallel paths.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ LCR METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ LCR METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">HI/LO or Kelvin terminals</div>" },
      { id: "power_factor_meter", name: "Power Factor Meter", cat: "Measurement", principle: "Measures the phase relationship between voltage and current and displays power factor.", terminals: "Voltage coil, current coil", ratings: "Single/three-phase model dependent", mistakes: "Using the wrong phase connection or range.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ POWER FACTOR METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ POWER FACTOR METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Voltage coil, current coil</div>" },
      { id: "mccb", name: "Moulded Case Circuit Breaker (MCCB)", cat: "Protection", principle: "Resettable breaker providing overload and short-circuit protection at higher current ratings than typical MCBs.", terminals: "Line terminals, load terminals", ratings: "Frame/trip rating dependent", mistakes: "Using an incorrectly sized breaker as a substitute for proper cable protection.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ MOULDED CASE CIRCUIT BREAKER (MCCB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ MOULDED CASE CIRCUIT BREAKER (MCCB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line terminals, load terminals</div>" },
      { id: "rccb", name: "Residual Current Circuit Breaker (RCCB)", cat: "Protection", principle: "Trips when imbalance between live conductors indicates earth-leakage current.", terminals: "Line/neutral in and out", ratings: "30 mA/100 mA/300 mA classes", mistakes: "Using RCCB alone for overload protection where an MCB/MCCB is required.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ RESIDUAL CURRENT CIRCUIT BREAKER (RCCB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ RESIDUAL CURRENT CIRCUIT BREAKER (RCCB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/neutral in and out</div>" },
      { id: "elcb", name: "Earth Leakage Circuit Breaker (ELCB)", cat: "Protection", principle: "Provides earth-leakage protection using the applicable sensing method for the device type.", terminals: "Model dependent", ratings: "Sensitivity/model dependent", mistakes: "Confusing older voltage-operated ELCB behavior with modern RCCB protection.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ EARTH LEAKAGE CIRCUIT BREAKER (ELCB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ EARTH LEAKAGE CIRCUIT BREAKER (ELCB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Model dependent</div>" },
      { id: "rcbo", name: "RCBO", cat: "Protection", principle: "Combines overcurrent/short-circuit protection with residual-current protection in one device.", terminals: "Line/neutral in and out", ratings: "Curve and leakage sensitivity dependent", mistakes: "Selecting incorrect trip curve or leakage sensitivity.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ RCBO ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ RCBO ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/neutral in and out</div>" },
      { id: "isolator", name: "Isolator / Disconnect Switch", cat: "Protection", principle: "Provides a visible or rated means of isolation; it is not necessarily intended to interrupt fault current.", terminals: "Line and load poles", ratings: "Voltage/current/pole dependent", mistakes: "Using a non-load-break isolator to interrupt heavy load current.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ ISOLATOR / DISCONNECT SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ ISOLATOR / DISCONNECT SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line and load poles</div>" },
      { id: "hrc_fuse", name: "HRC Fuse", cat: "Protection", principle: "High rupturing capacity fuse safely interrupts high fault currents within its rated breaking capacity.", terminals: "Terminal 1, Terminal 2", ratings: "Current/voltage/breaking capacity dependent", mistakes: "Replacing with an ordinary fuse without matching breaking capacity.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ HRC FUSE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ HRC FUSE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Terminal 1, Terminal 2</div>" },
      { id: "spd", name: "Surge Protection Device (SPD)", cat: "Protection", principle: "Limits transient overvoltage by diverting surge energy and clamping voltage.", terminals: "Line/neutral/earth as applicable", ratings: "Type 1/2/3 and voltage dependent", mistakes: "Installing without correct earthing, backup protection or lead routing.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SURGE PROTECTION DEVICE (SPD) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SURGE PROTECTION DEVICE (SPD) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/neutral/earth as applicable</div>" },
      { id: "phase_monitor_relay", name: "Phase Failure / Sequence Relay", cat: "Protection", principle: "Monitors phase loss, reversal and abnormal voltage conditions to protect three-phase loads.", terminals: "L1/L2/L3 supply; relay output", ratings: "System voltage dependent", mistakes: "Assuming it replaces overload protection.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PHASE FAILURE / SEQUENCE RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PHASE FAILURE / SEQUENCE RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">L1/L2/L3 supply; relay output</div>" },
      { id: "timer_relay", name: "Timer Relay", cat: "Switching", principle: "Changes contact state after a configured on-delay, off-delay or timing function.", terminals: "Supply A1/A2; COM/NO/NC", ratings: "24 V/110 V/230 V model dependent", mistakes: "Using the wrong timing mode or supply voltage.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ TIMER RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ TIMER RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply A1/A2; COM/NO/NC</div>" },
      { id: "star_delta_timer", name: "Star-Delta Timer", cat: "Switching", principle: "Sequences star and delta contactors with a transition delay for reduced-voltage motor starting.", terminals: "Supply; STAR/DELTA outputs", ratings: "Control voltage dependent", mistakes: "Insufficient interlocking or overlap between star and delta contactors.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ STAR-DELTA TIMER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ STAR-DELTA TIMER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply; STAR/DELTA outputs</div>" },
      { id: "auxiliary_contactor", name: "Auxiliary Contactor", cat: "Switching", principle: "Provides additional auxiliary contacts for control logic, interlocking and status circuits.", terminals: "Coil A1/A2; NO/NC contacts", ratings: "Contact/coil rating dependent", mistakes: "Using auxiliary contacts to switch loads above their contact rating.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ AUXILIARY CONTACTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ AUXILIARY CONTACTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Coil A1/A2; NO/NC contacts</div>" },
      { id: "control_relay", name: "Control Relay", cat: "Switching", principle: "Electromagnetically or electronically switches low-power control circuits using isolated contacts.", terminals: "Coil; COM/NO/NC contacts", ratings: "Coil/contact ratings dependent", mistakes: "Ignoring coil suppression and contact ratings.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ CONTROL RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CONTROL RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Coil; COM/NO/NC contacts</div>" },
      { id: "limit_switch", name: "Limit Switch", cat: "Switching", principle: "Mechanical actuator changes contacts when a machine reaches a defined position.", terminals: "COM, NO, NC", ratings: "Contact rating dependent", mistakes: "Using a damaged actuator or exceeding contact ratings.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ LIMIT SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ LIMIT SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">COM, NO, NC</div>" },
      { id: "variable_dc_supply", name: "Variable DC Power Supply", cat: "Power", principle: "Provides adjustable regulated DC voltage with current limiting for laboratory circuits.", terminals: "Positive, negative, optional sense/earth", ratings: "Typical 0–30 V; current limit model dependent", mistakes: "Exceeding component voltage/current ratings or bypassing current limit.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ VARIABLE DC POWER SUPPLY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ VARIABLE DC POWER SUPPLY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Positive, negative, optional sense/earth</div>" },
      { id: "ac_variac", name: "Variac / Variable AC Supply", cat: "Power", principle: "Provides adjustable AC output using a variable autotransformer; output is generally not isolated.", terminals: "Input, common, variable output", ratings: "Input/output rating dependent", mistakes: "Assuming the output is isolated from mains.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ VARIAC / VARIABLE AC SUPPLY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ VARIAC / VARIABLE AC SUPPLY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Input, common, variable output</div>" },
      { id: "ups", name: "UPS (Uninterruptible Power Supply)", cat: "Power", principle: "Provides temporary backup power and conditioning when the normal supply fails or is unstable.", terminals: "AC input, AC output, battery terminals (model dependent)", ratings: "VA/kVA and battery dependent", mistakes: "Overloading output or using damaged batteries.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ UPS (UNINTERRUPTIBLE POWER SUPPLY) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ UPS (UNINTERRUPTIBLE POWER SUPPLY) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">AC input, AC output, battery terminals (model dependent)</div>" },
      { id: "inverter", name: "DC-AC Inverter", cat: "Power", principle: "Converts DC electrical energy into AC using controlled switching and filtering.", terminals: "DC input +/−; AC output", ratings: "Voltage/VA rating dependent", mistakes: "Reversing DC polarity or exceeding surge/current limits.", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DC-AC INVERTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DC-AC INVERTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">DC input +/−; AC output</div>" },
      // ===== DIPLOMA PHASE B EXPANSION: 40 INDUSTRIAL COMPONENTS =====
      { id: "thermal_overload_relay", name: "Thermal Overload Relay", cat: "Protection", principle: "Trips motor control on sustained overload using thermal sensing.", terminals: "L1/L2/L3, T1/T2/T3, auxiliary contacts", ratings: "Class/rating dependent", mistakes: "Bypassing or setting above motor protection requirements", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ THERMAL OVERLOAD RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ THERMAL OVERLOAD RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">L1/L2/L3, T1/T2/T3, auxiliary contacts</div>" },
      { id: "motor_protection_circuit_breaker", name: "Motor Protection Circuit Breaker (MPCB)", cat: "Protection", principle: "Combines motor isolation and adjustable overload/short-circuit protection.", terminals: "Line/Load terminals, trip setting", ratings: "Motor-rated", mistakes: "Using an incorrect current adjustment", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ MOTOR PROTECTION CIRCUIT BREAKER (MPCB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ MOTOR PROTECTION CIRCUIT BREAKER (MPCB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/Load terminals, trip setting</div>" },
      { id: "acb", name: "Air Circuit Breaker (ACB)", cat: "Protection", principle: "Low-voltage high-current circuit breaker using air for interruption.", terminals: "Main line/load terminals, control terminals", ratings: "Frame dependent", mistakes: "Using without correct protection coordination", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ AIR CIRCUIT BREAKER (ACB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ AIR CIRCUIT BREAKER (ACB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Main line/load terminals, control terminals</div>" },
      { id: "vcb", name: "Vacuum Circuit Breaker (VCB)", cat: "Protection", principle: "Interrupts medium-voltage current in a vacuum interrupter.", terminals: "Primary terminals, control circuit", ratings: "MV rated", mistakes: "Treating as low-voltage plug-in equipment", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ VACUUM CIRCUIT BREAKER (VCB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ VACUUM CIRCUIT BREAKER (VCB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary terminals, control circuit</div>" },
      { id: "sf6_breaker", name: "SF6 Circuit Breaker", cat: "Protection", principle: "Uses insulating interrupting medium for high-voltage switching equipment.", terminals: "Primary and control terminals", ratings: "HV rated", mistakes: "Ignoring manufacturer safety and maintenance procedures", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SF6 CIRCUIT BREAKER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SF6 CIRCUIT BREAKER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary and control terminals</div>" },
      { id: "earth_leakage_relay", name: "Earth Leakage Relay", cat: "Protection", principle: "Monitors residual current through an external sensor and commands a trip.", terminals: "Sensor input, supply, relay output", ratings: "Sensitivity dependent", mistakes: "Using as a substitute for all overcurrent protection", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ EARTH LEAKAGE RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ EARTH LEAKAGE RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Sensor input, supply, relay output</div>" },
      { id: "under_voltage_relay", name: "Under-Voltage Relay", cat: "Protection", principle: "Operates when monitored voltage falls below a set threshold.", terminals: "Supply/monitor input, relay output", ratings: "Setting dependent", mistakes: "Choosing unsuitable threshold or delay", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ UNDER-VOLTAGE RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ UNDER-VOLTAGE RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply/monitor input, relay output</div>" },
      { id: "over_voltage_relay", name: "Over-Voltage Relay", cat: "Protection", principle: "Operates when monitored voltage exceeds a set threshold.", terminals: "Monitor input, relay output", ratings: "Setting dependent", mistakes: "Ignoring coordination with other protection", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ OVER-VOLTAGE RELAY ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ OVER-VOLTAGE RELAY ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Monitor input, relay output</div>" },
      { id: "bimetallic_thermostat", name: "Bimetallic Thermostat", cat: "Switching", principle: "Temperature changes bend a bimetal strip to operate contacts.", terminals: "COM/NO/NC or terminals", ratings: "Temperature range dependent", mistakes: "Exceeding contact rating", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ BIMETALLIC THERMOSTAT ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ BIMETALLIC THERMOSTAT ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">COM/NO/NC or terminals</div>" },
      { id: "push_button_no", name: "NO Push Button", cat: "Switching", principle: "Momentary normally-open control contact closes when pressed.", terminals: "COM/NO", ratings: "Control-circuit rated", mistakes: "Using for power switching beyond rating", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ NO PUSH BUTTON ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ NO PUSH BUTTON ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">COM/NO</div>" },
      { id: "push_button_nc", name: "NC Stop Push Button", cat: "Switching", principle: "Momentary normally-closed contact opens when pressed.", terminals: "COM/NC", ratings: "Control-circuit rated", mistakes: "Incorrect stop-chain wiring", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ NC STOP PUSH BUTTON ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ NC STOP PUSH BUTTON ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">COM/NC</div>" },
      { id: "emergency_stop", name: "Emergency Stop Push Button", cat: "Switching", principle: "Latching emergency stop opens a safety control circuit when actuated.", terminals: "NC safety contacts", ratings: "Safety-rated models available", mistakes: "Using as ordinary start/stop without reset procedure", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ EMERGENCY STOP PUSH BUTTON ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ EMERGENCY STOP PUSH BUTTON ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">NC safety contacts</div>" },
      { id: "selector_switch", name: "Selector Switch", cat: "Switching", principle: "Maintained multi-position switch selects operating modes.", terminals: "Common and position contacts", ratings: "Control-circuit rated", mistakes: "Ambiguous position labeling", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SELECTOR SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SELECTOR SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Common and position contacts</div>" },
      { id: "float_switch", name: "Float Level Switch", cat: "Sensors", principle: "Liquid level movement changes a contact or sensor output.", terminals: "COM/NO/NC or sensor leads", ratings: "Model dependent", mistakes: "Ignoring fluid compatibility", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ FLOAT LEVEL SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ FLOAT LEVEL SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">COM/NO/NC or sensor leads</div>" },
      { id: "pressure_switch", name: "Pressure Switch", cat: "Sensors", principle: "Pressure threshold operates an electrical contact.", terminals: "Pressure port, COM/NO/NC", ratings: "Pressure range dependent", mistakes: "Exceeding pressure rating", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PRESSURE SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PRESSURE SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Pressure port, COM/NO/NC</div>" },
      { id: "proximity_inductive", name: "Inductive Proximity Sensor", cat: "Sensors", principle: "Detects nearby metal using an electromagnetic field.", terminals: "Brown +V, Blue 0V, Black output", ratings: "DC sensor common", mistakes: "Wrong wiring or sensing distance assumptions", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ INDUCTIVE PROXIMITY SENSOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ INDUCTIVE PROXIMITY SENSOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Brown +V, Blue 0V, Black output</div>" },
      { id: "photoelectric_sensor", name: "Photoelectric Sensor", cat: "Sensors", principle: "Uses emitted/detected light to detect objects.", terminals: "Supply and output leads", ratings: "Model dependent", mistakes: "Ignoring alignment and ambient light", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PHOTOELECTRIC SENSOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PHOTOELECTRIC SENSOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply and output leads</div>" },
      { id: "magnetic_reed_switch", name: "Reed Switch", cat: "Sensors", principle: "Magnetic field closes or opens sealed reed contacts.", terminals: "Two contact leads", ratings: "Low-power switching", mistakes: "Switching excessive current", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ REED SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ REED SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Two contact leads</div>" },
      { id: "encoder", name: "Rotary Encoder", cat: "Sensors", principle: "Produces position or speed pulses from shaft rotation.", terminals: "Supply, A/B/Z outputs", ratings: "Model dependent", mistakes: "Poor shielding or missed pulses", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ ROTARY ENCODER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ ROTARY ENCODER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply, A/B/Z outputs</div>" },
      { id: "temperature_sensor_pt100", name: "PT100 RTD Sensor", cat: "Sensors", principle: "Platinum resistance changes predictably with temperature.", terminals: "2/3/4 wire terminals", ratings: "IEC curve dependent", mistakes: "Using wrong lead compensation", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PT100 RTD SENSOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PT100 RTD SENSOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">2/3/4 wire terminals</div>" },
      { id: "terminal_block", name: "Terminal Block", cat: "Switching", principle: "Provides organized, removable electrical conductor termination.", terminals: "Clamp terminals", ratings: "Voltage/current dependent", mistakes: "Loose torque causing heating", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ TERMINAL BLOCK ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ TERMINAL BLOCK ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Clamp terminals</div>" },
      { id: "busbar", name: "Busbar", cat: "Power", principle: "Conductive bar distributes high current within panels or switchgear.", terminals: "Bolted connection points", ratings: "Current/temperature rated", mistakes: "Insufficient spacing or enclosure protection", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ BUSBAR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ BUSBAR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Bolted connection points</div>" },
      { id: "cable_lug", name: "Cable Lug", cat: "Switching", principle: "Crimped termination connects a cable to a stud or terminal.", terminals: "Cable barrel, stud hole", ratings: "Cable-size dependent", mistakes: "Poor crimping or wrong lug size", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ CABLE LUG ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CABLE LUG ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Cable barrel, stud hole</div>" },
      { id: "cable_gland", name: "Cable Gland", cat: "Switching", principle: "Secures cable entry and can provide strain relief and sealing.", terminals: "Cable entry hardware", ratings: "Size/IP dependent", mistakes: "Incorrect tightening or sealing", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ CABLE GLAND ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CABLE GLAND ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Cable entry hardware</div>" },
      { id: "changeover_switch", name: "Changeover Switch", cat: "Switching", principle: "Selects between two power sources with defined transfer positions.", terminals: "Source 1, Source 2, Load", ratings: "Pole/current rated", mistakes: "Paralleling sources unintentionally", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ CHANGEOVER SWITCH ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CHANGEOVER SWITCH ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Source 1, Source 2, Load</div>" },
      { id: "star_delta_starter", name: "Star-Delta Starter", cat: "Switching", principle: "Reduced-voltage motor starter transitions from star to delta connection.", terminals: "Main/star/delta/control terminals", ratings: "Motor rated", mistakes: "Missing electrical/mechanical interlock", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ STAR-DELTA STARTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ STAR-DELTA STARTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Main/star/delta/control terminals</div>" },
      { id: "dol_starter", name: "DOL Starter", cat: "Switching", principle: "Direct-on-line starter applies full line voltage through contactor and overload protection.", terminals: "Line/load/control terminals", ratings: "Motor rated", mistakes: "Using where starting current is unacceptable", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DOL STARTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DOL STARTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/load/control terminals</div>" },
      { id: "soft_starter", name: "Soft Starter", cat: "Power", principle: "Controls motor voltage during starting to limit current and mechanical stress.", terminals: "Line/load/control terminals", ratings: "Motor/kW rated", mistakes: "Bypassing setup or protection requirements", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SOFT STARTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SOFT STARTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/load/control terminals</div>" },
      { id: "variable_frequency_drive", name: "Variable Frequency Drive (VFD)", cat: "Power", principle: "Controls AC motor speed by synthesizing variable-frequency output.", terminals: "L1/L2/L3 input, U/V/W output, PE", ratings: "Drive rated", mistakes: "Switching output wiring while energized", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ VARIABLE FREQUENCY DRIVE (VFD) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ VARIABLE FREQUENCY DRIVE (VFD) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">L1/L2/L3 input, U/V/W output, PE</div>" },
      { id: "control_transformer", name: "Control Transformer", cat: "Power", principle: "Provides a suitable isolated control voltage for industrial control circuits.", terminals: "Primary, secondary", ratings: "VA/voltage rated", mistakes: "Incorrect fuse or secondary grounding practice", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ CONTROL TRANSFORMER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CONTROL TRANSFORMER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Primary, secondary</div>" },
      { id: "distribution_board", name: "Distribution Board (DB)", cat: "Protection", principle: "Enclosure distributes circuits with protective devices and neutral/earth bars.", terminals: "Incoming, outgoing, N/PE bars", ratings: "System rated", mistakes: "Unsafe live work or poor circuit identification", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ DISTRIBUTION BOARD (DB) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DISTRIBUTION BOARD (DB) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Incoming, outgoing, N/PE bars</div>" },
      { id: "main_switch", name: "Main Switch / Isolator", cat: "Protection", principle: "Provides main isolation for a board or installation.", terminals: "Incoming/outgoing poles", ratings: "System rated", mistakes: "Assuming every isolator interrupts fault current", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ MAIN SWITCH / ISOLATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ MAIN SWITCH / ISOLATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Incoming/outgoing poles</div>" },
      { id: "earth_electrode", name: "Earth Electrode", cat: "Protection", principle: "Provides a connection to the earthing system and soil electrode network.", terminals: "Earth conductor connection", ratings: "Site dependent", mistakes: "Ignoring measured earth resistance and bonding", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ EARTH ELECTRODE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ EARTH ELECTRODE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Earth conductor connection</div>" },
      { id: "single_phase_energy_meter", name: "Single-Phase Energy Meter", cat: "Measurement", principle: "Measures single-phase electrical energy consumption in kWh.", terminals: "Line in/out, Neutral in/out", ratings: "Voltage/current rated", mistakes: "Incorrect terminal sequence", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ SINGLE-PHASE ENERGY METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SINGLE-PHASE ENERGY METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line in/out, Neutral in/out</div>" },
      { id: "three_phase_energy_meter", name: "Three-Phase Energy Meter", cat: "Measurement", principle: "Measures energy in three-phase systems using phase voltage/current inputs.", terminals: "L1/L2/L3/N and current paths", ratings: "System rated", mistakes: "Wrong phase association", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ THREE-PHASE ENERGY METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ THREE-PHASE ENERGY METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">L1/L2/L3/N and current paths</div>" },
      { id: "frequency_meter", name: "Frequency Meter", cat: "Measurement", principle: "Measures AC system frequency.", terminals: "Voltage input terminals", ratings: "45–65 Hz typical", mistakes: "Connecting outside input range", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ FREQUENCY METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ FREQUENCY METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Voltage input terminals</div>" },
      { id: "phase_sequence_meter", name: "Phase Sequence Meter", cat: "Measurement", principle: "Indicates three-phase phase order for safe machine connection.", terminals: "L1/L2/L3", ratings: "System rated", mistakes: "Testing on unknown damaged circuits", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PHASE SEQUENCE METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PHASE SEQUENCE METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">L1/L2/L3</div>" },
      { id: "tachometer", name: "Tachometer", cat: "Measurement", principle: "Measures rotational speed of a shaft or rotating target.", terminals: "Optical/contact sensor interface", ratings: "RPM range dependent", mistakes: "Unsafe contact with rotating machinery", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ TACHOMETER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ TACHOMETER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Optical/contact sensor interface</div>" },
      { id: "panel_meter", name: "Panel Digital Meter", cat: "Measurement", principle: "Displays configured electrical quantity on a panel.", terminals: "Supply and sensing terminals", ratings: "Model dependent", mistakes: "Incorrect scaling or CT/PT ratio", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PANEL DIGITAL METER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PANEL DIGITAL METER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply and sensing terminals</div>" },
      { id: "pilot_lamp", name: "Pilot Lamp / Indicator", cat: "Loads", principle: "Provides visual indication of circuit or machine status.", terminals: "Lamp terminals", ratings: "Voltage rated", mistakes: "Using wrong lamp voltage", realVisual: "<div class=\"text-cyan-300 font-mono font-bold\">[ PILOT LAMP / INDICATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PILOT LAMP / INDICATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Lamp terminals</div>" },
      // ===== DIPLOMA PHASE C: POWER ELECTRONICS + ADVANCED ELECTRICAL (35) =====
            { id: "half_wave_rectifier", name: "Half-Wave Rectifier", cat: "Power", principle: "Uses one diode to pass one half-cycle of AC and produce pulsating DC.", terminals: "AC input, DC output, return", ratings: "Educational/lab circuit", mistakes: "Expecting smooth DC without filtering", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ HALF-WAVE RECTIFIER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ HALF-WAVE RECTIFIER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">AC input, DC output, return</div>" },
            { id: "full_wave_rectifier", name: "Center-Tapped Full-Wave Rectifier", cat: "Power", principle: "Uses two diodes and a center-tapped transformer to rectify both AC half-cycles.", terminals: "AC ends, center tap, DC output", ratings: "Transformer dependent", mistakes: "Incorrect center-tap wiring", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ CENTER-TAPPED FULL-WAVE RECTIFIER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CENTER-TAPPED FULL-WAVE RECTIFIER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">AC ends, center tap, DC output</div>" },
            { id: "rectifier_filter_cap", name: "Rectifier Filter Capacitor", cat: "Passive", principle: "Stores charge between peaks to reduce ripple after rectification.", terminals: "Positive, Negative", ratings: "High ripple-current capacitor", mistakes: "Ignoring voltage and ripple-current ratings", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ RECTIFIER FILTER CAPACITOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ RECTIFIER FILTER CAPACITOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Positive, Negative</div>" },
            { id: "linear_regulator_7805", name: "7805 Linear Voltage Regulator", cat: "IC / Control", principle: "Provides regulated 5 V DC from a higher DC input within its operating limits.", terminals: "IN, GND, OUT", ratings: "5 V output; TO-220/TO-92 variants", mistakes: "Overheating due to excessive input voltage/current", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ 7805 LINEAR VOLTAGE REGULATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ 7805 LINEAR VOLTAGE REGULATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">IN, GND, OUT</div>" },
            { id: "linear_regulator_7812", name: "7812 Linear Voltage Regulator", cat: "IC / Control", principle: "Provides regulated 12 V DC from a suitable higher DC input.", terminals: "IN, GND, OUT", ratings: "12 V output; variant dependent", mistakes: "Using input too close to dropout voltage", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ 7812 LINEAR VOLTAGE REGULATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ 7812 LINEAR VOLTAGE REGULATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">IN, GND, OUT</div>" },
            { id: "adjustable_regulator_lm317", name: "LM317 Adjustable Regulator", cat: "IC / Control", principle: "Adjustable linear regulator using a resistor network to set output voltage.", terminals: "IN, OUT, ADJ", ratings: "Up to ~1.5 A with heatsinking", mistakes: "Wrong resistor network or inadequate heatsinking", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ LM317 ADJUSTABLE REGULATOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ LM317 ADJUSTABLE REGULATOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">IN, OUT, ADJ</div>" },
            { id: "opto_coupler", name: "Optocoupler", cat: "IC / Control", principle: "Transfers a signal through light to provide galvanic isolation between circuits.", terminals: "LED input, transistor output", ratings: "Isolation rating model dependent", mistakes: "Ignoring output transistor configuration", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ OPTOCOUPLER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ OPTOCOUPLER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">LED input, transistor output</div>" },
            { id: "gate_driver", name: "MOSFET/IGBT Gate Driver", cat: "IC / Control", principle: "Provides controlled high-current gate drive for fast power-switch transitions.", terminals: "VCC, GND, IN, gate output", ratings: "Driver model dependent", mistakes: "Insufficient dead-time or poor grounding", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ MOSFET/IGBT GATE DRIVER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ MOSFET/IGBT GATE DRIVER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">VCC, GND, IN, gate output</div>" },
            { id: "pwm_controller", name: "PWM Controller IC", cat: "IC / Control", principle: "Generates pulse-width-modulated control signals for switched-mode power circuits.", terminals: "VCC, GND, timing/control pins", ratings: "IC dependent", mistakes: "Poor compensation or incorrect timing network", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ PWM CONTROLLER IC ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ PWM CONTROLLER IC ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">VCC, GND, timing/control pins</div>" },
            { id: "buck_boost_converter", name: "Buck-Boost Converter", cat: "Power", principle: "Can regulate output above or below input depending on topology and control.", terminals: "VIN+, VIN-, VOUT+, VOUT-", ratings: "Module dependent", mistakes: "Ignoring polarity/topology differences", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ BUCK-BOOST CONVERTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ BUCK-BOOST CONVERTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">VIN+, VIN-, VOUT+, VOUT-</div>" },
            { id: "isolated_dc_dc", name: "Isolated DC-DC Converter", cat: "Power", principle: "Transfers DC power through a high-frequency transformer to provide isolation and conversion.", terminals: "Input +/-, Output +/-", ratings: "Module dependent", mistakes: "Exceeding isolation or output ratings", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ ISOLATED DC-DC CONVERTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ ISOLATED DC-DC CONVERTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Input +/-, Output +/-</div>" },
            { id: "dc_chopper", name: "DC Chopper", cat: "Power", principle: "Controls average DC output by rapidly switching a semiconductor device.", terminals: "DC input, switched output, control", ratings: "Topology dependent", mistakes: "Ignoring freewheel path for inductive load", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ DC CHOPPER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ DC CHOPPER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">DC input, switched output, control</div>" },
            { id: "single_phase_inverter", name: "Single-Phase Inverter", cat: "Power", principle: "Converts DC to single-phase AC using controlled switching and filtering.", terminals: "DC input, AC output, earth as required", ratings: "Voltage/power rated", mistakes: "Unsafe live output handling or wrong load connection", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ SINGLE-PHASE INVERTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SINGLE-PHASE INVERTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">DC input, AC output, earth as required</div>" },
            { id: "three_phase_inverter", name: "Three-Phase Inverter", cat: "Power", principle: "Synthesizes three-phase AC from a DC link using controlled power switches.", terminals: "DC link, U/V/W output, control", ratings: "Drive rated", mistakes: "Incorrect motor/output wiring", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ THREE-PHASE INVERTER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ THREE-PHASE INVERTER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">DC link, U/V/W output, control</div>" },
            { id: "igbt_module", name: "IGBT Power Module", cat: "Semiconductor", principle: "High-power voltage-controlled switch commonly used in inverters and motor drives.", terminals: "Gate, emitter, collector / module terminals", ratings: "Module dependent", mistakes: "Poor gate drive or inadequate thermal management", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ IGBT POWER MODULE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ IGBT POWER MODULE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Gate, emitter, collector / module terminals</div>" },
            { id: "power_bjt", name: "Power BJT", cat: "Semiconductor", principle: "High-current bipolar transistor used for switching or amplification in legacy power circuits.", terminals: "Collector, Base, Emitter", ratings: "Device dependent", mistakes: "Insufficient base drive or thermal protection", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ POWER BJT ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ POWER BJT ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Collector, Base, Emitter</div>" },
            { id: "fast_recovery_diode", name: "Fast Recovery Diode", cat: "Semiconductor", principle: "Rectifier diode optimized for faster reverse recovery in switched power circuits.", terminals: "Anode, Cathode", ratings: "Device dependent", mistakes: "Using beyond reverse-voltage/current limits", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ FAST RECOVERY DIODE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ FAST RECOVERY DIODE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Anode, Cathode</div>" },
            { id: "freewheel_diode", name: "Freewheeling Diode", cat: "Semiconductor", principle: "Provides a safe current path for inductive load current when the switch turns off.", terminals: "Anode, Cathode across inductive load", ratings: "Load dependent", mistakes: "Installing with wrong polarity", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ FREEWHEELING DIODE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ FREEWHEELING DIODE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Anode, Cathode across inductive load</div>" },
            { id: "snubber_rc", name: "RC Snubber Network", cat: "Passive", principle: "Resistor-capacitor network reduces switching transients and dv/dt stress.", terminals: "Two network terminals", ratings: "Design dependent", mistakes: "Using arbitrary values without transient analysis", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ RC SNUBBER NETWORK ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ RC SNUBBER NETWORK ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Two network terminals</div>" },
            { id: "snubber_diode", name: "Flyback Suppression Diode", cat: "Semiconductor", principle: "Suppresses inductive voltage spikes by providing a recirculation path.", terminals: "Anode, Cathode", ratings: "Coil/load dependent", mistakes: "Using a slow diode in unsuitable high-frequency circuits", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ FLYBACK SUPPRESSION DIODE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ FLYBACK SUPPRESSION DIODE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Anode, Cathode</div>" },
            { id: "current_sensor_hall", name: "Hall Current Sensor Module", cat: "Measurement", principle: "Measures current through a conductor using magnetic-field sensing and isolation.", terminals: "IP+/IP-, VCC, GND, OUT", ratings: "Sensor dependent", mistakes: "Incorrect conductor path or offset calibration", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ HALL CURRENT SENSOR MODULE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ HALL CURRENT SENSOR MODULE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">IP+/IP-, VCC, GND, OUT</div>" },
            { id: "current_shunt", name: "Current Shunt Resistor", cat: "Measurement", principle: "Low-value precision resistor used to infer current from a measured voltage drop.", terminals: "Kelvin/current terminals", ratings: "mV drop at rated current", mistakes: "Excessive power dissipation or poor Kelvin sensing", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ CURRENT SHUNT RESISTOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ CURRENT SHUNT RESISTOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Kelvin/current terminals</div>" },
            { id: "ripple_meter", name: "Ripple Voltage Measurement", cat: "Measurement", principle: "Measurement setup for checking residual AC ripple on a DC supply.", terminals: "Probe +, reference/ground", ratings: "Instrument dependent", mistakes: "Using wrong coupling/range", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ RIPPLE VOLTAGE MEASUREMENT ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ RIPPLE VOLTAGE MEASUREMENT ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Probe +, reference/ground</div>" },
            { id: "power_factor_correction_cap", name: "Power Factor Correction Capacitor", cat: "Power", principle: "Supplies reactive power to improve inductive-load power factor in AC systems.", terminals: "Capacitor terminals", ratings: "AC kVAr/voltage rated", mistakes: "Using without discharge/safety arrangements", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ POWER FACTOR CORRECTION CAPACITOR ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ POWER FACTOR CORRECTION CAPACITOR ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Capacitor terminals</div>" },
            { id: "solar_charge_controller", name: "Solar Charge Controller", cat: "Power", principle: "Regulates battery charging from a PV source and protects against unsuitable charging conditions.", terminals: "PV input, battery, load", ratings: "PWM/MPPT model dependent", mistakes: "Wrong battery chemistry or polarity", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ SOLAR CHARGE CONTROLLER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SOLAR CHARGE CONTROLLER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">PV input, battery, load</div>" },
            { id: "mppt_controller", name: "MPPT Controller", cat: "Power", principle: "Tracks PV operating point to extract available power efficiently while charging a battery system.", terminals: "PV input, battery output", ratings: "PV/battery rated", mistakes: "Exceeding PV voltage limits", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ MPPT CONTROLLER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ MPPT CONTROLLER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">PV input, battery output</div>" },
            { id: "battery_management_system", name: "Battery Management System (BMS)", cat: "Protection", principle: "Monitors and protects battery cells against unsafe voltage, current and temperature conditions.", terminals: "B-/B+, cell taps, P-/P+ model dependent", ratings: "Cell-count dependent", mistakes: "Wrong cell tap sequence can damage BMS", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ BATTERY MANAGEMENT SYSTEM (BMS) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ BATTERY MANAGEMENT SYSTEM (BMS) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">B-/B+, cell taps, P-/P+ model dependent</div>" },
            { id: "battery_charger", name: "Battery Charger", cat: "Power", principle: "Provides controlled charging voltage/current for a specified battery chemistry.", terminals: "AC/DC input, battery +/-, sense/control", ratings: "Chemistry dependent", mistakes: "Using charger with incompatible battery chemistry", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ BATTERY CHARGER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ BATTERY CHARGER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">AC/DC input, battery +/-, sense/control</div>" },
            { id: "smps_controller", name: "SMPS Controller", cat: "IC / Control", principle: "Controls a switched-mode power supply through high-frequency feedback and switching logic.", terminals: "Supply, gate/control, feedback pins", ratings: "IC/topology dependent", mistakes: "Unsafe mains-side debugging without isolation", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ SMPS CONTROLLER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SMPS CONTROLLER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Supply, gate/control, feedback pins</div>" },
            { id: "uninterruptible_power_supply", name: "Uninterruptible Power Supply (UPS)", cat: "Power", principle: "Provides temporary AC power from stored energy when the main supply fails.", terminals: "AC input, AC output, battery terminals", ratings: "VA/W rated", mistakes: "Overloading or using incorrect battery pack", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ UNINTERRUPTIBLE POWER SUPPLY (UPS) ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ UNINTERRUPTIBLE POWER SUPPLY (UPS) ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">AC input, AC output, battery terminals</div>" },
            { id: "surge_suppressor_rcd", name: "Surge Suppression Module", cat: "Protection", principle: "Clamps or absorbs transient overvoltage to protect sensitive power electronics.", terminals: "Line/load/earth depending on device", ratings: "Device dependent", mistakes: "Using incorrect voltage class or earthing", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ SURGE SUPPRESSION MODULE ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ SURGE SUPPRESSION MODULE ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Line/load/earth depending on device</div>" },
            { id: "power_electronics_trainer", name: "Power Electronics Trainer", cat: "Measurement", principle: "Educational laboratory unit for safely studying controlled rectifiers, choppers and inverters.", terminals: "Lab-specific terminals", ratings: "Trainer dependent", mistakes: "Making connections while energized", realVisual: "<div class=\"text-violet-300 font-mono font-bold\">[ POWER ELECTRONICS TRAINER ]</div>", symbolVisual: "<div class=\"text-cyan-400 font-bold text-lg\">[ POWER ELECTRONICS TRAINER ]</div>", wiringVisual: "<div class=\"text-slate-300 font-mono text-xs\">Lab-specific terminals</div>" },

      { id: 'solar_panel', name: 'Solar PV Panel', cat: 'Power', principle: 'Converts sunlight into DC electrical energy using photovoltaic cells.', terminals: 'Positive (+), Negative (-)', ratings: '12V nominal, 50W', mistakes: 'Reverse-polarity wiring or shading cells without proper protection.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ SOLAR PV PANEL ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ SOLAR_PANEL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Positive (+), Negative (-)</div>' },
      { id: 'solar_combiner', name: 'Solar Combiner Box', cat: 'Protection', principle: 'Combines multiple PV strings with fuses and surge protection.', terminals: 'PV Inputs, DC Output, PE', ratings: '1000V DC rated', mistakes: 'Mixing unequal strings without proper design.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ SOLAR COMBINER BOX ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ SOLAR_COMBINER ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">PV Inputs, DC Output, PE</div>' },
      { id: 'dc_isolator', name: 'DC Isolator Switch', cat: 'Protection', principle: 'Safely isolates DC circuits for maintenance.', terminals: 'DC+ In/Out, DC- In/Out', ratings: '1000V DC', mistakes: 'Using an AC-only isolator on high-voltage DC.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ DC ISOLATOR SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ DC_ISOLATOR ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">DC+ In/Out, DC- In/Out</div>' },
      { id: 'wind_generator', name: 'Wind Turbine Generator', cat: 'Power', principle: 'Converts wind mechanical energy into electrical energy.', terminals: 'AC/DC Output, Earth', ratings: 'Lab-scale / rated by model', mistakes: 'Operating without correct controller and braking protection.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ WIND TURBINE GENERATOR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ WIND_GENERATOR ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">AC/DC Output, Earth</div>' },
      { id: 'charge_controller', name: 'Solar Charge Controller', cat: 'IC / Control', principle: 'Regulates charging from PV source to battery.', terminals: 'PV IN, Battery, Load', ratings: '12/24V, PWM', mistakes: 'Wrong battery chemistry/profile setting.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ SOLAR CHARGE CONTROLLER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ CHARGE_CONTROLLER ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">PV IN, Battery, Load</div>' },
      { id: 'lithium_battery', name: 'Lithium Battery Pack', cat: 'Power', principle: 'Rechargeable battery pack with high energy density.', terminals: 'B+, B-, balance leads', ratings: 'Nominal 3.7V/cell', mistakes: 'Charging without compatible BMS and charger.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ LITHIUM BATTERY PACK ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ LITHIUM_BATTERY ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">B+, B-, balance leads</div>' },
      { id: 'lead_acid_battery', name: 'Lead Acid Battery', cat: 'Power', principle: 'Rechargeable electrochemical battery used in UPS and automotive systems.', terminals: 'Positive (+), Negative (-)', ratings: '12V common', mistakes: 'Short circuiting terminals or poor ventilation during charging.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ LEAD ACID BATTERY ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ LEAD_ACID_BATTERY ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Positive (+), Negative (-)</div>' },
      { id: 'battery_bms', name: 'Battery Management System (BMS)', cat: 'Protection', principle: 'Monitors battery cells and provides protection against unsafe voltage/current conditions.', terminals: 'B+, B-, P+, P-, Cell taps', ratings: 'According to pack voltage/current', mistakes: 'Incorrect cell tap sequence can damage the BMS.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ BATTERY MANAGEMENT SYSTEM (BMS) ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ BATTERY_BMS ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">B+, B-, P+, P-, Cell taps</div>' },
      { id: 'earthing_electrode', name: 'Earth Electrode', cat: 'Protection', principle: 'Provides a low-impedance connection between installation and earth.', terminals: 'Earth Conductor Connection', ratings: 'Depends on soil/system design', mistakes: 'Using undersized earth conductor or loose joints.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ EARTH ELECTRODE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ EARTHING_ELECTRODE ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Earth Conductor Connection</div>' },
      { id: 'earth_busbar', name: 'Earth Busbar', cat: 'Protection', principle: 'Common bonding point for protective earth conductors.', terminals: 'Multiple PE terminals', ratings: 'Panel rated', mistakes: 'Mixing neutral and PE incorrectly.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ EARTH BUSBAR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ EARTH_BUSBAR ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Multiple PE terminals</div>' },
      { id: 'neutral_busbar', name: 'Neutral Busbar', cat: 'Power', principle: 'Common termination point for neutral conductors in a distribution board.', terminals: 'Multiple Neutral terminals', ratings: 'Panel rated', mistakes: 'Using neutral bar as protective earth.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ NEUTRAL BUSBAR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ NEUTRAL_BUSBAR ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Multiple Neutral terminals</div>' },
      { id: 'sp_switch', name: 'Single Pole Switch', cat: 'Switching', principle: 'Controls one conductor in a circuit.', terminals: 'COM, OUT', ratings: '230V AC typical', mistakes: 'Switching neutral instead of phase where phase isolation is required.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ SINGLE POLE SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ SP_SWITCH ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">COM, OUT</div>' },
      { id: 'dp_switch', name: 'Double Pole Switch', cat: 'Switching', principle: 'Simultaneously isolates two conductors.', terminals: 'L IN/OUT, N IN/OUT', ratings: '230V AC typical', mistakes: 'Incorrect terminal pairing.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ DOUBLE POLE SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ DP_SWITCH ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">L IN/OUT, N IN/OUT</div>' },
      { id: 'two_way_switch', name: 'Two Way Switch', cat: 'Switching', principle: 'Allows a lamp circuit to be controlled from two locations.', terminals: 'COM, L1, L2', ratings: '230V AC typical', mistakes: 'Mixing common and traveller terminals.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ TWO WAY SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ TWO_WAY_SWITCH ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">COM, L1, L2</div>' },
      { id: 'intermediate_switch', name: 'Intermediate Switch', cat: 'Switching', principle: 'Used between two-way switches for control from three or more locations.', terminals: 'Four traveller terminals', ratings: '230V AC typical', mistakes: 'Incorrect crossover wiring.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ INTERMEDIATE SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ INTERMEDIATE_SWITCH ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Four traveller terminals</div>' },
      { id: 'bell_push', name: 'Bell Push Switch', cat: 'Switching', principle: 'Momentary normally-open push switch for signaling circuits.', terminals: 'COM, NO', ratings: 'Low-current control', mistakes: 'Using it as a continuous high-current switch.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ BELL PUSH SWITCH ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ BELL_PUSH ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">COM, NO</div>' },
      { id: 'ceiling_rose', name: 'Ceiling Rose', cat: 'Loads', principle: 'Provides a protected connection point for ceiling light/fan wiring.', terminals: 'L, N, Earth', ratings: '230V installation', mistakes: 'Loose connections or exposed conductors.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ CEILING ROSE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ CEILING_ROSE ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">L, N, Earth</div>' },
      { id: 'lamp_holder', name: 'Lamp Holder', cat: 'Loads', principle: 'Mechanical and electrical holder for a lamp.', terminals: 'Live, Neutral contacts', ratings: 'According to lamp type', mistakes: 'Touching live parts during replacement.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ LAMP HOLDER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ LAMP_HOLDER ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Live, Neutral contacts</div>' },
      { id: 'junction_box', name: 'Junction Box', cat: 'Power', principle: 'Encloses and protects cable joints and branch connections.', terminals: 'Cable entries / terminals', ratings: 'Installation rated', mistakes: 'Leaving joints exposed or overcrowding.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ JUNCTION BOX ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ JUNCTION_BOX ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Cable entries / terminals</div>' },
      { id: 'pvc_conduit', name: 'PVC Conduit', cat: 'Power', principle: 'Routes and mechanically protects electrical conductors.', terminals: 'Conduit path', ratings: 'Installation rated', mistakes: 'Overfilling conduit or using sharp bends.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ PVC CONDUIT ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ PVC_CONDUIT ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Conduit path</div>' },
      { id: 'cable_tray', name: 'Cable Tray', cat: 'Power', principle: 'Supports and routes groups of electrical cables.', terminals: 'Tray / bonding points', ratings: 'Load rated', mistakes: 'Ignoring bonding and fill limits.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ CABLE TRAY ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ CABLE_TRAY ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Tray / bonding points</div>' },
      { id: 'power_cable', name: 'PVC Insulated Power Cable', cat: 'Power', principle: 'Carries electrical power through insulated conductors.', terminals: 'Core conductors, PE where provided', ratings: 'Voltage/current by size', mistakes: 'Undersizing cable for load or installation method.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ PVC INSULATED POWER CABLE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER_CABLE ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Core conductors, PE where provided</div>' },
      { id: 'energy_meter_3ph', name: 'Three-Phase Energy Meter', cat: 'Measurement', principle: 'Measures electrical energy consumption in three-phase systems.', terminals: 'Voltage inputs, current inputs, neutral', ratings: '3-phase rated', mistakes: 'Incorrect CT ratio/programming.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ THREE-PHASE ENERGY METER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ ENERGY_METER_3PH ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Voltage inputs, current inputs, neutral</div>' },
      { id: 'power_quality_analyzer', name: 'Power Quality Analyzer', cat: 'Measurement', principle: 'Measures voltage, current, harmonics and power-quality parameters.', terminals: 'Voltage probes, current clamps', ratings: 'Instrument rated', mistakes: 'Connecting probes beyond rating.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ POWER QUALITY ANALYZER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER_QUALITY_ANALYZER ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Voltage probes, current clamps</div>' },
      { id: 'insulation_tester', name: 'Insulation Resistance Tester', cat: 'Measurement', principle: 'Applies a test voltage to measure insulation resistance.', terminals: 'Line, Earth terminals', ratings: '250/500/1000V test ranges', mistakes: 'Testing energized circuits or touching leads during test.', realVisual: '<div class="text-cyan-300 font-mono font-bold">[ INSULATION RESISTANCE TESTER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ INSULATION_TESTER ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Line, Earth terminals</div>' },
    ,
      { id: 'buck_converter', name: 'Buck Converter', cat: 'Power', principle: 'Steps down DC voltage efficiently using high-frequency switching.', terminals: 'VIN+, VIN-, VOUT+, VOUT-', ratings: '12/24V input, adjustable output', mistakes: 'Reversing input polarity or exceeding current rating.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ BUCK CONVERTER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VIN+, VIN-, VOUT+, VOUT-</div>' },
      { id: 'buck_boost_converter', name: 'Buck-Boost Converter', cat: 'Power', principle: 'Converts DC voltage to a regulated level that may be higher or lower than input.', terminals: 'VIN+, VIN-, VOUT+, VOUT-', ratings: 'Wide DC input, adjustable output', mistakes: 'Using without checking output polarity and load limits.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ BUCK-BOOST CONVERTER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VIN+, VIN-, VOUT+, VOUT-</div>' },
      { id: 'dc_chopper', name: 'DC Chopper', cat: 'Power', principle: 'Controls DC power by rapidly switching a semiconductor device.', terminals: 'DC IN+, DC IN-, LOAD+, LOAD-', ratings: 'Depends on trainer/module rating', mistakes: 'Ignoring freewheeling path with inductive loads.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ DC CHOPPER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">DC IN+, DC IN-, LOAD+, LOAD-</div>' },
      { id: 'igbt_module', name: 'IGBT Power Module', cat: 'Semiconductor', principle: 'High-power voltage-controlled switching module used in inverters and drives.', terminals: 'G, E, C / module terminals', ratings: 'Industrial high-voltage/current', mistakes: 'Poor gate drive or inadequate cooling.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ IGBT POWER MODULE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">G, E, C / module terminals</div>' },
      { id: 'gate_driver', name: 'Gate Driver Module', cat: 'IC / Control', principle: 'Provides controlled gate signals and isolation/drive capability for MOSFET or IGBT switching.', terminals: 'VCC, GND, IN, OUT', ratings: '5–15V typical drive supply', mistakes: 'Driving power switches directly without correct gate network.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ GATE DRIVER MODULE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC, GND, IN, OUT</div>' },
      { id: 'freewheeling_diode', name: 'Freewheeling Diode', cat: 'Semiconductor', principle: 'Provides a safe current path when an inductive load is switched off.', terminals: 'Anode, Cathode', ratings: 'Depends on load voltage/current', mistakes: 'Using a slow diode in high-frequency switching.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ FREEWHEELING DIODE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Anode, Cathode</div>' },
      { id: 'rc_snubber', name: 'RC Snubber Network', cat: 'Protection', principle: 'Limits voltage spikes and dv/dt across switching devices.', terminals: 'Across switch/device terminals', ratings: 'Application dependent', mistakes: 'Incorrect RC values causing overheating or poor suppression.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ RC SNUBBER NETWORK ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">Across switch/device terminals</div>' },
      { id: 'bridge_rectifier_module', name: 'Bridge Rectifier Module', cat: 'Power', principle: 'Converts AC to pulsating DC using four diodes in a bridge arrangement.', terminals: 'AC~, AC~, +, -', ratings: 'Module dependent', mistakes: 'Incorrect AC/DC terminal wiring.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ BRIDGE RECTIFIER MODULE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">AC~, AC~, +, -</div>' },
      { id: 'controlled_rectifier', name: 'Controlled Rectifier Module', cat: 'Power', principle: 'Uses SCR devices to control the average DC output from an AC source.', terminals: 'AC input, gate/control, DC output', ratings: 'Trainer dependent', mistakes: 'Gate/control wiring errors and unsafe mains handling.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ CONTROLLED RECTIFIER MODULE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">AC input, gate/control, DC output</div>' },
      { id: 'pwm_controller', name: 'PWM Controller', cat: 'IC / Control', principle: 'Generates pulse-width-modulated control signals for power conversion and motor control.', terminals: 'VCC, GND, PWM OUT, feedback pins', ratings: 'IC/module dependent', mistakes: 'Ignoring feedback and compensation requirements.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ PWM CONTROLLER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC, GND, PWM OUT, feedback pins</div>' },
      { id: 'isolated_dc_dc', name: 'Isolated DC-DC Converter', cat: 'Power', principle: 'Transfers DC power through a high-frequency transformer with galvanic isolation.', terminals: 'VIN+, VIN-, VOUT+, VOUT-', ratings: 'Module dependent', mistakes: 'Exceeding isolation/output ratings.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ ISOLATED DC-DC CONVERTER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VIN+, VIN-, VOUT+, VOUT-</div>' },
      { id: 'smps_controller', name: 'SMPS Controller IC', cat: 'IC / Control', principle: 'Controls switching frequency and feedback in switched-mode power supplies.', terminals: 'VCC, GND, gate/drive, feedback', ratings: 'IC dependent', mistakes: 'Unsafe troubleshooting on live high-voltage SMPS.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ SMPS CONTROLLER IC ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC, GND, gate/drive, feedback</div>' },
      { id: 'pfc_controller', name: 'PFC Controller', cat: 'IC / Control', principle: 'Controls power-factor-correction stages to improve input current waveform and efficiency.', terminals: 'VCC, GND, sense, drive', ratings: 'IC dependent', mistakes: 'Incorrect sensing network or mains safety practices.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ PFC CONTROLLER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC, GND, sense, drive</div>' },
      { id: 'current_shunt', name: 'Current Shunt Resistor', cat: 'Measurement', principle: 'Produces a small proportional voltage for accurate current measurement.', terminals: 'T1, T2 / sense points', ratings: 'Low resistance, rated current', mistakes: 'Using an undersized shunt that overheats.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ CURRENT SHUNT RESISTOR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">T1, T2 / sense points</div>' },
      { id: 'current_sensor_module', name: 'Hall Current Sensor Module', cat: 'Measurement', principle: 'Measures AC or DC current using magnetic sensing with electrical isolation.', terminals: 'VCC, GND, OUT, current path', ratings: 'Module dependent', mistakes: 'Exceeding current path rating.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ HALL CURRENT SENSOR MODULE ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">VCC, GND, OUT, current path</div>' },
      { id: 'grid_tie_inverter', name: 'Grid-Tie Inverter', cat: 'Power', principle: 'Synchronizes renewable DC power and feeds compatible AC power into an approved grid system.', terminals: 'DC IN, AC/grid terminals', ratings: 'System dependent', mistakes: 'Never connect without certified protection and approved installation.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ GRID-TIE INVERTER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">DC IN, AC/grid terminals</div>' },
      { id: 'hybrid_inverter', name: 'Hybrid Solar Inverter', cat: 'Power', principle: 'Manages solar, battery and AC sources for backup and energy use.', terminals: 'PV IN, Battery, AC IN/OUT', ratings: 'System dependent', mistakes: 'Incorrect battery/PV configuration or earthing.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ HYBRID SOLAR INVERTER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">PV IN, Battery, AC IN/OUT</div>' },
      { id: 'mppt_controller', name: 'MPPT Charge Controller', cat: 'Power', principle: 'Tracks the maximum power point of a solar array to charge batteries efficiently.', terminals: 'PV+, PV-, BAT+, BAT-', ratings: 'System dependent', mistakes: 'Wrong battery voltage profile or reversed polarity.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ MPPT CHARGE CONTROLLER ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">PV+, PV-, BAT+, BAT-</div>' },
      { id: 'solar_combiner_box', name: 'Solar Combiner Box', cat: 'Protection', principle: 'Combines PV strings with fusing, isolation and surge protection.', terminals: 'PV string inputs, combined output, earth', ratings: 'System dependent', mistakes: 'Unsafe DC isolation and incorrect fuse selection.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ SOLAR COMBINER BOX ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">PV string inputs, combined output, earth</div>' },
      { id: 'dc_solar_isolator', name: 'DC Solar Isolator', cat: 'Protection', principle: 'Provides safe manual isolation of photovoltaic DC circuits.', terminals: 'IN+, IN-, OUT+, OUT-', ratings: 'PV DC rated', mistakes: 'Using an AC-rated switch for high-voltage DC.', realVisual: '<div class="text-amber-300 font-mono font-bold">[ DC SOLAR ISOLATOR ]</div>', symbolVisual: '<div class="text-cyan-400 font-bold text-lg">[ POWER / CONTROL ]</div>', wiringVisual: '<div class="text-slate-300 font-mono text-xs">IN+, IN-, OUT+, OUT-</div>' }
    ];

    // v5.55 — Component Directory follows the selected website language.
    // English remains the source data; Hindi is a presentation layer so
    // component IDs, ratings and simulation logic stay unchanged.
    const componentHindi = {
      'solar_panel': { name: 'सोलर पीवी पैनल', principle: 'सोलर पीवी पैनल विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Positive (+), Negative (-)', ratings: '12V nominal, 50W', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'solar_combiner': { name: 'सोलर कॉम्बाइनर बॉक्स', principle: 'सोलर कॉम्बाइनर बॉक्स विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'PV Inputs, DC Output, PE', ratings: '1000V DC rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'dc_isolator': { name: 'डीसी आइसोलेटर स्विच', principle: 'डीसी आइसोलेटर स्विच विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'DC+ In/Out, DC- In/Out', ratings: '1000V DC', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'wind_generator': { name: 'विंड टर्बाइन जनरेटर', principle: 'विंड टर्बाइन जनरेटर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'AC/DC Output, Earth', ratings: 'Lab-scale / rated by model', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'charge_controller': { name: 'सोलर चार्ज कंट्रोलर', principle: 'सोलर चार्ज कंट्रोलर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'PV IN, Battery, Load', ratings: '12/24V, PWM', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'lithium_battery': { name: 'लिथियम बैटरी पैक', principle: 'लिथियम बैटरी पैक विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'B+, B-, balance leads', ratings: 'Nominal 3.7V/cell', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'lead_acid_battery': { name: 'लेड-एसिड बैटरी', principle: 'लेड-एसिड बैटरी विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Positive (+), Negative (-)', ratings: '12V common', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'battery_bms': { name: 'बैटरी मैनेजमेंट सिस्टम', principle: 'बैटरी मैनेजमेंट सिस्टम विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'B+, B-, P+, P-, Cell taps', ratings: 'According to pack voltage/current', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'earthing_electrode': { name: 'अर्थ इलेक्ट्रोड', principle: 'अर्थ इलेक्ट्रोड विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Earth Conductor Connection', ratings: 'Depends on soil/system design', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'earth_busbar': { name: 'अर्थ बसबार', principle: 'अर्थ बसबार विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Multiple PE terminals', ratings: 'Panel rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'neutral_busbar': { name: 'न्यूट्रल बसबार', principle: 'न्यूट्रल बसबार विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Multiple Neutral terminals', ratings: 'Panel rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'sp_switch': { name: 'सिंगल पोल स्विच', principle: 'सिंगल पोल स्विच विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'COM, OUT', ratings: '230V AC typical', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'dp_switch': { name: 'डबल पोल स्विच', principle: 'डबल पोल स्विच विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'L IN/OUT, N IN/OUT', ratings: '230V AC typical', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'two_way_switch': { name: 'टू-वे स्विच', principle: 'टू-वे स्विच विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'COM, L1, L2', ratings: '230V AC typical', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'intermediate_switch': { name: 'इंटरमीडिएट स्विच', principle: 'इंटरमीडिएट स्विच विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Four traveller terminals', ratings: '230V AC typical', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'bell_push': { name: 'बेल पुश स्विच', principle: 'बेल पुश स्विच विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'COM, NO', ratings: 'Low-current control', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'ceiling_rose': { name: 'सीलिंग रोज', principle: 'सीलिंग रोज विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'L, N, Earth', ratings: '230V installation', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'lamp_holder': { name: 'लैंप होल्डर', principle: 'लैंप होल्डर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Live, Neutral contacts', ratings: 'According to lamp type', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'junction_box': { name: 'जंक्शन बॉक्स', principle: 'जंक्शन बॉक्स विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Cable entries / terminals', ratings: 'Installation rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'pvc_conduit': { name: 'पीवीसी कंड्यूट', principle: 'पीवीसी कंड्यूट विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Conduit path', ratings: 'Installation rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'cable_tray': { name: 'केबल ट्रे', principle: 'केबल ट्रे विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Tray / bonding points', ratings: 'Load rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'power_cable': { name: 'पावर केबल', principle: 'पावर केबल विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Core conductors, PE where provided', ratings: 'Voltage/current by size', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'cable_gland': { name: 'केबल ग्लैंड', principle: 'केबल ग्लैंड विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Cable entry, enclosure thread', ratings: 'IP rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'cable_lug': { name: 'केबल लग', principle: 'केबल लग विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Conductor barrel, eye terminal', ratings: 'Current by cable size', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'energy_meter_3ph': { name: 'थ्री-फेज एनर्जी मीटर', principle: 'थ्री-फेज एनर्जी मीटर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Voltage inputs, current inputs, neutral', ratings: '3-phase rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'power_quality_analyzer': { name: 'पावर क्वालिटी एनालाइज़र', principle: 'पावर क्वालिटी एनालाइज़र विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Voltage probes, current clamps', ratings: 'Instrument rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'phase_sequence_meter': { name: 'फेज सीक्वेंस मीटर', principle: 'फेज सीक्वेंस मीटर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'L1, L2, L3', ratings: '3-phase rated', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'frequency_meter': { name: 'फ्रीक्वेंसी मीटर', principle: 'फ्रीक्वेंसी मीटर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Input terminals', ratings: '45–65Hz typical', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'tachometer': { name: 'डिजिटल टैकोमीटर', principle: 'डिजिटल टैकोमीटर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Optical/contact sensor', ratings: 'RPM range by model', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      'insulation_tester': { name: 'इंसुलेशन रेजिस्टेंस टेस्टर', principle: 'इंसुलेशन रेजिस्टेंस टेस्टर विद्युत/डिप्लोमा उपयोग के लिए।', terminals: 'Line, Earth terminals', ratings: '250/500/1000V test ranges', mistakes: 'रेटिंग और सुरक्षा निर्देशों का पालन न करना।' },
      resistor: {name:"कार्बन फिल्म रेसिस्टर", cat:"निष्क्रिय", principle:"करंट को सीमित करता है और जूल ऊष्मा के कारण वोल्टेज ड्रॉप करता है।", terminals:"T1, T2 (गैर-ध्रुवीकृत)", mistakes:"निर्धारित पावर रेटिंग से अधिक चलाने पर रेसिस्टर जल सकता है।"},
      potentiometer: {name:"पोटेंशियोमीटर", cat:"निष्क्रिय", principle:"तीन-टर्मिनल समायोज्य रेसिस्टर, जो वोल्टेज डिवाइडर के रूप में काम करता है।", terminals:"पिन 1 (हाई), वाइपर, पिन 3 (लो)", mistakes:"वाइपर और ग्राउंड के बीच सप्लाई सीधे जोड़ना।"},
      capacitor: {name:"सिरेमिक कैपेसिटर", cat:"निष्क्रिय", principle:"इलेक्ट्रिक फील्ड में ऊर्जा संग्रह करता है; DC को रोकता और AC को पास करता है।", terminals:"लीड 1, लीड 2 (गैर-ध्रुवीकृत)", mistakes:"ध्रुवीकृत इलेक्ट्रोलाइटिक कैपेसिटर को उलटी DC सप्लाई पर लगाना।"},
      electrolytic_cap: {name:"इलेक्ट्रोलाइटिक कैपेसिटर", cat:"निष्क्रिय", principle:"DC सप्लाई को स्मूद/फिल्टर करने वाला उच्च-कैपेसिटेंस ध्रुवीकृत कैपेसिटर।", terminals:"एनोड (+), कैथोड (-)", mistakes:"उल्टी ध्रुवीयता में लगाने से कैपेसिटर गर्म होकर फट सकता है।"},
      inductor: {name:"इंडक्टर / चोक", cat:"निष्क्रिय", principle:"कॉइल में बने चुंबकीय क्षेत्र के कारण करंट में बदलाव का विरोध करता है।", terminals:"T1, T2", mistakes:"करंट अचानक बंद होने पर बैक-EMF स्पाइक को नज़रअंदाज़ करना।"},
      ldr: {name:"लाइट डिपेंडेंट रेसिस्टर (LDR)", cat:"सेंसर", principle:"प्रकाश पड़ने पर इसकी रेसिस्टेंस कम हो जाती है।", terminals:"लीड 1, लीड 2", mistakes:"इसे सीधे हाई-करंट पाथ में इस्तेमाल करना।"},
      thermistor: {name:"NTC थर्मिस्टर", cat:"सेंसर", principle:"तापमान बढ़ने पर इसकी रेसिस्टेंस घटती है।", terminals:"लीड 1, लीड 2", mistakes:"इसे रैखिक प्रतिक्रिया वाला मानना; NTC कर्व घातीय होता है।"},
      hall_sensor: {name:"हॉल इफेक्ट सेंसर", cat:"सेंसर", principle:"पास के चुंबकीय क्षेत्र के अनुसार आउटपुट वोल्टेज देता है।", terminals:"VCC, GND, OUT", mistakes:"सप्लाई ध्रुवीयता या ओपन-ड्रेन आउटपुट की पुल-अप आवश्यकता को नज़रअंदाज़ करना।"},
      zener_diode: {name:"Zener Diode", cat:"Semiconductor", principle:"Maintains approximately constant reverse voltage in breakdown; useful for regulation and references.", terminals:"Anode (+), Cathode (-, banded)", mistakes:"Running in breakdown without current limiting."},
      schottky_diode: {name:"Schottky Diode", cat:"Semiconductor", principle:"Low-forward-voltage diode with fast switching, common in power conversion.", terminals:"Anode (+), Cathode (-)", mistakes:"Ignoring reverse-voltage rating."},
      p_mosfet: {name:"P-Channel MOSFET", cat:"Semiconductor", principle:"High-side voltage-controlled switch using a P-channel conduction path.", terminals:"Gate (G), Drain (D), Source (S)", mistakes:"Incorrect source-referenced gate drive."},
      scr: {name:"SCR / Thyristor", cat:"Semiconductor", principle:"Latching semiconductor switch triggered by a gate pulse.", terminals:"Anode (A), Cathode (K), Gate (G)", mistakes:"Expecting the gate to turn an SCR off like a transistor."},
      triac: {name:"TRIAC", cat:"Semiconductor", principle:"Bidirectional thyristor for AC power control.", terminals:"MT1, MT2, Gate", mistakes:"Using inductive loads without suitable protection."},
      diac: {name:"DIAC", cat:"Semiconductor", principle:"Bidirectional trigger device that conducts after breakover voltage.", terminals:"T1, T2", mistakes:"Treating it as a normal rectifier diode."},
      ic_741: {name:"µA741 Op-Amp", cat:"IC / Control", principle:"Classic general-purpose operational amplifier for analog signal conditioning.", terminals:"V+, V-, IN+, IN-, OUT", mistakes:"Exceeding common-mode or supply limits."},
      reg_7805: {name:"7805 Voltage Regulator", cat:"IC / Control", principle:"Three-terminal linear regulator providing regulated +5V output.", terminals:"IN, GND, OUT", mistakes:"Ignoring heat dissipation at large voltage drops."},
      thermistor_ptc: {name:"PTC Thermistor", cat:"Sensors", principle:"Resistance increases as temperature rises; useful for sensing and protection.", terminals:"Lead 1, Lead 2", mistakes:"Assuming a linear resistance-temperature curve."},
      push_button: {name:"Momentary Push Button", cat:"Switching", principle:"Momentary normally-open switch that closes while pressed.", terminals:"NO1, NO2", mistakes:"Ignoring contact bounce in sensitive digital circuits."},
      dpdt_switch: {name:"DPDT Switch", cat:"Switching", principle:"Double-pole double-throw switch for routing two circuits.", terminals:"COM1, A1, B1, COM2, A2, B2", mistakes:"Cross-wiring poles during motor reversing."},
      ac_source: {name:"AC Voltage Source", cat:"Power", principle:"Generates configurable sinusoidal AC voltage.", terminals:"L, N", mistakes:"Confusing RMS voltage with peak voltage."},
      lamp: {name:"Indicator Lamp", cat:"Loads", principle:"Electrical load that converts energy primarily into visible light.", terminals:"L, N", mistakes:"Applying voltage above the lamp rating."},
      ir_sensor: {name:"IR Proximity Sensor", cat:"Sensors", principle:"Uses infrared emission and reflection to detect nearby objects.", terminals:"VCC, GND, OUT", mistakes:"Ignoring ambient light and reflective-surface effects."},
      thermocouple: {name:"Thermocouple Sensor", cat:"Sensors", principle:"Produces a small voltage related to temperature difference through the Seebeck effect.", terminals:"T+, T-", mistakes:"Ignoring cold-junction compensation."},
      schmitt_trigger: {name:"Schmitt Trigger", cat:"IC / Control", principle:"Comparator with hysteresis that cleans slow or noisy digital transitions.", terminals:"VCC, GND, IN, OUT", mistakes:"Ignoring hysteresis when interpreting thresholds."},
      pt100: {name:"PT100 RTD", cat:"Sensors", principle:"Precision resistance temperature detector with predictable temperature response.", terminals:"Lead 1, Lead 2", mistakes:"Using long leads without considering lead resistance."},
      reed_switch: {name:"Reed Switch", cat:"Switching", principle:"Magnetically actuated switch that opens or closes when a magnetic field is applied.", terminals:"NO1, NO2", mistakes:"Exceeding contact current or using it for high inrush loads."},
      led: {name:"लाइट एमिटिंग डायोड (LED)", cat:"सेमीकंडक्टर", principle:"फॉरवर्ड बायस होने पर इलेक्ट्रोल्यूमिनेसेंस द्वारा प्रकाश उत्सर्जित करता है।", terminals:"एनोड (+), कैथोड (-)", mistakes:"सीरीज रेसिस्टर के बिना सीधे पावर रेल से जोड़ना।"},
      diode_1n4007: {name:"1N4007 रेक्टिफायर डायोड", cat:"सेमीकंडक्टर", principle:"करंट को केवल एक दिशा में प्रवाहित करता है और रिवर्स दिशा में रोकता है।", terminals:"एनोड (+), कैथोड (-, बैंड वाला सिरा)", mistakes:"डायोड उल्टा लगाने से इच्छित करंट पाथ पूरी तरह रुक जाता है।"},
      bjt_npn: {name:"2N2222 NPN ट्रांजिस्टर", cat:"सेमीकंडक्टर", principle:"करंट-नियंत्रित स्विच; बेस करंट कलेक्टर-एमिटर करंट को नियंत्रित करता है।", terminals:"कलेक्टर (C), बेस (B), एमिटर (E)", mistakes:"बेस रेसिस्टर के बिना बेस को सीधे जोड़ना।"},
      bjt_pnp: {name:"2N2907 PNP ट्रांजिस्टर", cat:"सेमीकंडक्टर", principle:"जब बेस वोल्टेज एमिटर से कम होता है तब कंडक्ट करता है; NPN की विपरीत ध्रुवीयता में काम करता है।", terminals:"कलेक्टर (C), बेस (B), एमिटर (E)", mistakes:"इसे NPN की तरह वायर करना; करंट की दिशा उलट होती है।"},
      mosfet_n: {name:"N-चैनल MOSFET (IRF540)", cat:"सेमीकंडक्टर", principle:"वोल्टेज-नियंत्रित स्विच; गेट वोल्टेज ड्रेन और सोर्स के बीच कंडक्टिव चैनल बनाता है।", terminals:"गेट (G), ड्रेन (D), सोर्स (S)", mistakes:"गेट को फ्लोटिंग छोड़ने से अनिश्चित स्विचिंग हो सकती है।"},
      op_amp: {name:"LM358 ऑप-एम्प", cat:"IC / कंट्रोल", principle:"कम्पैरिजन, एम्प्लीफिकेशन और फिल्टरिंग के लिए हाई-गेन डिफरेंशियल एम्प्लीफायर।", terminals:"V+, V-, IN+, IN-, OUT", mistakes:"नेगेटिव फीडबैक भूलने पर आउटपुट सैचुरेट हो सकता है।"},
      timer_555: {name:"555 टाइमर IC", cat:"IC / कंट्रोल", principle:"एस्टेबल ऑसिलेटर और मोनोस्टेबल पल्स बनाने वाला बहुउपयोगी टाइमिंग IC।", terminals:"GND, TRIG, OUT, RESET, CTRL, THR, DIS, VCC", mistakes:"RESET को फ्लोटिंग छोड़ना; सामान्य ऑपरेशन में इसे हाई रखना चाहिए।"},
      microcontroller: {name:"ATmega328P माइक्रोकंट्रोलर", cat:"IC / कंट्रोल", principle:"प्रोग्रामेबल डिजिटल लॉजिक कोर, जो स्टोर किए गए निर्देशों को चलाता है।", terminals:"VCC, GND, RESET, I/O पिन ×20", mistakes:"ड्राइवर स्टेज के बिना I/O पिन से हाई-करंट लोड चलाना।"},
      relay: {name:"SPDT रिले", cat:"स्विचिंग", principle:"इलेक्ट्रोमैग्नेटिक कॉइल आर्मेचर को खींचकर अलग पावर सर्किट को मैकेनिकल रूप से स्विच करती है।", terminals:"कॉइल +, कॉइल -, COM, NO, NC", mistakes:"कॉइल के समानांतर फ्लाईबैक डायोड न लगाने से इंडक्टिव वोल्टेज स्पाइक हो सकता है।"},
      switch_spst: {name:"SPST टॉगल स्विच", cat:"स्विचिंग", principle:"एक सर्किट पाथ को मैकेनिकल तरीके से जोड़ता या तोड़ता है।", terminals:"इन, आउट", mistakes:"मेन्स सर्किट में लाइव की जगह न्यूट्रल को स्विच करना।"},
      contactor: {name:"3-फेज कॉन्टैक्टर", cat:"स्विचिंग", principle:"मोटर और औद्योगिक लोड को नियंत्रित करने वाला हेवी-ड्यूटी इलेक्ट्रोमैग्नेटिक स्विच।", terminals:"कॉइल A1/A2, L1/L2/L3, T1/T2/T3", mistakes:"मोटर की स्टार्टिंग इनरश करंट के लिए कम कॉन्टैक्ट रेटिंग चुनना।"},
      fuse: {name:"ग्लास कार्ट्रिज फ्यूज", cat:"सुरक्षा", principle:"करंट रेटिंग से अधिक होने पर पतली वायर पिघलकर सर्किट खोल देती है और डाउनस्ट्रीम भागों की सुरक्षा करती है।", terminals:"T1, T2", mistakes:"वायरिंग/लोड की सुरक्षित क्षमता से अधिक रेटिंग वाला फ्यूज लगाना।"},
      mcb: {name:"मिनिएचर सर्किट ब्रेकर (MCB)", cat:"सुरक्षा", principle:"रीसेटेबल थर्मल-मैग्नेटिक स्विच, जो ओवरलोड या शॉर्ट-सर्किट पर ट्रिप करता है।", terminals:"लाइन इन, लोड आउट", mistakes:"लोड के लिए गलत ट्रिप कर्व (B/C/D) चुनना।"},
      olr: {name:"थर्मल ओवरलोड रिले (OLR)", cat:"सुरक्षा", principle:"लगातार ओवरकरंट पर बाइमेटल गर्म होकर मुड़ता है और मोटर कॉन्टैक्टर को डी-एनर्जाइज़ करने वाला ऑक्ज़िलरी कॉन्टैक्ट ट्रिप करता है।", terminals:"L1/L2/L3 इन, T1/T2/T3 आउट, 95-96 ऑक्स", mistakes:"मोटर के नेमप्लेट फुल-लोड एम्पियर से बहुत ऊपर ट्रिप करंट सेट करना।"},
      mov_varistor: {name:"MOV वेरिस्टर", cat:"सुरक्षा", principle:"थ्रेशोल्ड वोल्टेज से ऊपर रेसिस्टेंस तेजी से घटाकर ट्रांजिएंट वोल्टेज स्पाइक को क्लैम्प करता है।", terminals:"लीड 1, लीड 2", mistakes:"फ्यूज के बिना लगाना; MOV शॉर्ट फेल होकर गर्म हो सकता है।"},
      bat_9v: {name:"9V अल्कलाइन बैटरी (PP3)", cat:"पावर", principle:"रासायनिक सेल से डायरेक्ट करंट पोटेंशियल उत्पन्न करता है।", terminals:"पॉजिटिव (+), नेगेटिव (-)", mistakes:"सीधे शॉर्ट-सर्किट करने से गर्मी और नुकसान हो सकता है।"},
      transformer: {name:"स्टेप-डाउन ट्रांसफॉर्मर", cat:"पावर", principle:"म्यूचुअल इंडक्शन से दो कॉइल के बीच AC ऊर्जा ट्रांसफर कर वोल्टेज बदलता है।", terminals:"प्राइमरी L/N, सेकेंडरी +/-", mistakes:"लो-वोल्टेज सेकेंडरी साइड पर मेन्स-रेटेड प्राइमरी को जोड़ना।"},
      bridge_rectifier: {name:"ब्रिज रेक्टिफायर", cat:"पावर", principle:"चार डायोड की व्यवस्था से फुल-वेव AC को पल्सेटिंग DC में बदलता है।", terminals:"AC~, AC~, DC+, DC-", mistakes:"वायरिंग में AC और DC टर्मिनल पेयर को आपस में बदल देना।"},
      dc_motor: {name:"DC मोटर", cat:"लोड", principle:"मोटर इफेक्ट (F = BIL) द्वारा विद्युत ऊर्जा को घूर्णन यांत्रिक ऊर्जा में बदलती है।", terminals:"M+, M-", mistakes:"मोटर को पूरी तरह रुकने से पहले दिशा बदलना, जिससे मैकेनिकल/इलेक्ट्रिकल तनाव बढ़ता है।"},
      buzzer: {name:"पाइजो बजर", cat:"लोड", principle:"पाइजोइलेक्ट्रिक डिस्क AC या पल्स्ड DC से कंपन करके ध्वनि उत्पन्न करती है।", terminals:"पॉजिटिव (+), नेगेटिव (-)", mistakes:"लाउड/एक्टिव बजर को ट्रांजिस्टर ड्राइवर के बिना GPIO पिन से लगातार चलाना।"},
      incandescent_bulb: {name:"इन्कैंडेसेंट बल्ब", cat:"लोड", principle:"टंगस्टन फिलामेंट करंट का विरोध करते हुए सफेद-गर्म होकर प्रकाश और ऊष्मा देता है।", terminals:"कॉन्टैक्ट, शेल (न्यूट्रल)", mistakes:"स्विच ऑफ करने के तुरंत बाद गर्म कांच को छूना।"},
      multimeter: {name:"डिजिटल मल्टीमीटर", cat:"मापन", principle:"चुने गए मोड के अनुसार आंतरिक शंट/डिवाइडर नेटवर्क बदलकर वोल्टेज, करंट या रेसिस्टेंस मापता है।", terminals:"VΩmA (लाल प्रोब), COM (काला प्रोब)", mistakes:"वोल्टेज स्रोत के across मापते समय मीटर को Amps मोड में छोड़ना, जिससे शॉर्ट-सर्किट हो सकता है।"},
      oscilloscope_probe: {name:"ऑसिलोस्कोप प्रोब (1x/10x)", cat:"मापन", principle:"समय के साथ वोल्टेज वेवफॉर्म कैप्चर कर उसे कैलिब्रेटेड ग्रिड पर दिखाता है।", terminals:"टिप (सिग्नल), ग्राउंड क्लिप", mistakes:"प्रोब को कम्पेन्सेट करना भूलने से स्क्वायर-वेव मापन विकृत हो सकता है।"},
      clamp_meter: {name:"AC क्लैम्प मीटर", cat:"मापन", principle:"एक कंडक्टर के आसपास चुंबकीय क्षेत्र को महसूस करके करंट को बिना वायर काटे मापता है।", terminals:"जॉ (एक वायर के चारों ओर क्लैम्प)", mistakes:"केबल के दोनों कंडक्टरों पर एक साथ क्लैम्प करने से चुंबकीय क्षेत्र लगभग शून्य हो जाता है।"}
,

      // ===== DIPLOMA PHASE A HINDI NAMES =====
      "dc_shunt_motor": {name:"DC शंट मोटर", cat:"लोड", principle:"फील्ड वाइंडिंग आर्मेचर के समानांतर होती है, इसलिए सामान्य लोड परिवर्तन पर गति लगभग स्थिर रहती है।", terminals:"A1, A2, F1, F2", mistakes:"गलत फील्ड/आर्मेचर ध्रुवीयता या आवश्यक फील्ड एक्साइटेशन के बिना चलाना।"},
      "dc_series_motor": {name:"DC सीरीज मोटर", cat:"लोड", principle:"फील्ड वाइंडिंग आर्मेचर के सीरीज में होती है और बहुत अधिक स्टार्टिंग टॉर्क देती है।", terminals:"A1, A2, S1, S2", mistakes:"बिना मैकेनिकल लोड के सीरीज मोटर चलाने से खतरनाक ओवरस्पीड हो सकता है।"},
      "dc_compound_motor": {name:"DC कंपाउंड मोटर", cat:"लोड", principle:"शंट और सीरीज दोनों फील्ड वाइंडिंग से टॉर्क और स्पीड रेगुलेशन का संयुक्त व्यवहार मिलता है।", terminals:"A1, A2, F1, F2, S1, S2", mistakes:"क्यूम्युलेटिव/डिफरेंशियल फील्ड कनेक्शन गलत करने से व्यवहार बदल सकता है।"},
      "dc_generator": {name:"DC जनरेटर", cat:"लोड", principle:"इलेक्ट्रोमैग्नेटिक इंडक्शन और कम्यूटेटर से यांत्रिक ऊर्जा को DC विद्युत ऊर्जा में बदलता है।", terminals:"आर्मेचर, फील्ड टर्मिनल", mistakes:"सही एक्साइटेशन और गति स्थापित होने से पहले आउटपुट गलत तरीके से जोड़ना।"},
      "single_phase_induction_motor": {name:"सिंगल-फेज इंडक्शन मोटर", cat:"लोड", principle:"मेन और ऑक्ज़िलरी वाइंडिंग तथा स्टार्टिंग व्यवस्था से घूमने वाला चुंबकीय प्रभाव बनाता है।", terminals:"मेन वाइंडिंग, ऑक्ज़िलरी वाइंडिंग, कैपेसिटर", mistakes:"गलत कैपेसिटर या वाइंडिंग कनेक्शन से मोटर गर्म हो सकती है।"},
      "three_phase_induction_motor": {name:"थ्री-फेज इंडक्शन मोटर", cat:"लोड", principle:"थ्री-फेज स्टेटर घूमता चुंबकीय क्षेत्र बनाता है जो रोटर में करंट और टॉर्क उत्पन्न करता है।", terminals:"U/V/W या T1/T2/T3, फ्रेम अर्थ", mistakes:"गलत फेज सीक्वेंस से दिशा बदलती है; ओवरलोड प्रोटेक्शन कभी बायपास न करें।"},
      "synchronous_motor": {name:"सिंक्रोनस मोटर", cat:"लोड", principle:"रोटर सही एक्साइटेशन पर स्टेटर के घूमते चुंबकीय क्षेत्र से लॉक होकर सिंक्रोनस स्पीड पर चलता है।", terminals:"थ्री-फेज स्टेटर, फील्ड/एक्साइटेशन", mistakes:"गलत स्टार्टिंग या एक्साइटेशन से पुल-आउट और ओवरहीटिंग हो सकती है।"},
      "alternator": {name:"अल्टरनेटर / सिंक्रोनस जनरेटर", cat:"लोड", principle:"शाफ्ट की यांत्रिक शक्ति को इलेक्ट्रोमैग्नेटिक इंडक्शन द्वारा AC विद्युत शक्ति में बदलता है।", terminals:"U/V/W आउटपुट, फील्ड टर्मिनल", mistakes:"गलत एक्साइटेशन, गति या सिंक्रोनाइजेशन से उपकरण क्षतिग्रस्त हो सकता है।"},
      "universal_motor": {name:"यूनिवर्सल मोटर", cat:"लोड", principle:"सीरीज-वाउंड मोटर है जो AC या DC सप्लाई पर काम कर सकती है और उच्च गति देती है।", terminals:"सप्लाई टर्मिनल, ब्रश/फील्ड सर्किट", mistakes:"बिना उचित लोड/कंट्रोल के चलाने से अधिक गति और ब्रश घिसाव हो सकता है।"},
      "stepper_motor": {name:"स्टेपर मोटर", cat:"लोड", principle:"फेज वाइंडिंग को क्रम से एनर्जाइज करने पर निश्चित कोणों में स्टेप करके घूमता है।", terminals:"Phase A+/A-, B+/B- या कॉइल टर्मिनल", mistakes:"उचित करंट-लिमिट ड्राइवर के बिना कॉइल को सीधे चलाना।"},
      "step_up_transformer": {name:"स्टेप-अप ट्रांसफॉर्मर", cat:"पावर", principle:"टर्न्स रेशियो के अनुसार AC वोल्टेज बढ़ाते हुए म्यूचुअल इंडक्शन से ऊर्जा ट्रांसफर करता है।", terminals:"प्राइमरी L/N, सेकेंडरी टर्मिनल", mistakes:"सेकेंडरी वोल्टेज को जांचे बिना सुरक्षित मान लेना।"},
      "auto_transformer": {name:"ऑटो ट्रांसफॉर्मर", cat:"पावर", principle:"एक ही टैप्ड वाइंडिंग से अलग या परिवर्तनीय AC वोल्टेज देता है।", terminals:"इनपुट, कॉमन, टैप/आउटपुट", mistakes:"यह सप्लाई से गैल्वैनिक आइसोलेशन नहीं देता।"},
      "isolation_transformer": {name:"आइसोलेशन ट्रांसफॉर्मर", cat:"पावर", principle:"म्यूचुअल इंडक्शन से AC पावर ट्रांसफर करते हुए प्राइमरी और सेकेंडरी में गैल्वैनिक आइसोलेशन देता है।", terminals:"प्राइमरी L/N, आइसोलेटेड सेकेंडरी", mistakes:"आइसोलेशन को सभी विद्युत खतरों का समाधान मान लेना।"},
      "current_transformer_ct": {name:"करंट ट्रांसफॉर्मर (CT)", cat:"पावर", principle:"मीटरिंग और प्रोटेक्शन के लिए प्राइमरी करंट के अनुपात में कम सेकेंडरी करंट देता है।", terminals:"प्राइमरी कंडक्टर/विंडो, S1, S2", mistakes:"प्राइमरी करंट रहते हुए CT सेकेंडरी को कभी ओपन न छोड़ें।"},
      "potential_transformer_pt": {name:"पोटेंशियल ट्रांसफॉर्मर (PT)", cat:"पावर", principle:"मीटरिंग और प्रोटेक्शन के लिए सिस्टम वोल्टेज के अनुपात में कम वोल्टेज देता है।", terminals:"प्राइमरी, सेकेंडरी टर्मिनल", mistakes:"रेटेड प्राइमरी इंसुलेशन से अधिक वोल्टेज लगाना।"},
      "ammeter": {name:"एमीटर", cat:"मापन", principle:"करंट मापता है और मापे जाने वाले सर्किट के सीरीज में जोड़ा जाता है।", terminals:"A/mA इनपुट, COM", mistakes:"एमीटर को सीधे वोल्टेज स्रोत के across जोड़ना।"},
      "voltmeter": {name:"वोल्टमीटर", cat:"मापन", principle:"दो बिंदुओं के बीच विभवांतर मापता है और समानांतर जोड़ा जाता है।", terminals:"V इनपुट, COM", mistakes:"अपर्याप्त वोल्टेज रेंज या गलत टर्मिनल का उपयोग।"},
      "wattmeter": {name:"वॉटमीटर", cat:"मापन", principle:"वोल्टेज और करंट सेंसिंग से वास्तविक विद्युत शक्ति मापता है।", terminals:"करंट कॉइल, पोटेंशियल कॉइल", mistakes:"करंट/पोटेंशियल कॉइल की गलत वायरिंग से गलत रीडिंग या नुकसान।"},
      "energy_meter": {name:"एनर्जी मीटर", cat:"मापन", principle:"समय के साथ शक्ति को इंटीग्रेट करके ऊर्जा खपत, सामान्यतः kWh में, मापता है।", terminals:"लाइन, लोड, न्यूट्रल/फेज टर्मिनल", mistakes:"गलत टर्मिनल क्रम या बायपास वायरिंग।"},
      "megger": {name:"मेगर / इंसुलेशन टेस्टर", cat:"मापन", principle:"नियंत्रित उच्च टेस्ट वोल्टेज लगाकर इंसुलेशन रेजिस्टेंस मापता है।", terminals:"LINE, EARTH, GUARD", mistakes:"एनर्जाइज्ड सर्किट या जुड़े संवेदनशील इलेक्ट्रॉनिक्स पर टेस्ट करना।"},
      "earth_tester": {name:"अर्थ रेजिस्टेंस टेस्टर", cat:"मापन", principle:"टेस्ट इलेक्ट्रोड या क्लैम्प विधि से अर्थ इलेक्ट्रोड रेजिस्टेंस मापता है।", terminals:"E, P, C टर्मिनल", mistakes:"गलत प्रोब प्लेसमेंट या पैरेलल अर्थ पाथ को नजरअंदाज करना।"},
      "lcr_meter": {name:"LCR मीटर", cat:"मापन", principle:"AC टेस्ट सिग्नल से इंडक्टेंस, कैपेसिटेंस और रेसिस्टेंस मापता है।", terminals:"HI/LO या Kelvin टर्मिनल", mistakes:"पैरेलल पाथ हटाए बिना इन-सर्किट पार्ट मापना।"},
      "power_factor_meter": {name:"पावर फैक्टर मीटर", cat:"मापन", principle:"वोल्टेज और करंट के फेज संबंध को मापकर पावर फैक्टर दिखाता है।", terminals:"वोल्टेज कॉइल, करंट कॉइल", mistakes:"गलत फेज कनेक्शन या रेंज का उपयोग।"},
      "mccb": {name:"मोल्डेड केस सर्किट ब्रेकर (MCCB)", cat:"सुरक्षा", principle:"उच्च करंट रेटिंग पर ओवरलोड और शॉर्ट-सर्किट प्रोटेक्शन देने वाला रीसेटेबल ब्रेकर है।", terminals:"लाइन टर्मिनल, लोड टर्मिनल", mistakes:"गलत साइज के ब्रेकर को उचित केबल प्रोटेक्शन का विकल्प मानना।"},
      "rccb": {name:"रेजिडुअल करंट सर्किट ब्रेकर (RCCB)", cat:"सुरक्षा", principle:"लाइव कंडक्टरों के करंट असंतुलन को पहचानकर अर्थ-लीकेज पर ट्रिप करता है।", terminals:"लाइन/न्यूट्रल इन और आउट", mistakes:"जहाँ MCB/MCCB जरूरी है वहाँ RCCB को अकेला ओवरलोड प्रोटेक्शन मानना।"},
      "elcb": {name:"अर्थ लीकेज सर्किट ब्रेकर (ELCB)", cat:"सुरक्षा", principle:"डिवाइस के सेंसर प्रकार के अनुसार अर्थ-लीकेज प्रोटेक्शन प्रदान करता है।", terminals:"मॉडल के अनुसार", mistakes:"पुराने ELCB और आधुनिक RCCB के कार्य में भ्रम करना।"},
      "rcbo": {name:"RCBO", cat:"सुरक्षा", principle:"एक ही डिवाइस में ओवरकरंट/शॉर्ट-सर्किट और रेजिडुअल-करंट प्रोटेक्शन देता है।", terminals:"लाइन/न्यूट्रल इन और आउट", mistakes:"गलत ट्रिप कर्व या लीकेज सेंसिटिविटी चुनना।"},
      "isolator": {name:"आइसोलेटर / डिस्कनेक्ट स्विच", cat:"सुरक्षा", principle:"सुरक्षित आइसोलेशन के लिए सर्किट को अलग करता है; हर मॉडल फॉल्ट करंट तोड़ने के लिए नहीं होता।", terminals:"लाइन और लोड पोल", mistakes:"नॉन-लोड-ब्रेक आइसोलेटर से भारी लोड करंट तोड़ना।"},
      "hrc_fuse": {name:"HRC फ्यूज", cat:"सुरक्षा", principle:"उच्च फॉल्ट करंट को अपनी रेटेड ब्रेकिंग क्षमता के भीतर सुरक्षित रूप से इंटरप्ट करता है।", terminals:"टर्मिनल 1, टर्मिनल 2", mistakes:"ब्रेकिंग क्षमता मिलाए बिना साधारण फ्यूज से बदलना।"},
      "spd": {name:"सर्ज प्रोटेक्शन डिवाइस (SPD)", cat:"सुरक्षा", principle:"सर्ज ऊर्जा को डायवर्ट करके ट्रांजिएंट ओवरवोल्टेज को सीमित करता है।", terminals:"मॉडल अनुसार लाइन/न्यूट्रल/अर्थ", mistakes:"सही अर्थिंग, बैकअप प्रोटेक्शन या लीड रूटिंग के बिना लगाना।"},
      "phase_monitor_relay": {name:"फेज फेल्योर / सीक्वेंस रिले", cat:"सुरक्षा", principle:"फेज लॉस, फेज रिवर्सल और असामान्य वोल्टेज को मॉनिटर करके थ्री-फेज लोड की सुरक्षा करता है।", terminals:"L1/L2/L3 सप्लाई, रिले आउटपुट", mistakes:"इसे ओवरलोड प्रोटेक्शन का विकल्प मानना।"},
      "timer_relay": {name:"टाइमर रिले", cat:"स्विचिंग", principle:"निर्धारित ऑन-डिले, ऑफ-डिले या अन्य टाइमिंग फंक्शन के बाद कॉन्टैक्ट बदलता है।", terminals:"A1/A2 सप्लाई, COM/NO/NC", mistakes:"गलत टाइमिंग मोड या सप्लाई वोल्टेज चुनना।"},
      "star_delta_timer": {name:"स्टार-डेल्टा टाइमर", cat:"स्विचिंग", principle:"स्टार और डेल्टा कॉन्टैक्टर को क्रम से चलाकर रिड्यूस्ड-वोल्टेज मोटर स्टार्टिंग करता है।", terminals:"सप्लाई, STAR/DELTA आउटपुट", mistakes:"स्टार और डेल्टा के बीच पर्याप्त इंटरलॉक/डिले न रखना।"},
      "auxiliary_contactor": {name:"ऑक्सिलरी कॉन्टैक्टर", cat:"स्विचिंग", principle:"कंट्रोल लॉजिक, इंटरलॉकिंग और स्टेटस सर्किट के लिए अतिरिक्त कॉन्टैक्ट देता है।", terminals:"कॉइल A1/A2, NO/NC कॉन्टैक्ट", mistakes:"ऑक्सिलरी कॉन्टैक्ट से उसकी रेटिंग से अधिक लोड स्विच करना।"},
      "control_relay": {name:"कंट्रोल रिले", cat:"स्विचिंग", principle:"आइसोलेटेड कॉन्टैक्ट से लो-पावर कंट्रोल सर्किट स्विच करता है।", terminals:"कॉइल, COM/NO/NC", mistakes:"कॉइल सप्रेशन या कॉन्टैक्ट रेटिंग को नजरअंदाज करना।"},
      "limit_switch": {name:"लिमिट स्विच", cat:"स्विचिंग", principle:"मशीन की निश्चित स्थिति पर मैकेनिकल एक्ट्यूएटर से कॉन्टैक्ट बदलता है।", terminals:"COM, NO, NC", mistakes:"क्षतिग्रस्त एक्ट्यूएटर या रेटिंग से अधिक करंट का उपयोग।"},
      "variable_dc_supply": {name:"वेरिएबल DC पावर सप्लाई", cat:"पावर", principle:"लैब सर्किट के लिए एडजस्टेबल रेगुलेटेड DC वोल्टेज और करंट लिमिट देता है।", terminals:"पॉजिटिव, नेगेटिव, वैकल्पिक अर्थ", mistakes:"कंपोनेंट की वोल्टेज/करंट रेटिंग से अधिक चलाना या करंट लिमिट बायपास करना।"},
      "ac_variac": {name:"वेरिएक / वेरिएबल AC सप्लाई", cat:"पावर", principle:"वेरिएबल ऑटो ट्रांसफॉर्मर से एडजस्टेबल AC आउटपुट देता है; सामान्यतः यह आइसोलेटेड नहीं होता।", terminals:"इनपुट, कॉमन, वेरिएबल आउटपुट", mistakes:"आउटपुट को मेन्स से आइसोलेटेड मान लेना।"},
      "ups": {name:"UPS (अनइंटरप्टिबल पावर सप्लाई)", cat:"पावर", principle:"मुख्य सप्लाई फेल या अस्थिर होने पर अस्थायी बैकअप पावर और कंडीशनिंग देता है।", terminals:"AC इनपुट, AC आउटपुट, बैटरी टर्मिनल", mistakes:"आउटपुट ओवरलोड करना या खराब बैटरी उपयोग करना।"},
      "inverter": {name:"DC-AC इन्वर्टर", cat:"पावर", principle:"कंट्रोल्ड स्विचिंग और फिल्टरिंग से DC ऊर्जा को AC में बदलता है।", terminals:"DC इनपुट +/−, AC आउटपुट", mistakes:"DC पोलैरिटी उलटना या सर्ज/करंट लिमिट से अधिक लोड करना।"},
      // ===== PHASE B HINDI LOCALIZATION =====
      "thermal_overload_relay": {name:"Thermal Overload Relay", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "motor_protection_circuit_breaker": {name:"Motor Protection Circuit Breaker", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "acb": {name:"Acb", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "vcb": {name:"Vcb", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "sf6_breaker": {name:"Sf6 Breaker", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "earth_leakage_relay": {name:"Earth Leakage Relay", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "under_voltage_relay": {name:"Under Voltage Relay", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "over_voltage_relay": {name:"Over Voltage Relay", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "bimetallic_thermostat": {name:"Bimetallic Thermostat", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "push_button_no": {name:"Push Button No", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "push_button_nc": {name:"Push Button Nc", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "emergency_stop": {name:"Emergency Stop", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "selector_switch": {name:"Selector Switch", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "float_switch": {name:"Float Switch", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "pressure_switch": {name:"Pressure Switch", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "proximity_inductive": {name:"Proximity Inductive", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "photoelectric_sensor": {name:"Photoelectric Sensor", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "magnetic_reed_switch": {name:"Reed Switch", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "encoder": {name:"Encoder", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "temperature_sensor_pt100": {name:"Temperature Sensor Pt100", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "terminal_block": {name:"Terminal Block", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "busbar": {name:"Busbar", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "cable_lug": {name:"Cable Lug", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "cable_gland": {name:"Cable Gland", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "changeover_switch": {name:"Changeover Switch", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "star_delta_starter": {name:"Star Delta Starter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "dol_starter": {name:"Dol Starter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "soft_starter": {name:"Soft Starter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "variable_frequency_drive": {name:"Variable Frequency Drive", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "control_transformer": {name:"Control Transformer", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "distribution_board": {name:"Distribution Board", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "main_switch": {name:"Main Switch", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "earth_electrode": {name:"Earth Electrode", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "single_phase_energy_meter": {name:"Single Phase Energy Meter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "three_phase_energy_meter": {name:"Three Phase Energy Meter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "frequency_meter": {name:"Frequency Meter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "phase_sequence_meter": {name:"Phase Sequence Meter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "tachometer": {name:"Tachometer", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "panel_meter": {name:"Panel Meter", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},
      "pilot_lamp": {name:"Pilot Lamp", principle:"औद्योगिक/डिप्लोमा अध्ययन के लिए इसका कार्य और सुरक्षित उपयोग समझें।", terminals:"मॉडल/स्कीमैटिक के अनुसार टर्मिनल", mistakes:"रेटिंग, वायरिंग और सुरक्षा निर्देश जांचे बिना उपयोग करना।"},

      // ===== DIPLOMA PHASE B HINDI LOCALIZATION: 40 COMPONENTS =====
      "thermal_overload_relay": {name:"थर्मल ओवरलोड रिले", cat:"सुरक्षा", principle:"थर्मल ओवरलोड रिले का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "motor_protection_circuit_breaker": {name:"मोटर प्रोटेक्शन सर्किट ब्रेकर (MPCB)", cat:"सुरक्षा", principle:"मोटर प्रोटेक्शन सर्किट ब्रेकर (MPCB) का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "acb": {name:"एयर सर्किट ब्रेकर (ACB)", cat:"सुरक्षा", principle:"एयर सर्किट ब्रेकर (ACB) का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "vcb": {name:"वैक्यूम सर्किट ब्रेकर (VCB)", cat:"सुरक्षा", principle:"वैक्यूम सर्किट ब्रेकर (VCB) का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "sf6_breaker": {name:"SF₆ सर्किट ब्रेकर", cat:"सुरक्षा", principle:"SF₆ सर्किट ब्रेकर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "earth_leakage_relay": {name:"अर्थ लीकेज रिले", cat:"सुरक्षा", principle:"अर्थ लीकेज रिले का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "under_voltage_relay": {name:"अंडर-वोल्टेज रिले", cat:"सुरक्षा", principle:"अंडर-वोल्टेज रिले का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "over_voltage_relay": {name:"ओवर-वोल्टेज रिले", cat:"सुरक्षा", principle:"ओवर-वोल्टेज रिले का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "bimetallic_thermostat": {name:"बायमेटलिक थर्मोस्टेट", cat:"स्विचिंग", principle:"बायमेटलिक थर्मोस्टेट का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "push_button_no": {name:"NO पुश बटन", cat:"स्विचिंग", principle:"NO पुश बटन का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "push_button_nc": {name:"NC स्टॉप पुश बटन", cat:"स्विचिंग", principle:"NC स्टॉप पुश बटन का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "emergency_stop": {name:"इमरजेंसी स्टॉप पुश बटन", cat:"स्विचिंग", principle:"इमरजेंसी स्टॉप पुश बटन का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "selector_switch": {name:"सेलेक्टर स्विच", cat:"स्विचिंग", principle:"सेलेक्टर स्विच का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "float_switch": {name:"फ्लोट लेवल स्विच", cat:"सेंसर", principle:"फ्लोट लेवल स्विच का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "pressure_switch": {name:"प्रेशर स्विच", cat:"सेंसर", principle:"प्रेशर स्विच का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "proximity_inductive": {name:"इंडक्टिव प्रॉक्सिमिटी सेंसर", cat:"सेंसर", principle:"इंडक्टिव प्रॉक्सिमिटी सेंसर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "photoelectric_sensor": {name:"फोटोइलेक्ट्रिक सेंसर", cat:"सेंसर", principle:"फोटोइलेक्ट्रिक सेंसर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "magnetic_reed_switch": {name:"रीड स्विच", cat:"सेंसर", principle:"रीड स्विच का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "encoder": {name:"रोटरी एनकोडर", cat:"सेंसर", principle:"रोटरी एनकोडर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "temperature_sensor_pt100": {name:"PT100 RTD तापमान सेंसर", cat:"सेंसर", principle:"PT100 RTD तापमान सेंसर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "terminal_block": {name:"टर्मिनल ब्लॉक", cat:"स्विचिंग", principle:"टर्मिनल ब्लॉक का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "busbar": {name:"बसबार", cat:"पावर", principle:"बसबार का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "cable_lug": {name:"केबल लग", cat:"स्विचिंग", principle:"केबल लग का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "cable_gland": {name:"केबल ग्लैंड", cat:"स्विचिंग", principle:"केबल ग्लैंड का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "changeover_switch": {name:"चेंजओवर स्विच", cat:"स्विचिंग", principle:"चेंजओवर स्विच का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "star_delta_starter": {name:"स्टार-डेल्टा स्टार्टर", cat:"स्विचिंग", principle:"स्टार-डेल्टा स्टार्टर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "dol_starter": {name:"DOL स्टार्टर", cat:"स्विचिंग", principle:"DOL स्टार्टर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "soft_starter": {name:"सॉफ्ट स्टार्टर", cat:"पावर", principle:"सॉफ्ट स्टार्टर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "variable_frequency_drive": {name:"वेरिएबल फ्रीक्वेंसी ड्राइव (VFD)", cat:"पावर", principle:"वेरिएबल फ्रीक्वेंसी ड्राइव (VFD) का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "control_transformer": {name:"कंट्रोल ट्रांसफॉर्मर", cat:"पावर", principle:"कंट्रोल ट्रांसफॉर्मर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "distribution_board": {name:"डिस्ट्रीब्यूशन बोर्ड (DB)", cat:"सुरक्षा", principle:"डिस्ट्रीब्यूशन बोर्ड (DB) का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "main_switch": {name:"मेन स्विच / आइसोलेटर", cat:"सुरक्षा", principle:"मेन स्विच / आइसोलेटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "earth_electrode": {name:"अर्थ इलेक्ट्रोड", cat:"सुरक्षा", principle:"अर्थ इलेक्ट्रोड का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "single_phase_energy_meter": {name:"सिंगल-फेज ऊर्जा मीटर", cat:"मापन", principle:"सिंगल-फेज ऊर्जा मीटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "three_phase_energy_meter": {name:"थ्री-फेज ऊर्जा मीटर", cat:"मापन", principle:"थ्री-फेज ऊर्जा मीटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "frequency_meter": {name:"फ्रीक्वेंसी मीटर", cat:"मापन", principle:"फ्रीक्वेंसी मीटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "phase_sequence_meter": {name:"फेज सीक्वेंस मीटर", cat:"मापन", principle:"फेज सीक्वेंस मीटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "tachometer": {name:"टैकोमीटर", cat:"मापन", principle:"टैकोमीटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "panel_meter": {name:"पैनल डिजिटल मीटर", cat:"मापन", principle:"पैनल डिजिटल मीटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"},
      "pilot_lamp": {name:"पायलट लैम्प / इंडिकेटर", cat:"लोड", principle:"पायलट लैम्प / इंडिकेटर का कार्य और सिद्धांत समझने के लिए इसे संबंधित औद्योगिक/डिप्लोमा संदर्भ में पढ़ें; सही रेटिंग और वायरिंग हमेशा जांचें।", terminals:"मॉडल/डिवाइस के अनुसार टर्मिनल देखें", mistakes:"रेटिंग, टर्मिनल पहचान और सुरक्षा निर्देश जांचे बिना वायरिंग या उपयोग करना।"}
,
      buck_converter: {name:"बक DC-DC कन्वर्टर", cat:"पावर", principle:"उच्च आवृत्ति स्विचिंग और इंडक्टर की सहायता से DC वोल्टेज को कम करता है।", terminals:"VIN+, VIN-, VOUT+, VOUT-", mistakes:"इनपुट ध्रुवीयता उलटी लगाना या करंट सीमा पार करना।"},
      boost_converter: {name:"बूस्ट DC-DC कन्वर्टर", cat:"पावर", principle:"इंडक्टर में ऊर्जा संग्रह करके DC वोल्टेज को अधिक स्तर तक बढ़ाता है।", terminals:"VIN+, VIN-, VOUT+, VOUT-", mistakes:"इसे बक कन्वर्टर की तरह वोल्टेज घटाने के लिए उपयोग करना।"},
      // ===== PHASE C HINDI LOCALIZATION =====
            half_wave_rectifier: {name:"हाफ-वेव रेक्टिफायर", cat:"पावर", principle:"Half-Wave Rectifier बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"AC input, DC output, return", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            full_wave_rectifier: {name:"सेंटर-टैप्ड फुल-वेव रेक्टिफायर", cat:"पावर", principle:"Center-Tapped Full-Wave Rectifier बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"AC ends, center tap, DC output", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            rectifier_filter_cap: {name:"रेक्टिफायर फिल्टर कैपेसिटर", cat:"निष्क्रिय", principle:"Rectifier Filter Capacitor बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Positive, Negative", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            linear_regulator_7805: {name:"7805 लीनियर वोल्टेज रेगुलेटर", cat:"IC / कंट्रोल", principle:"7805 Linear Voltage Regulator बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"IN, GND, OUT", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            linear_regulator_7812: {name:"7812 लीनियर वोल्टेज रेगुलेटर", cat:"IC / कंट्रोल", principle:"7812 Linear Voltage Regulator बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"IN, GND, OUT", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            adjustable_regulator_lm317: {name:"LM317 एडजस्टेबल रेगुलेटर", cat:"IC / कंट्रोल", principle:"LM317 Adjustable Regulator बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"IN, OUT, ADJ", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            opto_coupler: {name:"ऑप्टोकपलर", cat:"IC / कंट्रोल", principle:"Optocoupler बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"LED input, transistor output", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            gate_driver: {name:"MOSFET/IGBT गेट ड्राइवर", cat:"IC / कंट्रोल", principle:"MOSFET/IGBT Gate Driver बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"VCC, GND, IN, gate output", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            pwm_controller: {name:"PWM कंट्रोलर IC", cat:"IC / कंट्रोल", principle:"PWM Controller IC बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"VCC, GND, timing/control pins", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            buck_boost_converter: {name:"बक-बूस्ट कन्वर्टर", cat:"पावर", principle:"Buck-Boost Converter बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"VIN+, VIN-, VOUT+, VOUT-", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            isolated_dc_dc: {name:"आइसोलेटेड DC-DC कन्वर्टर", cat:"पावर", principle:"Isolated DC-DC Converter बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Input +/-, Output +/-", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            dc_chopper: {name:"DC चॉपर", cat:"पावर", principle:"DC Chopper बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"DC input, switched output, control", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            single_phase_inverter: {name:"सिंगल-फेज इन्वर्टर", cat:"पावर", principle:"Single-Phase Inverter बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"DC input, AC output, earth as required", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            three_phase_inverter: {name:"थ्री-फेज इन्वर्टर", cat:"पावर", principle:"Three-Phase Inverter बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"DC link, U/V/W output, control", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            igbt_module: {name:"IGBT पावर मॉड्यूल", cat:"सेमीकंडक्टर", principle:"IGBT Power Module बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Gate, emitter, collector / module terminals", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            power_bjt: {name:"पावर BJT", cat:"सेमीकंडक्टर", principle:"Power BJT बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Collector, Base, Emitter", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            fast_recovery_diode: {name:"फास्ट रिकवरी डायोड", cat:"सेमीकंडक्टर", principle:"Fast Recovery Diode बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Anode, Cathode", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            freewheel_diode: {name:"फ्रीव्हीलिंग डायोड", cat:"सेमीकंडक्टर", principle:"Freewheeling Diode बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Anode, Cathode across inductive load", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            snubber_rc: {name:"RC स्नबर नेटवर्क", cat:"निष्क्रिय", principle:"RC Snubber Network बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Two network terminals", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            snubber_diode: {name:"फ्लाईबैक सप्रेशन डायोड", cat:"सेमीकंडक्टर", principle:"Flyback Suppression Diode बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Anode, Cathode", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            current_sensor_hall: {name:"हॉल करंट सेंसर मॉड्यूल", cat:"मापन", principle:"Hall Current Sensor Module बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"IP+/IP-, VCC, GND, OUT", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            current_shunt: {name:"करंट शंट रेसिस्टर", cat:"मापन", principle:"Current Shunt Resistor बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Kelvin/current terminals", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            ripple_meter: {name:"रिपल वोल्टेज मापन", cat:"मापन", principle:"Ripple Voltage Measurement बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Probe +, reference/ground", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            power_factor_correction_cap: {name:"पावर फैक्टर करेक्शन कैपेसिटर", cat:"पावर", principle:"Power Factor Correction Capacitor बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Capacitor terminals", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            solar_charge_controller: {name:"सोलर चार्ज कंट्रोलर", cat:"पावर", principle:"Solar Charge Controller बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"PV input, battery, load", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            mppt_controller: {name:"MPPT कंट्रोलर", cat:"पावर", principle:"MPPT Controller बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"PV input, battery output", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            battery_management_system: {name:"बैटरी मैनेजमेंट सिस्टम (BMS)", cat:"सुरक्षा", principle:"Battery Management System (BMS) बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"B-/B+, cell taps, P-/P+ model dependent", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            battery_charger: {name:"बैटरी चार्जर", cat:"पावर", principle:"Battery Charger बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"AC/DC input, battery +/-, sense/control", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            smps_controller: {name:"SMPS कंट्रोलर", cat:"IC / कंट्रोल", principle:"SMPS Controller बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Supply, gate/control, feedback pins", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            uninterruptible_power_supply: {name:"अनइंटरप्टिबल पावर सप्लाई (UPS)", cat:"पावर", principle:"Uninterruptible Power Supply (UPS) बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"AC input, AC output, battery terminals", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            surge_suppressor_rcd: {name:"सर्ज सप्रेशन मॉड्यूल", cat:"सुरक्षा", principle:"Surge Suppression Module बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Line/load/earth depending on device", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"},
            power_electronics_trainer: {name:"पावर इलेक्ट्रॉनिक्स ट्रेनर", cat:"मापन", principle:"Power Electronics Trainer बिजली को नियंत्रित, रूपांतरित या मापने वाले पावर इलेक्ट्रॉनिक्स सिस्टम में उपयोग होता है।", terminals:"Lab-specific terminals", mistakes:"निर्धारित रेटिंग, ध्रुवीयता, इन्सुलेशन और सुरक्षा नियमों का पालन न करना।"}
    };

    const componentCategoryHindi = {
      Passive:"निष्क्रिय", Semiconductor:"सेमीकंडक्टर", "IC / Control":"IC / कंट्रोल",
      Switching:"स्विचिंग", Protection:"सुरक्षा", Power:"पावर", Loads:"लोड",
      Sensors:"सेंसर", Measurement:"मापन"
    };


    // v30: Keep the Hindi UI complete even when a newly added component has
    // not yet received a hand-written localization entry. The main database
    // remains the single source of truth; missing Hindi records are generated
    // from the actual component entry instead of falling back to raw English.
    const hindiNameTerms = [
      [/\bSingle Phase\b/gi, 'सिंगल फेज'], [/\bThree Phase\b/gi, 'थ्री-फेज'],
      [/\bPower\b/gi, 'पावर'], [/\bVoltage\b/gi, 'वोल्टेज'], [/\bCurrent\b/gi, 'करंट'],
      [/\bMotor\b/gi, 'मोटर'], [/\bGenerator\b/gi, 'जनरेटर'], [/\bTransformer\b/gi, 'ट्रांसफॉर्मर'],
      [/\bRelay\b/gi, 'रिले'], [/\bSwitch\b/gi, 'स्विच'], [/\bContactor\b/gi, 'कॉन्टैक्टर'],
      [/\bBreaker\b/gi, 'ब्रेकर'], [/\bMeter\b/gi, 'मीटर'], [/\bSensor\b/gi, 'सेंसर'],
      [/\bController\b/gi, 'कंट्रोलर'], [/\bDiode\b/gi, 'डायोड'], [/\bTransistor\b/gi, 'ट्रांजिस्टर'],
      [/\bBattery\b/gi, 'बैटरी'], [/\bCable\b/gi, 'केबल'], [/\bTerminal\b/gi, 'टर्मिनल'],
      [/\bSupply\b/gi, 'सप्लाई'], [/\bStarter\b/gi, 'स्टार्टर'], [/\bInverter\b/gi, 'इन्वर्टर'],
      [/\bCharger\b/gi, 'चार्जर'], [/\bIndicator\b/gi, 'इंडिकेटर'], [/\bTester\b/gi, 'टेस्टर'],
      [/\bResistance\b/gi, 'रेजिस्टेंस'], [/\bEarth\b/gi, 'अर्थ'], [/\bEnergy\b/gi, 'एनर्जी'],
      [/\bDigital\b/gi, 'डिजिटल'], [/\bAC\b/g, 'AC'], [/\bDC\b/g, 'DC']
    ];
    function autoHindiComponentName(name) {
      let value = String(name || 'कंपोनेंट');
      hindiNameTerms.forEach(([pattern, replacement]) => { value = value.replace(pattern, replacement); });
      return value;
    }
    // Component Database Integrity — v38 authoritative cleanup
    // Keep the first definition for every ID and remove later duplicate definitions.
    const componentDuplicateAudit = (() => {
      const duplicates = [];
      const canonical = [];
      const canonicalSeen = new Set();
      componentsDatabase.forEach((component, index) => {
        const id = component?.id;
        if (!id) { duplicates.push({ index, id: null, reason: 'missing-id' }); return; }
        if (canonicalSeen.has(id)) { duplicates.push({ index, id, reason: 'duplicate-id' }); return; }
        canonicalSeen.add(id);
        canonical.push(component);
      });
      componentsDatabase.splice(0, componentsDatabase.length, ...canonical);
      return Object.freeze({
        originalEntries: canonical.length + duplicates.length,
        uniqueEntries: canonical.length,
        duplicates: Object.freeze(duplicates.map(x => Object.freeze({ ...x })))
      });
    })();
    window.componentDuplicateAudit = componentDuplicateAudit;

    componentsDatabase.forEach((c) => {
      if (!componentHindi[c.id]) {
        componentHindi[c.id] = {
          name: autoHindiComponentName(c.name),
          cat: componentCategoryHindi && componentCategoryHindi[c.cat] ? componentCategoryHindi[c.cat] : c.cat,
          principle: `${autoHindiComponentName(c.name)} का उपयोग ${componentCategoryHindi && componentCategoryHindi[c.cat] ? componentCategoryHindi[c.cat] : c.cat} श्रेणी के विद्युत/इलेक्ट्रॉनिक अध्ययन और प्रयोग में किया जाता है।`,
          terminals: c.terminals ? `टर्मिनल: ${c.terminals}` : 'टर्मिनल विवरण उपलब्ध नहीं है।',
          ratings: c.ratings ? `रेटिंग: ${c.ratings}` : undefined,
          mistakes: 'निर्धारित रेटिंग, सही कनेक्शन और आवश्यक सुरक्षा नियमों का पालन न करना।'
        };
      }
    });


    function localizedComponent(c) {
      if (currentLang !== 'hi') return c;
      const h = componentHindi[c.id];
      return h ? {...c, ...h} : c;
    }

    function renderComponents(list) {
      const grid = document.getElementById('components-grid');
      const emptyMsg = document.getElementById('components-empty-msg');
      if (!grid) return;

      if (list.length === 0) {
        grid.innerHTML = '';
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        return;
      }
      if (emptyMsg) emptyMsg.classList.add('hidden');

      const inspectText = currentLang === 'hi' ? '3-व्यू निरीक्षण →' : '3-View Inspect →';

      grid.innerHTML = list.map(c => {
        const v = localizedComponent(c);
        const cap = (window.getComponentCapability && window.getComponentCapability(c.id)) || null;
        const sim = cap ? cap.simulation : 'none';
        const simLabel = currentLang === 'hi' ? (sim === 'full' ? 'पूर्ण सिमुलेशन' : sim === 'partial' ? 'आंशिक सिमुलेशन' : 'सिमुलेशन नहीं') : (sim === 'full' ? 'Full Simulation' : sim === 'partial' ? 'Partial Simulation' : 'No Simulation');
        const simClass = sim === 'full' ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' : sim === 'partial' ? 'text-amber-300 border-amber-500/40 bg-amber-500/10' : 'text-slate-400 border-slate-700 bg-slate-800/60';
        const labLabel = cap && (cap.industrialLab || cap.instrumentLab || cap.dedicatedLab) ? (currentLang === 'hi' ? 'डेडिकेटेड लैब' : 'Dedicated Lab') : '';
        const group = cap ? cap.functionalGroup : 'documentation-only';
        const groupMeta = {
          'fully-functional': [currentLang === 'hi' ? 'पूर्ण कार्यशील' : 'Fully Functional', 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'],
          'builder-partial': [currentLang === 'hi' ? 'बिल्डर / आंशिक' : 'Builder / Partial', 'text-amber-300 border-amber-500/40 bg-amber-500/10'],
          'dedicated-lab': [currentLang === 'hi' ? 'डेडिकेटेड लैब' : 'Dedicated Lab', 'text-violet-300 border-violet-500/40 bg-violet-500/10'],
          'documentation-only': [currentLang === 'hi' ? 'जानकारी मात्र' : 'Documentation Only', 'text-slate-400 border-slate-700 bg-slate-800/60']
        }[group];
        const dedicatedAction = cap ? getDedicatedLabAction(c.id, cap) : null;
        const builderButton = cap && cap.builder
          ? `<button type="button" class="elab-add-builder-btn px-2 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-500/25" data-add-builder="${c.id}" onclick="event.stopPropagation(); window.elabAddComponentToBuilder && window.elabAddComponentToBuilder('${c.id}')">${currentLang === 'hi' ? '+ बिल्डर' : '+ Builder'}</button>`
          : dedicatedAction
            ? `<button type="button" class="px-2 py-1 rounded-md bg-violet-500/15 border border-violet-500/40 text-violet-300 font-bold hover:bg-violet-500/25" onclick="event.stopPropagation(); openDedicatedLabForComponent('${c.id}')">${currentLang === 'hi' ? dedicatedAction.labelHi : dedicatedAction.label}</button>`
            : `<span class="px-2 py-1 rounded-md border border-slate-700 text-slate-500">${labLabel || (currentLang === 'hi' ? 'जानकारी' : 'Info Only')}</span>`;
        return `
        <div onclick="openCompModal('${c.id}')" class="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-xl flex flex-col justify-between cursor-pointer group transition">
          <div>
            <div class="flex justify-between items-center mb-2 gap-2">
              <span class="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-cyan-400 border border-slate-700 rounded">${v.cat}</span>
              <span class="text-[10px] font-mono text-slate-400 truncate">${v.ratings}</span>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">
              <span class="text-[9px] font-mono px-2 py-0.5 border rounded ${simClass}">${simLabel}</span>
              <span class="text-[9px] font-mono px-2 py-0.5 border rounded ${groupMeta[1]}">${groupMeta[0]}</span>
              ${labLabel && group !== 'dedicated-lab' ? `<span class="text-[9px] font-mono px-2 py-0.5 border rounded text-violet-300 border-violet-500/40 bg-violet-500/10">${labLabel}</span>` : ''}
            </div>
            <h3 class="font-bold text-white text-base group-hover:text-cyan-400 transition">${v.name}</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">${v.principle}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center gap-2 text-[11px] font-mono text-slate-400">
            <span class="text-slate-500 truncate max-w-[120px]">${v.terminals}</span>
            <div class="flex items-center gap-2 shrink-0">
              ${builderButton}
              <span class="text-cyan-400 font-bold group-hover:translate-x-1 transition">${inspectText}</span>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    let activeCompFilter = 'All';
    // FIX #3: accept event explicitly instead of relying on the
    // implicit global `event` object (fails under strict mode /
    // in some browsers, and breaks if called programmatically).
    function setCompFilter(cat, evt) {
      activeCompFilter = cat;
      document.querySelectorAll('.comp-filter-btn').forEach(btn => {
        btn.className = 'comp-filter-btn px-3 py-1 bg-slate-900 border border-slate-800 hover:text-white rounded-lg text-xs transition text-slate-400';
      });
      const target = (evt && evt.target) ? evt.target : document.getElementById(`pill-${cat}`);
      if (target) target.className = 'comp-filter-btn px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition';
      filterComponents();
    }

    function filterComponents() {
      const query = document.getElementById('comp-search').value.toLowerCase().trim();
      const filtered = componentsDatabase.filter(c => {
        const v = localizedComponent(c);
        const matchesCat = activeCompFilter === 'All' || c.cat === activeCompFilter;
        const haystack = [c.name, c.terminals, c.principle, v.name, v.terminals, v.principle]
          .join(' ').toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        return matchesCat && matchesQuery;
      });
      renderComponents(filtered);
    }

    // v5.55 — Real Component View: lightweight 2D vector illustrations.
    // These are drawn inline so the file remains self-contained/offline-friendly.
    function componentReal2D(id) {
      const base = (body, label='') => `<div class="el-real2d-wrap">
        <svg class="el-real2d-svg" viewBox="0 0 520 220" role="img" aria-label="${label}">
          <defs>
            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".45" stop-color="#64748b"/><stop offset="1" stop-color="#1e293b"/></linearGradient>
            <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
            <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000" flood-opacity=".45"/></filter>
          </defs>${body}
        </svg></div>`;
      const wire = (x1,y1,x2,y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>`;
      const pin = (x,y,c='#22d3ee') => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`;
      const label = (x,y,t) => `<text x="${x}" y="${y}" fill="#e2e8f0" font-size="15" font-family="ui-monospace,monospace" text-anchor="middle">${t}</text>`;
      switch(id){
        case 'resistor': return base(`${wire(55,110,155,110)}${wire(365,110,465,110)}<rect x="155" y="78" width="210" height="64" rx="18" fill="#d6b47a" filter="url(#shadow)"/><rect x="195" y="78" width="12" height="64" fill="#8b4513"/><rect x="235" y="78" width="12" height="64" fill="#111827"/><rect x="275" y="78" width="12" height="64" fill="#dc2626"/><rect x="315" y="78" width="12" height="64" fill="#f59e0b"/>${pin(55,110)}${pin(465,110)}${label(260,180,'470 Ω Carbon Film')}`,'Carbon Film Resistor');
        case 'potentiometer': return base(`${wire(65,110,165,110)}${wire(355,110,455,110)}<circle cx="260" cy="110" r="66" fill="url(#body)" stroke="#64748b" stroke-width="5" filter="url(#shadow)"/><circle cx="260" cy="110" r="43" fill="#1e293b" stroke="#94a3b8" stroke-width="3"/><line x1="260" y1="110" x2="295" y2="78" stroke="#22d3ee" stroke-width="8" stroke-linecap="round"/>${pin(65,110)}${pin(455,110)}${pin(260,176)}<line x1="260" y1="176" x2="260" y2="145" stroke="#cbd5e1" stroke-width="5"/>${label(260,205,'10 kΩ Rotary Potentiometer')}`,'Potentiometer');
        case 'capacitor': return base(`${wire(55,110,225,110)}${wire(295,110,465,110)}<line x1="235" y1="60" x2="235" y2="160" stroke="#e2e8f0" stroke-width="10"/><line x1="285" y1="60" x2="285" y2="160" stroke="#e2e8f0" stroke-width="10"/>${pin(55,110)}${pin(465,110)}${label(260,190,'Ceramic 100 nF')}`,'Ceramic Capacitor');
        case 'electrolytic_cap': return base(`${wire(65,110,190,110)}${wire(330,110,455,110)}<rect x="190" y="50" width="140" height="120" rx="25" fill="#1e293b" stroke="#94a3b8" stroke-width="4" filter="url(#shadow)"/><rect x="210" y="58" width="8" height="104" fill="#475569"/><text x="260" y="118" fill="#f8fafc" font-size="24" text-anchor="middle">470 µF</text><text x="260" y="145" fill="#fb7185" font-size="18" text-anchor="middle">25 V</text><text x="210" y="45" fill="#22d3ee" font-size="18">+</text>${pin(65,110)}${pin(455,110)}`,'Electrolytic Capacitor');
        case 'inductor': return base(`${wire(55,110,130,110)}${wire(390,110,465,110)}<path d="M130 110 C130 45 170 45 170 110 C170 175 210 175 210 110 C210 45 250 45 250 110 C250 175 290 175 290 110 C290 45 330 45 330 110 C330 175 370 175 390 110" fill="none" stroke="#d4a72c" stroke-width="12" stroke-linecap="round" filter="url(#shadow)"/>${pin(55,110)}${pin(465,110)}${label(260,200,'10 mH Choke')}`,'Inductor');
        case 'ldr': return base(`${wire(55,110,170,110)}${wire(350,110,465,110)}<circle cx="260" cy="110" r="78" fill="#e5e7eb" stroke="#64748b" stroke-width="5"/><path d="M200 105 L230 75 L260 145 L290 75 L320 145" fill="none" stroke="#92400e" stroke-width="10"/><path d="M355 55 L315 82 M370 85 L330 110" stroke="#fbbf24" stroke-width="8" stroke-linecap="round"/>${pin(55,110)}${pin(465,110)}${label(260,205,'Light Dependent Resistor')}`,'LDR');
        case 'thermistor': return base(`${wire(55,110,160,110)}${wire(360,110,465,110)}<rect x="160" y="72" width="200" height="76" rx="38" fill="#e2e8f0" stroke="#64748b" stroke-width="4"/><path d="M190 110 l35 -30 35 60 35 -60 35 60" fill="none" stroke="#ef4444" stroke-width="9"/>${pin(55,110)}${pin(465,110)}${label(260,190,'NTC 10 kΩ @ 25°C')}`,'NTC Thermistor');
        case 'hall_sensor': return base(`${wire(65,110,175,110)}${wire(345,110,455,110)}<rect x="175" y="55" width="170" height="110" rx="12" fill="#111827" stroke="#64748b" stroke-width="5" filter="url(#shadow)"/><path d="M210 85 Q260 50 310 85" fill="none" stroke="#22d3ee" stroke-width="6"/><text x="260" y="125" fill="#f8fafc" font-size="24" text-anchor="middle">HALL</text>${pin(65,110)}${pin(455,110)}`,'Hall Effect Sensor');
        case 'led': return base(`${wire(55,110,190,110)}${wire(330,110,465,110)}<circle cx="260" cy="110" r="58" fill="#ef4444" opacity=".95" filter="url(#shadow)"/><path d="M225 82 L225 138 L305 110 Z" fill="#fee2e2" opacity=".9"/><line x1="305" y1="82" x2="305" y2="138" stroke="#7f1d1d" stroke-width="8"/>${pin(55,110)}${pin(465,110)}${label(260,190,'RED LED • 20 mA')}`,'LED');
        case 'diode_1n4007': return base(`${wire(55,110,190,110)}${wire(330,110,465,110)}<rect x="190" y="78" width="140" height="64" rx="30" fill="#e5e7eb" stroke="#64748b" stroke-width="4"/><polygon points="215,110 285,75 285,145" fill="#0f172a"/><line x1="292" y1="74" x2="292" y2="146" stroke="#111827" stroke-width="10"/>${pin(55,110)}${pin(465,110)}${label(260,190,'1N4007 Rectifier Diode')}`,'1N4007 Diode');
        case 'bjt_npn': case 'bjt_pnp': return base(`${wire(55,110,180,110)}${wire(340,110,465,110)}<path d="M230 60 L230 160 M230 88 L290 88 L290 132 L230 132" fill="none" stroke="#e2e8f0" stroke-width="8"/><line x1="180" y1="110" x2="230" y2="110" stroke="#cbd5e1" stroke-width="7"/><line x1="290" y1="88" x2="340" y2="60" stroke="#cbd5e1" stroke-width="7"/><line x1="290" y1="132" x2="340" y2="160" stroke="#cbd5e1" stroke-width="7"/>${pin(55,110)}${pin(465,110)}${label(260,195,id==='bjt_npn'?'2N2222 NPN':'2N2907 PNP')}`,'Transistor');
        case 'mosfet_n': return base(`<rect x="195" y="45" width="130" height="130" rx="14" fill="#111827" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><line x1="240" y1="65" x2="240" y2="155" stroke="#e2e8f0" stroke-width="8"/><line x1="275" y1="65" x2="275" y2="155" stroke="#22d3ee" stroke-width="8"/><line x1="155" y1="110" x2="240" y2="110" stroke="#cbd5e1" stroke-width="7"/><line x1="275" y1="65" x2="365" y2="65" stroke="#cbd5e1" stroke-width="7"/><line x1="275" y1="155" x2="365" y2="155" stroke="#cbd5e1" stroke-width="7"/>${pin(155,110)}${pin(365,65)}${pin(365,155)}${label(260,205,'IRF540 N-Channel MOSFET')}`,'MOSFET');
        case 'op_amp': return base(`<polygon points="175,55 350,110 175,165" fill="#1e293b" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><text x="205" y="100" fill="#22d3ee" font-size="22">+</text><text x="205" y="140" fill="#fb7185" font-size="22">−</text><text x="275" y="118" fill="#f8fafc" font-size="22">LM358</text>${wire(75,85,175,85)}${wire(75,135,175,135)}${wire(350,110,455,110)}${pin(75,85)}${pin(75,135)}${pin(455,110)}`,'LM358 Op Amp');
        case 'timer_555': return base(`<rect x="175" y="38" width="170" height="144" rx="10" fill="#111827" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><path d="M250 38 Q260 55 270 38" fill="none" stroke="#64748b" stroke-width="4"/><text x="260" y="120" fill="#f8fafc" font-size="28" text-anchor="middle">555</text><g stroke="#cbd5e1" stroke-width="5">${Array.from({length:4},(_,i)=>`<line x1="155" y1="62" x2="175" y2="62"/><line x1="345" y1="62" x2="365" y2="62"/>`).join('')}</g>${label(260,205,'555 Timer IC')}`,'555 Timer');
        case 'microcontroller': return base(`<rect x="165" y="35" width="190" height="150" rx="10" fill="#111827" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><rect x="185" y="55" width="150" height="110" rx="5" fill="#020617" stroke="#22d3ee" stroke-width="3"/><text x="260" y="120" fill="#f8fafc" font-size="24" text-anchor="middle">ATmega328P</text>${Array.from({length:7},(_,i)=>`<line x1="145" y1="55" x2="165" y2="55"/><line x1="355" y1="55" x2="375" y2="55"/>`).join('')}${label(260,205,'DIP-28 Microcontroller')}`,'ATmega328P');
        case 'relay': return base(`${wire(55,110,150,110)}${wire(370,110,465,110)}<rect x="150" y="45" width="220" height="130" rx="14" fill="#1e293b" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><rect x="180" y="70" width="70" height="70" rx="8" fill="#0f172a" stroke="#d4a72c" stroke-width="6"/><path d="M190 105 q15 -30 30 0 q15 30 30 0" fill="none" stroke="#fbbf24" stroke-width="5"/><line x1="290" y1="80" x2="330" y2="110" stroke="#e2e8f0" stroke-width="7"/><line x1="290" y1="140" x2="330" y2="110" stroke="#e2e8f0" stroke-width="7"/><circle cx="330" cy="110" r="7" fill="#22d3ee"/>${pin(55,110)}${pin(465,110)}${label(260,205,'12 V SPDT Relay')}`,'SPDT Relay');
        case 'switch_spst': return base(`${wire(55,110,190,110)}${wire(330,110,465,110)}<circle cx="190" cy="110" r="12" fill="#22d3ee"/><circle cx="330" cy="110" r="12" fill="#22d3ee"/><line x1="198" y1="102" x2="315" y2="62" stroke="#e2e8f0" stroke-width="10" stroke-linecap="round"/><rect x="210" y="35" width="100" height="28" rx="12" fill="#334155"/>${pin(55,110)}${pin(465,110)}${label(260,190,'SPST Toggle Switch')}`,'SPST Switch');
        case 'contactor': return base(`<rect x="165" y="30" width="190" height="160" rx="12" fill="#1e293b" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><text x="260" y="115" fill="#f8fafc" font-size="28" text-anchor="middle">K1</text>${[65,110,155].map(y=>`<line x1="110" y1="${y}" x2="165" y2="${y}" stroke="#cbd5e1" stroke-width="8"/><line x1="355" y1="${y}" x2="410" y2="${y}" stroke="#cbd5e1" stroke-width="8"/>`).join('')}${label(260,212,'3-Phase Contactor')}`,'Contactor');
        case 'fuse': return base(`${wire(55,110,175,110)}${wire(345,110,465,110)}<rect x="175" y="75" width="170" height="70" rx="35" fill="#e2e8f0" stroke="#64748b" stroke-width="4"/><rect x="190" y="92" width="140" height="36" rx="18" fill="#94a3b8"/><path d="M205 110 Q260 80 315 110" fill="none" stroke="#f59e0b" stroke-width="4"/>${pin(55,110)}${pin(465,110)}${label(260,190,'5 A Glass Cartridge Fuse')}`,'Fuse');
        case 'mcb': return base(`<rect x="195" y="30" width="130" height="160" rx="10" fill="#f1f5f9" stroke="#64748b" stroke-width="5" filter="url(#shadow)"/><rect x="220" y="65" width="80" height="60" rx="8" fill="#334155"/><rect x="238" y="78" width="44" height="90" rx="18" fill="#e2e8f0"/><rect x="246" y="85" width="28" height="45" rx="10" fill="#22c55e"/><text x="260" y="55" fill="#0f172a" font-size="18" text-anchor="middle">B16</text>${label(260,212,'16 A MCB')}`,'MCB');
        case 'olr': return base(`<rect x="165" y="40" width="190" height="145" rx="12" fill="#f8fafc" stroke="#64748b" stroke-width="5" filter="url(#shadow)"/><rect x="205" y="65" width="110" height="80" rx="8" fill="#1e293b"/><path d="M220 90 h80 M220 110 h80 M220 130 h80" stroke="#f59e0b" stroke-width="7"/><text x="260" y="105" fill="#f8fafc" font-size="20" text-anchor="middle">OLR</text>${label(260,210,'Thermal Overload Relay')}`,'OLR');
        case 'mov_varistor': return base(`${wire(55,110,175,110)}${wire(345,110,465,110)}<circle cx="260" cy="110" r="62" fill="#1e3a8a" stroke="#93c5fd" stroke-width="5" filter="url(#shadow)"/><text x="260" y="120" fill="#f8fafc" font-size="28" text-anchor="middle">MOV</text>${pin(55,110)}${pin(465,110)}${label(260,190,'275 V MOV Varistor')}`,'MOV');
        case 'bat_9v': return base(`<rect x="195" y="35" width="130" height="150" rx="14" fill="#475569" stroke="#cbd5e1" stroke-width="5" filter="url(#shadow)"/><rect x="215" y="55" width="90" height="95" rx="8" fill="#111827"/><text x="260" y="105" fill="#f8fafc" font-size="28" text-anchor="middle">9V</text><text x="260" y="132" fill="#22d3ee" font-size="16" text-anchor="middle">PP3</text><circle cx="225" cy="30" r="8" fill="#ef4444"/><circle cx="295" cy="30" r="8" fill="#111827"/>${label(260,210,'9 V Alkaline Battery')}`,'9V Battery');
        case 'transformer': return base(`<rect x="175" y="45" width="170" height="130" rx="12" fill="#1e293b" stroke="#94a3b8" stroke-width="5"/><path d="M225 65 C185 65 185 155 225 155 M295 65 C335 65 335 155 295 155" fill="none" stroke="#d4a72c" stroke-width="12"/><line x1="260" y1="60" x2="260" y2="160" stroke="#94a3b8" stroke-width="5"/>${label(260,205,'230 V → 12 V Transformer')}`,'Transformer');
        case 'bridge_rectifier': return base(`<rect x="175" y="45" width="170" height="130" rx="14" fill="#111827" stroke="#94a3b8" stroke-width="5"/><path d="M260 70 L315 110 L260 150 L205 110 Z" fill="none" stroke="#22d3ee" stroke-width="7"/><path d="M235 92 L260 70 L285 92 M235 128 L260 150 L285 128" fill="none" stroke="#e2e8f0" stroke-width="6"/>${label(260,205,'Bridge Rectifier 2 A / 400 V')}`,'Bridge Rectifier');
        case 'dc_motor': return base(`${wire(55,110,160,110)}${wire(360,110,465,110)}<circle cx="260" cy="110" r="78" fill="#64748b" stroke="#cbd5e1" stroke-width="5" filter="url(#shadow)"/><circle cx="260" cy="110" r="48" fill="#334155"/><path d="M260 62 v96 M212 110 h96" stroke="#94a3b8" stroke-width="8"/><text x="260" y="120" fill="#f8fafc" font-size="24" text-anchor="middle">M</text>${pin(55,110)}${pin(465,110)}${label(260,205,'12 V DC Motor')}`,'DC Motor');
        case 'buzzer': return base(`${wire(55,110,170,110)}${wire(350,110,465,110)}<circle cx="260" cy="110" r="70" fill="#111827" stroke="#94a3b8" stroke-width="5" filter="url(#shadow)"/><circle cx="260" cy="110" r="48" fill="#0f172a" stroke="#475569" stroke-width="5"/><path d="M315 85 q55 25 0 50 M330 70 q80 40 0 80" fill="none" stroke="#22d3ee" stroke-width="6"/>${pin(55,110)}${pin(465,110)}${label(260,205,'5 V Piezo Buzzer')}`,'Piezo Buzzer');
        case 'incandescent_bulb': return base(`${wire(55,110,190,110)}${wire(330,110,465,110)}<path d="M220 145 Q205 120 205 100 A55 55 0 1 1 315 100 Q315 120 300 145 Z" fill="#fde68a" stroke="#f59e0b" stroke-width="5" filter="url(#shadow)"/><path d="M225 105 Q260 65 295 105 M230 145 H290" fill="none" stroke="#b45309" stroke-width="6"/><rect x="230" y="145" width="60" height="35" rx="5" fill="#94a3b8"/>${pin(55,110)}${pin(465,110)}${label(260,205,'60 W Incandescent Bulb')}`,'Incandescent Bulb');
        case 'multimeter': return base(`<rect x="175" y="25" width="170" height="170" rx="20" fill="#f8fafc" stroke="#64748b" stroke-width="6" filter="url(#shadow)"/><rect x="200" y="50" width="120" height="55" rx="6" fill="#0f172a"/><text x="260" y="88" fill="#22c55e" font-size="25" text-anchor="middle">12.00 V</text><circle cx="260" cy="145" r="28" fill="#334155" stroke="#94a3b8" stroke-width="4"/><line x1="260" y1="145" x2="275" y2="124" stroke="#22d3ee" stroke-width="6"/>${label(260,215,'Digital Multimeter')}`,'Digital Multimeter');
        case 'oscilloscope_probe': return base(`<path d="M105 145 C150 55 230 55 275 110 S365 165 420 80" fill="none" stroke="#111827" stroke-width="20" stroke-linecap="round"/><path d="M105 145 C150 55 230 55 275 110 S365 165 420 80" fill="none" stroke="#94a3b8" stroke-width="10" stroke-linecap="round"/><path d="M420 80 L470 45" stroke="#22d3ee" stroke-width="8"/><rect x="65" y="125" width="70" height="40" rx="12" fill="#1e293b"/>${label(260,205,'Oscilloscope Probe 1× / 10×')}`,'Oscilloscope Probe');
        case 'clamp_meter': return base(`<path d="M190 170 L190 90 A70 70 0 0 1 330 90 L330 170" fill="none" stroke="#f8fafc" stroke-width="28"/><path d="M205 90 A55 55 0 0 1 315 90" fill="none" stroke="#334155" stroke-width="16"/><rect x="195" y="95" width="130" height="85" rx="12" fill="#111827" stroke="#94a3b8" stroke-width="5"/><text x="260" y="145" fill="#22d3ee" font-size="22" text-anchor="middle">0.00 A</text>${label(260,210,'AC Clamp Meter')}`,'AC Clamp Meter');
       const extra = {'zener_diode':'Zener Diode', 'schottky_diode':'Schottky Diode', 'p_mosfet':'P-Channel MOSFET', 'scr':'SCR / Thyristor', 'triac':'TRIAC', 'diac':'DIAC', 'ic_741':'µA741 Op-Amp', 'reg_7805':'7805 Voltage Regulator', 'thermistor_ptc':'PTC Thermistor', 'push_button':'Momentary Push Button', 'dpdt_switch':'DPDT Switch', 'ac_source':'AC Voltage Source', 'lamp':'Indicator Lamp', 'ir_sensor':'IR Proximity Sensor', 'thermocouple':'Thermocouple Sensor', 'schmitt_trigger':'Schmitt Trigger', 'pt100':'PT100 RTD', 'reed_switch':'Reed Switch', "dc_shunt_motor":"DC Shunt Motor", "dc_series_motor":"DC Series Motor", "dc_compound_motor":"DC Compound Motor", "dc_generator":"DC Generator", "single_phase_induction_motor":"Single-Phase Induction Motor", "three_phase_induction_motor":"Three-Phase Induction Motor", "synchronous_motor":"Synchronous Motor", "alternator":"Alternator / Synchronous Generator", "universal_motor":"Universal Motor", "stepper_motor":"Stepper Motor", "step_up_transformer":"Step-Up Transformer", "auto_transformer":"Auto Transformer", "isolation_transformer":"Isolation Transformer", "current_transformer_ct":"Current Transformer (CT)", "potential_transformer_pt":"Potential Transformer (PT)", "ammeter":"Ammeter", "voltmeter":"Voltmeter", "wattmeter":"Wattmeter", "energy_meter":"Energy Meter", "megger":"Megger / Insulation Tester", "earth_tester":"Earth Resistance Tester", "lcr_meter":"LCR Meter", "power_factor_meter":"Power Factor Meter", "mccb":"Moulded Case Circuit Breaker (MCCB)", "rccb":"Residual Current Circuit Breaker (RCCB)", "elcb":"Earth Leakage Circuit Breaker (ELCB)", "rcbo":"RCBO", "isolator":"Isolator / Disconnect Switch", "hrc_fuse":"HRC Fuse", "spd":"Surge Protection Device (SPD)", "phase_monitor_relay":"Phase Failure / Sequence Relay", "timer_relay":"Timer Relay", "star_delta_timer":"Star-Delta Timer", "auxiliary_contactor":"Auxiliary Contactor", "control_relay":"Control Relay", "limit_switch":"Limit Switch", "variable_dc_supply":"Variable DC Power Supply", "ac_variac":"Variac / Variable AC Supply", "ups":"UPS (Uninterruptible Power Supply)", "inverter":"DC-AC Inverter"};
       if (extra[id]) return base(`${wire(55,110,175,110)}<rect x=175 y=55 width=170 height=110 rx=16 fill="#111827" stroke="#94a3b8" stroke-width=5 filter="url(#shadow)"/><text x=260 y=118 fill="#f8fafc" font-size=18 text-anchor="middle" font-family="ui-monospace,monospace">${extra[id]}</text>${wire(345,110,465,110)}${pin(55,110)}${pin(465,110)}${label(260,195,extra[id])}`, extra[id]);
        default: return base(`<rect x="150" y="55" width="220" height="110" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="5"/><text x="260" y="120" fill="#22d3ee" font-size="24" text-anchor="middle">${id}</text>`,'Component');
      }
    }

    const builderAddMap = Object.freeze({
      resistor:'resistor', potentiometer:'potentiometer', capacitor:'capacitor', electrolytic_cap:'electrolytic_cap',
      inductor:'inductor', ldr:'ldr', thermistor:'thermistor', thermistor_ptc:'thermistor_ptc', hall_sensor:'hall_sensor',
      led:'led', diode_1n4007:'diode', bjt_npn:'bjt_npn', bjt_pnp:'bjt_pnp', mosfet_n:'mosfet_n',
      zener_diode:'zener_diode', schottky_diode:'schottky_diode', p_mosfet:'p_mosfet', scr:'scr', triac:'triac', diac:'diac',
      ic_741:'ic_741', reg_7805:'reg_7805', schmitt_trigger:'schmitt_trigger', push_button:'push_button', dpdt_switch:'dpdt_switch',
      reed_switch:'reed_switch', ac_source:'ac_source', lamp:'lamp', incandescent_bulb:'incandescent_bulb', relay:'relay', switch_spst:'switch', fuse:'fuse',
      mcb:'mcb', olr:'olr', mov_varistor:'mov_varistor', bat_9v:'bat_9v', transformer:'transformer', bridge_rectifier:'bridge_rectifier',
      ir_sensor:'ir_sensor', thermocouple:'thermocouple', pt100:'pt100', dc_motor:'dc_motor', buzzer:'buzzer'
    });
    const nonCircuitTools = new Set(['multimeter','oscilloscope_probe','clamp_meter','microcontroller','timer_555','op_amp','contactor']);


    // Central Component Registry — single capability source for the active component database.
    const ComponentRegistry = (() => {
      const fullySimulated = new Set([
        'resistor','potentiometer','capacitor','inductor','ldr','thermistor','thermistor_ptc',
        'led','diode_1n4007','push_button','dpdt_switch','reed_switch','switch_spst','fuse',
        'ac_source','lamp','relay','bridge_rectifier','buzzer','mcb','pt100'
      ]);
      const partialSimulation = new Set([
        'bjt_npn','bjt_pnp','mosfet_n','p_mosfet','zener_diode','schottky_diode',
        'electrolytic_cap','dc_motor','bat_9v','incandescent_bulb'
      ]);
      const industrialIds = new Set(['contactor','olr','mcb','mccb','rccb','elcb','rcbo','isolator','star_delta_timer','timer_relay','phase_monitor_relay','auxiliary_contactor','control_relay','limit_switch']);
      const instrumentIds = new Set(['multimeter','oscilloscope_probe','clamp_meter','ammeter','voltmeter','wattmeter','energy_meter','megger','earth_tester','lcr_meter','power_factor_meter']);
      const registry = new Map();
      componentsDatabase.forEach(component => {
        const id = component.id;
        const builder = Object.prototype.hasOwnProperty.call(builderAddMap, id);
        const dedicated = nonCircuitTools.has(id);
        const simulation = fullySimulated.has(id) ? 'full' : (partialSimulation.has(id) ? 'partial' : 'none');
        const industrialLab = industrialIds.has(id);
        const instrumentLab = instrumentIds.has(id);
        // Phase 3 — one authoritative functional classification per component.
        // Priority is intentional: a working simulation wins over secondary lab metadata;
        // otherwise a Builder component is classified as partial/builder-only.
        const functionalGroup = simulation === 'full' ? 'fully-functional'
          : builder ? 'builder-partial'
          : (industrialLab || instrumentLab || dedicated) ? 'dedicated-lab'
          : 'documentation-only';
        registry.set(id, Object.freeze({
          id,
          display: true,
          builder,
          simulation,
          industrialLab,
          instrumentLab,
          documentation: true,
          dedicatedLab: dedicated,
          functionalGroup,
          category: component.cat
        }));
      });
      return registry;
    })();
    window.ComponentRegistry = ComponentRegistry;
    window.getComponentCapability = (id) => ComponentRegistry.get(id) || null;
    window.getComponentCapabilitySummary = () => {
      const summary = { total: 0, builder: 0, full: 0, partial: 0, none: 0, industrialLab: 0, instrumentLab: 0, dedicatedLab: 0, documentationOnly: 0, classifications: { 'fully-functional': 0, 'builder-partial': 0, 'dedicated-lab': 0, 'documentation-only': 0 } };
      ComponentRegistry.forEach(cap => {
        summary.total++;
        if (cap.builder) summary.builder++;
        if (cap.simulation === 'full') summary.full++;
        else if (cap.simulation === 'partial') summary.partial++;
        else summary.none++;
        if (cap.industrialLab) summary.industrialLab++;
        if (cap.instrumentLab) summary.instrumentLab++;
        if (cap.dedicatedLab) summary.dedicatedLab++;
        if (cap.functionalGroup === 'documentation-only') summary.documentationOnly++;
        summary.classifications[cap.functionalGroup]++;
      });
      return Object.freeze({ ...summary, classifications: Object.freeze({ ...summary.classifications }) });
    };
    window.getComponentsByFunctionalGroup = (group) => Object.freeze(
      Array.from(ComponentRegistry.values()).filter(cap => cap.functionalGroup === group)
    );

    // Phase 4B — dedicated-lab routing. A capability badge must not claim a lab exists
    // without a real action. Only routes backed by an implemented UI are exposed as actions.
    // Phase 4C — dedicated tool audit. Do not expose a generic Industrial Lab button
    // for every component merely because it has industrial metadata. Only components whose
    // current Industrial Lab exercises actually cover their behavior get a launcher.
    const implementedIndustrialLabComponents = new Set([
      'contactor', 'auxiliary_contactor', 'control_relay', 'star_delta_timer', 'timer_relay'
    ]);
    function getDedicatedLabAction(id, cap){
      if (!cap) return null;
      if (implementedIndustrialLabComponents.has(id)) return { kind: 'industrial', label: 'Open Industrial Lab', labelHi: 'इंडस्ट्रियल लैब खोलें' };
      if (id === 'multimeter') return { kind: 'multimeter', label: 'Open Multimeter', labelHi: 'मल्टीमीटर खोलें' };
      if (id === 'oscilloscope_probe') return { kind: 'oscilloscope', label: 'Open Oscilloscope', labelHi: 'ऑसिलोस्कोप खोलें' };
      return null;
    }
    window.openDedicatedLabForComponent = function(id){
      const cap = window.getComponentCapability ? window.getComponentCapability(id) : null;
      const action = getDedicatedLabAction(id, cap);
      if (!action) return false;
      if (action.kind === 'industrial') { showSection('industrial'); return true; }
      if (action.kind === 'multimeter') { if (typeof window.elabOpenLearningTool === 'function') window.elabOpenLearningTool('multimeter'); return true; }
      if (action.kind === 'oscilloscope') { if (typeof window.elabOpenLearningTool === 'function') window.elabOpenLearningTool('oscilloscope'); return true; }
      return false;
    };

    function addCurrentComponentToBuilder(){
      if(!currentSelectedComp) return;
      const dbId=currentSelectedComp.id;
      const builderType=builderAddMap[dbId];
      const hint=document.getElementById('modal-builder-hint');
      if(!builderType){
        if(hint) hint.textContent=nonCircuitTools.has(dbId) ? 'Lab/advanced tool — use its dedicated lab model.' : 'This component is currently documentation-only.';
        return;
      }
      if(typeof addBuilderComp!=='function'){ if(hint) hint.textContent='Circuit Builder is unavailable.'; return; }
      addBuilderComp(builderType);
      closeCompModal();
      document.getElementById('builder-canvas')?.scrollIntoView({behavior:'smooth',block:'center'});
      const st=document.getElementById('builder-status-text');
      if(st) st.textContent=`Added ${currentSelectedComp.name} to Circuit Builder.`;
    }

    let currentSelectedComp = null;
    function openCompModal(id) {
      safeSound('click');
      const c = componentsDatabase.find(x => x.id === id);
      if (!c) return;
      currentSelectedComp = localizedComponent(c);
      document.getElementById('modal-cat').innerText = currentSelectedComp.cat;
      document.getElementById('modal-name').innerText = currentSelectedComp.name;
      document.getElementById('modal-principle').innerText = currentSelectedComp.principle;
      document.getElementById('modal-terminals').innerText = currentSelectedComp.terminals;
      document.getElementById('modal-ratings').innerText = currentSelectedComp.ratings;
      document.getElementById('modal-mistakes').innerText = currentSelectedComp.mistakes;
      const addBtn=document.getElementById('modal-add-builder-btn');
      const addHint=document.getElementById('modal-builder-hint');
      const modalCap = window.getComponentCapability ? window.getComponentCapability(currentSelectedComp.id) : null;
      const modalAction = getDedicatedLabAction(currentSelectedComp.id, modalCap);
      if(addBtn){
        if (builderAddMap[currentSelectedComp.id]) {
          addBtn.disabled=false; addBtn.onclick=addCurrentComponentToBuilder; addBtn.textContent='Add to Builder';
          addBtn.classList.remove('opacity-40','cursor-not-allowed');
        } else if (modalAction) {
          addBtn.disabled=false; addBtn.onclick=() => openDedicatedLabForComponent(currentSelectedComp.id); addBtn.textContent=modalAction.label;
          addBtn.classList.remove('opacity-40','cursor-not-allowed');
        } else {
          addBtn.disabled=true; addBtn.onclick=null; addBtn.textContent='Add to Builder';
          addBtn.classList.add('opacity-40','cursor-not-allowed');
        }
      }
      if(addHint) addHint.textContent=builderAddMap[currentSelectedComp.id] ? 'Adds a new component to the sandbox.' : (modalAction ? 'Opens the implemented dedicated lab/tool for this component.' : (modalCap && (modalCap.industrialLab || modalCap.instrumentLab || modalCap.dedicatedLab) ? 'Dedicated-lab classification exists, but this specific tool has no implemented launcher yet.' : 'Documentation view only.'));
      setModalVisualView('real');
      document.getElementById('comp-modal').classList.remove('hidden');
      trackProgress(5);
    }

    function setModalVisualView(viewType) {
      safeSound('click');
      if (!currentSelectedComp) return;
      ['real', 'symbol', 'wiring'].forEach(v => {
        const btn = document.getElementById(`tab-view-${v}`);
        btn.className = "px-3 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-bold font-mono";
      });
      document.getElementById(`tab-view-${viewType}`).className = "px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-bold font-mono";

      const area = document.getElementById('modal-visual-area');
      if (viewType === 'real') {
        let visual = '';
        try { visual = componentReal2D(currentSelectedComp.id) || ''; } catch (err) { visual = ''; }
        if (!visual || !visual.includes('<svg')) {
          visual = `<div class="el-real2d-wrap"><svg class="el-real2d-svg" viewBox="0 0 520 220" role="img" aria-label="${currentSelectedComp.name}"><rect x="70" y="55" width="380" height="110" rx="18" fill="#1e293b" stroke="#22d3ee" stroke-width="5"/><circle cx="95" cy="110" r="6" fill="#22d3ee"/><circle cx="425" cy="110" r="6" fill="#22d3ee"/><text x="260" y="105" fill="#f8fafc" font-size="22" text-anchor="middle" font-family="Arial,sans-serif">${currentSelectedComp.name}</text><text x="260" y="135" fill="#67e8f9" font-size="14" text-anchor="middle" font-family="ui-monospace,monospace">REAL COMPONENT • 2D VIEW</text></svg></div>`;
        }
        area.innerHTML = visual;
      }
      if (viewType === 'symbol') area.innerHTML = currentSelectedComp.symbolVisual || '<div class="text-cyan-400 font-mono">Schematic Symbol</div>';
      if (viewType === 'wiring') area.innerHTML = currentSelectedComp.wiringVisual || '<div class="text-cyan-400 font-mono">Pinout View</div>';
    }

    function closeCompModal() {
      safeSound('click');
      document.getElementById('comp-modal').classList.add('hidden');
    }

    // Symbols Library
    const symbolsDatabase = [
      { name: "DC Battery", code: "──[ + | - ]──", desc: "DC Direct Voltage Source" },
      { name: "Resistor", code: "──/\\/\\/\\──", desc: "Fixed Resistance (IEEE)" },
      { name: "Capacitor", code: "──| |──", desc: "Non-polarized Capacitor" },
      { name: "Diode", code: "──|>|──", desc: "One-way Rectifier Junction" },
      { name: "LED", code: "──|>|── ⇗⇗", desc: "Light Emitting Diode" },
      { name: "Inductor", code: "──०००० ──", desc: "Coil / Choke" },
      { name: "Fuse", code: "──[≈]──", desc: "Overcurrent Protection" },
      { name: "Ground", code: "──⏚", desc: "Earth / Chassis Reference" },
      { name: "AND Gate", code: "──[ & ]──", desc: "Logic AND Gate" },
      { name: "OR Gate", code: "──[ ≥1 ]──", desc: "Logic OR Gate" },
      { name: "NOT Gate", code: "──[ 1 ]o──", desc: "Logic Inverter" },
      { name: "Relay Coil", code: "[ COIL ]⊸", desc: "Electromagnetic Switch" }
    ];

    function renderSymbols() {
      const grid = document.getElementById('symbols-grid');
      if (!grid) return;
      grid.innerHTML = symbolsDatabase.map(s => `
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center flex flex-col justify-between">
          <div class="py-4 font-mono text-cyan-400 font-bold text-sm tracking-widest bg-slate-950 rounded border border-slate-800/80 mb-2">${s.code}</div>
          <div>
            <h5 class="text-xs font-bold text-white">${s.name}</h5>
            <p class="text-[10px] text-slate-400 mt-1">${s.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // -------------------------------------------------------------
    // CIRCUIT BUILDER v5.55 FINAL TOUCH-OPTIMIZED DRAG & DROP ENGINE
    // -------------------------------------------------------------
    let builderCanvasComps = [];
    let builderWires = [];

    // Authoritative Builder state bridge. Keep the real lexical state private
    // while exposing controlled access for Diagram -> Builder handoff code.
    window.NilSparkLabBuilderState = {
      get components(){ return builderCanvasComps; },
      get wires(){ return builderWires; },
      replace: function(components, wires){
        builderCanvasComps = Array.isArray(components) ? components : [];
        builderWires = Array.isArray(wires) ? wires : [];
        activeWireStart = null;
      },
      setComponents: function(components){
        builderCanvasComps = Array.isArray(components) ? components : [];
      },
      setWires: function(wires){
        builderWires = Array.isArray(wires) ? wires : [];
        activeWireStart = null;
      },
      addComponent: function(component){
        if(component && typeof component === 'object') builderCanvasComps = builderCanvasComps.concat([component]);
        return component || null;
      },
      addWires: function(wires){
        if(Array.isArray(wires) && wires.length) builderWires = builderWires.concat(wires);
        activeWireStart = null;
        return builderWires;
      },
      removeWire: function(wireId){
        builderWires = builderWires.filter(function(w){ return w && w.id !== wireId; });
        activeWireStart = null;
      },
      removeComponent: function(id){
        builderCanvasComps = builderCanvasComps.filter(function(c){ return c && c.id !== id; });
        builderWires = builderWires.filter(function(w){ return w && w.from && w.to && w.from.compId !== id && w.to.compId !== id; });
        activeWireStart = null;
      },
      clear: function(){
        builderCanvasComps = [];
        builderWires = [];
        activeWireStart = null;
      },
      render: function(){ renderBuilderCanvas(); }
    };
    let activeWireStart = null;
    let currentWireColor = '#22d3ee';
    let dmmMode = 'V';
    let activeEditingCompId = null;
    let isSimRunning = false;
    let wireRoutingMode = 'curved';
    let undoStack = [];
    let redoStack = [];
    // v5.55 simulation telemetry: calculated per-component DC values for the
    // active path. The solver remains an educational DC approximation, but
    // now reports voltage drop and power instead of only a single total value.
    let simulationTelemetry = new Map();
    let simulationDirection = 'forward';

    function saveStateForUndo() {
      const state = JSON.stringify({ components: builderCanvasComps, wires: builderWires, view: globalComponentView });
      undoStack.push(state);
      if (undoStack.length > 20) undoStack.shift();
      redoStack = [];
    }

    function undoAction() {
      if (undoStack.length === 0) return;
      safeSound('click');
      redoStack.push(JSON.stringify({ components: builderCanvasComps, wires: builderWires, view: globalComponentView }));
      const prevState = JSON.parse(undoStack.pop());
      window.NilSparkLabBuilderState.replace(prevState.components || [], prevState.wires || []);
      if (prevState.view === 'real' || prevState.view === 'symbol') globalComponentView = prevState.view;
      renderBuilderCanvas();
      const viewBtn = document.getElementById('elab-v577-view-toggle');
      if (viewBtn) viewBtn.innerHTML = globalComponentView === 'symbol'
        ? '<span>🔧</span> Real Connection'
        : '<span>⚡</span> Circuit Symbol';
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
    }

    function redoAction() {
      if (redoStack.length === 0) return;
      safeSound('click');
      undoStack.push(JSON.stringify({ components: builderCanvasComps, wires: builderWires, view: globalComponentView }));
      const nextState = JSON.parse(redoStack.pop());
      window.NilSparkLabBuilderState.replace(nextState.components || [], nextState.wires || []);
      if (nextState.view === 'real' || nextState.view === 'symbol') globalComponentView = nextState.view;
      renderBuilderCanvas();
      const viewBtn = document.getElementById('elab-v577-view-toggle');
      if (viewBtn) viewBtn.innerHTML = globalComponentView === 'symbol'
        ? '<span>🔧</span> Real Connection'
        : '<span>⚡</span> Circuit Symbol';
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
    }

    function toggleWireRouting() {
      safeSound('click');
      wireRoutingMode = wireRoutingMode === 'curved' ? 'orthogonal' : 'curved';
      const modeText = document.getElementById('wire-mode-text');
      const modeButton = document.getElementById('btn-wire-mode');
      const curved = wireRoutingMode === 'curved';
      if (modeText) modeText.innerText = curved ? 'Curved' : '90°';
      if (modeButton) {
        modeButton.setAttribute('aria-pressed', curved ? 'true' : 'false');
        modeButton.title = curved ? 'Wire routing: Curved' : 'Wire routing: 90°';
      }
      drawWires();
    }

    // FIX: accept event explicitly here too
    function setWireColor(color, evt) {
      safeSound('click');
      currentWireColor = color;
      document.querySelectorAll('#wire-color-picker button').forEach(btn => {
        btn.classList.remove('border-white', 'ring-2', 'ring-cyan-500/50');
        if (btn.getAttribute('data-color') === color) {
          btn.classList.add('border-white', 'ring-2', 'ring-cyan-500/50');
        }
      });
    }

    function addBuilderComp(type, customProps = {}) {
      if (builderCanvasComps.length >= 200) {
        const st = document.getElementById('builder-status-text');
        if (st) st.textContent = '⚠ Security limit: maximum 200 components per circuit.';
        return;
      }
      if (typeof type !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(type)) return;
      saveStateForUndo();
      safeSound('click');

      const canvas = document.getElementById('builder-canvas');
      const rect = canvas.getBoundingClientRect();

      const col = builderCanvasComps.length % 2;
      const row = Math.floor(builderCanvasComps.length / 2) % 3;

      const rawX = 20 + col * 160;
      const rawY = 20 + row * 130;
      const posX = Math.max(10, Math.min(rect.width - 178, Math.round(rawX / 20) * 20));
      const posY = Math.max(10, Math.min(rect.height - 110, Math.round(rawY / 20) * 20));

      const compMap = {
        battery: { name: "9V Battery", terminals: ["+ (Pos)", "- (Gnd)"], type: "source", v: 9 },
        resistor: { name: "Resistor", terminals: ["T1", "T2"], type: "resistor", r: 470, powerRating: 0.25 },
        potentiometer: { name: "Pot (10k)", terminals: ["Pin 1", "Wiper", "Pin 3"], type: "potentiometer", r: 5000, maxR: 10000, wiperPos: 50 },
        ldr: { name: "LDR Sensor", terminals: ["Lead 1", "Lead 2"], type: "ldr", lux: 50, r: 5000 },
        capacitor: { name: "100µF Capacitor", terminals: ["+", "-"], type: "capacitor", c: 100, voltageRating: 25, charged: false },
        inductor: { name: "10mH Inductor", terminals: ["L1", "L2"], type: "inductor", l: 10, r: 0.5 },
        led: { name: "Red LED", terminals: ["Anode (+)", "Cathode (-)"], type: "led", vf: 2.0, color: "Red", isOn: false },
        diode: { name: "1N4007 Diode", terminals: ["Anode (+)", "Cathode (-)"], type: "diode", vf: 0.7 },
        bjt_npn: { name: "NPN Transistor", terminals: ["C", "B", "E"], type: "bjt_npn", beta: 100, vbe: 0.7, isOn: false },
        switch: { name: "SPST Switch", terminals: ["In", "Out"], type: "switch", closed: true },
        relay: { name: "Relay Coil", terminals: ["Coil+", "Coil-"], type: "relay", coilR: 120, energized: false },
        gate_and: { name: "AND Gate", terminals: ["In A", "In B", "OUT"], type: "logic_gate", gateType: "AND" },
        gate_or: { name: "OR Gate", terminals: ["In A", "In B", "OUT"], type: "logic_gate", gateType: "OR" },
        gate_not: { name: "NOT Gate", terminals: ["IN", "OUT"], type: "logic_gate", gateType: "NOT" },
        gate_nand: { name: "NAND Gate", terminals: ["In A", "In B", "OUT"], type: "logic_gate", gateType: "NAND" },
        gate_nor: { name: "NOR Gate", terminals: ["In A", "In B", "OUT"], type: "logic_gate", gateType: "NOR" },
        gate_xor: { name: "XOR Gate", terminals: ["In A", "In B", "OUT"], type: "logic_gate", gateType: "XOR" },
        logic_in: { name: "Logic Switch", terminals: ["OUT"], type: "logic_input", state: 0 },
        motor: { name: "DC Motor", terminals: ["M+", "M-"], type: "motor", r: 50, isSpinning: false },
        buzzer: { name: "Buzzer", terminals: ["+", "-"], type: "buzzer", r: 100, isOn: false },
        fuse: { name: "Fuse", terminals: ["In", "Out"], type: "fuse", r: 0.1, ratedA: 1, blown: false },
        zener_diode: { name: "Zener Diode", terminals: ["Anode (+)", "Cathode (-)"], type: "diode", vf: 0.7, deviceKind: "zener", zenerV: 5.1 },
        schottky_diode: { name: "Schottky Diode", terminals: ["Anode (+)", "Cathode (-)"], type: "diode", vf: 0.3, deviceKind: "schottky" },
        p_mosfet: { name: "P-Channel MOSFET", terminals: ["Gate (G)", "Drain (D)", "Source (S)"], type: "p_mosfet", isOn: false },
        scr: { name: "SCR / Thyristor", terminals: ["Anode (A)", "Cathode (K)", "Gate (G)"], type: "scr", isOn: false },
        triac: { name: "TRIAC", terminals: ["MT1", "MT2", "Gate"], type: "triac", isOn: false },
        diac: { name: "DIAC", terminals: ["A1", "A2"], type: "diac", vf: 1.0 },
        ic_741: { name: "µA741 Op-Amp", terminals: ["V+", "V-", "IN+", "IN-", "OUT"], type: "ic_741" },
        reg_7805: { name: "7805 Regulator", terminals: ["IN", "GND", "OUT"], type: "reg_7805", vout: 5 },
        schmitt_trigger: { name: "Schmitt Trigger", terminals: ["VCC", "GND", "IN", "OUT"], type: "schmitt_trigger", state: 0 },
        thermistor_ptc: { name: "PTC Thermistor", terminals: ["Lead 1", "Lead 2"], type: "thermistor_ptc", r: 10000, temperature: 25 },
        ir_sensor: { name: "IR Sensor", terminals: ["VCC", "GND", "OUT"], type: "ir_sensor", state: 0 },
        thermocouple: { name: "Thermocouple", terminals: ["Lead +", "Lead -"], type: "thermocouple", mv: 0 },
        pt100: { name: "PT100 RTD", terminals: ["Lead 1", "Lead 2"], type: "pt100", r: 100, temperature: 25 },
        push_button: { name: "Push Button", terminals: ["In", "Out"], type: "push_button", closed: false },
        dpdt_switch: { name: "DPDT Switch", terminals: ["COM1", "NO1", "NC1", "COM2", "NO2", "NC2"], type: "dpdt_switch", position: 0 },
        reed_switch: { name: "Reed Switch", terminals: ["In", "Out"], type: "reed_switch", closed: false },
        ac_source: { name: "AC Source", terminals: ["L", "N"], type: "ac_source", v: 230, frequency: 50 },
        bridge_rectifier: { name: "Bridge Rectifier", terminals: ["AC1", "AC2", "DC+", "DC-"], type: "bridge_rectifier", vf: 0.7, ratedA: 2, ratedV: 400 },
        lamp: { name: "Indicator Lamp", terminals: ["In", "Out"], type: "lamp", r: 2300, power: 10, isOn: false },
        electrolytic_cap: { name: "Electrolytic Capacitor", terminals: ["+ (Anode)", "- (Cathode)"], type: "capacitor", c: 470, voltageRating: 25, charged: false, polarized: true },
        thermistor: { name: "NTC Thermistor", terminals: ["Lead 1", "Lead 2"], type: "thermistor", r: 10000, temperature: 25 },
        hall_sensor: { name: "Hall Effect Sensor", terminals: ["VCC", "GND", "OUT"], type: "hall_sensor", state: 0 },
        bjt_pnp: { name: "PNP Transistor", terminals: ["C", "B", "E"], type: "bjt_pnp", beta: 100, vbe: 0.7, isOn: false },
        mosfet_n: { name: "N-Channel MOSFET", terminals: ["Gate (G)", "Drain (D)", "Source (S)"], type: "mosfet_n", vth: 3.0, rdsOn: 0.05, isOn: false },
        op_amp: { name: "LM358 Op-Amp", terminals: ["V+", "V-", "IN+", "IN-", "OUT"], type: "op_amp" },
        timer_555: { name: "555 Timer IC", terminals: ["GND", "TRIG", "OUT", "RESET", "CTRL", "THR", "DIS", "VCC"], type: "timer_555" },
        microcontroller: { name: "ATmega328P Microcontroller", terminals: ["VCC", "GND", "RESET", "I/O"], type: "microcontroller" },
        contactor: { name: "3-Phase Contactor", terminals: ["A1", "A2", "L1", "L2", "L3", "T1", "T2", "T3"], type: "contactor" },
        mcb: { name: "MCB", terminals: ["Line In", "Load Out"], type: "mcb", tripped: false, closed: true },
        olr: { name: "Thermal Overload Relay", terminals: ["L1", "L2", "L3", "T1", "T2", "T3", "95-96"], type: "olr", tripped: false },
        mov_varistor: { name: "MOV Varistor", terminals: ["Lead 1", "Lead 2"], type: "mov_varistor", r: 100000 },
        bat_9v: { name: "9V Alkaline Battery", terminals: ["+ (Pos)", "- (Gnd)"], type: "source", v: 9 },
        transformer: { name: "Step-Down Transformer", terminals: ["Pri L", "Pri N", "Sec +", "Sec -"], type: "transformer", ratio: 230/12 },
        dc_motor: { name: "DC Motor", terminals: ["M+", "M-"], type: "motor", r: 50, isSpinning: false },
        incandescent_bulb: { name: "Incandescent Bulb", terminals: ["In", "Out"], type: "lamp", r: 2300, power: 60, isOn: false }
      };

      // Phase 4 safety: never create a malformed builder component for an unknown mapping.
      if (!compMap[type]) {
        const st = document.getElementById('builder-status-text');
        if (st) st.textContent = `⚠ Unsupported builder component: ${type}`;
        return;
      }

      // Security + state-integrity hardening: custom properties may come from
      // Assistant/diagram handoff code, so they must never be allowed to overwrite
      // identity/type/schema fields or inject non-primitive values into Builder state.
      const blockedPropKeys = new Set(['id','type','terminals','viewMode']);
      const safeProps = {};
      if (customProps && typeof customProps === 'object' && !Array.isArray(customProps)) {
        Object.keys(customProps).forEach((key) => {
          if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key) || blockedPropKeys.has(key)) return;
          const value = customProps[key];
          if (typeof value === 'string') safeProps[key] = value.replace(/[\u0000-\u001F<>\"'`]/g, '').slice(0, 240);
          else if (typeof value === 'number' && Number.isFinite(value)) safeProps[key] = value;
          else if (typeof value === 'boolean' || value === null) safeProps[key] = value;
        });
      }

      let newId;
      do {
        newId = 'c_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      } while (builderCanvasComps.some((c) => c && c.id === newId));

      const newComp = {
        id: newId,
        x: posX,
        y: posY,
        rotation: 0,
        viewMode: globalComponentView,
        ...compMap[type],
        ...safeProps
      };
      // Identity and structural fields always come from the canonical component map.
      newComp.type = compMap[type].type;
      newComp.terminals = compMap[type].terminals.slice();
      newComp.id = newId;
      newComp.x = Number.isFinite(newComp.x) ? Math.max(0, Math.min(Math.max(0, rect.width - 178), newComp.x)) : posX;
      newComp.y = Number.isFinite(newComp.y) ? Math.max(0, Math.min(Math.max(0, rect.height - 110), newComp.y)) : posY;
      newComp.rotation = Number.isFinite(newComp.rotation) ? ((newComp.rotation % 360) + 360) % 360 : 0;
      newComp.viewMode = globalComponentView;

      window.NilSparkLabBuilderState.addComponent(newComp);
      renderBuilderCanvas();
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
    }

    function toggleCanvasSwitch(id, event) {
      if (event) event.stopPropagation();
      saveStateForUndo();
      safeSound('click');
      const comp = builderCanvasComps.find(c => c.id === id);
      if (comp && ['switch','push_button','reed_switch'].includes(comp.type)) {
        comp.closed = !comp.closed;
        renderBuilderCanvas();
        if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
      }
    }

    function toggleLogicInput(id, event) {
      if (event) event.stopPropagation();
      saveStateForUndo();
      safeSound('click');
      const comp = builderCanvasComps.find(c => c.id === id);
      if (comp && comp.type === 'logic_input') {
        comp.state = comp.state ? 0 : 1;
        renderBuilderCanvas();
        if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
      }
    }

    function rotateComponent(id, event) {
      if (event) event.stopPropagation();
      saveStateForUndo();
      safeSound('click');
      const comp = builderCanvasComps.find(c => c.id === id);
      if (comp) {
        comp.rotation = ((comp.rotation || 0) + 90) % 360;
        renderBuilderCanvas();
      }
    }

    function handlePotSliderChange(id, val) {
      const comp = builderCanvasComps.find(c => c.id === id);
      if (comp && comp.type === 'potentiometer') {
        comp.wiperPos = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
        comp.r = Math.max(0.01, Number(((comp.wiperPos / 100) * (comp.maxR || 10000)).toFixed(2)));
        const label = document.getElementById(`pot-lbl-${id}`);
        if (label) label.innerText = `${comp.r}Ω / ${comp.maxR || 10000}Ω`;
        if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
      }
    }


    function v514Svg(c){
      const t = c.type;
      const n = String(c.name || t);
      const live = !!(c.isOn || c.isSpinning || c.energized || c.closed || c.state===1);
      const ledColor =
        c.color==='Green' ? '#22c55e' :
        c.color==='Blue' ? '#3b82f6' :
        c.color==='White' ? '#f8fafc' :
        c.color==='Yellow' ? '#facc15' : '#ef4444';

      const esc = (v) => String(v ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
      const text = esc(n.length > 16 ? n.slice(0,16) : n);
      const pin2 = `<circle cx="8" cy="41" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/>`;
      const leads2 = `<line x1="8" y1="41" x2="45" y2="41" class="el-v515-lead"/><line x1="125" y1="41" x2="162" y2="41" class="el-v515-lead"/>`;
      const label = (v) => `<text x="85" y="78" text-anchor="middle" class="el-v514-label">${esc(v)}</text>`;
      const svg = (body) => `<svg class="el-v514-svg el-v515-physical" viewBox="0 0 170 82">${body}</svg>`;

      // 1. Carbon-film resistor
      if(t==='resistor'){
        const r = c.r || 470;
        return svg(`${leads2}
          <rect x="43" y="27" width="84" height="28" rx="9" fill="#d9b77d" stroke="#8b6b3e" stroke-width="1.5"/>
          <rect x="59" y="27" width="5" height="28" fill="#7c2d12"/>
          <rect x="76" y="27" width="5" height="28" fill="#111827"/>
          <rect x="93" y="27" width="5" height="28" fill="#dc2626"/>
          <rect x="110" y="27" width="5" height="28" fill="#f59e0b"/>
          <path d="M48 30 Q84 20 122 30" fill="none" stroke="#f8fafc" opacity=".35" stroke-width="2"/>
          ${pin2}${label(`${r}Ω • 1/4W`)}`);
      }

      // 2. Potentiometer — real knob + three terminals
      if(t==='potentiometer'){
        return svg(`
          <line x1="8" y1="41" x2="45" y2="41" class="el-v515-lead"/>
          <line x1="125" y1="41" x2="162" y2="41" class="el-v515-lead"/>
          <line x1="85" y1="10" x2="85" y2="23" class="el-v515-lead"/>
          <rect x="48" y="28" width="74" height="27" rx="6" fill="#374151" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="85" cy="41" r="19" fill="#64748b" stroke="#dbeafe" stroke-width="2"/>
          <circle cx="85" cy="41" r="13" fill="#1f2937"/>
          <line x1="85" y1="41" x2="85" y2="30" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="85" cy="10" r="4.5" class="el-v515-pin"/>
          <circle cx="8" cy="41" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/>
          ${label(`10kΩ POT • ${Math.round(c.wiperPos ?? 50)}%`)}`);
      }

      // 3. LDR photoresistor
      if(t==='ldr'){
        return svg(`${leads2}
          <rect x="48" y="27" width="74" height="28" rx="6" fill="#d6b98c" stroke="#7c5a32" stroke-width="1.5"/>
          <path d="M58 34 H112 M58 41 H112 M58 48 H112" stroke="#111827" stroke-width="3"/>
          <path d="M66 18 l8 8 M80 16 l8 10 M94 18 l8 8" stroke="#facc15" stroke-width="2.5"/>
          ${pin2}${label(`LDR • ${c.r || 5000}Ω`)}`);
      }

      // 4. LED
      if(t==='led'){
        return svg(`${leads2}
          <path d="M55 41 L65 27 H105 Q115 27 115 41 Q115 55 105 55 H65 Z" fill="${live?ledColor:'#991b1b'}" stroke="#dbeafe" stroke-width="1.5"/>
          <path d="M65 29 Q85 12 105 29" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>
          <line x1="88" y1="55" x2="88" y2="66" class="el-v515-metal" stroke-width="3"/>
          <line x1="96" y1="55" x2="96" y2="69" class="el-v515-metal" stroke-width="3"/>
          <path d="M121 25 l11 -9 M129 31 l11 -9" stroke="${live?ledColor:'#64748b'}" stroke-width="2.5"/>
          ${pin2}${label(`${c.color || 'Red'} LED • ${c.vf || 2.0}V`)}`);
      }

      // 5/9/10. Diode family: ordinary, Zener and Schottky
      if(t==='diode'){
        const z = /zener/i.test(n), sh = /schottky/i.test(n);
        const band = z ? '#facc15' : sh ? '#e5e7eb' : '#cbd5e1';
        return svg(`${leads2}
          <rect x="47" y="28" width="76" height="26" rx="13" fill="#111827" stroke="#9ca3af" stroke-width="1.5"/>
          <rect x="105" y="28" width="7" height="26" fill="${band}"/>
          ${z ? '<path d="M105 31 l-4 5 M112 47 l4 5" stroke="#facc15" stroke-width="2"/>' : ''}
          ${sh ? '<path d="M112 33 l-5 5 M112 49 l-5 -5" stroke="#e5e7eb" stroke-width="2"/>' : ''}
          ${pin2}${label(z?'Zener 5.1V':sh?'Schottky • 0.3V':'1N4007 • 0.7V')}`);
      }

      // 5B. Real bridge rectifier module — four external terminals
      // AC1 / AC2 are the ~ inputs; DC+ / DC- are the rectified output.
      if(t==='bridge_rectifier'){
        return svg(`
          <line x1="8" y1="24" x2="44" y2="24" class="el-v515-lead"/>
          <line x1="8" y1="58" x2="44" y2="58" class="el-v515-lead"/>
          <line x1="126" y1="24" x2="162" y2="24" class="el-v515-lead"/>
          <line x1="126" y1="58" x2="162" y2="58" class="el-v515-lead"/>
          <rect x="44" y="13" width="82" height="56" rx="8" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <path d="M85 20 L111 41 L85 62 L59 41 Z" fill="#1f2937" stroke="#22d3ee" stroke-width="1.8"/>
          <path d="M68 41 L77 32 L86 41 L95 32" fill="none" stroke="#e2e8f0" stroke-width="2"/>
          <path d="M68 41 L77 50 L86 41 L95 50" fill="none" stroke="#e2e8f0" stroke-width="2"/>
          <text x="85" y="45" text-anchor="middle" fill="#67e8f9" font-size="7" font-weight="900">BR</text>
          <text x="51" y="22" fill="#facc15" font-size="7" font-weight="900">~</text>
          <text x="51" y="63" fill="#facc15" font-size="7" font-weight="900">~</text>
          <text x="116" y="22" fill="#22c55e" font-size="7" font-weight="900">+</text>
          <text x="116" y="63" fill="#94a3b8" font-size="7" font-weight="900">−</text>
          <circle cx="8" cy="24" r="5" class="el-v515-pin"/>
          <circle cx="8" cy="58" r="5" class="el-v515-pin"/>
          <circle cx="162" cy="24" r="5" class="el-v515-pin"/>
          <circle cx="162" cy="58" r="5" class="el-v515-pin"/>
          ${label(`BRIDGE • ${c.ratedA || 2}A / ${c.ratedV || 400}V`)}`);
      }

      // 6. SPST switch
      if(t==='switch'){
        return svg(`${leads2}
          <circle cx="48" cy="41" r="6" fill="#d1d5db" stroke="#475569" stroke-width="2"/>
          <circle cx="122" cy="41" r="6" fill="#d1d5db" stroke="#475569" stroke-width="2"/>
          <line x1="48" y1="41" x2="${c.closed?122:83}" y2="${c.closed?41:19}" stroke="${c.closed?'#34d399':'#94a3b8'}" stroke-width="6" stroke-linecap="round"/>
          ${pin2}${label(`SPST • ${c.closed?'ON':'OFF'}`)}`);
      }

      // 7. DC motor
      if(t==='motor'){
        return svg(`${leads2}
          <circle cx="85" cy="41" r="29" fill="#4b5563" stroke="#dbeafe" stroke-width="2"/>
          <circle cx="85" cy="41" r="21" fill="#111827" stroke="#64748b" stroke-width="2"/>
          <text x="85" y="48" text-anchor="middle" fill="#e2e8f0" font-size="19" font-weight="900">M</text>
          <line x1="85" y1="14" x2="85" y2="7" stroke="#94a3b8" stroke-width="3"/>
          ${pin2}${label(`DC MOTOR • ${c.isSpinning?'RUN':'STOP'}`)}`);
      }

      // 8. Capacitors — ceramic or electrolytic
      if(t==='capacitor'){
        const polarized = (c.voltageRating || 25) >= 16 || /electro/i.test(n);
        if(polarized){
          return svg(`${leads2}
            <rect x="55" y="18" width="60" height="46" rx="12" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
            <path d="M70 20 V62" stroke="#334155" stroke-width="3"/>
            <path d="M101 20 V62" stroke="#334155" stroke-width="3"/>
            <text x="104" y="29" fill="#f8fafc" font-size="11" font-weight="900">+</text>
            ${pin2}${label(`${c.c || 100}µF • ${c.voltageRating || 25}V`)}`);
        }
        return svg(`${leads2}
          <path d="M55 26 Q85 18 115 26 L115 56 Q85 64 55 56 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
          <text x="85" y="45" text-anchor="middle" fill="#334155" font-size="10" font-weight="900">CERAMIC</text>
          ${pin2}${label(`${c.c || 100}nF`)}`);
      }

      // 11. Inductor coil
      if(t==='inductor'){
        return svg(`${leads2}
          <path d="M42 41 C42 18 54 18 54 41 C54 18 66 18 66 41 C66 18 78 18 78 41 C78 18 90 18 90 41 C90 18 102 18 102 41 C102 18 114 18 114 41" fill="none" stroke="#d6a85f" stroke-width="5"/>
          <path d="M42 36 C58 28 96 28 114 36" fill="none" stroke="#f8fafc" opacity=".25" stroke-width="2"/>
          ${pin2}${label(`${c.l || 10}mH INDUCTOR`)}`);
      }

      // 12. Relay
      if(t==='relay'){
        return svg(`${leads2}
          <rect x="45" y="15" width="80" height="51" rx="7" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
          <path d="M58 48 q7 -22 14 0 q7 22 14 0 q7 -22 14 0" fill="none" stroke="#d6a85f" stroke-width="3"/>
          <path d="M103 23 V39 M103 39 L116 31 M116 31 V48" fill="none" stroke="#e2e8f0" stroke-width="2"/>
          <text x="85" y="29" text-anchor="middle" fill="#67e8f9" font-size="8" font-weight="900">RELAY</text>
          ${pin2}${label(`COIL • ${c.energized?'ENERGIZED':'OFF'}`)}`);
      }

      // 13. Buzzer
      if(t==='buzzer'){
        return svg(`${leads2}
          <path d="M48 27 H68 L82 17 V65 L68 55 H48 Z" fill="#475569" stroke="#cbd5e1" stroke-width="1.7"/>
          <circle cx="104" cy="41" r="18" fill="#111827" stroke="#64748b" stroke-width="2"/>
          <path d="M94 41 Q104 28 114 41 Q104 54 94 41" fill="none" stroke="#e2e8f0" stroke-width="2"/>
          <path d="M119 28 Q133 41 119 54" fill="none" stroke="#facc15" stroke-width="2.5"/>
          ${pin2}${label(`BUZZER • ${c.isOn?'ON':'OFF'}`)}`);
      }

      // 14. Fuse
      if(t==='fuse'){
        return svg(`${leads2}
          <rect x="43" y="27" width="84" height="28" rx="14" fill="rgba(226,232,240,.15)" stroke="#cbd5e1" stroke-width="2"/>
          <path d="M55 41 Q64 27 73 41 Q82 55 91 41 Q100 27 109 41" fill="none" stroke="${c.blown?'#ef4444':'#f59e0b'}" stroke-width="2.5"/>
          ${pin2}${label(`FUSE • ${c.blown?'BLOWN':(c.ratedA||1)+'A'}`)}`);
      }

      // 15. NPN transistor — TO-92 package
      if(t==='bjt_npn'){
        return svg(`
          <line x1="8" y1="41" x2="61" y2="41" class="el-v515-lead"/>
          <path d="M61 29 Q85 17 109 29 L109 53 Q85 65 61 53 Z" fill="#111827" stroke="#cbd5e1" stroke-width="2"/>
          <text x="85" y="47" text-anchor="middle" fill="#e2e8f0" font-size="9" font-weight="900">NPN</text>
          <line x1="73" y1="53" x2="66" y2="70" class="el-v515-metal" stroke-width="3"/>
          <line x1="85" y1="53" x2="85" y2="72" class="el-v515-metal" stroke-width="3"/>
          <line x1="97" y1="53" x2="104" y2="70" class="el-v515-metal" stroke-width="3"/>
          <line x1="109" y1="29" x2="162" y2="18" class="el-v515-lead"/>
          <line x1="109" y1="53" x2="162" y2="64" class="el-v515-lead"/>
          <circle cx="8" cy="41" r="5" class="el-v515-pin"/><circle cx="162" cy="18" r="5" class="el-v515-pin"/><circle cx="162" cy="64" r="5" class="el-v515-pin"/>
          ${label(`NPN • β ${c.beta || 100}`)}`);
      }

      // 16. P-MOSFET — TO-220 style
      if(t==='p_mosfet'){
        return svg(`
          <line x1="8" y1="41" x2="48" y2="41" class="el-v515-lead"/>
          <rect x="48" y="18" width="74" height="46" rx="6" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <rect x="57" y="24" width="56" height="34" rx="4" fill="#1f2937"/>
          <text x="85" y="44" text-anchor="middle" fill="#e2e8f0" font-size="9" font-weight="900">P-MOSFET</text>
          <line x1="122" y1="27" x2="162" y2="18" class="el-v515-lead"/><line x1="122" y1="41" x2="162" y2="41" class="el-v515-lead"/><line x1="122" y1="55" x2="162" y2="64" class="el-v515-lead"/>
          <circle cx="8" cy="41" r="5" class="el-v515-pin"/><circle cx="162" cy="18" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/><circle cx="162" cy="64" r="5" class="el-v515-pin"/>
          ${label('G • D • S')}`);
      }

      // 17. SCR
      if(t==='scr'){
        return svg(`
          <line x1="8" y1="41" x2="54" y2="41" class="el-v515-lead"/><line x1="116" y1="41" x2="162" y2="41" class="el-v515-lead"/>
          <path d="M57 22 L57 60 L99 41 Z" fill="#111827" stroke="#e2e8f0" stroke-width="2"/>
          <line x1="101" y1="22" x2="101" y2="60" stroke="#f8fafc" stroke-width="3"/>
          <line x1="78" y1="60" x2="78" y2="72" class="el-v515-metal" stroke-width="3"/>
          <circle cx="8" cy="41" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/><circle cx="78" cy="72" r="5" class="el-v515-pin"/>
          ${label('SCR / THYRISTOR')}`);
      }

      // 18. TRIAC
      if(t==='triac'){
        return svg(`
          <line x1="8" y1="29" x2="55" y2="29" class="el-v515-lead"/><line x1="8" y1="53" x2="55" y2="53" class="el-v515-lead"/><line x1="115" y1="41" x2="162" y2="41" class="el-v515-lead"/>
          <path d="M55 20 L55 62 M55 29 L103 41 L55 53" fill="none" stroke="#e2e8f0" stroke-width="3"/>
          <line x1="84" y1="53" x2="84" y2="70" class="el-v515-metal" stroke-width="3"/>
          <circle cx="8" cy="29" r="5" class="el-v515-pin"/><circle cx="8" cy="53" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/><circle cx="84" cy="70" r="5" class="el-v515-pin"/>
          ${label('TRIAC')}`);
      }

      // 19. DIAC
      if(t==='diac'){
        return svg(`${leads2}
          <polygon points="60,41 77,27 77,55" fill="#111827" stroke="#e2e8f0" stroke-width="2"/>
          <polygon points="110,41 93,27 93,55" fill="#111827" stroke="#e2e8f0" stroke-width="2"/>
          ${pin2}${label('DIAC • BIDIRECTIONAL')}`);
      }

      // 20. 741 op-amp DIP
      if(t==='ic_741' || t==='op_amp_741'){
        return svg(`
          <rect x="48" y="17" width="74" height="48" rx="5" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <path d="M79 17 V12 H91 V17" fill="none" stroke="#94a3b8" stroke-width="2"/>
          <text x="85" y="37" text-anchor="middle" fill="#67e8f9" font-size="8" font-weight="900">µA741</text>
          <text x="85" y="50" text-anchor="middle" fill="#94a3b8" font-size="7">OP-AMP</text>
          <line x1="8" y1="27" x2="48" y2="27" class="el-v515-lead"/><line x1="8" y1="55" x2="48" y2="55" class="el-v515-lead"/>
          <line x1="122" y1="27" x2="162" y2="27" class="el-v515-lead"/><line x1="122" y1="55" x2="162" y2="55" class="el-v515-lead"/>
          <circle cx="8" cy="27" r="5" class="el-v515-pin"/><circle cx="8" cy="55" r="5" class="el-v515-pin"/><circle cx="162" cy="27" r="5" class="el-v515-pin"/><circle cx="162" cy="55" r="5" class="el-v515-pin"/>
          ${label('DIP • 741')}`);
      }

      // 21. 7805 regulator TO-220
      if(t==='reg_7805'){
        return svg(`
          <path d="M56 17 H114 Q121 17 121 24 V59 Q121 65 114 65 H56 Q49 65 49 58 V24 Q49 17 56 17Z" fill="#111827" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="49" y="17" width="72" height="10" fill="#475569"/><text x="85" y="49" text-anchor="middle" fill="#67e8f9" font-size="10" font-weight="900">7805</text>
          <line x1="8" y1="30" x2="49" y2="30" class="el-v515-lead"/><line x1="85" y1="65" x2="85" y2="76" class="el-v515-lead"/><line x1="121" y1="30" x2="162" y2="30" class="el-v515-lead"/>
          <circle cx="8" cy="30" r="5" class="el-v515-pin"/><circle cx="85" cy="76" r="5" class="el-v515-pin"/><circle cx="162" cy="30" r="5" class="el-v515-pin"/>
          ${label('5V REGULATOR')}`);
      }

      // 22/35. PTC thermistor
      if(t==='thermistor_ptc'){
        return svg(`${leads2}
          <rect x="48" y="27" width="74" height="28" rx="8" fill="#d9b77d" stroke="#8b6b3e" stroke-width="1.5"/>
          <path d="M58 48 L70 34 L82 48 L94 34 L106 48 L118 34" fill="none" stroke="#111827" stroke-width="3"/>
          <text x="85" y="22" text-anchor="middle" fill="#facc15" font-size="8" font-weight="900">PTC</text>
          ${pin2}${label(`${c.r || 10000}Ω`)}`);
      }

      // 23. Push button
      if(t==='push_button'){
        return svg(`${leads2}
          <rect x="52" y="34" width="66" height="18" rx="5" fill="#374151" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="85" cy="34" r="13" fill="${c.closed?'#22c55e':'#ef4444'}" stroke="#e2e8f0" stroke-width="2"/>
          <rect x="81" y="21" width="8" height="13" fill="#94a3b8"/>
          ${pin2}${label(`PUSH BUTTON • ${c.closed?'ON':'OFF'}`)}`);
      }

      // 24. DPDT switch — six terminals
      if(t==='dpdt_switch'){
        return svg(`
          <line x1="8" y1="25" x2="45" y2="25" class="el-v515-lead"/><line x1="8" y1="57" x2="45" y2="57" class="el-v515-lead"/>
          <line x1="125" y1="25" x2="162" y2="25" class="el-v515-lead"/><line x1="125" y1="57" x2="162" y2="57" class="el-v515-lead"/>
          <circle cx="85" cy="41" r="6" fill="#cbd5e1"/>
          <line x1="85" y1="41" x2="45" y2="${c.position===1?25:57}" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
          <line x1="85" y1="41" x2="125" y2="${c.position===1?25:57}" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
          <circle cx="8" cy="25" r="5" class="el-v515-pin"/><circle cx="8" cy="57" r="5" class="el-v515-pin"/>
          <circle cx="162" cy="25" r="5" class="el-v515-pin"/><circle cx="162" cy="57" r="5" class="el-v515-pin"/>
          <circle cx="85" cy="41" r="5" class="el-v515-pin"/>
          ${label('DPDT SWITCH')}`);
      }

      // 25. AC source
      if(t==='ac_source'){
        return svg(`${leads2}
          <rect x="55" y="18" width="60" height="46" rx="8" fill="#111827" stroke="#cbd5e1" stroke-width="2"/>
          <circle cx="85" cy="41" r="15" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
          <path d="M73 41 Q79 31 85 41 Q91 51 97 41" fill="none" stroke="#f59e0b" stroke-width="2"/>
          ${pin2}${label(`AC ${c.v || 230}V • ${c.frequency || 50}Hz`)}`);
      }

      // 26. Indicator lamp
      if(t==='lamp'){
        return svg(`${leads2}
          <circle cx="85" cy="41" r="25" fill="${live?'#fde047':'#374151'}" stroke="#f8fafc" stroke-width="2"/>
          <path d="M72 34 Q85 48 98 34 M75 49 Q85 41 95 49" fill="none" stroke="${live?'#92400e':'#cbd5e1'}" stroke-width="3"/>
          <line x1="72" y1="63" x2="98" y2="63" stroke="#94a3b8" stroke-width="3"/>
          ${pin2}${label(`LAMP • ${c.power || 10}W`)}`);
      }

      // 27. IR sensor module
      if(t==='ir_sensor'){
        return svg(`
          <rect x="47" y="19" width="76" height="44" rx="7" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <circle cx="70" cy="41" r="12" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
          <circle cx="70" cy="41" r="5" fill="#ef4444" opacity=".7"/>
          <rect x="88" y="29" width="20" height="6" rx="2" fill="#22d3ee"/><rect x="88" y="40" width="20" height="6" rx="2" fill="#475569"/>
          <line x1="8" y1="29" x2="47" y2="29" class="el-v515-lead"/><line x1="8" y1="53" x2="47" y2="53" class="el-v515-lead"/><line x1="123" y1="41" x2="162" y2="41" class="el-v515-lead"/>
          <circle cx="8" cy="29" r="5" class="el-v515-pin"/><circle cx="8" cy="53" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/>
          ${label(`IR SENSOR • ${c.state?'DETECTED':'CLEAR'}`)}`);
      }

      // 28. Thermocouple probe
      if(t==='thermocouple'){
        return svg(`${leads2}
          <path d="M55 27 H112 Q122 27 122 41 Q122 55 112 55 H55" fill="none" stroke="#94a3b8" stroke-width="7"/>
          <path d="M58 41 H112" stroke="#f59e0b" stroke-width="3"/>
          <circle cx="112" cy="41" r="6" fill="#f59e0b"/>
          ${pin2}${label(`THERMOCOUPLE • ${c.temp || 25}°C`)}`);
      }

      // 29. Schmitt trigger DIP/module
      if(t==='schmitt_trigger'){
        return svg(`
          <rect x="50" y="17" width="70" height="48" rx="6" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <path d="M67 32 H92 L102 41 L92 50 H67" fill="none" stroke="#22d3ee" stroke-width="2"/>
          <text x="85" y="28" text-anchor="middle" fill="#67e8f9" font-size="7" font-weight="900">SCHMITT</text>
          <line x1="8" y1="24" x2="50" y2="24" class="el-v515-lead"/><line x1="8" y1="58" x2="50" y2="58" class="el-v515-lead"/>
          <line x1="120" y1="41" x2="162" y2="41" class="el-v515-lead"/>
          <circle cx="8" cy="24" r="5" class="el-v515-pin"/><circle cx="8" cy="58" r="5" class="el-v515-pin"/><circle cx="162" cy="41" r="5" class="el-v515-pin"/>
          ${label('TRIGGER INPUT')}`);
      }

      // 30. PT100 RTD
      if(t==='pt100'){
        return svg(`${leads2}
          <rect x="50" y="29" width="70" height="24" rx="6" fill="#e5e7eb" stroke="#64748b" stroke-width="1.5"/>
          <path d="M60 41 H68 L74 31 L80 51 L86 31 L92 51 L98 41 H110" fill="none" stroke="#dc2626" stroke-width="2"/>
          ${pin2}${label(`PT100 RTD • ${c.r || 100}Ω`)}`);
      }

      // 31. Reed switch
      if(t==='reed_switch'){
        return svg(`${leads2}
          <rect x="48" y="29" width="74" height="24" rx="12" fill="rgba(226,232,240,.12)" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="63" y1="41" x2="${c.closed?85:79}" y2="41" stroke="#e2e8f0" stroke-width="3"/>
          <line x1="107" y1="41" x2="${c.closed?85:91}" y2="41" stroke="#e2e8f0" stroke-width="3"/>
          <circle cx="85" cy="41" r="5" fill="${c.closed?'#22c55e':'#64748b'}"/>
          ${pin2}${label(`REED • ${c.closed?'CLOSED':'OPEN'}`)}`);
      }

      // 32-37. Logic gate family
      if(t==='logic_gate'){
        const g = String(c.gateType || 'AND').toUpperCase();
        let shape = '';
        if(g==='OR' || g==='XOR' || g==='NOR'){
          shape = `<path d="M52 20 Q76 20 84 41 Q76 62 52 62 Q69 41 52 20Z" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>`;
          if(g==='XOR') shape += `<path d="M46 20 Q61 41 46 62" fill="none" stroke="#22d3ee" stroke-width="2"/>`;
          if(g==='NOR') shape += `<circle cx="89" cy="41" r="4" fill="#111827" stroke="#e2e8f0" stroke-width="1.5"/>`;
          shape += `<line x1="84" y1="41" x2="126" y2="41" class="el-v515-lead"/>`;
        } else if(g==='NOT'){
          shape = `<path d="M52 20 L103 41 L52 62 Z" fill="#334155" stroke="#cbd5e1" stroke-width="2"/><circle cx="108" cy="41" r="4" fill="#111827" stroke="#e2e8f0" stroke-width="1.5"/><line x1="112" y1="41" x2="162" y2="41" class="el-v515-lead"/>`;
        } else {
          shape = `<path d="M52 20 H75 Q120 20 120 41 Q120 62 75 62 H52 Q70 41 52 20Z" fill="#334155" stroke="#cbd5e1" stroke-width="2"/><line x1="120" y1="41" x2="162" y2="41" class="el-v515-lead"/>`;
        }
        const inputs = g==='NOT'
          ? `<line x1="8" y1="41" x2="52" y2="41" class="el-v515-lead"/><circle cx="8" cy="41" r="5" class="el-v515-pin"/>`
          : `<line x1="8" y1="29" x2="52" y2="29" class="el-v515-lead"/><line x1="8" y1="53" x2="52" y2="53" class="el-v515-lead"/><circle cx="8" cy="29" r="5" class="el-v515-pin"/><circle cx="8" cy="53" r="5" class="el-v515-pin"/>`;
        return svg(`${inputs}${shape}<circle cx="162" cy="41" r="5" class="el-v515-pin"/><text x="84" y="46" text-anchor="middle" fill="#e2e8f0" font-size="8" font-weight="900">${esc(g)}</text>`);
      }

      // 38. Logic switch / input
      if(t==='logic_input'){
        return svg(`
          <rect x="52" y="23" width="66" height="36" rx="8" fill="#111827" stroke="#94a3b8" stroke-width="2"/>
          <circle cx="85" cy="41" r="14" fill="${c.state?'#22c55e':'#475569'}" stroke="#e2e8f0" stroke-width="2"/>
          <text x="85" y="46" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">${c.state?'1':'0'}</text>
          <line x1="118" y1="41" x2="162" y2="41" class="el-v515-lead"/>
          <circle cx="162" cy="41" r="5" class="el-v515-pin"/>
          ${label(`LOGIC SWITCH • ${c.state?'HIGH':'LOW'}`)}`);
      }

      // Safe realistic fallback for any future component not yet specialized.
      return svg(`${leads2}
        <rect x="46" y="23" width="78" height="35" rx="7" fill="#334155" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="54" y="30" width="62" height="20" rx="4" fill="#111827"/>
        <text x="85" y="44" text-anchor="middle" fill="#e2e8f0" font-size="8" font-weight="900">${text}</text>
        ${pin2}${label(text)}`);
    }


    function getVisualTerminalLayout(c){
      const t = c.type;
      if(t==='logic_gate') return c.gateType==='NOT'
        ? [{term:'IN',x:8,y:41},{term:'OUT',x:162,y:41}]
        : [{term:'In A',x:8,y:29},{term:'In B',x:8,y:53},{term:'OUT',x:162,y:41}];
      if(t==='logic_input') return [{term:'OUT',x:162,y:41}];
      if(t==='bjt_npn') return [{term:'C',x:162,y:18},{term:'B',x:8,y:41},{term:'E',x:162,y:64}];
      if(t==='p_mosfet') return [{term:'Gate (G)',x:8,y:41},{term:'Drain (D)',x:162,y:18},{term:'Source (S)',x:162,y:64}];
      if(t==='scr') return [{term:'Anode (A)',x:8,y:29},{term:'Cathode (K)',x:162,y:29},{term:'Gate (G)',x:85,y:66}];
      if(t==='triac') return [{term:'MT1',x:8,y:29},{term:'MT2',x:8,y:53},{term:'Gate',x:85,y:66}];
      if(t==='ic_741') return [{term:'V+',x:8,y:18},{term:'V-',x:8,y:64},{term:'IN+',x:8,y:34},{term:'IN-',x:8,y:48},{term:'OUT',x:162,y:41}];
      if(t==='reg_7805') return [{term:'IN',x:8,y:30},{term:'GND',x:85,y:76},{term:'OUT',x:162,y:30}];
      if(t==='potentiometer') return [{term:'Pin 1',x:8,y:41},{term:'Wiper',x:85,y:76},{term:'Pin 3',x:162,y:41}];
      if(t==='bridge_rectifier') return [{term:'AC1',x:8,y:24},{term:'AC2',x:8,y:58},{term:'DC+',x:162,y:24},{term:'DC-',x:162,y:58}];
      if(t==='dpdt_switch') return [{term:'COM1',x:8,y:24},{term:'NO1',x:162,y:24},{term:'NC1',x:8,y:58},{term:'COM2',x:162,y:58},{term:'NO2',x:8,y:41},{term:'NC2',x:162,y:41}];
      if(t==='ir_sensor') return [{term:'VCC',x:8,y:22},{term:'GND',x:8,y:60},{term:'OUT',x:162,y:41}];
      if(t==='schmitt_trigger') return [{term:'VCC',x:8,y:22},{term:'GND',x:8,y:60},{term:'IN',x:8,y:41},{term:'OUT',x:162,y:41}];
      if(t==='source') return [{term:'+ (Pos)',x:8,y:41},{term:'- (Gnd)',x:162,y:41}];
      if(t==='ac_source') return [{term:'L',x:8,y:41},{term:'N',x:162,y:41}];
      const terms = Array.isArray(c.terminals) ? c.terminals : [];
      if(!terms.length) return [];
      if(terms.length===1) return [{term:terms[0],x:162,y:41}];
      if(terms.length===2) return [{term:terms[0],x:8,y:41},{term:terms[1],x:162,y:41}];
      const rows=Math.ceil(terms.length/2), top=16, bottom=66, step=rows>1?(bottom-top)/(rows-1):0;
      return terms.map((term,i)=>({term,x:i%2===0?8:162,y:Math.round(top+Math.floor(i/2)*step)}));
    }

    // v5.79 — Component View: Symbol <-> Real
    // The view is visual-only. Component IDs, terminal names and wire endpoints
    // remain unchanged, so switching views never breaks an existing connection.

    // v5.79 — Global Circuit View
    // One control switches the entire builder between Symbol and Real Connection view.
    let globalComponentView = 'symbol';

    function toggleGlobalComponentView(event) {
      if (event) event.stopPropagation();
      if (builderCanvasComps.length || builderWires.length) saveStateForUndo();
      globalComponentView = globalComponentView === 'symbol' ? 'real' : 'symbol';
      builderCanvasComps.forEach(c => { c.viewMode = globalComponentView; });
      renderBuilderCanvas();

      const btn = document.getElementById('elab-v577-view-toggle');
      if (btn) {
        btn.innerHTML = globalComponentView === 'symbol'
          ? '<span>🔧</span> Real Connection'
          : '<span>⚡</span> Circuit Symbol';
      }
      const st = document.getElementById('builder-status-text');
      if (st) {
        st.innerText = globalComponentView === 'symbol'
          ? 'Circuit Symbol view — tap Real Connection to see the complete real-component circuit.'
          : 'Real Connection view — the complete circuit is shown with real components.';
      }
    }

    function getComponentView(c) {
      return globalComponentView;
    }

    function symbolSvg(c) {
      const t = c.type;
      const val =
        t === 'resistor' ? `${c.r || 470}Ω` :
        t === 'source' ? `${c.v || 9}V` :
        t === 'capacitor' ? `${c.c || 100}µF` :
        t === 'inductor' ? `${c.l || 10}mH` :
        t === 'potentiometer' ? `${c.r || 5000}Ω` :
        t === 'led' ? 'LED' :
        t === 'diode' ? 'D' :
        t === 'motor' ? 'M' :
        t === 'switch' ? (c.closed ? 'ON' : 'OFF') :
        t === 'logic_gate' ? (c.gateType || 'AND') :
        t === 'logic_input' ? (c.state ? 'HIGH' : 'LOW') :
        t === 'lamp' ? 'LAMP' :
        t === 'fuse' ? 'FUSE' :
        String(c.name || t).slice(0, 12);

      const pin = `<circle cx="8" cy="41" r="4.5" class="el-v576-symbol-pin"/><circle cx="162" cy="41" r="4.5" class="el-v576-symbol-pin"/>`;
      const label = `<text x="85" y="76" text-anchor="middle" class="el-v576-symbol-label">${val}</text>`;

      if (t === 'resistor')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="42" y2="41" class="el-v576-wire"/><polyline points="42,41 50,29 62,53 74,29 86,53 98,29 110,53 122,41" class="el-v576-symbol-stroke"/><line x1="122" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
      if (t === 'led')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="55" y2="41" class="el-v576-wire"/><polygon points="55,25 55,57 91,41" class="el-v576-symbol-fill"/><line x1="96" y1="25" x2="96" y2="57" class="el-v576-symbol-stroke"/><line x1="96" y1="41" x2="162" y2="41" class="el-v576-wire"/><path d="M105 25 l12 -10 M113 31 l12 -10" class="el-v576-arrow"/>${pin}${label}</svg>`;
      if (t === 'diode')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="60" y2="41" class="el-v576-wire"/><polygon points="60,25 60,57 96,41" class="el-v576-symbol-fill"/><line x1="101" y1="25" x2="101" y2="57" class="el-v576-symbol-stroke"/><line x1="101" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
      if (t === 'capacitor')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="65" y2="41" class="el-v576-wire"/><line x1="65" y1="21" x2="65" y2="61" class="el-v576-symbol-stroke"/><line x1="105" y1="21" x2="105" y2="61" class="el-v576-symbol-stroke"/><line x1="105" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
      if (t === 'inductor')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="40" y2="41" class="el-v576-wire"/><path d="M40 41 C40 17 54 17 54 41 C54 17 68 17 68 41 C68 17 82 17 82 41 C82 17 96 17 96 41 C96 17 110 17 110 41" class="el-v576-symbol-stroke" fill="none"/><line x1="110" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
      if (t === 'source')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="65" y2="41" class="el-v576-wire"/><line x1="80" y1="22" x2="80" y2="60" class="el-v576-symbol-stroke"/><line x1="96" y1="30" x2="96" y2="52" class="el-v576-symbol-stroke"/><line x1="96" y1="41" x2="162" y2="41" class="el-v576-wire"/><text x="80" y="17" class="el-v576-pol">+</text><text x="94" y="67" class="el-v576-pol">−</text>${pin}${label}</svg>`;
      if (t === 'ac_source')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="48" y2="41" class="el-v576-wire"/><circle cx="85" cy="41" r="27" class="el-v576-symbol-circle"/><path d="M65 41 q10 -18 20 0 t20 0" fill="none" class="el-v576-symbol-stroke"/><line x1="112" y1="41" x2="162" y2="41" class="el-v576-wire"/><circle cx="8" cy="41" r="4.5" class="el-v576-symbol-pin"/><circle cx="162" cy="41" r="4.5" class="el-v576-symbol-pin"/><text x="85" y="76" text-anchor="middle" class="el-v576-symbol-label">AC ${c.v || 230}V · ${c.frequency || 50}Hz</text></svg>`;
      if (t === 'bridge_rectifier')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82">
          <line x1="8" y1="24" x2="48" y2="24" class="el-v576-wire"/>
          <line x1="8" y1="58" x2="48" y2="58" class="el-v576-wire"/>
          <line x1="122" y1="24" x2="162" y2="24" class="el-v576-wire"/>
          <line x1="122" y1="58" x2="162" y2="58" class="el-v576-wire"/>
          <path d="M85 14 L112 41 L85 68 L58 41 Z" class="el-v576-box"/>
          <path d="M69 41 L78 32 L87 41 L96 32" fill="none" class="el-v576-symbol-stroke"/>
          <path d="M69 41 L78 50 L87 41 L96 50" fill="none" class="el-v576-symbol-stroke"/>
          <text x="85" y="45" text-anchor="middle" class="el-v576-symbol-text">BR</text>
          <text x="85" y="10" text-anchor="middle" class="el-v576-symbol-label">~  ~</text>
          <text x="85" y="79" text-anchor="middle" class="el-v576-symbol-label">+   −</text>
          <circle cx="8" cy="24" r="4.5" class="el-v576-symbol-pin"/>
          <circle cx="8" cy="58" r="4.5" class="el-v576-symbol-pin"/>
          <circle cx="162" cy="24" r="4.5" class="el-v576-symbol-pin"/>
          <circle cx="162" cy="58" r="4.5" class="el-v576-symbol-pin"/>
        </svg>`;
      if (t === 'switch')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="58" y2="41" class="el-v576-wire"/><circle cx="58" cy="41" r="4" class="el-v576-symbol-fill"/><line x1="58" y1="41" x2="104" y2="${c.closed ? 41 : 24}" class="el-v576-symbol-stroke"/><circle cx="112" cy="41" r="4" class="el-v576-symbol-fill"/><line x1="112" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
      if (t === 'motor')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="58" y2="41" class="el-v576-wire"/><circle cx="85" cy="41" r="27" class="el-v576-symbol-circle"/><text x="85" y="47" text-anchor="middle" class="el-v576-symbol-text">M</text><line x1="112" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
      if (t === 'logic_gate')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="29" x2="48" y2="29" class="el-v576-wire"/><line x1="8" y1="53" x2="48" y2="53" class="el-v576-wire"/><path d="M48 20 Q90 20 116 41 Q90 62 48 62 Q66 41 48 20Z" class="el-v576-gate"/><line x1="116" y1="41" x2="162" y2="41" class="el-v576-wire"/><text x="78" y="46" text-anchor="middle" class="el-v576-symbol-text">${c.gateType || 'AND'}</text>${pin}${label}</svg>`;
      if (t === 'logic_input')
        return `<svg class="el-v576-svg" viewBox="0 0 170 82"><circle cx="72" cy="41" r="23" class="el-v576-symbol-circle"/><text x="72" y="46" text-anchor="middle" class="el-v576-symbol-text">${c.state ? '1' : '0'}</text><line x1="95" y1="41" x2="162" y2="41" class="el-v576-wire"/><circle cx="8" cy="41" r="4.5" class="el-v576-symbol-pin"/><text x="85" y="76" text-anchor="middle" class="el-v576-symbol-label">LOGIC</text></svg>`;

      // Generic IEC-style box for components without a dedicated symbol.
      return `<svg class="el-v576-svg" viewBox="0 0 170 82"><line x1="8" y1="41" x2="48" y2="41" class="el-v576-wire"/><rect x="48" y="22" width="74" height="38" rx="4" class="el-v576-box"/><text x="85" y="46" text-anchor="middle" class="el-v576-symbol-text">${String(c.name || t).slice(0, 13)}</text><line x1="122" y1="41" x2="162" y2="41" class="el-v576-wire"/>${pin}${label}</svg>`;
    }

    function componentVisualSvg(c) {
      return getComponentView(c) === 'symbol' ? symbolSvg(c) : v514Svg(c);
    }

    function renderBuilderCanvas() {
      const canvas = document.getElementById('builder-canvas');
      const emptyText = document.getElementById('canvas-empty-text');

      if (builderCanvasComps.length === 0) {
        if (emptyText) emptyText.classList.remove('hidden');
        document.querySelectorAll('.canvas-comp-card').forEach(e => e.remove());
        window.NilSparkLabBuilderState.setWires([]);
        drawWires();
        return;
      }

      if (emptyText) emptyText.classList.add('hidden');
      document.querySelectorAll('.canvas-comp-card').forEach(e => e.remove());

      builderCanvasComps.forEach(c => {
        c.viewMode = globalComponentView;
        const div = document.createElement('div');
        div.id = c.id;
        div.className = "canvas-comp-card el-comp-card-v514 draggable-card absolute z-20 transition-transform cursor-move";
        div.style.left = `${c.x}px`;
        div.style.top = `${c.y}px`;
        div.style.width = "178px";
        div.style.height = "106px";
        div.style.transform = `rotate(${c.rotation || 0}deg)`;
        // Keyboard accessibility (v11 hardening, Phase 3): make each placed component
        // reachable/operable via keyboard, in addition to the existing mouse/touch drag.
        div.tabIndex = 0;
        div.setAttribute('role', 'group');
        div.setAttribute('data-elab-kbd-movable', 'true');

        let valLabel = '';
        if (c.type === 'resistor') valLabel = `${c.r}Ω`;
        if (c.type === 'source') valLabel = `${c.v}V`;
        if (c.type === 'potentiometer') valLabel = `${c.r}Ω`;
        if (c.type === 'ldr') valLabel = `${c.r}Ω`;
        if (c.type === 'led') valLabel = `${c.color} · ${c.vf}Vf`;
        if (c.type === 'diode') valLabel = `${c.vf}Vf`;
        if (c.type === 'motor') valLabel = `${c.r}Ω`;
        if (c.type === 'switch') valLabel = c.closed ? 'ON' : 'OFF';
        if (c.type === 'logic_gate') valLabel = `${c.gateType}`;
        if (c.type === 'inductor') valLabel = `${c.l}mH`;
        if (c.type === 'relay') valLabel = c.energized ? 'ON' : 'OFF';
        if (c.type === 'buzzer') valLabel = c.isOn ? 'ON' : 'OFF';
        if (c.type === 'fuse') valLabel = c.blown ? 'BLOWN' : `${c.ratedA}A`;
        if (c.type === 'bjt_npn') valLabel = c.isOn ? 'ON' : 'OFF';
        if (c.type === 'bridge_rectifier') valLabel = `${c.ratedA || 2}A · ${c.ratedV || 400}V`;
        if (c.type === 'ac_source') valLabel = `${c.v || 230}V AC · ${c.frequency || 50}Hz`;
        if (c.type === 'capacitor') valLabel = `${c.c}µF`;
        if (c.type === 'thermistor_ptc') valLabel = `${c.r}Ω`;
        if (c.type === 'pt100') valLabel = `${c.r}Ω`;
        if (c.type === 'push_button') valLabel = c.closed ? 'ON' : 'OFF';
        if (c.type === 'reed_switch') valLabel = c.closed ? 'CLOSED' : 'OPEN';
        if (c.type === 'dpdt_switch') valLabel = `POS ${c.position ? 'B' : 'A'}`;
        if (c.type === 'lamp') valLabel = `${c.r || 2300}Ω`;
        if (c.type === 'thermistor') valLabel = `${c.r || 10000}Ω`;
        if (c.type === 'mcb') valLabel = c.tripped ? 'TRIPPED' : 'READY';
        if (c.type === 'olr') valLabel = c.tripped ? 'TRIPPED' : 'READY';
        if (c.type === 'mov_varistor') valLabel = 'SURGE CLAMP';

        div.setAttribute('aria-label', `${c.name}${valLabel ? ', ' + valLabel : ''}. Use arrow keys to move, R to rotate, Delete to remove.`);

        let visualResponse = `<div class="el-v514-stage el-integrated-component-stage relative" style="width:178px;height:86px;">${componentVisualSvg(c)}`;
        const layout = getVisualTerminalLayout(c);
        visualResponse += layout.map(p => `
          <button
            onclick="handleTerminalClick('${c.id}', '${p.term}', event)"
            class="terminal-btn el-integrated-terminal ${builderWires.some(w => (w.from.compId===c.id && w.from.term===p.term) || (w.to.compId===c.id && w.to.term===p.term)) ? 'connected' : ''}"
            data-comp="${c.id}"
            data-term="${p.term}"
            title="${p.term}"
            aria-label="${p.term}"
            style="left:${p.x}px;top:${p.y}px;"
          ></button>`).join('');
        visualResponse += `</div>`;

        let controls = '';
        if (c.type === 'switch' || c.type === 'push_button' || c.type === 'reed_switch') {
          controls = `<button onclick="toggleCanvasSwitch('${c.id}', event)" class="absolute right-1 bottom-0 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${c.closed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500' : 'bg-rose-500/20 text-rose-300 border border-rose-500'}">${c.closed ? 'ON' : 'OFF'}</button>`;
        } else if (c.type === 'dpdt_switch') {
          controls = `<button onclick="openEditModal('${c.id}', event)" class="absolute right-1 bottom-0 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-600">POS ${c.position ? 'B' : 'A'}</button>`;
        } else if (c.type === 'logic_input') {
          controls = `<button onclick="toggleLogicInput('${c.id}', event)" class="absolute right-1 bottom-0 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${c.state ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500' : 'bg-rose-500/20 text-rose-300 border border-rose-500'}">${c.state ? 'HIGH' : 'LOW'}</button>`;
        } else if (c.type === 'potentiometer') {
          controls = `<div class="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-1" onpointerdown="event.stopPropagation()"><input type="range" min="0" max="100" value="${Math.min(100, Math.max(0, c.wiperPos ?? 50))}" oninput="handlePotSliderChange('${c.id}', this.value)" class="w-16 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400" /><span id="pot-lbl-${c.id}" class="text-[7px] font-mono text-cyan-300">${c.r || 5000}Ω / ${c.maxR || 10000}Ω</span></div>`;
        }

        div.innerHTML = `
          <div class="absolute inset-x-0 top-0 flex items-center justify-between px-1 pointer-events-none z-30">
            <span class="text-[9px] font-bold text-cyan-300 font-mono truncate max-w-[120px] drop-shadow-md">${c.name}${valLabel ? ` · ${valLabel}` : ''}</span>
            <div class="flex items-center gap-0.5 pointer-events-auto">
              <button onclick="openEditModal('${c.id}', event)" class="text-slate-400 hover:text-cyan-300 text-xs px-1" title="Edit Value">⚙</button>
              <button onclick="rotateComponent('${c.id}', event)" class="text-slate-400 hover:text-cyan-300 text-xs px-1" title="Rotate 90°">↻</button>
              <button onclick="removeBuilderComp('${c.id}', event)" class="text-slate-400 hover:text-rose-400 text-xs px-1" title="Delete">✕</button>
            </div>
          </div>
          ${visualResponse}
          ${controls}
        `;

        makeDraggableMobile(div, c);

        // v104: direct Builder-card delete gestures with confirmation.
        // v103 repaired the gesture routing but accidentally removed the confirmation popup.
        // Keep the direct event binding, restore the confirmation flow, and fall back
        // to the native confirm dialog when the custom dialog module is unavailable.
        // Event delegation was fragile on touch devices because pointer capture
        // and SVG/button targets could prevent the document-level resolver from
        // seeing the same component. Binding directly to the freshly-rendered
        // card makes desktop double-click and mobile double-tap deterministic.
        let lastTapAt = 0;
        let lastTapX = 0;
        let lastTapY = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMoved = false;

        const deleteCardComponent = (event) => {
          if (event && (event.target.closest?.('button, input, .terminal-btn'))) return false;
          const id = div.id;
          if (!id || !builderCanvasComps.some(item => item && item.id === id)) return false;
          const nameEl = div.querySelector('.text-cyan-300');
          const name = nameEl ? nameEl.textContent.trim().split(' · ')[0] : id;
          const message = `Remove "${name}" from the circuit?`;
          const finish = (ok) => {
            if (!ok) return false;
            const removed = removeBuilderComp(id);
            if (removed) {
              const status = document.getElementById('builder-status-text');
              if (status) status.innerText = '✓ Component removed. Double-click/tap a component to remove it.';
            }
            return removed;
          };

          // Preferred: the app's accessible custom confirmation popup.
          if (window.NilSparkLabDialog && typeof window.NilSparkLabDialog.confirm === 'function') {
            window.NilSparkLabDialog.confirm(message, {
              title: 'Delete Component?',
              kicker: 'Circuit Builder',
              componentName: name,
              okText: 'REMOVE',
              cancelText: 'CANCEL',
              danger: true
            }).then(finish);
            return true;
          }

          // Never fall back to the browser-native confirm UI: it breaks the
          // NIL SparkLab visual system and can look like an unrelated page.
          // The dialog module is expected to be present because the app ships
          // its own self-contained dialog implementation. Fail closed if not.
          const status = document.getElementById('builder-status-text');
          if (status) status.innerText = '⚠ Confirmation dialog is unavailable. Please reload the lab.';
          return false;
        };

        div.addEventListener('dblclick', (event) => {
          if (event.target.closest?.('button, input, .terminal-btn')) return;
          event.preventDefault();
          event.stopPropagation();
          deleteCardComponent(event);
        });

        div.addEventListener('pointerdown', (event) => {
          if (event.pointerType !== 'touch') return;
          if (event.target.closest?.('button, input, .terminal-btn')) {
            touchMoved = true;
            lastTapAt = 0;
            return;
          }
          touchStartX = event.clientX;
          touchStartY = event.clientY;
          touchMoved = false;
        }, { passive: true });

        div.addEventListener('pointermove', (event) => {
          if (event.pointerType !== 'touch') return;
          if (Math.hypot(event.clientX - touchStartX, event.clientY - touchStartY) > 12) {
            touchMoved = true;
          }
        }, { passive: true });

        div.addEventListener('pointerup', (event) => {
          if (event.pointerType !== 'touch') return;
          if (touchMoved || event.target.closest?.('button, input, .terminal-btn')) {
            lastTapAt = 0;
            return;
          }

          const now = Date.now();
          const withinTime = now - lastTapAt <= 550;
          const withinDistance = Math.hypot(event.clientX - lastTapX, event.clientY - lastTapY) <= 28;

          if (withinTime && withinDistance) {
            lastTapAt = 0;
            event.preventDefault();
            event.stopPropagation();
            deleteCardComponent(event);
            return;
          }

          lastTapAt = now;
          lastTapX = event.clientX;
          lastTapY = event.clientY;
          setTimeout(() => {
            if (Date.now() - lastTapAt > 560) lastTapAt = 0;
          }, 570);
        }, { passive: false });

        canvas.appendChild(div);
      });

      drawWires();
    }

    // v5.55: keyboard/touch-safe wire cancellation. Escape or tapping empty canvas
    // cancels an in-progress connection without deleting components.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeWireStart) {
        cancelWireSelection();
        const st = document.getElementById('builder-status-text');
        if (st) st.innerText = 'Wire selection cancelled.';
      }
    });

    // v11 hardening, Phase 3: minimal keyboard-operable path for the Circuit Builder
    // canvas. Additive only — existing mouse/touch drag (makeDraggableMobile) and all
    // terminal-click wiring are unchanged. Tab reaches a placed component (tabIndex
    // set in renderBuilderCanvas); arrow keys nudge it; R rotates it; Delete/Backspace
    // removes it. Wire terminals were already real <button> elements and were already
    // natively keyboard-operable (Tab + Enter/Space); this does not change them.
    document.addEventListener('keydown', (e) => {
      const el = document.activeElement;
      if (!el || el.getAttribute('data-elab-kbd-movable') !== 'true') return;
      const id = el.id;
      const comp = (typeof builderCanvasComps !== 'undefined') ? builderCanvasComps.find(c => c.id === id) : null;
      if (!comp) return;

      const step = e.shiftKey ? 30 : 10;
      let handled = true;
      if (e.key === 'ArrowLeft') comp.x = Math.max(0, (comp.x || 0) - step);
      else if (e.key === 'ArrowRight') comp.x = (comp.x || 0) + step;
      else if (e.key === 'ArrowUp') comp.y = Math.max(0, (comp.y || 0) - step);
      else if (e.key === 'ArrowDown') comp.y = (comp.y || 0) + step;
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); rotateComponent(id, null); return; }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeBuilderComp(id); return; }
      else handled = false;

      if (handled) {
        e.preventDefault();
        renderBuilderCanvas();
        // renderBuilderCanvas() rebuilds every card element, so restore keyboard focus
        // to the same component instead of silently losing it to the document body.
        const restored = document.getElementById(id);
        if (restored) restored.focus();
        if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('builder-canvas');
      if (canvas) canvas.addEventListener('pointerdown', (e) => {
        if (e.target === canvas || e.target.id === 'canvas-empty-text' || e.target.id === 'builder-wire-svg') {
          if (activeWireStart) {
            cancelWireSelection();
            const st = document.getElementById('builder-status-text');
            if (st) st.innerText = 'Wire selection cancelled.';
          }
        }
      });
    });

    // Universal Pointer Drag & Drop for Mobile & Desktop
    function makeDraggableMobile(element, compData) {
      let isDragging = false;
      let startX = 0, startY = 0;

      element.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        isDragging = true;
        // FIX v5.55 FINAL: capture the PRE-DRAG state. The old code saved after
        // mutating the component, so Undo could not actually undo a move.
        saveStateForUndo();
        element.setPointerCapture(e.pointerId);

        startX = e.clientX - compData.x;
        startY = e.clientY - compData.y;
        element.classList.add('ring-2', 'ring-cyan-400', 'z-30');
      });

      element.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const canvas = document.getElementById('builder-canvas');
        const rect = canvas.getBoundingClientRect();

        const rawX = e.clientX - startX;
        const rawY = e.clientY - startY;

        compData.x = Math.max(10, Math.min(rect.width - 178, Math.round(rawX / 20) * 20));
        compData.y = Math.max(10, Math.min(rect.height - 100, Math.round(rawY / 20) * 20));

        element.style.left = `${compData.x}px`;
        element.style.top = `${compData.y}px`;
        drawWires();
      });

      const stopDrag = (e) => {
        if (isDragging) {
          isDragging = false;
          try { element.releasePointerCapture(e.pointerId); } catch(err){}
          element.classList.remove('ring-2', 'ring-cyan-400', 'z-30');
        }
      };

      element.addEventListener('pointerup', stopDrag);
      element.addEventListener('pointercancel', stopDrag);
    }

    function handleTerminalClick(compId, term, event) {
      if(event)event.stopPropagation();
      safeSound('click');
      const comp=builderCanvasComps.find(c=>c.id===compId);
      if(!comp||!Array.isArray(comp.terminals)||!comp.terminals.includes(term)){
        document.getElementById('builder-status-text').innerText='⚠ Invalid terminal. Refresh/restore the component before wiring.';cancelWireSelection();return;
      }
      if(!activeWireStart){activeWireStart={compId,term};document.querySelectorAll('.el-integrated-terminal.wire-anchor').forEach(el=>el.classList.remove('wire-anchor'));const anchor=document.querySelector(`.el-integrated-terminal[data-comp="${compId}"][data-term="${term}"]`);if(anchor)anchor.classList.add('wire-anchor');document.getElementById('builder-status-text').innerText=`Wire anchored at [${term}]. Tap destination terminal.`;return;}
      if(activeWireStart.compId===compId&&activeWireStart.term===term){cancelWireSelection();return;}
      const fromComp=builderCanvasComps.find(c=>c.id===activeWireStart.compId);
      if(!fromComp){cancelWireSelection();return;}
      if(fromComp.id===comp.id){document.getElementById('builder-status-text').innerText='⚠ Same-component connection is not allowed.';cancelWireSelection();return;}
      const duplicate=builderWires.some(w=>(w.from.compId===activeWireStart.compId&&w.from.term===activeWireStart.term&&w.to.compId===compId&&w.to.term===term)||(w.to.compId===activeWireStart.compId&&w.to.term===activeWireStart.term&&w.from.compId===compId&&w.from.term===term));
      if(duplicate){document.getElementById('builder-status-text').innerText='⚠ This exact connection already exists.';cancelWireSelection();return;}
      if(builderWires.length >= 400){document.getElementById('builder-status-text').innerText='⚠ Security limit: maximum 400 wires per circuit.';cancelWireSelection();return;}
      saveStateForUndo();window.NilSparkLabBuilderState.addWires([{id:'w_'+Date.now()+Math.floor(Math.random()*1000),color:currentWireColor,from:activeWireStart,to:{compId,term}}]);activeWireStart=null;document.querySelectorAll('.el-integrated-terminal.wire-anchor').forEach(el=>el.classList.remove('wire-anchor'));renderBuilderCanvas();document.getElementById('builder-status-text').innerText=`✓ Wire connected: [${comp.name||compId}] ${term}. Tap wire to delete.`;runSmartDiagnostics();if(isSimRunning)runBuilderSim();else resetVerificationDisplay();
    }

    function cancelWireSelection() {
      activeWireStart = null;
      document.querySelectorAll('.el-integrated-terminal.wire-anchor').forEach(el => el.classList.remove('wire-anchor'));
    }

    function clearBuilderWires() {
      if (!builderWires.length) {
        cancelWireSelection();
        document.getElementById('builder-status-text').innerText = 'No wires to clear.';
        return;
      }
      saveStateForUndo();
      safeSound('click');
      window.NilSparkLabBuilderState.setWires([]);
      cancelWireSelection();
      renderBuilderCanvas();
      document.getElementById('builder-status-text').innerText = 'All wires cleared. Components kept.';
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
    }

    // v6.00 — Clear entire circuit canvas with the same in-app confirmation UI
    // used by component deletion. The operation is fully undoable.
    function clearBuilderCanvas(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const componentCount = Array.isArray(builderCanvasComps) ? builderCanvasComps.length : 0;
      const wireCount = Array.isArray(builderWires) ? builderWires.length : 0;
      if (componentCount === 0 && wireCount === 0) {
        cancelWireSelection();
        const status = document.getElementById('builder-status-text');
        if (status) status.innerText = 'Canvas is already empty.';
        return false;
      }

      const finish = (confirmed) => {
        if (!confirmed) return false;
        saveStateForUndo();
        safeSound('click');
        window.NilSparkLabBuilderState.clear();
        cancelWireSelection();
        simulationTelemetry = new Map();
        isSimRunning = false;
        activeEditingCompId = null;
        if (typeof closeEditModal === 'function') closeEditModal();

        const root = document.documentElement;
        if (root) {
          root.dataset.circuitStatus = 'normal';
          root.dataset.overcurrent = 'false';
        }

        renderBuilderCanvas();
        const status = document.getElementById('builder-status-text');
        const stat = document.getElementById('builder-calc-stat');
        if (status) status.innerText = 'Canvas cleared. Ready to build a new circuit.';
        if (stat) stat.innerText = '';
        updateSmartFromSimulation(0, 0, 0, 'READY', 'Canvas cleared. Add components and connect them to build a new circuit.');
        updateDmmReading();
        return true;
      };

      const message = `This will remove ${componentCount} component${componentCount === 1 ? '' : 's'} and ${wireCount} wire${wireCount === 1 ? '' : 's'} from the canvas.`;
      if (window.NilSparkLabDialog && typeof window.NilSparkLabDialog.confirm === 'function') {
        window.NilSparkLabDialog.confirm(message, {
          title: 'Clear Entire Canvas?',
          kicker: 'Circuit Builder',
          componentName: `${componentCount} component${componentCount === 1 ? '' : 's'} · ${wireCount} wire${wireCount === 1 ? '' : 's'}`,
          okText: 'CLEAR EVERYTHING',
          cancelText: 'CANCEL',
          danger: true
        }).then(finish);
        return true;
      }

      // Never show a browser-native confirm fallback. Keep the interaction
      // consistent with the rest of NIL SparkLab and fail safely if the custom
      // dialog layer is unavailable.
      const dialogStatus = document.getElementById('builder-status-text');
      if (dialogStatus) dialogStatus.innerText = '⚠ Confirmation dialog is unavailable. Please reload the lab.';
      return false;
    }

    window.clearBuilderCanvas = clearBuilderCanvas;

    function getTerminalCenter(compId, term) {
      const btn = document.querySelector(`.terminal-btn[data-comp="${compId}"][data-term="${term}"]`);
      if (!btn) return { x: 0, y: 0 };
      const canvasRect = document.getElementById('builder-canvas').getBoundingClientRect();
      const rect = btn.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - canvasRect.left,
        y: rect.top + rect.height / 2 - canvasRect.top
      };
    }

    function drawWires() {
      const svgLayer = document.getElementById('builder-wire-svg');
      if (!svgLayer) return;

      const battery = builderCanvasComps.find(c => c.type === 'source');
      const vText = battery ? `${battery.v.toFixed(1)}V` : '0V';

      svgLayer.innerHTML = `
        <defs>
          <filter id="wire-glow-builder" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      ` + builderWires.map(w => {
        const p1 = getTerminalCenter(w.from.compId, w.from.term);
        const p2 = getTerminalCenter(w.to.compId, w.to.term);

        let pathData = '';
        if (wireRoutingMode === 'orthogonal') {
          const midX = (p1.x + p2.x) / 2;
          pathData = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
        } else {
          const dx = Math.abs(p2.x - p1.x) * 0.5;
          pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
        }

        return `
          <g class="cursor-pointer group pointer-events-auto" onclick="deleteWire('${w.id}')">
            <title>Wire: ${w.from.term} ➔ ${w.to.term} | Telemetry: ${isSimRunning ? `${vText} Active` : '0V Idle'}</title>
            <path d="${pathData}" stroke="transparent" stroke-width="16" fill="none" />
            <path d="${pathData}" stroke="${w.color || '#22d3ee'}" stroke-width="3.5" fill="none" stroke-linecap="round" class="group-hover:stroke-rose-400 transition-all" filter="url(#wire-glow-builder)"/>
            ${isSimRunning ? `
              <path d="${pathData}" stroke="#ffffff" stroke-width="2" stroke-dasharray="4, 12" fill="none" class="animate-flow-fwd opacity-90" />
            ` : ''}
          </g>
        `;
      }).join('');
    }

    function deleteWire(wireId) {
      const exists = builderWires.some(w => w.id === wireId);
      if (!exists) return;
      saveStateForUndo();
      safeSound('click');
      window.NilSparkLabBuilderState.removeWire(wireId);
      cancelWireSelection();
      drawWires();
      const status = document.getElementById('builder-status-text');
      if (status) status.innerText = '✓ Wire disconnected. Tap two terminals to reconnect it.';
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
    }

    function removeBuilderComp(id) {
      const exists = builderCanvasComps.some(c => c && c.id === id);
      if (!exists) return false;
      saveStateForUndo();
      safeSound('click');
      window.NilSparkLabBuilderState.removeComponent(id);
      if (activeEditingCompId === id && typeof closeEditModal === 'function') closeEditModal();
      renderBuilderCanvas();
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
      return true;
    }

    // Public bridge for gesture/keyboard/compatibility layers. The core builder
    // state is authoritative, but external event routers must not depend on
    // lexical/global-function behaviour varying across hosting environments.
    window.removeBuilderComp = removeBuilderComp;
    window.NilSparkLabBuilderActions = Object.freeze({
      removeComponent: removeBuilderComp
    });

    function openEditModal(id, event) {
      if (event) event.stopPropagation();
      safeSound('click');
      const c = builderCanvasComps.find(x => x.id === id);
      if (!c) return;
      activeEditingCompId = id;
      const title = document.getElementById('edit-modal-title');
      const body = document.getElementById('edit-modal-body');
      if (!title || !body) return;
      title.innerText = `${currentLang === 'hi' ? 'सेटिंग्स' : 'Settings'} · ${c.name}`;

      const hi = currentLang === 'hi';
      const L = (en, h) => hi ? h : en;
      const input = (id, value, step='any', min='0') => `<input type="number" id="${id}" value="${Number.isFinite(Number(value)) ? value : 0}" step="${step}" min="${min}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-cyan-400" />`;
      const row = (label, control) => `<label class="block space-y-1"><span class="text-slate-400">${label}</span>${control}</label>`;
      const select = (id, options) => `<select id="${id}" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-cyan-400">${options}</select>`;

      let html = '';
      switch (c.type) {
        case 'source':
          html = row(L('Supply Voltage (V)', 'सप्लाई वोल्टेज (V)'), input('edit-v', c.v, '0.1', '0'));
          break;
        case 'ac_source':
          html = row(L('RMS Voltage (V)', 'RMS वोल्टेज (V)'), input('edit-acv', c.v ?? 230, '0.1', '0')) + row(L('Frequency (Hz)', 'फ्रीक्वेंसी (Hz)'), input('edit-freq', c.frequency ?? 50, '1', '1'));
          break;
        case 'bridge_rectifier':
          html = row(L('Diode Drop per Diode (V)', 'प्रति डायोड ड्रॉप (V)'), input('edit-bridgevf', c.vf ?? 0.7, '0.01', '0')) + row(L('Current Rating (A)', 'करंट रेटिंग (A)'), input('edit-bridgea', c.ratedA ?? 2, '0.1', '0.1')) + row(L('Voltage Rating (V)', 'वोल्टेज रेटिंग (V)'), input('edit-bridgev', c.ratedV ?? 400, '1', '1'));
          break;
        case 'resistor':
          html = row(L('Resistance (Ω)', 'प्रतिरोध (Ω)'), input('edit-r', c.r, '0.1', '0.01')) + row(L('Power Rating (W)', 'पावर रेटिंग (W)'), input('edit-power', c.powerRating ?? 0.25, '0.01', '0.01'));
          break;
        case 'potentiometer':
          html = row(L('Maximum Resistance (Ω)', 'अधिकतम प्रतिरोध (Ω)'), input('edit-maxr', c.maxR ?? 10000, '1', '1')) + row(L('Wiper Position (%)', 'वाइपर स्थिति (%)'), input('edit-wiper', c.wiperPos ?? 50, '1', '0'));
          break;
        case 'ldr':
          html = row(L('Resistance (Ω)', 'प्रतिरोध (Ω)'), input('edit-r', c.r, '1', '1')) + row(L('Light Level (lux)', 'लाइट लेवल (lux)'), input('edit-lux', c.lux ?? 50, '1', '0'));
          break;
        case 'led':
          html = row(L('Forward Voltage (V)', 'फॉरवर्ड वोल्टेज (V)'), input('edit-vf', c.vf ?? 2, '0.1', '0')) + row(L('Color', 'रंग'), select('edit-color', ['Red','Green','Blue','White','Yellow'].map(x => `<option value="${x}" ${c.color===x?'selected':''}>${x}</option>`).join('')));
          break;
        case 'diode':
          html = row(L('Forward Voltage (V)', 'फॉरवर्ड वोल्टेज (V)'), input('edit-vf', c.vf ?? 0.7, '0.01', '0'));
          break;
        case 'motor':
          html = row(L('Winding Resistance (Ω)', 'वाइंडिंग प्रतिरोध (Ω)'), input('edit-r', c.r ?? 50, '0.1', '0.01'));
          break;
        case 'switch':
          html = row(L('State', 'स्थिति'), select('edit-state', `<option value="1" ${c.closed?'selected':''}>${L('Closed / ON','बंद / ON')}</option><option value="0" ${!c.closed?'selected':''}>${L('Open / OFF','खुला / OFF')}</option>`));
          break;
        case 'push_button':
        case 'reed_switch':
          html = row(L('State', 'स्थिति'), select('edit-state', `<option value="1" ${c.closed?'selected':''}>${L('Closed / ON','बंद / ON')}</option><option value="0" ${!c.closed?'selected':''}>${L('Open / OFF','खुला / OFF')}</option>`));
          break;
        case 'dpdt_switch':
          html = row(L('Position', 'पोजीशन'), select('edit-position', `<option value="0" ${!c.position?'selected':''}>A / NO</option><option value="1" ${c.position?'selected':''}>B / NC</option>`));
          break;
        case 'capacitor':
          html = row(L('Capacitance (µF)', 'कैपेसिटेंस (µF)'), input('edit-c', c.c ?? 100, '0.01', '0.001')) + row(L('Voltage Rating (V)', 'वोल्टेज रेटिंग (V)'), input('edit-vrating', c.voltageRating ?? 25, '0.1', '0.1'));
          break;
        case 'inductor':
          html = row(L('Inductance (mH)', 'इंडक्टेंस (mH)'), input('edit-l', c.l ?? 10, '0.01', '0.001')) + row(L('Winding Resistance (Ω)', 'वाइंडिंग प्रतिरोध (Ω)'), input('edit-r', c.r ?? 0.5, '0.01', '0.001'));
          break;
        case 'relay':
          html = row(L('Coil Resistance (Ω)', 'कॉइल प्रतिरोध (Ω)'), input('edit-coilr', c.coilR ?? 120, '0.1', '0.01'));
          break;
        case 'buzzer':
          html = row(L('Resistance (Ω)', 'प्रतिरोध (Ω)'), input('edit-r', c.r ?? 100, '0.1', '0.01'));
          break;
        case 'fuse':
          html = row(L('Current Rating (A)', 'करंट रेटिंग (A)'), input('edit-rateda', c.ratedA ?? 1, '0.01', '0.01')) + row(L('Internal Resistance (Ω)', 'आंतरिक प्रतिरोध (Ω)'), input('edit-r', c.r ?? 0.1, '0.01', '0.001')) + row(L('Condition', 'स्थिति'), select('edit-blown', `<option value="0" ${!c.blown?'selected':''}>${L('OK','ठीक')}</option><option value="1" ${c.blown?'selected':''}>${L('Blown','फ्यूज उड़ा हुआ')}</option>`));
          break;
        case 'bjt_npn':
          html = row(L('Current Gain (β)', 'करंट गेन (β)'), input('edit-beta', c.beta ?? 100, '1', '1')) + row(L('Base-Emitter Voltage (V)', 'बेस-एमिटर वोल्टेज (V)'), input('edit-vbe', c.vbe ?? 0.7, '0.01', '0'));
          break;
        case 'logic_input':
          html = row(L('Logic State', 'लॉजिक स्थिति'), select('edit-state', `<option value="1" ${c.state?'selected':''}>HIGH (1)</option><option value="0" ${!c.state?'selected':''}>LOW (0)</option>`));
          break;
        case 'logic_gate':
          html = `<div class="text-slate-400">${L('Gate type is fixed. Use the Logic Switch inputs to change its state.', 'गेट का प्रकार स्थिर है। इनपुट बदलने के लिए Logic Switch का उपयोग करें।')}</div>`;
          break;
        default:
          html = `<div class="text-slate-400">${L('No editable electrical value is defined for this component yet.', 'इस कंपोनेंट के लिए अभी कोई editable electrical value उपलब्ध नहीं है।')}</div>`;
      }
      body.innerHTML = html;
      document.getElementById('comp-edit-modal').classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    function closeEditModal() {
      document.getElementById('comp-edit-modal').classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      activeEditingCompId = null;
    }

    function saveComponentEdit() {
      const c = builderCanvasComps.find(x => x.id === activeEditingCompId);
      if (!c) { closeEditModal(); return; }
      saveStateForUndo();
      safeSound('click');
      const val = id => document.getElementById(id)?.value;
      const num = (id, fallback) => { const n = parseFloat(val(id)); return Number.isFinite(n) ? n : fallback; };

      if (c.type === 'source') c.v = Math.max(0, num('edit-v', c.v));
      if (c.type === 'ac_source') { c.v = Math.max(0, num('edit-acv', c.v ?? 230)); c.frequency = Math.max(1, num('edit-freq', c.frequency ?? 50)); }
      if (c.type === 'bridge_rectifier') { c.vf = Math.max(0, num('edit-bridgevf', c.vf ?? 0.7)); c.ratedA = Math.max(0.1, num('edit-bridgea', c.ratedA ?? 2)); c.ratedV = Math.max(1, num('edit-bridgev', c.ratedV ?? 400)); }
      if (c.type === 'resistor') { c.r = Math.max(0.01, num('edit-r', c.r)); c.powerRating = Math.max(0.01, num('edit-power', c.powerRating ?? 0.25)); }
      if (c.type === 'potentiometer') { c.maxR = Math.max(1, num('edit-maxr', c.maxR ?? 10000)); c.wiperPos = Math.min(100, Math.max(0, num('edit-wiper', c.wiperPos ?? 50))); c.r = Math.max(10, Math.round((c.wiperPos / 100) * c.maxR)); }
      if (c.type === 'ldr') { c.r = Math.max(1, num('edit-r', c.r)); c.lux = Math.max(0, num('edit-lux', c.lux ?? 50)); }
      if (c.type === 'led') { c.vf = Math.max(0, num('edit-vf', c.vf ?? 2)); c.color = val('edit-color') || c.color; }
      if (c.type === 'diode') c.vf = Math.max(0, num('edit-vf', c.vf ?? 0.7));
      if (c.type === 'motor') c.r = Math.max(0.01, num('edit-r', c.r ?? 50));
      if (c.type === 'switch') c.closed = val('edit-state') === '1';
      if (c.type === 'push_button' || c.type === 'reed_switch') c.closed = val('edit-state') === '1';
      if (c.type === 'dpdt_switch') c.position = val('edit-position') === '1' ? 1 : 0;
      if (c.type === 'capacitor') { c.c = Math.max(0.001, num('edit-c', c.c ?? 100)); c.voltageRating = Math.max(0.1, num('edit-vrating', c.voltageRating ?? 25)); }
      if (c.type === 'inductor') { c.l = Math.max(0.001, num('edit-l', c.l ?? 10)); c.r = Math.max(0.001, num('edit-r', c.r ?? 0.5)); }
      if (c.type === 'relay') c.coilR = Math.max(0.01, num('edit-coilr', c.coilR ?? 120));
      if (c.type === 'buzzer') c.r = Math.max(0.01, num('edit-r', c.r ?? 100));
      if (c.type === 'fuse') { c.ratedA = Math.max(0.01, num('edit-rateda', c.ratedA ?? 1)); c.r = Math.max(0.001, num('edit-r', c.r ?? 0.1)); c.blown = val('edit-blown') === '1'; }
      if (c.type === 'bjt_npn') { c.beta = Math.max(1, num('edit-beta', c.beta ?? 100)); c.vbe = Math.max(0, num('edit-vbe', c.vbe ?? 0.7)); }
      if (c.type === 'logic_input') c.state = val('edit-state') === '1' ? 1 : 0;

      closeEditModal();
      renderBuilderCanvas();
      if (isSimRunning) runBuilderSim(); else markCircuitVerificationStale();
    }

    function initDraggableProbes() {
      ['probe-red', 'probe-black'].forEach(id => {
        const el = document.getElementById(id);
        let isDragging = false;
        let startX, startY;

        el.addEventListener('pointerdown', (e) => {
          isDragging = true;
          el.setPointerCapture(e.pointerId);
          const rect = el.getBoundingClientRect();
          const canvasRect = document.getElementById('builder-canvas').getBoundingClientRect();
          startX = e.clientX - (rect.left - canvasRect.left);
          startY = e.clientY - (rect.top - canvasRect.top);
        });

        window.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          const canvas = document.getElementById('builder-canvas');
          const canvasRect = canvas.getBoundingClientRect();
          const x = Math.max(0, Math.min(canvasRect.width - 20, e.clientX - startX));
          const y = Math.max(0, Math.min(canvasRect.height - 45, e.clientY - startY));
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          updateDmmReading();
        });

        window.addEventListener('pointerup', () => { isDragging = false; });
      });
    }

    function setDmmMode(mode) {
      safeSound('click');
      dmmMode = mode;
      document.getElementById('dmm-mode-badge').innerText = mode === 'V' ? 'DC V' : mode === 'mA' ? 'DC mA' : 'BEEP 🔊';
      updateDmmReading();
    }

    function getDmmTouchedTerminal(probeId) {
      const probe = document.getElementById(probeId);
      if (!probe) return null;
      const pr = probe.getBoundingClientRect();
      const px = pr.left + pr.width / 2;
      const py = pr.top + pr.height * 0.82;
      let best = null, bestDist = Infinity;
      document.querySelectorAll('.terminal-btn').forEach(t => {
        const r = t.getBoundingClientRect();
        const tx = r.left + r.width / 2, ty = r.top + r.height / 2;
        const d = Math.hypot(tx - px, ty - py);
        if (d < 28 && d < bestDist) { best = t; bestDist = d; }
      });
      return best;
    }

    function getCircuitNetMap() {
      const adj = new Map();
      const add = (a,b) => { if(!adj.has(a)) adj.set(a,[]); if(!adj.has(b)) adj.set(b,[]); adj.get(a).push(b); adj.get(b).push(a); };
      builderWires.forEach(w => {
        if (w?.from && w?.to) add(`${w.from.compId}:${w.from.term}`, `${w.to.compId}:${w.to.term}`);
      });
      builderCanvasComps.forEach(c => {
        if ((c.type === 'switch' && c.closed) || (c.type === 'mcb' && !c.tripped && c.closed !== false)) add(`${c.id}:In`, `${c.id}:Out`);
        if (c.type === 'potentiometer') {
          add(`${c.id}:Pin 1`, `${c.id}:Wiper`); add(`${c.id}:Wiper`, `${c.id}:Pin 3`);
        }
      });
      return adj;
    }

    function sameElectricalNet(a, b, adj) {
      if (!a || !b) return false;
      const q=[a], seen=new Set([a]);
      while(q.length){ const n=q.shift(); if(n===b) return true; for(const x of (adj.get(n)||[])) if(!seen.has(x)){seen.add(x);q.push(x);} }
      return false;
    }

    function updateDmmReading() {
      const screen = document.getElementById('dmm-screen');
      const redT = getDmmTouchedTerminal('probe-red');
      const blackT = getDmmTouchedTerminal('probe-black');
      if (!screen) return;
      if (!redT || !blackT) {
        screen.innerText = dmmMode === 'V' ? '0.00 V' : dmmMode === 'mA' ? '0.0 mA' : 'O.L (Open)';
        return;
      }

      const red = redT.dataset?.term || redT.getAttribute('data-term') || '';
      const black = blackT.dataset?.term || blackT.getAttribute('data-term') || '';
      const redComp = redT.dataset?.comp || redT.getAttribute('data-comp');
      const blackComp = blackT.dataset?.comp || blackT.getAttribute('data-comp');
      const rNode = redComp && red ? `${redComp}:${red}` : null;
      const bNode = blackComp && black ? `${blackComp}:${black}` : null;
      const adj = getCircuitNetMap();
      const battery = builderCanvasComps.find(c => c.type === 'source');

      if (dmmMode === 'CONT') {
        const closed = sameElectricalNet(rNode, bNode, adj);
        screen.innerText = closed ? '0.00 Ω (SHORT)' : 'O.L (Open)';
        if (closed) SoundEngine.playBeep(2200, 0.05);
        return;
      }

      if (!battery || !rNode || !bNode) {
        screen.innerText = dmmMode === 'V' ? '0.00 V' : '0.0 mA';
        return;
      }

      const pos = `${battery.id}:+ (Pos)`, neg = `${battery.id}:- (Gnd)`;
      const redPos = sameElectricalNet(rNode, pos, adj), redNeg = sameElectricalNet(rNode, neg, adj);
      const blackPos = sameElectricalNet(bNode, pos, adj), blackNeg = sameElectricalNet(bNode, neg, adj);
      let voltage = 0;
      if (redPos && blackNeg) voltage = Number(battery.v) || 0;
      else if (redNeg && blackPos) voltage = -(Number(battery.v) || 0);
      else if (sameElectricalNet(rNode,bNode,adj)) voltage = 0;

      if (dmmMode === 'V') {
        screen.innerText = `${voltage.toFixed(2)} V`;
      } else {
        const loop = checkCircuitClosedLoop();
        if (!loop.isClosed) { screen.innerText = '0.0 mA'; return; }
        const activePassives = getActivePassiveComponents(battery);
        const totalR = activePassives.reduce((sum,c)=>sum+Math.max(0,Number(c.r)||0),0);
        const leds = builderCanvasComps.filter(c=>c.type==='led');
        const vf = leds.reduce((sum,c)=>sum+Math.max(0,Number(c.vf)||0),0);
        const ma = totalR > 0 ? Math.max(0,((Number(battery.v)||0)-vf)/totalR)*1000 : 0;
        screen.innerText = `${ma.toFixed(1)} mA`;
      }
    }

    // =============================================================
    // v5.55 FINAL SIMULATION ENGINE 2.0
    // Active-path analysis, direct-short detection and over-current
    // protection. The solver intentionally stays conservative: when a
    // circuit topology is ambiguous, it warns instead of inventing a
    // physically valid result.
    // =============================================================
    // v5.55: IMPORTANT — resistive components must NOT be treated as wires.
    // The previous graph connected both terminals of a resistor internally,
    // so Battery+ -> 470Ω -> LED -> Battery− looked like a direct short.
    // We keep a pure wire/zero-ohm net graph for topology checks and let the
    // solver model resistors as actual impedance.
    function getSimulationNetGraph() {
      const adj = new Map();
      const add = (u, v) => {
        if (!adj.has(u)) adj.set(u, new Set());
        if (!adj.has(v)) adj.set(v, new Set());
        adj.get(u).add(v);
        adj.get(v).add(u);
      };

      // Physical wires are zero-ohm connections.
      builderWires.forEach(w => {
        if (w?.from && w?.to) {
          add(`${w.from.compId}:${w.from.term}`, `${w.to.compId}:${w.to.term}`);
        }
      });

      // A closed ideal switch is also a zero-ohm connection.
      builderCanvasComps.forEach(c => {
        if ((c.type === 'switch' && c.closed) || (c.type === 'mcb' && !c.tripped && c.closed !== false)) {
          add(`${c.id}:In`, `${c.id}:Out`);
        }
      });

      return adj;
    }

    function graphReachable(start, adj) {
      const seen = new Set();
      if (!start) return seen;
      const q = [start];
      seen.add(start);
      while (q.length) {
        const n = q.shift();
        for (const next of (adj.get(n) || [])) {
          if (!seen.has(next)) { seen.add(next); q.push(next); }
        }
      }
      return seen;
    }

    function isDirectBatteryShort(battery) {
      if (!battery) return false;
      const adj = getSimulationNetGraph();
      const pos = `${battery.id}:+ (Pos)`;
      const neg = `${battery.id}:- (Gnd)`;
      return graphReachable(pos, adj).has(neg);
    }

    // v5.55: Find the actual closed electrical path while keeping
    // component impedance separate from zero-ohm wires. A resistor/LED is
    // traversed as a component edge for topology discovery, but it is NOT
    // collapsed into the wire net. This fixes:
    // Battery+ -> Resistor -> LED -> Battery-
    function findClosedComponentPath(battery) {
      if (!battery) return { closed:false, componentIds:new Set(), ledIds:new Set() };
      const nodeEdges=new Map();
      const add=(a,b,meta=null,directed=false)=>{if(!nodeEdges.has(a))nodeEdges.set(a,[]);if(!nodeEdges.has(b))nodeEdges.set(b,[]);nodeEdges.get(a).push({to:b,meta});if(!directed)nodeEdges.get(b).push({to:a,meta});};
      const key=(id,t)=>`${id}:${t}`;
      builderWires.forEach(w=>{if(w?.from&&w?.to)add(key(w.from.compId,w.from.term),key(w.to.compId,w.to.term),{kind:'wire'});});
      const passive2=new Set(['resistor','ldr','thermistor','thermistor_ptc','pt100','motor','inductor','relay','buzzer','fuse','lamp']);
      builderCanvasComps.forEach(c=>{
        if(c.type==='switch' || c.type==='push_button' || c.type==='reed_switch' || c.type==='mcb') { if(c.type!=='mcb' ? c.closed : (!c.tripped && c.closed !== false)) add(key(c.id,c.terminals[0]),key(c.id,c.terminals[1]),{kind:'component',compId:c.id}); return; }
        if(c.type==='dpdt_switch'){
          const p=c.position?1:0;
          if(p===0){add(key(c.id,'COM1'),key(c.id,'NO1'),{kind:'component',compId:c.id});add(key(c.id,'COM2'),key(c.id,'NO2'),{kind:'component',compId:c.id});}
          else {add(key(c.id,'COM1'),key(c.id,'NC1'),{kind:'component',compId:c.id});add(key(c.id,'COM2'),key(c.id,'NC2'),{kind:'component',compId:c.id});}
          return;
        }
        if(c.type==='fuse' && (c.blown||c.isBlown)) return;
        if(c.type==='potentiometer'){add(key(c.id,'Pin 1'),key(c.id,'Wiper'),{kind:'component',compId:c.id});add(key(c.id,'Wiper'),key(c.id,'Pin 3'),{kind:'component',compId:c.id});return;}
        if(c.type==='led' || c.type==='diode'){add(key(c.id,'Anode (+)'),key(c.id,'Cathode (-)'),{kind:'component',compId:c.id},true);return;}
        if(c.type==='bridge_rectifier'){add(key(c.id,'AC1'),key(c.id,'DC+'),{kind:'component',compId:c.id},true);add(key(c.id,'AC2'),key(c.id,'DC+'),{kind:'component',compId:c.id},true);add(key(c.id,'DC-'),key(c.id,'AC1'),{kind:'component',compId:c.id},true);add(key(c.id,'DC-'),key(c.id,'AC2'),{kind:'component',compId:c.id},true);return;}
        if(passive2.has(c.type)){const ts=c.terminals||[];if(ts.length>=2)add(key(c.id,ts[0]),key(c.id,ts[1]),{kind:'component',compId:c.id});}
      });
      const start=key(battery.id,'+ (Pos)'),end=key(battery.id,'- (Gnd)');
      const q=[start],prev=new Map([[start,null]]),prevMeta=new Map();
      while(q.length){const n=q.shift();if(n===end)break;for(const e of(nodeEdges.get(n)||[])){if(prev.has(e.to))continue;prev.set(e.to,n);prevMeta.set(e.to,e.meta);q.push(e.to);}}
      if(!prev.has(end))return {closed:false,componentIds:new Set(),ledIds:new Set()};
      const componentIds=new Set(),ledIds=new Set();let n=end;
      while(prev.get(n)!==null){const m=prevMeta.get(n);if(m?.kind==='component'&&m.compId){componentIds.add(m.compId);const c=builderCanvasComps.find(x=>x.id===m.compId);if(c?.type==='led'||c?.type==='diode')ledIds.add(c.id);}n=prev.get(n);}
      return {closed:true,componentIds,ledIds};
    }
    function findACRectifierPath(acSource) {
      if (!acSource) return { closed:false, componentIds:new Set(), diodeIds:new Set() };

      const graph = new Map();
      const add = (a,b,meta=null, directed=false) => {
        if(!graph.has(a)) graph.set(a,[]);
        if(!graph.has(b)) graph.set(b,[]);
        graph.get(a).push({to:b,meta});
        if(!directed) graph.get(b).push({to:a,meta});
      };
      const key=(id,t)=>`${id}:${t}`;

      builderWires.forEach(w=>{
        if(w?.from&&w?.to) add(key(w.from.compId,w.from.term),key(w.to.compId,w.to.term),{kind:'wire'});
      });

      builderCanvasComps.forEach(c=>{
        if(c.id===acSource.id || c.type==='logic_gate' || c.type==='logic_input') return;

        if(c.type==='switch'){
          if(c.closed) add(key(c.id,'In'),key(c.id,'Out'),{kind:'component',compId:c.id});
          return;
        }

        if(c.type==='fuse' && (c.blown||c.isBlown)) return;

        if(c.type==='bridge_rectifier'){
          add(key(c.id,'AC1'),key(c.id,'DC+'),{kind:'component',compId:c.id},true);
          add(key(c.id,'AC2'),key(c.id,'DC+'),{kind:'component',compId:c.id},true);
          add(key(c.id,'DC-'),key(c.id,'AC1'),{kind:'component',compId:c.id},true);
          add(key(c.id,'DC-'),key(c.id,'AC2'),{kind:'component',compId:c.id},true);
          return;
        }

        if(c.type==='led' || c.type==='diode'){
          add(key(c.id,'Anode (+)'),key(c.id,'Cathode (-)'),{kind:'component',compId:c.id},true);
          return;
        }

        if(c.type==='bjt_npn') return;

        const ts=Array.isArray(c.terminals)?c.terminals:[];
        if(ts.length>=2) add(key(c.id,ts[0]),key(c.id,ts[1]),{kind:'component',compId:c.id});
      });

      const start=key(acSource.id,'L');
      const end=key(acSource.id,'N');
      const q=[start];
      const prev=new Map([[start,null]]);
      const prevMeta=new Map();

      while(q.length){
        const node=q.shift();
        if(node===end) break;
        for(const edge of (graph.get(node)||[])){
          if(prev.has(edge.to)) continue;
          prev.set(edge.to,node);
          prevMeta.set(edge.to,edge.meta);
          q.push(edge.to);
        }
      }

      if(!prev.has(end)) return {closed:false,componentIds:new Set(),diodeIds:new Set()};

      const componentIds=new Set();
      const diodeIds=new Set();
      let node=end;
      while(prev.get(node)!==null){
        const meta=prevMeta.get(node);
        if(meta?.kind==='component' && meta.compId){
          componentIds.add(meta.compId);
          const c=builderCanvasComps.find(x=>x.id===meta.compId);
          if(c?.type==='diode' || c?.type==='led') diodeIds.add(c.id);
        }
        node=prev.get(node);
      }
      return {closed:true,componentIds,diodeIds};
    }

    function runBridgeRectifierSim(acSource) {
      const path=findACRectifierPath(acSource);

      // Reset visual load states first.
      builderCanvasComps.forEach(c=>{
        if(c.type==='led') c.isOn=false;
        if(c.type==='motor') c.isSpinning=false;
        if(c.type==='buzzer') c.isOn=false;
        if(c.type==='relay') c.energized=false;
      });

      if(!path.closed){
        isSimRunning=false;
        SoundEngine.playBeep(400,0.2);
        showSimulationStatus(
          "<span class='text-slate-400 font-bold'>⚡ AC Rectifier Path Open:</span> Connect AC L/N through a correctly oriented bridge, then DC+ → load → DC−.",
          "Full-wave bridge path not closed"
        );
        updateSmartFromSimulation(Number(acSource.v)||0,0,0,'OPEN','AC source detected, but the rectifier/load return path is not closed.','ERROR');
        renderBuilderCanvas();
        return;
      }

      const bridge = builderCanvasComps.find(c=>c.type==='bridge_rectifier' && path.componentIds.has(c.id));
      const bridgeDrop = bridge ? Math.max(0.1, Number(bridge.vf)||0.7) * 2 : 1.4;

      const active = builderCanvasComps.filter(c=>path.componentIds.has(c.id));
      const resistive = active.filter(c=>['resistor','motor','buzzer','relay','inductor','fuse','ldr','thermistor_ptc','pt100','lamp'].includes(c.type));
      const leds = active.filter(c=>c.type==='led');
      const diodes = active.filter(c=>c.type==='diode');

      // Educational full-wave approximation:
      // VDC(avg) ≈ 0.9 Vrms − two forward diode drops.
      const vrms=Math.max(0,Number(acSource.v)||0);
      if(bridge && vrms*Math.SQRT2 > Number(bridge.ratedV||400)){
        isSimRunning=false; safeSound('spark');
        showSimulationStatus(`<span class='text-rose-500 font-bold'>⚠ BRIDGE VOLTAGE RATING EXCEEDED!</span> Peak input is ${(vrms*Math.SQRT2).toFixed(1)} V, above the ${Number(bridge.ratedV||400).toFixed(0)} V rating.`, `Vpeak = ${(vrms*Math.SQRT2).toFixed(1)} V | Rating = ${Number(bridge.ratedV||400).toFixed(0)} V`);
        updateSmartFromSimulation(vrms,0,0,'CHECK','Bridge rectifier reverse-voltage rating exceeded.','ERROR');
        renderBuilderCanvas(); return;
      }
      const vdc=Math.max(0,0.9*vrms-bridgeDrop);
      const loadVf=leds.reduce((a,c)=>a+Math.max(0,Number(c.vf)||0),0)
                 + diodes.reduce((a,c)=>a+Math.max(0,Number(c.vf)||0),0);

      let totalR=0;
      resistive.forEach(c=>{
        let r=Number(c.r);
        if(c.type==='relay') r=Number(c.coilR)||120;
        else if(c.type==='motor') r=Number(c.r)||20;
        else if(c.type==='buzzer') r=Number(c.r)||40;
        else if(c.type==='inductor') r=Number(c.r)||0.5;
        else if(c.type==='fuse') r=c.blown?1e9:(Number(c.r)||0.1);
        else if(c.type==='lamp') r=Number(c.r)||2300;
        else if(!Number.isFinite(r)||r<=0) r=Number(c.r)||0;
        if(Number.isFinite(r)&&r>0) totalR+=r;
      });

      if(totalR<=0){
        isSimRunning=false;
        safeSound('spark');
        showSimulationStatus(
          "<span class='text-rose-500 font-bold animate-pulse'>💥 Rectifier output short / no current limiting load.</span>",
          "Add a resistor or another valid load on DC+ → DC−"
        );
        updateSmartFromSimulation(vdc,0,0,'CHECK','Bridge output is closed but the load has no usable current-limiting resistance.','ERROR');
        renderBuilderCanvas();
        return;
      }

      const netV=Math.max(0,vdc-loadVf);
      const currentA=netV/totalR;
      const currentmA=currentA*1000;
      if(bridge && currentA > Number(bridge.ratedA || 2)){
        isSimRunning=false; safeSound('spark');
        showSimulationStatus(`<span class='text-rose-500 font-bold animate-pulse'>🛑 BRIDGE OVERCURRENT TRIP!</span> Rectifier current exceeded ${Number(bridge.ratedA||2).toFixed(2)} A.`, `I = ${currentmA.toFixed(0)} mA | Rating = ${Number(bridge.ratedA||2).toFixed(0)} A`);
        updateSmartFromSimulation(vdc,currentA,vdc*currentA,'CHECK','Bridge rectifier current rating exceeded.','ERROR');
        renderBuilderCanvas(); return;
      }

      if(currentmA>2000){
        isSimRunning=false;
        safeSound('spark');
        showSimulationStatus(
          "<span class='text-rose-500 font-bold animate-pulse'>🛑 OVERCURRENT TRIP!</span> Bridge load current exceeded 2.00 A.",
          `I = ${currentmA.toFixed(0)} mA | Limit = 2000 mA`
        );
        updateSmartFromSimulation(vdc,0,0,'CHECK','Bridge load current exceeded the 2.00 A virtual protection limit.','ERROR');
        renderBuilderCanvas();
        return;
      }

      isSimRunning=true;
      SoundEngine.playBeep(1200,0.1);

      simulationTelemetry=new Map();
      resistive.forEach(c=>{
        let r=Number(c.r);
        if(c.type==='relay') r=Number(c.coilR)||120;
        else if(c.type==='motor') r=Number(c.r)||20;
        else if(c.type==='buzzer') r=Number(c.r)||40;
        else if(c.type==='inductor') r=Number(c.r)||0.5;
        else if(c.type==='fuse') r=c.blown?1e9:(Number(c.r)||0.1);
        const vd=currentA*Math.max(r,0.000001);
        c.simVoltage=vd;c.simCurrent=currentA;c.simPower=vd*currentA;
        simulationTelemetry.set(c.id,{voltage:vd,current:currentA,power:vd*currentA,resistance:r});
        if(c.type==='motor') c.isSpinning=true;
        if(c.type==='buzzer') c.isOn=true;
        if(c.type==='relay') c.energized=true;
      });

      leds.forEach(c=>{
        c.simVoltage=Math.max(0,Number(c.vf)||0);
        c.simCurrent=currentA;
        c.simPower=c.simVoltage*currentA;
        c.isOn=currentA>0.000001;
        simulationTelemetry.set(c.id,{voltage:c.simVoltage,current:currentA,power:c.simPower,resistance:0});
      });

      diodes.forEach(c=>{
        c.simVoltage=Math.max(0,Number(c.vf)||0);
        c.simCurrent=currentA;
        c.simPower=c.simVoltage*currentA;
        simulationTelemetry.set(c.id,{voltage:c.simVoltage,current:currentA,power:c.simPower,resistance:0});
      });

      if(bridge){
        bridge.simVoltage=bridgeDrop;
        bridge.simCurrent=currentA;
        bridge.simPower=bridgeDrop*currentA;
        simulationTelemetry.set(bridge.id,{voltage:bridgeDrop,current:currentA,power:bridgeDrop*currentA,resistance:0});
      }

      showSimulationStatus(
        "<span class='text-emerald-400 font-bold'>✓ Full-Wave Bridge Rectifier Active.</span> AC is converted to pulsating DC; load current calculated from the educational average-DC model.",
        `Vrms = ${vrms.toFixed(2)} V | VDC(avg) ≈ ${vdc.toFixed(2)} V | I ≈ ${currentmA.toFixed(2)} mA`
      );
      updateSmartFromSimulation(vdc,currentA,vdc*currentA,'OK',`Full-wave bridge detected. Approx. VDC(avg) = 0.9×Vrms − 2Vd = ${vdc.toFixed(2)} V.`);
      renderBuilderCanvas();
    }

    function getActivePassiveComponents(battery) {
      if (!battery) return [];
      const path=findClosedComponentPath(battery);
      if (!path.closed) return [];
      const supported=['resistor','potentiometer','ldr','thermistor','thermistor_ptc','pt100','motor','inductor','fuse','buzzer','relay','lamp'];
      return builderCanvasComps.filter(c=>supported.includes(c.type)&&path.componentIds.has(c.id));
    }

    function resetSimulationTelemetry() {
      simulationTelemetry = new Map();
      builderCanvasComps.forEach(c => {
        c.simVoltage = 0;
        c.simCurrent = 0;
        c.simPower = 0;
      });
    }

    function buildSeriesTelemetry(activePassives, activeLeds, currentA, sourceV, totalVf) {
      simulationTelemetry = new Map();
      let remainingV = Math.max(0, sourceV - totalVf);
      activePassives.forEach(c => {
        let r = 0;
        if (c.type === 'relay') r = Math.max(10, Number(c.coilR) || 120);
        else if (c.type === 'inductor') r = Math.max(0.05, Number(c.r) || 0.5);
        else if (c.type === 'fuse') r = c.blown ? 1e9 : Math.max(0.05, Number(c.r) || 0.1);
        else r = Math.max(0, Number(c.r) || 0);
        const vDrop = currentA * r;
        const power = currentA * vDrop;
        c.simCurrent = currentA;
        c.simVoltage = vDrop;
        c.simPower = power;
        simulationTelemetry.set(c.id, { voltage: vDrop, current: currentA, power, resistance: r });
        remainingV = Math.max(0, remainingV - vDrop);
      });
      activeLeds.forEach(c => {
        c.simCurrent = currentA;
        c.simVoltage = Math.max(0, Number(c.vf) || 0);
        c.simPower = currentA * c.simVoltage;
        simulationTelemetry.set(c.id, { voltage: c.simVoltage, current: currentA, power: c.simPower, resistance: 0 });
      });
    }

    function showSimulationStatus(html, calc = '') {
      const status = document.getElementById('builder-status-text');
      const stat = document.getElementById('builder-calc-stat');
      if (status) status.innerHTML = html;
      if (stat) stat.innerText = calc;
    }

    // Graph Closed-Loop Netlist Solver
    // FIX v5.55 FINAL: the previous solver omitted the internal connection of a
    // closed SPST switch and treated diodes/LEDs as bidirectional. This
    // version models passive parts as bidirectional, switches as open/closed,
    // and diode/LED conduction in the Anode -> Cathode direction.
    function checkCircuitClosedLoop() {
      const battery=builderCanvasComps.find(c=>c.type==='source');
      if(!battery)return {isClosed:false,battery:null};
      const adj=new Map(), add=(u,v)=>{if(!adj.has(u))adj.set(u,[]);if(!adj.has(v))adj.set(v,[]);adj.get(u).push(v);adj.get(v).push(u);};
      const key=(id,t)=>`${id}:${t}`;
      builderWires.forEach(w=>{if(w?.from&&w?.to)add(key(w.from.compId,w.from.term),key(w.to.compId,w.to.term));});
      const passive2=new Set(['resistor','ldr','thermistor','thermistor_ptc','pt100','motor','inductor','relay','buzzer','fuse','lamp']);
      builderCanvasComps.forEach(c=>{
        if(c.type==='switch'||c.type==='push_button'||c.type==='reed_switch'||c.type==='mcb'){if(c.type==='mcb' ? (!c.tripped && c.closed !== false) : c.closed)add(key(c.id,c.terminals[0]),key(c.id,c.terminals[1]));return;}
        if(c.type==='dpdt_switch'){if(c.position){add(key(c.id,'COM1'),key(c.id,'NC1'));add(key(c.id,'COM2'),key(c.id,'NC2'));}else{add(key(c.id,'COM1'),key(c.id,'NO1'));add(key(c.id,'COM2'),key(c.id,'NO2'));}return;}
        if(c.type==='fuse'&&(c.blown||c.isBlown))return;
        if(c.type==='potentiometer'){add(key(c.id,'Pin 1'),key(c.id,'Wiper'));add(key(c.id,'Wiper'),key(c.id,'Pin 3'));return;}
        if(c.type==='led'||c.type==='diode'){add(key(c.id,'Anode (+)'),key(c.id,'Cathode (-)'));return;}
        if(c.type==='bridge_rectifier'){add(key(c.id,'AC1'),key(c.id,'DC+'));add(key(c.id,'AC2'),key(c.id,'DC+'));add(key(c.id,'DC-'),key(c.id,'AC1'));add(key(c.id,'DC-'),key(c.id,'AC2'));return;}
        if(passive2.has(c.type)){const ts=c.terminals||[];if(ts.length>=2)add(key(c.id,ts[0]),key(c.id,ts[1]));}
      });
      const start=key(battery.id,'+ (Pos)'),end=key(battery.id,'- (Gnd)'),seen=new Set([start]),q=[start];
      while(q.length){const n=q.shift();if(n===end)return {isClosed:true,battery};for(const x of(adj.get(n)||[]))if(!seen.has(x)){seen.add(x);q.push(x);}}
      return {isClosed:false,battery};
    }

    // V6 FEATURE: NPN common-emitter DC bias-point solver. Detects the classic
    // "transistor as a switch" topology — base driven through a resistor from
    // the same battery rail, emitter tied to ground, collector feeding a
    // resistor/LED/motor/buzzer/relay/lamp load back to the same rail — and
    // computes the real cutoff / active / saturation operating point using
    // standard transistor-switch equations (Ib, Ic = βIb, and the Vce(sat)
    // clamp). Any topology outside this common pattern is intentionally left
    // unsolved (returns null) so the caller can show an honest "unsupported"
    // message instead of guessing.
    function solveTransistorSwitch(battery, transistor) {
      const comps = builderCanvasComps || [];
      if (!battery || !transistor) return null;
      const parent = new Map();
      const find = x => { if(!parent.has(x)) parent.set(x,x); let r=x; while(parent.get(r)!==r){ r=parent.get(r); } while(x!==r){ const n=parent.get(x); parent.set(x,r); x=n; } return r; };
      const union = (a,b) => { a=find(a); b=find(b); if(a!==b) parent.set(a,b); };
      const key=(id,t)=>`${id}:${t}`;
      builderWires.forEach(w=>{ if(w?.from&&w?.to) union(key(w.from.compId,w.from.term),key(w.to.compId,w.to.term)); });
      comps.forEach(c=>{
        if(c===transistor) return;
        if((c.type==='switch'||c.type==='push_button'||c.type==='reed_switch'||c.type==='mcb') && (c.type==='mcb' ? (!c.tripped && c.closed !== false) : c.closed)) union(key(c.id,c.terminals[0]),key(c.id,c.terminals[1]));
      });

      const pos = find(key(battery.id,'+ (Pos)'));
      const neg = find(key(battery.id,'- (Gnd)'));
      const baseNode = find(key(transistor.id,'B'));
      const collectorNode = find(key(transistor.id,'C'));
      const emitterNode = find(key(transistor.id,'E'));

      // This simplified switch model only supports the classic
      // emitter-grounded configuration.
      if (emitterNode !== neg) return null;

      const loadTypes = new Set(['resistor','led','diode','motor','buzzer','relay','lamp','ldr']);
      const resistanceOf = c => {
        if (c.type === 'led' || c.type === 'diode') return null; // handled separately (has Vf, not pure R)
        if (c.type === 'relay') return Math.max(10, Number(c.coilR) || 120);
        if (c.type === 'motor') return Math.max(1, Number(c.r) || 20);
        if (c.type === 'buzzer') return Math.max(1, Number(c.r) || 40);
        return Math.max(0.01, Number(c.r) || 0);
      };

      // Find the single resistor bridging (pos <-> base): the base drive resistor.
      let rb = null;
      for (const c of comps) {
        if (c.type !== 'resistor' || !Array.isArray(c.terminals) || c.terminals.length < 2) continue;
        const a = find(key(c.id, c.terminals[0])), b = find(key(c.id, c.terminals[1]));
        if ((a === pos && b === baseNode) || (b === pos && a === baseNode)) { if (rb) return null; rb = c; }
      }
      if (!rb) return null;

      // Find the single load bridging (pos <-> collector).
      let loadComp = null, loadVf = 0;
      for (const c of comps) {
        if (c === rb || !loadTypes.has(c.type) || !Array.isArray(c.terminals) || c.terminals.length < 2) continue;
        const t0 = c.type === 'led' || c.type === 'diode' ? 'Anode (+)' : c.terminals[0];
        const t1 = c.type === 'led' || c.type === 'diode' ? 'Cathode (-)' : c.terminals[1];
        if (!c.terminals.includes(t0) || !c.terminals.includes(t1)) continue;
        const a = find(key(c.id, t0)), b = find(key(c.id, t1));
        const forward = (a === pos && b === collectorNode);
        if (forward) { if (loadComp) return null; loadComp = c; loadVf = (c.type === 'led' || c.type === 'diode') ? Math.max(0, Number(c.vf) || (c.type === 'led' ? 2.0 : 0.7)) : 0; }
      }
      if (!loadComp) return null;

      const Vcc = Number(battery.v) || 0;
      const Vbe = Number(transistor.vbe) || 0.7;
      const beta = Math.max(1, Number(transistor.beta) || 100);
      const Rb = Math.max(1, Number(rb.r) || 1);
      const Rc = loadComp.type === 'led' || loadComp.type === 'diode' ? 220 /* series-resistor-free LED path isn't realistic; treat junction alone as ~0Ω limiter and rely on Vf drop */ : resistanceOf(loadComp);

      const Ib = Math.max(0, (Vcc - Vbe) / Rb);
      if (Ib <= 0) {
        return { region: 'CUTOFF', Ib: 0, Ic: 0, Vce: Vcc, on: false, rb, loadComp, Vcc, Vbe, beta };
      }

      const VceSat = 0.2;
      const IcSat = Math.max(0, (Vcc - VceSat - loadVf) / Math.max(0.01, Rc));
      const IcActive = beta * Ib;

      if (IcActive >= IcSat) {
        return { region: 'SATURATION', Ib, Ic: IcSat, Vce: VceSat, on: true, rb, loadComp, Vcc, Vbe, beta };
      }
      const Vce = Vcc - IcActive * Rc - loadVf;
      return { region: 'ACTIVE', Ib, Ic: IcActive, Vce: Math.max(VceSat, Vce), on: true, rb, loadComp, Vcc, Vbe, beta };
    }

    // V6.1: Educational PNP high-side switch solver and N-channel MOSFET low-side
    // switch solver. These intentionally recognize only clear teaching topologies.
    function buildNodeResolver(){
      const parent=new Map(), key=(id,t)=>`${id}:${t}`;
      const find=x=>{if(!parent.has(x))parent.set(x,x);let r=x;while(parent.get(r)!==r)r=parent.get(r);while(x!==r){const n=parent.get(x);parent.set(x,r);x=n;}return r;};
      const union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent.set(a,b);};
      builderWires.forEach(w=>{if(w?.from&&w?.to)union(key(w.from.compId,w.from.term),key(w.to.compId,w.to.term));});
      builderCanvasComps.forEach(c=>{if((c.type==='switch'||c.type==='push_button'||c.type==='reed_switch'||c.type==='mcb')&&(c.type==='mcb'?(!c.tripped&&c.closed!==false):c.closed))union(key(c.id,c.terminals[0]),key(c.id,c.terminals[1]));});
      return {find,union,key};
    }
    function classicLoadToGround(resolver,battery,node){
      const neg=resolver.find(resolver.key(battery.id,'- (Gnd)'));
      const types=new Set(['resistor','motor','buzzer','relay','lamp','ldr']);
      let found=null;
      for(const c of builderCanvasComps){if(!types.has(c.type)||!Array.isArray(c.terminals)||c.terminals.length<2)continue;const a=resolver.find(resolver.key(c.id,c.terminals[0])),b=resolver.find(resolver.key(c.id,c.terminals[1]));if((a===node&&b===neg)||(b===node&&a===neg)){if(found)return null;found=c;}}
      return found;
    }
    function loadResistance(c){if(!c)return Infinity;if(c.type==='relay')return Math.max(10,Number(c.coilR)||120);if(c.type==='motor')return Math.max(1,Number(c.r)||20);if(c.type==='buzzer')return Math.max(1,Number(c.r)||40);return Math.max(.01,Number(c.r)||100);}
    function solvePnpHighSideSwitch(battery,tr){
      if(!battery||!tr)return null;const R=buildNodeResolver(),pos=R.find(R.key(battery.id,'+ (Pos)')),neg=R.find(R.key(battery.id,'- (Gnd)'));
      const C=R.find(R.key(tr.id,'C')),B=R.find(R.key(tr.id,'B')),E=R.find(R.key(tr.id,'E'));
      if(E!==pos)return null;let rb=null;
      for(const c of builderCanvasComps){if(c.type!=='resistor'||!Array.isArray(c.terminals)||c.terminals.length<2)continue;const a=R.find(R.key(c.id,c.terminals[0])),b=R.find(R.key(c.id,c.terminals[1]));if((a===B&&b===neg)||(b===B&&a===neg)){if(rb)return null;rb=c;}}
      const load=classicLoadToGround(R,battery,C);if(!rb||!load)return null;const Vcc=Number(battery.v)||0,Vbe=Math.max(.1,Number(tr.vbe)||.7),Rb=Math.max(1,Number(rb.r)||1),beta=Math.max(1,Number(tr.beta)||100),Ib=Math.max(0,(Vcc-Vbe)/Rb),Rload=loadResistance(load),IcSat=Math.max(0,(Vcc-.2)/Rload),IcAct=beta*Ib, Ic=Math.min(IcAct,IcSat),region=Ib<=0?'CUTOFF':(IcAct>=IcSat?'SATURATION':'ACTIVE');return {on:Ib>0&&Ic>0,region,Ib,Ic,Vce:region==='SATURATION'?.2:Math.max(.2,Vcc-Ic*Rload),loadComp:load,Vcc};
    }
    function solveNmosLowSideSwitch(battery,tr){
      if(!battery||!tr)return null;const R=buildNodeResolver(),pos=R.find(R.key(battery.id,'+ (Pos)')),neg=R.find(R.key(battery.id,'- (Gnd)'));
      const G=R.find(R.key(tr.id,'Gate (G)')),D=R.find(R.key(tr.id,'Drain (D)')),S=R.find(R.key(tr.id,'Source (S)'));if(S!==neg)return null;
      // Gate drive must be explicitly tied to the positive rail through a resistor or directly.
      let gateDriven=(G===pos); if(!gateDriven){for(const c of builderCanvasComps){if(c.type!=='resistor'||!Array.isArray(c.terminals)||c.terminals.length<2)continue;const a=R.find(R.key(c.id,c.terminals[0])),b=R.find(R.key(c.id,c.terminals[1]));if((a===G&&b===pos)||(b===G&&a===pos)){gateDriven=true;break;}}}
      const load=classicLoadToGround(R,battery,D);if(!gateDriven||!load)return null;const Vcc=Number(battery.v)||0,Vth=Math.max(.1,Number(tr.vth)||3),Rds=Math.max(.001,Number(tr.rdsOn)||.05),Rload=loadResistance(load),Vgs=Vcc,on=Vgs>=Vth,I=on?Math.max(0,Vcc/(Rload+Rds)):0;return {on,region:on?'ON':'CUTOFF',Vgs,Vth,Ic:I,Id:I,Vds:on?I*Rds:Vcc,loadComp:load,Vcc};
    }

    // v5.55: nodal DC solver for resistor/switch/fuse networks. This replaces the
    // old "branched = stop" behavior for topologies that can be solved safely.
    function solveResistorNetwork(battery) {
      const comps = builderCanvasComps || [];
      const sources = comps.filter(c => c.type === 'source');
      if (!battery || sources.length !== 1) return null;
      const supported = new Set(['resistor','ldr','thermistor','thermistor_ptc','pt100','motor','buzzer','relay','inductor','fuse','lamp','switch','mcb','push_button','reed_switch','potentiometer']);
      if (comps.some(c => ['led','diode','capacitor','bjt_npn','bjt_pnp','mosfet_n','p_mosfet','scr','triac','diac','ic_741','reg_7805','schmitt_trigger','ir_sensor','thermocouple','hall_sensor','logic_gate','logic_input','ac_source','bridge_rectifier','dpdt_switch'].includes(c.type))) return null;
      const parent = new Map();
      const find = x => { if(!parent.has(x)) parent.set(x,x); let r=x; while(parent.get(r)!==r){ r=parent.get(r); } while(x!==r){ const n=parent.get(x); parent.set(x,r); x=n; } return r; };
      const union = (a,b) => { a=find(a); b=find(b); if(a!==b) parent.set(a,b); };
      const key=(id,t)=>`${id}:${t}`;
      builderWires.forEach(w=>{ if(w?.from&&w?.to) union(key(w.from.compId,w.from.term),key(w.to.compId,w.to.term)); });
      const terminalMap=new Map();
      comps.forEach(c=>(c.terminals||[]).forEach(t=>terminalMap.set(key(c.id,t),true)));
      const pos=find(key(battery.id,'+ (Pos)')), neg=find(key(battery.id,'- (Gnd)'));
      if(pos===neg) return {short:true};
      const edges=[];
      for(const c of comps){
        if(!supported.has(c.type) || c===battery) continue;
        // FIX (V6): a potentiometer is 3-terminal (Pin 1 / Wiper / Pin 3), so it
        // needs two edges — one per resistive segment either side of the wiper —
        // instead of the generic 2-terminal handling below, which previously
        // caused potentiometers to be excluded from branched/parallel solving
        // entirely (any circuit with a pot in a parallel network fell back to
        // an "Unsupported branched topology" message even though the math is
        // straightforward).
        if(c.type==='potentiometer'){
          const maxR = Math.max(1, Number(c.maxR) || 10000);
          const r1 = Math.max(1e-6, Number(c.r) || maxR/2);
          const r2 = Math.max(1e-6, maxR - r1);
          const a1=key(c.id,'Pin 1'), b1=key(c.id,'Wiper');
          const a2=key(c.id,'Wiper'), b2=key(c.id,'Pin 3');
          edges.push({c,a:find(a1),b:find(b1),r:r1});
          edges.push({c,a:find(a2),b:find(b2),r:r2});
          continue;
        }
        let a,b,r;
        if(c.type==='switch'||c.type==='push_button'||c.type==='reed_switch'||c.type==='mcb'){ if(c.type==='mcb' ? (c.tripped || c.closed === false) : !c.closed) continue; a=key(c.id,c.terminals[0]); b=key(c.id,c.terminals[1]); r=1e-6; }
        else { const ts=(c.terminals||[]); if(ts.length<2) continue; a=key(c.id,ts[0]); b=key(c.id,ts[1]);
          r=Number(c.r); if(!Number.isFinite(r)||r<=0){ if(c.type==='relay') r=Number(c.coilR)||120; else if(c.type==='fuse') r=Number(c.r)||0.1; else if(c.type==='motor') r=20; else if(c.type==='buzzer') r=40; else if(c.type==='inductor') r=Number(c.r)||0.5; else r=NaN; }
          if(c.type==='fuse' && (c.blown||c.isBlown)) continue;
        }
        if(Number.isFinite(r)&&r>=0) edges.push({c,a:find(a),b:find(b),r:Math.max(r,1e-6)});
      }
      if(!edges.length) return null;
      const nodes=[...new Set(edges.flatMap(e=>[e.a,e.b]))].filter(n=>n!==neg&&n!==pos);
      const idx=new Map(nodes.map((n,i)=>[n,i]));
      const n=nodes.length, A=Array.from({length:n},()=>Array(n).fill(0)), z=Array(n).fill(0), V=Number(battery.v)||0;
      const addConduct=(u,v,g)=>{ if(u!==neg&&u!==pos) A[idx.get(u)][idx.get(u)]+=g; if(v!==neg&&v!==pos) A[idx.get(v)][idx.get(v)]+=g; if(u!==neg&&v!==neg&&u!==pos&&v!==pos){A[idx.get(u)][idx.get(v)]-=g;A[idx.get(v)][idx.get(u)]-=g;} if(u===pos&&v!==neg&&v!==pos) z[idx.get(v)]+=g*V; if(v===pos&&u!==neg&&u!==pos) z[idx.get(u)]+=g*V; };
      edges.forEach(e=>addConduct(e.a,e.b,1/e.r));
      // Gaussian elimination with partial pivoting.
      for(let i=0;i<n;i++){ let p=i; for(let r=i+1;r<n;r++) if(Math.abs(A[r][i])>Math.abs(A[p][i])) p=r; if(Math.abs(A[p][i])<1e-12) return null; [A[i],A[p]]=[A[p],A[i]]; [z[i],z[p]]=[z[p],z[i]]; const d=A[i][i]; for(let j=i;j<n;j++) A[i][j]/=d; z[i]/=d; for(let r=0;r<n;r++){if(r===i)continue; const f=A[r][i]; if(!f)continue; for(let j=i;j<n;j++)A[r][j]-=f*A[i][j]; z[r]-=f*z[i];}}
      const volts=new Map([[pos,V],[neg,0]]); nodes.forEach((node,i)=>volts.set(node,z[i]));
      let sourceCurrent=0;
      edges.forEach(e=>{ const i=(volts.get(e.a)-volts.get(e.b))/e.r; if(e.a===pos) sourceCurrent+=i; if(e.b===pos) sourceCurrent-=i; });
      if(!Number.isFinite(sourceCurrent)||sourceCurrent<0) sourceCurrent=Math.abs(sourceCurrent||0);
      const telemetry=new Map();
      edges.forEach(e=>{ const i=(volts.get(e.a)-volts.get(e.b))/e.r; const absI=Math.abs(i), vd=Math.abs(volts.get(e.a)-volts.get(e.b)); telemetry.set(e.c.id,{voltage:vd,current:absI,power:vd*absI,resistance:e.r}); e.c.simVoltage=vd; e.c.simCurrent=absI; e.c.simPower=vd*absI; });
      return {short:false, V, current:sourceCurrent, req:sourceCurrent>1e-12?V/sourceCurrent:Infinity, telemetry, volts};
    }

    function setSmartMetrics(v=0, i=0, p=0, health='READY', note='') {
      const fmt=(n,d=2)=>Number.isFinite(Number(n))?Number(n).toFixed(d):'0.00';
      const el=id=>document.getElementById(id);
      if(el('smart-v')) el('smart-v').innerText=`${fmt(v)} V`;
      if(el('smart-i')) el('smart-i').innerText=`${fmt(i*1000)} mA`;
      if(el('smart-p')) el('smart-p').innerText=`${fmt(p,3)} W`;
      if(el('smart-health')) el('smart-health').innerText=health;
      if(el('smart-diagnostic-text')) el('smart-diagnostic-text').innerText=note||'No diagnostic message.';
    }

    /* ============================================================
       v101: SINGLE NORMALIZED CIRCUIT VERIFICATION STATE
       ------------------------------------------------------------
       Every simulation branch ultimately maps into exactly one of
       three levels: OK / WARNING / ERROR. This section is additive —
       existing callers of updateSmartFromSimulation(v,i,p,health,note)
       keep working unchanged (backward compatible), they just now also
       get consistent color/border/icon treatment and a real "level" on
       the published telemetry object. Call sites that need to be
       explicit about a level that the legacy `health` string can't
       express (e.g. "CHECK" meaning a hard block, not a soft warning)
       pass an optional 6th `level` argument.
       ============================================================ */
    const VERIFICATION_ICONS = { OK: '✔️', WARNING: '⚠️', ERROR: '❌' };

    // Maps the many legacy `health` strings already used across the
    // simulation branches onto the 3 normalized levels. Anything not
    // explicitly listed defaults to WARNING (safer than silently OK).
    function healthToVerificationLevel(health) {
      switch (String(health || '').toUpperCase()) {
        case 'OK': return 'OK';
        case 'CUTOFF': return 'OK'; // a correctly-solved "device is off" state, not an error
        case 'READY': return null; // neutral / not-yet-simulated — no color state
        case 'OPEN': return 'ERROR'; // missing conductive path (spec: open circuit = error)
        case 'CHECK': return 'WARNING'; // default; specific hard-block sites pass level='ERROR' explicitly
        default: return 'WARNING';
      }
    }

    function applyVerificationStateClasses(level) {
      const classes = ['is-verified-ok', 'is-verified-warning', 'is-verified-error'];
      const targets = [document.getElementById('builder-status'), document.getElementById('elab-v565-smart-panel')];
      const cls = level === 'OK' ? 'is-verified-ok' : level === 'WARNING' ? 'is-verified-warning' : level === 'ERROR' ? 'is-verified-error' : null;
      targets.forEach(t => {
        if (!t) return;
        t.classList.remove(...classes);
        if (cls) t.classList.add(cls);
      });
    }

    // Central result-update helper (spec: applyCircuitVerificationResult).
    // Responsible for #builder-status-text, #builder-calc-stat, #smart-health,
    // #smart-diagnostic-text, Smart metrics, and the verification CSS state.
    function applyCircuitVerificationResult(result) {
      const r = result || {};
      const level = (r.level === 'OK' || r.level === 'WARNING' || r.level === 'ERROR') ? r.level : healthToVerificationLevel(r.health) || 'WARNING';
      const icon = r.icon || VERIFICATION_ICONS[level] || '';
      const colorClass = level === 'OK' ? 'text-emerald-400' : level === 'WARNING' ? 'text-amber-300' : 'text-rose-500';
      const status = document.getElementById('builder-status-text');
      if (status && (r.title || r.message)) {
        status.innerHTML = `<span class="${colorClass} font-bold">${icon} ${r.title || ''}</span>${r.message ? ' ' + r.message : ''}`;
      }
      const stat = document.getElementById('builder-calc-stat');
      if (stat && typeof r.calc === 'string') stat.innerText = r.calc;
      applyVerificationStateClasses(level);
      updateSmartFromSimulation(r.voltage || 0, r.current || 0, r.power || 0, level, r.details || r.message || r.title || '', level);
      return level;
    }

    function runSmartDiagnostics() {
      const comps=Array.isArray(builderCanvasComps)?builderCanvasComps:[], wires=Array.isArray(builderWires)?builderWires:[];
      const issues=[], seen=new Set();
      const endpointExists=ep=>!!ep&&comps.some(c=>c.id===ep.compId&&Array.isArray(c.terminals)&&c.terminals.includes(ep.term));
      wires.forEach((w,i)=>{
        if(!endpointExists(w.from)||!endpointExists(w.to))issues.push(`Wire ${i+1}: invalid/stale terminal endpoint.`);
        if(w.from&&w.to){const key=[`${w.from.compId}:${w.from.term}`,`${w.to.compId}:${w.to.term}`].sort().join('|');if(seen.has(key))issues.push(`Duplicate connection: ${key}`);else seen.add(key);}
        if(w.from?.compId===w.to?.compId)issues.push(`Wire ${i+1}: same-component connection is not allowed.`);
      });
      const dc=comps.find(c=>c.type==='source'), ac=comps.find(c=>c.type==='ac_source');
      if(!dc&&!ac)issues.push('No power source. Add a DC battery or AC source.');
      if(ac){
        const bridge=comp=>comp.type==='bridge_rectifier';
        const hasBridge=comps.some(bridge)||comps.filter(c=>c.type==='diode').length>=4;
        if(!hasBridge)issues.push('AC source detected, but no bridge rectifier/4-diode bridge is present.');
      }
      const badAdvanced=comps.filter(c=>['bjt_npn','p_mosfet','scr','triac','diac','ic_741','reg_7805','schmitt_trigger','ir_sensor','thermocouple'].includes(c.type));
      if(badAdvanced.length)issues.push(`${badAdvanced.length} advanced component${badAdvanced.length===1?'':'s'} require their dedicated model; they will not be treated as simple 2-terminal wires.`);
      let health='READY',note='No obvious wiring faults detected.';
      if(issues.length){health='CHECK';note=issues.slice(0,3).join(' • ')+(issues.length>3?` • +${issues.length-3} more`:'');}
      else if(ac){health='OK';note='AC source topology looks valid. Run simulation for rectifier/load operating point.';}
      else if(dc){const loop=checkCircuitClosedLoop();health=loop.isClosed?'OK':'OPEN';note=loop.isClosed?`Closed DC loop detected. ${comps.length} components / ${wires.length} wire connections scanned.`:'DC source found, but the conductive loop is open. Check switches and terminal wiring.';}
      /* STAGE13-DIAGNOSTICS-FIX
         If the circuit has already been simulated successfully, diagnostics
         must surface the latest solver operating point instead of resetting
         Current/Power to zero.  simulationTelemetry is cleared at the start
         of a new simulation, so this represents the latest completed run.
         Keep the topology-only path at zero when no solved telemetry exists. */
      let smartV = dc?.v || ac?.v || 0;
      let smartI = 0;
      let smartP = 0;
      if (!issues.length && simulationTelemetry instanceof Map && simulationTelemetry.size > 0) {
        let maxI = 0, totalP = 0;
        simulationTelemetry.forEach(t => {
          const ci = Math.abs(Number(t?.current) || 0);
          const cp = Math.max(0, Number(t?.power) || 0);
          if (ci > maxI) maxI = ci;
          totalP += cp;
        });
        smartI = maxI;
        smartP = totalP;
      }
      setSmartMetrics(smartV,smartI,smartP,health,note);
      // v101: this is a topology-only pre-check that runs at the start of
      // runBuilderSimCore(), before the real solver executes. Do NOT touch
      // #builder-status-text here beyond a transient "issues found" note —
      // the authoritative final status/color for this Simulate run is set
      // afterwards by whichever branch actually solves (or blocks) the
      // circuit, via updateSmartFromSimulation()/applyCircuitVerificationResult().
      const status=document.getElementById('builder-status-text');if(status&&issues.length)status.innerHTML=`<span class="text-amber-300 font-bold">⚠ Smart check:</span> ${issues.length} issue${issues.length===1?'':'s'} found.`;
      return {issues,health};
    }

    function updateSmartFromSimulation(v,i,p,health,note,level){
      const resolvedLevel = (level === 'OK' || level === 'WARNING' || level === 'ERROR') ? level : healthToVerificationLevel(health);
      const displayHealth = resolvedLevel || String(health || 'READY');
      setSmartMetrics(v,i,p,displayHealth,note);
      applyVerificationStateClasses(resolvedLevel);
      // v49: publish the last real Builder simulation telemetry for the Smart Assistant.
      window.NILSparkLabLastSimulation = Object.freeze({
        voltage:Number(v)||0,
        current:Number(i)||0,
        power:Number(p)||0,
        health:String(health||'READY'),
        note:String(note||''),
        // v101: normalized verification level/icon, additive — existing
        // consumers reading voltage/current/power/health/note/source are
        // unaffected.
        level: resolvedLevel || undefined,
        verificationLevel: resolvedLevel || undefined,
        verificationIcon: resolvedLevel ? VERIFICATION_ICONS[resolvedLevel] : undefined,
        timestamp:Date.now(),
        source:'builder-simulation'
      });
      try{ window.dispatchEvent(new CustomEvent('nilsparklab:simulation',{detail:window.NILSparkLabLastSimulation})); }catch(_){ }
    }

    // v101: clears the verification-state color layer and Smart panel back
    // to a neutral pre-simulation state, WITHOUT touching #builder-status-text
    // (used where a caller wants to keep its own status message, e.g. after
    // importing a circuit).
    function resetVerificationDisplay(){
      const stat = document.getElementById('builder-calc-stat');
      if (stat) stat.innerText = '';
      applyVerificationStateClasses(null);
      setSmartMetrics(0,0,0,'READY','Press Simulate to scan connections, shorts, open terminals and overload conditions.');
    }

    // v101: called whenever the circuit is edited (component/wire added,
    // removed, moved, or a value/switch changed) while it is NOT currently
    // live-simulating. A previous OK/WARNING/ERROR verification result no
    // longer applies to the modified circuit, so it is invalidated back to
    // a neutral "needs Simulate" state rather than left showing stale
    // green/red text for a circuit that has since changed.
    function markCircuitVerificationStale(){
      const status = document.getElementById('builder-status-text');
      if (status) status.innerHTML = '<span class="text-cyan-300 font-bold">Circuit changed</span> · Simulate to verify';
      resetVerificationDisplay();
    }

    /* STAGE11-BRIDGE-START
       Stage 11 repair: the actual Builder simulation invocation must consume
       the UCDM/Adapter-derived representation, not the raw Builder arrays,
       whenever conversion succeeds. If UCDM/Adapter conversion is not
       applicable (invalid circuit, unsupported component, modules missing),
       the raw Builder state is left untouched and runBuilderSimCore's
       existing runtime guard and manual checks reject it exactly as before.
       Builder state is restored unconditionally after the core call. */
    function runBuilderSim() {
      const U = window.NILSparkLabUCDM;
      const A = window.NILSparkLabUCDMSimulationAdapter;
      let restoreBuilderState = null;
      if (U && A && typeof U.fromBuilder === "function" && typeof U.validate === "function" && typeof A.toSimulationInput === "function" && window.NilSparkLabBuilderState && typeof window.NilSparkLabBuilderState.replace === "function") {
        try {
          const ucdmModel = U.fromBuilder();
          const checked = U.validate(ucdmModel);
          if (checked.valid) {
            const derivedInput = A.toSimulationInput(ucdmModel);
            const previousComponents = builderCanvasComps;
            const previousWires = builderWires;
            window.NilSparkLabBuilderState.replace(derivedInput.components, derivedInput.wires);
            restoreBuilderState = function () {
              window.NilSparkLabBuilderState.replace(previousComponents, previousWires);
            };
          }
        } catch (_) {
          // Fall through: raw Builder state stays untouched, runBuilderSimCore's
          // existing validation below still rejects it.
        }
      }
      try {
        return runBuilderSimCore();
      } finally {
        if (restoreBuilderState) restoreBuilderState();
      }
    }
    /* STAGE11-BRIDGE-END */

    function runBuilderSimCore() {
      const runtimeGuard = window.NILSparkLabSimulationRuntimeGuard;
      if (runtimeGuard && typeof runtimeGuard.validate === "function") {
        const runtimeCheck = runtimeGuard.validate(builderCanvasComps, builderWires);
        if (!runtimeCheck.valid) {
          isSimRunning = false;
          const first = runtimeCheck.errors[0] || {message:"Invalid simulation input"};
          showSimulationStatus(`<span class="text-rose-400 font-bold">⚠ Simulation input rejected.</span> ${first.message}`, "Simulation blocked — fix invalid circuit data.");
          updateSmartFromSimulation(0,0,0,'CHECK',first.message||'Invalid simulation input.','ERROR');
          return;
        }
      }
      resetSimulationTelemetry();

      // v5.80: AC source + bridge rectifier is handled separately from the
      // existing DC battery solver. This also recognizes a hand-built
      // four-diode bridge, so the user's original topology can simulate.
      const acSource = builderCanvasComps.find(c => c.type === 'ac_source');
      const hasBridgeNetwork = !!acSource && (
        builderCanvasComps.some(c => c.type === 'bridge_rectifier') ||
        builderCanvasComps.filter(c => c.type === 'diode').length >= 4
      );
      if (acSource && hasBridgeNetwork) {
        runBridgeRectifierSim(acSource);
        return;
      }

      const smart=runSmartDiagnostics();
      const logicGates = builderCanvasComps.filter(c => c.type === 'logic_gate');

      if (logicGates.length > 0) {
        isSimRunning = true;
        SoundEngine.playBeep(1000, 0.1);
        const inputs = builderCanvasComps.filter(c => c.type === 'logic_input');
        const inA = inputs[0] ? inputs[0].state : 0;
        const inB = inputs[1] ? inputs[1].state : 0;

        let out = 0;
        const gate = logicGates[0];
        if (gate.gateType === 'AND') out = (inA && inB) ? 1 : 0;
        if (gate.gateType === 'OR') out = (inA || inB) ? 1 : 0;
        if (gate.gateType === 'NOT') out = !inA ? 1 : 0;
        if (gate.gateType === 'NAND') out = !(inA && inB) ? 1 : 0;
        if (gate.gateType === 'NOR') out = !(inA || inB) ? 1 : 0;
        if (gate.gateType === 'XOR') out = (inA ^ inB) ? 1 : 0;

        document.getElementById('builder-status-text').innerHTML = `
          <span class="text-amber-400 font-bold">✓ Digital Logic Active:</span> ${gate.gateType} Output = <strong class="${out ? 'text-emerald-400' : 'text-rose-400'}">${out} (${out ? 'HIGH' : 'LOW'})</strong>
        `;
        document.getElementById('builder-calc-stat').innerText = `Inputs: [A=${inA}, B=${inB}] ➔ OUT=${out}`;
        updateSmartFromSimulation(3.3,0,out?'0.01':'0','OK',`Digital logic: ${gate.gateType} output = ${out ? 'HIGH (1)' : 'LOW (0)'}.`);
        drawWires();
        return;
      }

      const loop = checkCircuitClosedLoop();
      const componentPath = loop.battery ? findClosedComponentPath(loop.battery) : { closed: false, componentIds: new Set(), ledIds: new Set() };

      builderCanvasComps.forEach(c => {
        if (c.type === 'led') c.isOn = false;
        if (c.type === 'motor') c.isSpinning = false;
        if (c.type === 'buzzer') c.isOn = false;
        if (c.type === 'relay') c.energized = false;
        if (c.type === 'bjt_npn' || c.type === 'bjt_pnp' || c.type === 'mosfet_n') c.isOn = false;
      });

      const unsupportedTypes = new Set(['p_mosfet','scr','triac','diac','ic_741','reg_7805','schmitt_trigger','ir_sensor','thermocouple']);
      const wiredComponentIds = new Set();
      builderWires.forEach(w=>{ if(w?.from)wiredComponentIds.add(w.from.compId); if(w?.to)wiredComponentIds.add(w.to.compId); });
      const supportedDcTypes = new Set(['source','resistor','potentiometer','ldr','thermistor','thermistor_ptc','pt100','capacitor','inductor','led','diode','motor','buzzer','fuse','relay','switch','mcb','push_button','reed_switch','dpdt_switch','ac_source','bridge_rectifier','lamp','bjt_npn','bjt_pnp','mosfet_n']);
      const activeUnsupported = builderCanvasComps.filter(c=>wiredComponentIds.has(c.id) && (unsupportedTypes.has(c.type) || !supportedDcTypes.has(c.type)));
      if(activeUnsupported.length){
        isSimRunning=false;
        const names=activeUnsupported.slice(0,3).map(c=>c.name||c.type).join(', ');
        showSimulationStatus(`<span class='text-amber-300 font-bold'>⚠ Dedicated model required:</span> ${names}${activeUnsupported.length>3?' …':''}. These components need their dedicated/advanced model and are intentionally not reduced to fake 2-terminal resistors.`, 'Simulation paused — connect only supported DC passives/semiconductors for this solver.');
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','Advanced component model is not available in the simplified DC solver.');
        renderBuilderCanvas(); return;
      }

      if (loop.battery && isDirectBatteryShort(loop.battery)) {
        isSimRunning = false;
        safeSound('spark');
        showSimulationStatus(
          "<span class='text-rose-500 font-bold animate-pulse'>💥 HARD SHORT CIRCUIT!</span> Battery + and − are directly connected. Simulation blocked to protect the virtual source.",
          "I = 0 mA (protected) | Remove the short"
        );
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','Hard short circuit detected. Simulation blocked.','ERROR');
        renderBuilderCanvas();
        return;
      }

      if (!loop.battery) {
        isSimRunning = false;
        SoundEngine.playBeep(400, 0.2);
        document.getElementById('builder-status-text').innerHTML = "<span class='text-amber-400 font-bold'>⚠ No DC Power Source found.</span>";
        document.getElementById('builder-calc-stat').innerText = "";
        updateSmartFromSimulation(0,0,0,'CHECK','No DC power source detected.','ERROR');
        renderBuilderCanvas();
        return;
      }

      // V6.1: Advanced educational switch models are evaluated before the generic
      // closed-loop test because the transistor/MOSFET channel itself is conditional.
      const pnpModels = builderCanvasComps.filter(c=>c.type==='bjt_pnp');
      const nmosModels = builderCanvasComps.filter(c=>c.type==='mosfet_n');
      const advancedSwitch = pnpModels.length===1 ? solvePnpHighSideSwitch(loop.battery,pnpModels[0]) : (nmosModels.length===1 ? solveNmosLowSideSwitch(loop.battery,nmosModels[0]) : null);
      const advancedDevice = pnpModels.length===1 ? pnpModels[0] : (nmosModels.length===1 ? nmosModels[0] : null);
      if (advancedSwitch && advancedDevice) {
        isSimRunning=true; advancedDevice.isOn=advancedSwitch.on;
        const lc=advancedSwitch.loadComp;
        if(lc.type==='motor')lc.isSpinning=advancedSwitch.on;
        if(lc.type==='buzzer')lc.isOn=advancedSwitch.on;
        if(lc.type==='relay')lc.energized=advancedSwitch.on;
        const current=advancedSwitch.Ic!==undefined?advancedSwitch.Ic:(advancedSwitch.Id||0);
        advancedDevice.simCurrent=current; advancedDevice.simVoltage=advancedSwitch.Vce!==undefined?advancedSwitch.Vce:advancedSwitch.Vds; advancedDevice.simPower=current*advancedDevice.simVoltage;
        lc.simCurrent=current; lc.simVoltage=Math.max(0,(advancedSwitch.Vcc||0)-advancedDevice.simVoltage); lc.simPower=current*lc.simVoltage;
        showSimulationStatus(`<span class="text-emerald-400 font-bold">✓ ${advancedDevice.type==='bjt_pnp'?'PNP':'N-MOSFET'} ${advancedSwitch.region}:</span> ${advancedSwitch.on?'switch ON':'switch OFF'} — educational switching model active.`, `I = ${(current*1000).toFixed(2)} mA | ${advancedDevice.type==='bjt_pnp'?'VCE':'VDS'} = ${(advancedDevice.simVoltage||0).toFixed(3)} V`);
        updateSmartFromSimulation(advancedSwitch.Vcc||0,current,current*(advancedSwitch.Vcc||0),'OK',`${advancedDevice.type==='bjt_pnp'?'PNP high-side':'N-MOSFET low-side'} educational switch model: ${advancedSwitch.region}.`);
        renderBuilderCanvas(); return;
      }

      if (!loop.isClosed) {
        isSimRunning = false;
        SoundEngine.playBeep(400, 0.2);
        document.getElementById('builder-status-text').innerHTML = "<span class='text-slate-400 font-bold'>⚡ Open Circuit:</span> Path broken or switch OFF. Current = 0 mA.";
        document.getElementById('builder-calc-stat').innerText = "I = 0.00 mA";
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'OPEN','Open circuit: current is zero until the conductive path is completed.');
        renderBuilderCanvas();
        return;
      }

      const activePassives = getActivePassiveComponents(loop.battery);
      const resistors = activePassives.filter(c => c.type === 'resistor');
      const pots = activePassives.filter(c => c.type === 'potentiometer');
      const ldrs = activePassives.filter(c => c.type === 'ldr');
      const motors = activePassives.filter(c => c.type === 'motor');
      const inductors = activePassives.filter(c => c.type === 'inductor');
      const fuses = activePassives.filter(c => c.type === 'fuse');
      const buzzers = activePassives.filter(c => c.type === 'buzzer');
      const relays = activePassives.filter(c => c.type === 'relay');
      const transistors = builderCanvasComps.filter(c => c.type === 'bjt_npn' && componentPath.componentIds.has(c.id));
      const capacitors = builderCanvasComps.filter(c => c.type === 'capacitor' && componentPath.componentIds.has(c.id));
      const leds = builderCanvasComps.filter(c => c.type === 'led' && componentPath.componentIds.has(c.id));
      const diodes = builderCanvasComps.filter(c => c.type === 'diode' && componentPath.componentIds.has(c.id));

      // v5.55 FINAL DC model: capacitor is an open circuit at steady state;
      // inductor is approximated by its winding resistance. This is intentionally
      // a DC educational approximation, not a transient/SPICE solver.

      if (transistors.length > 0) {
        // V6: attempt a real NPN switch bias-point solve for the classic
        // base-resistor + collector-load topology before giving up.
        if (transistors.length === 1) {
          const bjt = solveTransistorSwitch(loop.battery, transistors[0]);
          if (bjt) {
            isSimRunning = true;
            transistors[0].isOn = bjt.on;
            const lc = bjt.loadComp;
            if (lc.type === 'led') lc.isOn = bjt.on;
            if (lc.type === 'motor') lc.isSpinning = bjt.on;
            if (lc.type === 'buzzer') lc.isOn = bjt.on;
            if (lc.type === 'relay') lc.energized = bjt.on;
            simulationTelemetry.set(transistors[0].id, { voltage: bjt.Vce, current: bjt.Ic, power: bjt.Vce * bjt.Ic, resistance: bjt.Ic > 0 ? bjt.Vce / bjt.Ic : Infinity });
            simulationTelemetry.set(bjt.rb.id, { voltage: bjt.Ib * (Number(bjt.rb.r) || 1), current: bjt.Ib, power: bjt.Ib * bjt.Ib * (Number(bjt.rb.r) || 1), resistance: Number(bjt.rb.r) || 1 });
            const regionColor = bjt.region === 'CUTOFF' ? 'text-slate-400' : bjt.region === 'SATURATION' ? 'text-emerald-400' : 'text-amber-300';
            showSimulationStatus(
              `<span class='${regionColor} font-bold'>✓ NPN switch solved — ${bjt.region}.</span> ${bjt.on ? 'Transistor conducting, load energized.' : 'Base current insufficient — transistor OFF.'}`,
              `Ib = ${(bjt.Ib*1e6).toFixed(1)} µA | Ic = ${(bjt.Ic*1000).toFixed(2)} mA | Vce = ${bjt.Vce.toFixed(2)} V`
            );
            updateSmartFromSimulation(bjt.Vcc, bjt.Ic, bjt.Vce * bjt.Ic, bjt.on ? 'OK' : 'CUTOFF', `NPN in ${bjt.region}: Ib=${(bjt.Ib*1e6).toFixed(1)}µA, Ic=${(bjt.Ic*1000).toFixed(2)}mA, Vce=${bjt.Vce.toFixed(2)}V.`);
            renderBuilderCanvas();
            return;
          }
        }
        isSimRunning = false;
        document.getElementById('builder-status-text').innerHTML = `<span class='text-amber-300 font-bold'>⚠ NPN bias analysis required.</span> This solver recognizes the classic base-resistor + collector-load switch topology (base resistor and collector load both returning to the same rail as the emitter's ground). Connect that pattern, or simplify the network — the solver will not guess conduction for other topologies.`;
        document.getElementById('builder-calc-stat').innerText = `β = ${Number(transistors[0].beta || 100)} | VBE = ${Number(transistors[0].vbe || 0.7).toFixed(2)} V`;
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','NPN bias analysis required — unsupported base/collector topology for the simplified switch solver.','WARNING');
        renderBuilderCanvas();
        return;
      }

      if (capacitors.length > 0) {
        isSimRunning = false;
        document.getElementById('builder-status-text').innerHTML = `<span class='text-cyan-300 font-bold'>ℹ Capacitor DC steady-state:</span> capacitor behaves as an open circuit after charging. Use a resistor/switch path and the capacitor will be shown as DC-open.`;
        document.getElementById('builder-calc-stat').innerText = 'DC model: C → open circuit';
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','Capacitor DC steady-state: capacitor behaves as an open circuit after charging.','WARNING');
        renderBuilderCanvas();
        return;
      }

      let totalR = activePassives.reduce((sum, c) => {
        if (c.type === 'inductor') return sum + Math.max(0.05, Number(c.r) || 0.5);
        if (c.type === 'fuse') return sum + (c.blown ? 1e9 : Math.max(0.05, Number(c.r) || 0.1));
        if (c.type === 'relay') return sum + Math.max(10, Number(c.coilR) || 120);
        return sum + Math.max(0, Number(c.r) || 0);
      }, 0);
      let totalVf = leds.reduce((sum, l) => sum + Math.max(0, Number(l.vf) || 0), 0) + diodes.reduce((sum, d) => sum + Math.max(0, Number(d.vf) || 0), 0);

      // v5.55: totalR === 0 is only a true short when there is no
      // current-limiting element on the discovered component path.
      if (totalR <= 0 && componentPath.componentIds.size === 0) {
        isSimRunning = false;
        safeSound('spark');
        showSimulationStatus(
          "<span class='text-rose-500 font-bold animate-pulse'>💥 Short Circuit!</span> Closed path has no current-limiting resistance.",
          "I = undefined / excessive current"
        );
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','Hard short circuit detected. Simulation blocked.','ERROR');
        renderBuilderCanvas();
        return;
      }

      if ((leds.length > 0 || diodes.length > 0) && totalR < 10) {
        isSimRunning = false;
        safeSound('spark');
        document.getElementById('builder-status-text').innerHTML = "<span class='text-rose-500 font-bold animate-pulse'>💥 Semiconductor overload! Add a series resistor.</span>";
        document.getElementById('builder-calc-stat').innerText = "Short-Circuit";
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','Semiconductor overload — LED/diode current-limiting resistance too low. Add a series resistor.','ERROR');
        renderBuilderCanvas();
        return;
      }

      isSimRunning = true;
      SoundEngine.playBeep(1200, 0.1);
      const netV = loop.battery.v - totalVf;
      if ((leds.length > 0 || diodes.length > 0) && netV <= 0) {
        isSimRunning = false;
        SoundEngine.playBeep(500, 0.15);
        document.getElementById('builder-status-text').innerHTML = "<span class='text-amber-400 font-bold'>⚠ Insufficient forward voltage for the LED chain.</span>";
        document.getElementById('builder-calc-stat').innerText = `Vnet = ${netV.toFixed(2)} V | I = 0.00 mA`;
        updateSmartFromSimulation(loop.battery?.v||0,0,0,'CHECK','Insufficient forward voltage for the LED/diode chain.','WARNING');
        renderBuilderCanvas();
        return;
      }
      const i_ma = Math.max(0, netV / totalR) * 1000;
      const currentA = i_ma / 1000;
      const p_res = Math.pow(currentA, 2) * totalR * 1000;

      // v5.55: expose the solved operating point for every active component.
      // This is intentionally series-path telemetry until a full nodal solver
      // is introduced; parallel/ambiguous topologies are flagged below.
      buildSeriesTelemetry(activePassives, [...leds, ...diodes], currentA, Number(loop.battery.v) || 0, totalVf);

      // v5.55: don't silently pretend a branched network is a simple series loop.
      const netGraph = getSimulationNetGraph();
      const topoDegree = new Map();
      const addTopo = (a, b) => {
        topoDegree.set(a, (topoDegree.get(a) || 0) + 1);
        topoDegree.set(b, (topoDegree.get(b) || 0) + 1);
      };
      builderWires.forEach(w => {
        if (w?.from && w?.to) addTopo(`${w.from.compId}:${w.from.term}`, `${w.to.compId}:${w.to.term}`);
      });
      builderCanvasComps.forEach(c => {
        if (c.type === 'source' || c.type === 'logic_gate' || c.type === 'logic_input') return;
        if ((c.type === 'switch' && c.closed) || (c.type === 'mcb' && !c.tripped && c.closed !== false)) addTopo(`${c.id}:In`, `${c.id}:Out`);
        else if (c.type === 'potentiometer') {
          addTopo(`${c.id}:Pin 1`, `${c.id}:Wiper`);
          addTopo(`${c.id}:Wiper`, `${c.id}:Pin 3`);
        } else if (Array.isArray(c.terminals) && c.terminals.length >= 2) {
          addTopo(`${c.id}:${c.terminals[0]}`, `${c.id}:${c.terminals[1]}`);
        }
      });
      const branchedNode = Array.from(topoDegree.values()).some(d => d > 2);
      if (branchedNode) {
        const nodal = solveResistorNetwork(loop.battery);
        if (nodal && !nodal.short) {
          if (nodal.current > 2) {
            isSimRunning=false; safeSound('spark');
            showSimulationStatus("<span class='text-rose-500 font-bold animate-pulse'>🛑 OVERCURRENT TRIP!</span> Nodal solution exceeded 2.00 A.", `I = ${(nodal.current*1000).toFixed(0)} mA | Limit = 2000 mA`);
            updateSmartFromSimulation(nodal.V,0,0,'CHECK','Nodal solution exceeded the 2.00 A virtual protection limit.','ERROR');
            renderBuilderCanvas(); return;
          }
          simulationTelemetry = nodal.telemetry;
          isSimRunning = true;
          builderCanvasComps.forEach(c=>{ if(c.type==='motor') c.isSpinning=true; if(c.type==='buzzer') c.isOn=true; if(c.type==='relay') c.energized=true; });
          showSimulationStatus("<span class='text-emerald-400 font-bold'>✓ Parallel/branched DC network solved.</span>", `V = ${nodal.V.toFixed(2)} V | I = ${(nodal.current*1000).toFixed(3)} mA | Req = ${nodal.req.toFixed(2)} Ω`);
          updateSmartFromSimulation(nodal.V,nodal.current,nodal.V*nodal.current,'OK',`Parallel/branched network solved. Equivalent R ≈ ${nodal.req.toFixed(2)} Ω.`);
          renderBuilderCanvas(); return;
        }
        isSimRunning = false;
        showSimulationStatus("<span class='text-amber-300 font-bold'>⚠ Unsupported branched topology.</span> Use resistors/switches/fuses for automatic nodal solving, or simplify the network.", `Topology: branched | Source = ${(Number(loop.battery.v)||0).toFixed(2)} V`);
        updateSmartFromSimulation(Number(loop.battery.v)||0,0,0,'CHECK','Unsupported branched topology for the automatic nodal solver.','WARNING');
        renderBuilderCanvas(); return;
      }

      // v5.55 protection threshold: 2 A for the virtual breadboard.
      // This is deliberately conservative and prevents absurd currents
      // from tiny resistance values in an educational simulation.
      if (i_ma > 2000) {
        isSimRunning = false;
        safeSound('spark');
        showSimulationStatus(
          "<span class='text-rose-500 font-bold animate-pulse'>🛑 OVERCURRENT TRIP!</span> Calculated current exceeded 2.00 A. Virtual protection opened the circuit.",
          `I = ${i_ma.toFixed(0)} mA | Limit = 2000 mA`
        );
        updateSmartFromSimulation(Number(loop.battery.v)||0,0,0,'CHECK','Calculated current exceeded the 2.00 A virtual protection limit.','ERROR');
        renderBuilderCanvas();
        return;
      }

      leds.forEach(l => l.isOn = true);
      diodes.forEach(d => { d.simCurrent = currentA; d.simVoltage = Number(d.vf) || 0.7; d.simPower = currentA * d.simVoltage; simulationTelemetry.set(d.id, { voltage: d.simVoltage, current: currentA, power: d.simPower, resistance: 0 }); });
      motors.forEach(m => m.isSpinning = true);
      buzzers.forEach(b => b.isOn = true);
      fuses.forEach(f => { if ((i_ma / 1000) > Number(f.ratedA || 1)) f.blown = true; });
      transistors.forEach(t => t.isOn = true);
      // Relay coil state is represented when a relay is present in the active path.
      relays.forEach(r => r.energized = true);

      const totalPowerW = (i_ma / 1000) * Math.max(0, Number(loop.battery.v) || 0);
      const highDissipation = p_res > 500;
      const powerWarning = highDissipation ? " <span class='text-amber-300'>⚠ High resistor dissipation.</span>" : "";
      document.getElementById('builder-status-text').innerHTML = `<span class='text-emerald-400 font-bold'>✓ Closed-Loop Verified.</span> Current flowing.${powerWarning}`;
      document.getElementById('builder-calc-stat').innerText = `I = ${i_ma.toFixed(2)} mA | R = ${totalR.toFixed(0)}Ω | P = ${p_res.toFixed(1)} mW | Source = ${totalPowerW.toFixed(2)} W | Direction = ${simulationDirection}`;
      // v101: real solved telemetry has priority over the topology-only
      // pre-check that ran earlier in runSmartDiagnostics() — this is the
      // authoritative final verification result for this Simulate run.
      updateSmartFromSimulation(Number(loop.battery.v) || 0, currentA, totalPowerW, highDissipation ? 'CHECK' : 'OK', highDissipation ? 'Closed-loop verified, but resistor dissipation is unusually high — check component ratings.' : `Closed DC loop verified. Current flowing normally.`, highDissipation ? 'WARNING' : 'OK');
      renderBuilderCanvas();
      trackProgress(10);
    }

    function loadCircuitPreset(presetKey) {
      if (!presetKey) return;
      safeSound('click');
      // FIX: resetBuilder() already pushes an undo snapshot, so the
      // extra saveStateForUndo() call that used to run right before
      // it created a redundant/duplicate history entry. Removed.
      resetBuilder();

      if (presetKey === 'led_series') {
        addBuilderComp('battery', { x: 30, y: 120, v: 9 });
        addBuilderComp('resistor', { x: 190, y: 50, r: 470 });
        addBuilderComp('led', { x: 190, y: 220, vf: 2.0, color: 'Red' });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#ef4444', from: { compId: builderCanvasComps[0].id, term: '+ (Pos)' }, to: { compId: builderCanvasComps[1].id, term: 'T1' } },
            { id: 'w2', color: '#eab308', from: { compId: builderCanvasComps[1].id, term: 'T2' }, to: { compId: builderCanvasComps[2].id, term: 'Anode (+)' } },
            { id: 'w3', color: '#334155', from: { compId: builderCanvasComps[2].id, term: 'Cathode (-)' }, to: { compId: builderCanvasComps[0].id, term: '- (Gnd)' } }
          ]);
          drawWires();
          runBuilderSim();
        }, 80);
      } else if (presetKey === 'pot_dimmer') {
        addBuilderComp('battery', { x: 30, y: 120, v: 9 });
        addBuilderComp('potentiometer', { x: 190, y: 50, r: 2500, wiperPos: 25 });
        addBuilderComp('led', { x: 190, y: 220, vf: 2.0, color: 'Red' });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#ef4444', from: { compId: builderCanvasComps[0].id, term: '+ (Pos)' }, to: { compId: builderCanvasComps[1].id, term: 'Pin 1' } },
            { id: 'w2', color: '#eab308', from: { compId: builderCanvasComps[1].id, term: 'Wiper' }, to: { compId: builderCanvasComps[2].id, term: 'Anode (+)' } },
            { id: 'w3', color: '#334155', from: { compId: builderCanvasComps[2].id, term: 'Cathode (-)' }, to: { compId: builderCanvasComps[0].id, term: '- (Gnd)' } }
          ]);
          drawWires();
          runBuilderSim();
        }, 80);
      } else if (presetKey === 'motor_switch') {
        addBuilderComp('battery', { x: 30, y: 120, v: 12 });
        addBuilderComp('switch', { x: 190, y: 50, closed: true });
        addBuilderComp('motor', { x: 190, y: 220 });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#ef4444', from: { compId: builderCanvasComps[0].id, term: '+ (Pos)' }, to: { compId: builderCanvasComps[1].id, term: 'In' } },
            { id: 'w2', color: '#eab308', from: { compId: builderCanvasComps[1].id, term: 'Out' }, to: { compId: builderCanvasComps[2].id, term: 'M+' } },
            { id: 'w3', color: '#334155', from: { compId: builderCanvasComps[2].id, term: 'M-' }, to: { compId: builderCanvasComps[0].id, term: '- (Gnd)' } }
          ]);
          drawWires();
          runBuilderSim();
        }, 80);
      } else if (presetKey === 'half_wave_rectifier') {
        // v10.25 — exact Half-wave Rectifier builder handoff
        addBuilderComp('ac_source', { x: 20, y: 140, v: 12, frequency: 50 });
        addBuilderComp('diode', { x: 210, y: 100, vf: 0.7 });
        addBuilderComp('resistor', { x: 420, y: 100, r: 470 });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#ef4444', from: { compId: builderCanvasComps[0].id, term: 'L' }, to: { compId: builderCanvasComps[1].id, term: 'Anode (+)' } },
            { id: 'w2', color: '#22d3ee', from: { compId: builderCanvasComps[1].id, term: 'Cathode (-)' }, to: { compId: builderCanvasComps[2].id, term: 'T1' } },
            { id: 'w3', color: '#334155', from: { compId: builderCanvasComps[2].id, term: 'T2' }, to: { compId: builderCanvasComps[0].id, term: 'N' } }
          ]);
          drawWires();
          renderBuilderCanvas();
        }, 100);
      } else if (presetKey === 'bridge_rectifier') {
        addBuilderComp('ac_source', { x: 20, y: 140, v: 12, frequency: 50 });
        addBuilderComp('bridge_rectifier', { x: 210, y: 100, ratedA: 2, ratedV: 400, vf: 0.7 });
        addBuilderComp('resistor', { x: 420, y: 60, r: 470 });
        addBuilderComp('led', { x: 420, y: 210, vf: 2.0, color: 'Red' });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#ef4444', from: { compId: builderCanvasComps[0].id, term: 'L' }, to: { compId: builderCanvasComps[1].id, term: 'AC1' } },
            { id: 'w2', color: '#22d3ee', from: { compId: builderCanvasComps[1].id, term: 'DC+' }, to: { compId: builderCanvasComps[2].id, term: 'T1' } },
            { id: 'w3', color: '#22d3ee', from: { compId: builderCanvasComps[2].id, term: 'T2' }, to: { compId: builderCanvasComps[3].id, term: 'Anode (+)' } },
            { id: 'w4', color: '#334155', from: { compId: builderCanvasComps[3].id, term: 'Cathode (-)' }, to: { compId: builderCanvasComps[1].id, term: 'DC-' } },
            { id: 'w5', color: '#334155', from: { compId: builderCanvasComps[1].id, term: 'AC2' }, to: { compId: builderCanvasComps[0].id, term: 'N' } }
          ]);
          drawWires();
          runBuilderSim();
        }, 100);
      } else if (presetKey === 'led_burn') {
        addBuilderComp('battery', { x: 30, y: 120, v: 9 });
        addBuilderComp('led', { x: 190, y: 120, vf: 2.0, color: 'Red' });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#ef4444', from: { compId: builderCanvasComps[0].id, term: '+ (Pos)' }, to: { compId: builderCanvasComps[1].id, term: 'Anode (+)' } },
            { id: 'w2', color: '#334155', from: { compId: builderCanvasComps[1].id, term: 'Cathode (-)' }, to: { compId: builderCanvasComps[0].id, term: '- (Gnd)' } }
          ]);
          drawWires();
          runBuilderSim();
        }, 80);
      } else if (presetKey === 'logic_and') {
        addBuilderComp('logic_in', { x: 30, y: 60, state: 1 });
        addBuilderComp('logic_in', { x: 30, y: 180, state: 1 });
        addBuilderComp('gate_and', { x: 190, y: 120, gateType: 'AND' });
        setTimeout(() => {
          window.NilSparkLabBuilderState.addWires([
            { id: 'w1', color: '#22d3ee', from: { compId: builderCanvasComps[0].id, term: 'OUT' }, to: { compId: builderCanvasComps[2].id, term: 'In A' } },
            { id: 'w2', color: '#22d3ee', from: { compId: builderCanvasComps[1].id, term: 'OUT' }, to: { compId: builderCanvasComps[2].id, term: 'In B' } }
          ]);
          drawWires();
          runBuilderSim();
        }, 80);
      }
    }

    function exportCircuitPNG() {
      safeSound('click');
      const canvasEl = document.getElementById('builder-canvas');
      const rect = canvasEl.getBoundingClientRect();
      const scale = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = Math.round(rect.width * scale);
      exportCanvas.height = Math.round(rect.height * scale);
      const ctx = exportCanvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('NIL SparkLab — Circuit Schematic', 14, 20);

      builderWires.forEach(w => {
        const p1 = getTerminalCenter(w.from.compId, w.from.term), p2 = getTerminalCenter(w.to.compId, w.to.term);
        if (!p1 || !p2) return;
        ctx.strokeStyle = w.color || '#22d3ee'; ctx.lineWidth = 3;
        ctx.beginPath(); const dx=Math.abs(p2.x-p1.x)*0.5;
        ctx.moveTo(p1.x,p1.y); ctx.bezierCurveTo(p1.x+dx,p1.y,p2.x-dx,p2.y,p2.x,p2.y); ctx.stroke();
      });
      builderCanvasComps.forEach(c => {
        ctx.save(); ctx.translate(c.x+70,c.y+35); ctx.rotate((Number(c.rotation)||0)*Math.PI/180);
        ctx.fillStyle='#0f172a'; ctx.strokeStyle=c.isOn||c.isSpinning?'#34d399':'#06b6d4'; ctx.lineWidth=2;
        ctx.fillRect(-65,-30,130,60); ctx.strokeRect(-65,-30,130,60);
        ctx.fillStyle='#e2e8f0'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.fillText(c.name||c.type,0,-2);
        if(c.type==='resistor') ctx.fillText(`${c.r}Ω`,0,14);
        if(c.type==='source') ctx.fillText(`${c.v}V`,0,14);
        if(c.type==='led') ctx.fillText(c.isOn?'ON':'OFF',0,14);
        ctx.restore();
      });
      const a=document.createElement('a'); a.href=exportCanvas.toDataURL('image/png'); a.download=`NilSparkLab_v5.55_Schematic_${Date.now()}.png`; a.click();
    }

    function exportCircuitJSON() {
      safeSound('click');
      const data = JSON.stringify({ components: builderCanvasComps, wires: builderWires }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NilSparkLab_Circuit_${Date.now()}.json`;
      a.click();
    }

    function importCircuitJSON(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.components && parsed.wires) {
            const validator = window.NilSparkLabSecurity && window.NilSparkLabSecurity.validateProject;
            if (typeof validator !== 'function') throw new Error('Canonical project validator unavailable');
            const checked = validator({
              version: window.NilSparkLabConfig?.projectFormat || '5.62',
              name: 'Imported Circuit',
              circuit: { components: parsed.components, wires: parsed.wires },
              simulation: { status: 'normal', overcurrent: 'false', currentDirection: 'forward', homePolarity: 1, homeFlowMode: 'conventional' }
            });
            if (!checked || !checked.ok) throw new Error(checked && checked.error || 'Circuit validation failed');
            saveStateForUndo();
            window.NilSparkLabBuilderState.replace(checked.value.circuit.components, checked.value.circuit.wires);
            renderBuilderCanvas();
            SoundEngine.playBeep(1400, 0.1);
            isSimRunning = false;
            document.getElementById('builder-status-text').innerText = "Circuit JSON imported successfully. Press Simulate to verify.";
            resetVerificationDisplay();
          } else {
            NilSparkLabDialog.alert("JSON file is missing components or wires data.", {title:"Circuit Import Failed", alertdialog:true});
          }
        } catch (err) {
          NilSparkLabDialog.alert("Invalid JSON Circuit file.", {title:"Circuit Import Failed", alertdialog:true});
        }
      };
      reader.onerror = () => NilSparkLabDialog.alert("Could not read the selected file.", {title:"Circuit Import Failed", alertdialog:true});
      reader.readAsText(file);
      // FIX: reset the input so re-selecting the same filename fires 'change' again
      event.target.value = '';
    }

    function resetBuilder() {
      const hadContent = builderCanvasComps.length > 0 || builderWires.length > 0;
      if (hadContent) saveStateForUndo();
      safeSound('click');
      isSimRunning = false;
      window.NilSparkLabBuilderState.clear();
      document.getElementById('builder-preset-select').value = "";
      document.getElementById('builder-status-text').innerText = "Canvas cleared.";
      resetVerificationDisplay();
      renderBuilderCanvas();
    }







    // v5.90 Guided Star-Delta build practice
    const sdGuidedOrder = ['SUPPLY','STOP','START','KM1','KM2','KM3','TIMER','OLR','MOTOR'];
    const sdGuidedLabels = {
      SUPPLY:'3Φ SUPPLY', STOP:'STOP NC', START:'START NO', KM1:'KM1 MAIN',
      KM2:'KM2 STAR', KM3:'KM3 DELTA', TIMER:'TIMER', OLR:'OLR', MOTOR:'3Φ MOTOR'
    };
    let sdGuidedBuild = [];

    function renderSdGuidedBuild() {
      const box=document.getElementById('sd-guided-slots');
      const count=document.getElementById('sd-guided-count');
      if(!box) return;
      if(!sdGuidedBuild.length) {
        box.innerHTML='<div class="w-full text-center py-5 text-[10px] text-slate-600 border border-dashed border-slate-800 rounded-lg">Build the sequence shown above. Remember: KM2 and KM3 must be interlocked.</div>';
      } else {
        box.innerHTML=sdGuidedBuild.map((key,i)=>
          '<div class="flex items-center gap-1"><span class="px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-[10px] font-bold">'+(i+1)+'. '+sdGuidedLabels[key]+'</span>'+
          (i<sdGuidedBuild.length-1?'<span class="text-slate-600">→</span>':'')+'</div>'
        ).join('');
      }
      if(count) count.textContent=sdGuidedBuild.length+' / 9 components';
    }

    function addSdGuidedComponent(key) {
      if(sdGuidedBuild.length>=sdGuidedOrder.length) return;
      sdGuidedBuild.push(key);
      renderSdGuidedBuild();
      const fb=document.getElementById('sd-guided-feedback');
      if(fb) fb.textContent='Added '+sdGuidedLabels[key]+'. Check the reference and then test the interlock.';
    }

    function resetSdGuidedBuild() {
      sdGuidedBuild=[];
      renderSdGuidedBuild();
      const fb=document.getElementById('sd-guided-feedback');
      if(fb) fb.textContent='Star-Delta practice circuit cleared. Build it again from the reference diagram.';
      const st=document.getElementById('sd-guided-status');
      if(st){st.textContent='NOT BUILT';st.className='px-2 py-1 rounded border border-slate-700 bg-slate-950 text-[10px] font-mono text-slate-400';}
    }

    function checkSdGuidedBuild() {
      const fb=document.getElementById('sd-guided-feedback');
      const st=document.getElementById('sd-guided-status');
      const exact=sdGuidedBuild.length===sdGuidedOrder.length && sdGuidedBuild.every((v,i)=>v===sdGuidedOrder[i]);
      const hasBoth=sdGuidedBuild.includes('KM2') && sdGuidedBuild.includes('KM3');
      if(exact && hasBoth) {
        if(fb) fb.innerHTML='<span class="text-emerald-400 font-bold">✓ Interlock check passed!</span> KM2 STAR and KM3 DELTA are both present and the sequence is complete. Ready to run.';
        if(st){st.textContent='READY TO RUN';st.className='px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-300';}
        return true;
      }
      let msg='Not correct yet. ';
      if(!sdGuidedBuild.length) msg+='Start with 3Φ SUPPLY.';
      else {
        const bad=sdGuidedBuild.findIndex((v,i)=>v!==sdGuidedOrder[i]);
        if(bad>=0) msg+='Position '+(bad+1)+' should be '+sdGuidedLabels[sdGuidedOrder[bad]]+'.';
        else if(sdGuidedBuild.length<sdGuidedOrder.length) msg+='Next component should be '+sdGuidedLabels[sdGuidedOrder[sdGuidedBuild.length]]+'.';
        else msg+='Check that KM2 STAR and KM3 DELTA are both present.';
      }
      if(fb) fb.textContent=msg;
      if(st){st.textContent='CHECK REQUIRED';st.className='px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-[10px] font-mono text-amber-300';}
      return false;
    }

    function runSdGuidedBuild() {
      if(!checkSdGuidedBuild()) return;
      const fb=document.getElementById('sd-guided-feedback');
      const st=document.getElementById('sd-guided-status');
      // Use the existing simulator's start-sequence function if available.
      if(typeof startStarDeltaSequence==='function') {
        startStarDeltaSequence();
        if(fb) fb.innerHTML='<span class="text-emerald-400 font-bold">▶ Sequence running.</span> Observe KM1 → KM2 STAR → transition → KM3 DELTA in the simulator below.';
        if(st){st.textContent='RUNNING';st.className='px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-300';}
      } else if(typeof startStarDelta==='function') {
        startStarDelta();
        if(fb) fb.innerHTML='<span class="text-emerald-400 font-bold">▶ Sequence started.</span> Watch the Star-Delta simulator below.';
        if(st){st.textContent='RUNNING';st.className='px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-300';}
      } else {
        if(fb) fb.textContent='Circuit is correct, but the Star-Delta simulator start control was not found in this build.';
      }
    }

    // v5.89 Guided DOL build practice
    const guidedDOLOrder = ['L','STOP','OLR','START','K1','AUX','N','MOTOR'];
    const guidedDOLLabels = {
      L:'L', STOP:'STOP NC', OLR:'OLR 95/96', START:'START NO',
      K1:'K1 COIL', AUX:'K1 AUX NO', N:'N', MOTOR:'3Φ MOTOR'
    };
    let guidedBuild = [];

    function renderGuidedBuild() {
      const box = document.getElementById('guided-build-slots');
      const count = document.getElementById('guided-build-count');
      if (!box) return;
      if (!guidedBuild.length) {
        box.innerHTML = '<div class="w-full text-center py-5 text-[10px] text-slate-600 border border-dashed border-slate-800 rounded-lg">Add the components below in the order shown by the reference diagram.</div>';
      } else {
        box.innerHTML = guidedBuild.map((key, i) =>
          '<div class="flex items-center gap-1">' +
          '<span class="px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-[10px] font-bold">' +
          (i+1) + '. ' + guidedDOLLabels[key] + '</span>' +
          (i < guidedBuild.length-1 ? '<span class="text-slate-600">→</span>' : '') +
          '</div>'
        ).join('');
      }
      if (count) count.textContent = guidedBuild.length + ' / 8 components';
    }

    function addGuidedComponent(key) {
      if (guidedBuild.length >= guidedDOLOrder.length) return;
      guidedBuild.push(key);
      renderGuidedBuild();
      const fb = document.getElementById('guided-build-feedback');
      if (fb) fb.textContent = 'Added ' + guidedDOLLabels[key] + '. Compare your order with the reference diagram, then press CHECK CIRCUIT.';
    }

    function resetGuidedBuild() {
      guidedBuild = [];
      renderGuidedBuild();
      const fb = document.getElementById('guided-build-feedback');
      if (fb) fb.textContent = 'Practice circuit cleared. Build it again from the reference diagram.';
      const st = document.getElementById('guided-build-status');
      if (st) { st.textContent='NOT BUILT'; st.className='px-2 py-1 rounded border border-slate-700 bg-slate-950 text-[10px] font-mono text-slate-400'; }
    }

    function checkGuidedBuild() {
      const fb = document.getElementById('guided-build-feedback');
      const st = document.getElementById('guided-build-status');
      const exact = guidedBuild.length === guidedDOLOrder.length &&
                    guidedBuild.every((v,i) => v === guidedDOLOrder[i]);
      if (exact) {
        if (fb) fb.innerHTML = '<span class="text-emerald-400 font-bold">✓ Circuit correct!</span> Control path and motor load are in the expected DOL learning order. You can RUN the circuit.';
        if (st) { st.textContent='READY TO RUN'; st.className='px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-300'; }
        return true;
      }
      let next = guidedDOLOrder[guidedBuild.length] || null;
      let msg = 'Not correct yet. ';
      if (!guidedBuild.length) msg += 'Start with L.';
      else {
        const badAt = guidedBuild.findIndex((v,i)=>v !== guidedDOLOrder[i]);
        if (badAt >= 0) msg += 'Position ' + (badAt+1) + ' should be ' + guidedDOLLabels[guidedDOLOrder[badAt]] + '.';
        else if (next) msg += 'Next component should be ' + guidedDOLLabels[next] + '.';
      }
      if (fb) fb.textContent = msg;
      if (st) { st.textContent='CHECK REQUIRED'; st.className='px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-[10px] font-mono text-amber-300'; }
      return false;
    }

    function runGuidedBuild() {
      if (!checkGuidedBuild()) return;
      if (typeof triggerDolStart === 'function') {
        triggerDolStart();
        const fb = document.getElementById('guided-build-feedback');
        if (fb) fb.innerHTML = '<span class="text-emerald-400 font-bold">▶ Circuit running.</span> The guided build has started the real DOL simulator below. Observe K1, auxiliary contact, OLR and motor status.';
        const st = document.getElementById('guided-build-status');
        if (st) { st.textContent='RUNNING'; st.className='px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-300'; }
      } else {
        const fb = document.getElementById('guided-build-feedback');
        if (fb) fb.textContent = 'Circuit is correct, but the DOL simulator control is unavailable in this build.';
      }
    }

    // v5.88 Industrial learning / engineer view
    let industrialViewMode = 'student';

    function setIndustrialViewMode(mode) {
      industrialViewMode = mode === 'engineer' ? 'engineer' : 'student';
      document.querySelectorAll('.industrial-student-panel').forEach(el => {
        el.classList.toggle('hidden', industrialViewMode === 'engineer');
      });
      const sb=document.getElementById('industrial-student-mode');
      const eb=document.getElementById('industrial-engineer-mode');
      if(sb) sb.className=industrialViewMode==='student'
        ? 'px-3 py-1.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950'
        : 'px-3 py-1.5 rounded text-[10px] font-bold text-slate-400';
      if(eb) eb.className=industrialViewMode==='engineer'
        ? 'px-3 py-1.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950'
        : 'px-3 py-1.5 rounded text-[10px] font-bold text-slate-400';
      const guide=document.getElementById('industrial-howto');
      if(guide) guide.innerHTML=industrialViewMode==='student'
        ? '<div class="text-[11px] font-bold text-cyan-300 mb-1">📖 HOW TO USE</div><div class="text-[10px] text-slate-300 leading-relaxed"><b>START</b> → contactor energizes → auxiliary contact seals the circuit → motor runs. <b>STOP</b> opens the control path. Use <b>FAULT</b> buttons for troubleshooting practice.</div>'
        : '<div class="text-[11px] font-bold text-cyan-300 mb-1">🛠 ENGINEER VIEW</div><div class="text-[10px] text-slate-300 leading-relaxed">Focus on contactor IDs, NO/NC logic, OLR 95-96, timer/interlock states, terminals and fault isolation.</div>';
    }

    function toggleIndustrialExplanation(id) {
      safeSound('click');
      const el=document.getElementById(id);
      if(el) el.classList.toggle('hidden');
    }

    // v5.87 safety wrapper: UI controls must never crash if audio is unavailable.
    function safeSound(type) {
      try {
        if (typeof SoundEngine !== 'undefined') {
          if (type === 'spark' && typeof SoundEngine.playSpark === 'function') SoundEngine.playSpark();
          else if (typeof SoundEngine.playClick === 'function') SoundEngine.playClick();
        }
      } catch (_) {}
    }

    // v5.86 PLC Control Lab
    let plcStarted = false;
    let plcStopInput = true;
    let plcSensor = false;
    let plcMotor = false;
    let plcLamp = false;
    let plcCounter = 0;
    let plcTimer = null;
    let plcScanTimer = null;

    function plcSet(id, text, cls) {
      const e = document.getElementById(id);
      if (e) { e.innerText = text; if (cls) e.className = cls; }
    }

    function plcRender(message) {
      const ton = Number(document.getElementById('plc-ton-ms')?.value || 2000);
      plcSet('plc-ton-value', `${(ton/1000).toFixed(1)} s`, 'text-cyan-300');
      plcSet('plc-i-start', plcStarted ? 'ON' : 'OFF', plcStarted ? 'text-emerald-400' : 'text-slate-400');
      plcSet('plc-i-stop', plcStopInput ? 'ON' : 'OFF', plcStopInput ? 'text-emerald-400' : 'text-rose-400');
      plcSet('plc-i-sensor', plcSensor ? 'ON' : 'OFF', plcSensor ? 'text-cyan-400' : 'text-slate-400');
      plcSet('plc-q-motor', plcMotor ? 'ON' : 'OFF', plcMotor ? 'text-emerald-400' : 'text-slate-400');
      plcSet('plc-m-seal', plcStarted ? 'ON' : 'OFF', plcStarted ? 'text-emerald-400' : 'text-slate-400');
      plcSet('plc-timer', plcMotor ? 'DONE' : (plcStarted ? 'TIMING' : 'READY'), plcMotor ? 'text-emerald-400' : 'text-amber-400');
      plcSet('plc-counter', `${plcCounter} / 3`, plcCounter >= 3 ? 'text-cyan-400' : 'text-slate-400');
      plcSet('plc-q-lamp', plcLamp ? 'ON' : 'OFF', plcLamp ? 'text-cyan-400' : 'text-slate-400');
      plcSet('plc-status', plcMotor ? 'RUNNING' : (plcStarted ? 'STARTING' : 'STOPPED'),
        plcMotor ? 'text-[10px] font-mono px-2 py-1 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
        plcStarted ? 'text-[10px] font-mono px-2 py-1 rounded border bg-amber-500/10 text-amber-300 border-amber-500/30' :
        'text-[10px] font-mono px-2 py-1 rounded border bg-slate-500/10 text-slate-300 border-slate-700');

      const d = document.getElementById('plc-diagnostic');
      if (d) d.innerText = message || (
        plcMotor ? 'PLC scan: TON done → Q0.0 MOTOR ON. Sensor events increment counter C1.' :
        plcStarted ? 'PLC scan: START latch active → TON timing before Q0.0.' :
        !plcStopInput ? 'PLC scan: STOP input is OFF/open → motor output is inhibited.' :
        'PLC ready. Press START to begin the scan-driven control sequence.'
      );
    }

    function plcStart() {
      safeSound('click');
      if (!plcStopInput) {
        plcRender('START blocked: STOP input I0.1 is OFF/open.');
        return;
      }
      if (plcStarted) {
        plcRender(plcMotor ? 'PLC already running: Q0.0 MOTOR is ON.' : 'PLC already in STARTING state: TON T1 is active.');
        return;
      }
      plcStarted = true;
      plcMotor = false;
      plcLamp = false;
      clearTimeout(plcTimer);
      const ton = Number(document.getElementById('plc-ton-ms')?.value || 2000);
      plcRender(`START I0.0 ON → M0.0 seal-in set → TON T1 timing for ${(ton/1000).toFixed(1)} s.`);
      plcTimer = setTimeout(() => {
        if (plcStarted && plcStopInput) {
          plcMotor = true;
          plcRender('TON T1 done → Q0.0 MOTOR energized.');
        }
      }, ton);
    }

    function plcStop() {
      safeSound('click');
      plcStopInput = false;
      plcStarted = false;
      plcMotor = false;
      plcLamp = false;
      clearTimeout(plcTimer);
      plcRender('STOP I0.1 pressed → seal-in cleared and Q0.0 MOTOR OFF.');
      setTimeout(() => {
        plcStopInput = true;
        plcRender('STOP button released → I0.1 NC input is ON again.');
      }, 500);
    }

    function plcToggleSensor() {
      safeSound('click');
      const risingEdge = !plcSensor;
      plcSensor = !plcSensor;
      if (risingEdge) {
        plcCounter = Math.min(3, plcCounter + 1);
        if (plcCounter >= 3) plcLamp = true;
      }
      plcRender(plcSensor ? `I0.2 SENSOR ON → C1 incremented to ${plcCounter}.` : 'I0.2 SENSOR OFF.');
      setTimeout(() => { plcSensor = false; plcRender(); }, 350);
    }

    function plcReset() {
      safeSound('click');
      clearTimeout(plcTimer);
      clearInterval(plcScanTimer);
      plcStarted = false;
      plcStopInput = true;
      plcSensor = false;
      plcMotor = false;
      plcLamp = false;
      plcCounter = 0;
      plcRender('PLC reset complete. All outputs cleared and counter reset.');
    }

    const plcTonSlider = document.getElementById('plc-ton-ms');
    if (plcTonSlider) plcTonSlider.addEventListener('input', plcRender);
    plcRender();

    // v5.85 Industrial Fault Diagnosis Trainer
    const industrialFaults = {
      none: {
        name: 'NONE', risk: 'LOW',
        symptoms: {contactor:'NORMAL', motor:'NORMAL', control:'PRESENT', phase:'HEALTHY', interlock:'SAFE'},
        diagnosis: 'No fault injected. System is healthy.',
        test: 'Recommended test: verify control supply, STOP/OLR continuity, then check the contactor coil.'
      },
      control_open: {
        name: 'CONTROL FUSE / WIRE OPEN', risk: 'MEDIUM',
        symptoms: {contactor:'OFF', motor:'STOPPED', control:'ABSENT', phase:'HEALTHY', interlock:'SAFE'},
        diagnosis: 'Control circuit is open, so the contactor coil cannot energize.',
        test: 'Check control fuse, control transformer output, terminal continuity and loose wires.'
      },
      stop_open: {
        name: 'STOP PUSH BUTTON OPEN', risk: 'LOW',
        symptoms: {contactor:'OFF', motor:'STOPPED', control:'PRESENT', phase:'HEALTHY', interlock:'SAFE'},
        diagnosis: 'STOP NC contact is open/stuck, blocking the coil circuit.',
        test: 'Isolate supply and check STOP NC continuity while the button is released.'
      },
      coil_open: {
        name: 'CONTACTOR COIL OPEN', risk: 'MEDIUM',
        symptoms: {contactor:'OFF', motor:'STOPPED', control:'PRESENT', phase:'HEALTHY', interlock:'SAFE'},
        diagnosis: 'Control voltage reaches the coil circuit, but the contactor coil is electrically open.',
        test: 'Measure coil resistance and verify rated coil voltage at A1-A2.'
      },
      olr_trip: {
        name: 'OVERLOAD RELAY TRIPPED', risk: 'MEDIUM',
        symptoms: {contactor:'DROPPED', motor:'STOPPED', control:'PRESENT', phase:'HEALTHY', interlock:'SAFE'},
        diagnosis: 'OLR 95-96 has opened after an overload condition.',
        test: 'Check motor current/mechanical load, then reset OLR only after the cause is removed.'
      },
      phase_loss: {
        name: 'SINGLE PHASE LOSS', risk: 'HIGH',
        symptoms: {contactor:'ON', motor:'UNSTABLE', control:'PRESENT', phase:'L2 MISSING', interlock:'SAFE'},
        diagnosis: 'Motor is supplied with an incomplete three-phase supply. Continued operation can overheat the motor.',
        test: 'Measure L1-L2, L2-L3 and L3-L1 before the contactor and at the motor terminals.'
      },
      aux_open: {
        name: 'HOLDING AUXILIARY OPEN', risk: 'LOW',
        symptoms: {contactor:'DROPS AFTER START', motor:'STOPS AFTER START', control:'PRESENT', phase:'HEALTHY', interlock:'SAFE'},
        diagnosis: 'The contactor auxiliary NO seal-in path is open, so the circuit cannot latch.',
        test: 'Check the NO auxiliary contact continuity and its wiring to the START branch.'
      },
      interlock: {
        name: 'INTERLOCK CONTACT FAULT', risk: 'HIGH',
        symptoms: {contactor:'CONFLICT POSSIBLE', motor:'WRONG DIRECTION RISK', control:'PRESENT', phase:'HEALTHY', interlock:'FAULT'},
        diagnosis: 'An interlocking contact is not correctly preventing conflicting contactors.',
        test: 'Verify NC interlock contacts and mechanical interlock before energizing both directions.'
      }
    };

    let activeIndustrialFault = 'none';
    let industrialTest = 'NOT RUN';

    function iftSet(id, text, cls) {
      const el = document.getElementById(id);
      if (el) { el.innerText = text; if (cls) el.className = cls; }
    }

    function updateIndustrialFaultUI(message) {
      const f = industrialFaults[activeIndustrialFault] || industrialFaults.none;
      const fault = activeIndustrialFault !== 'none';
      const healthyClass = 'text-emerald-400';
      const warnClass = f.risk === 'HIGH' ? 'text-rose-400' : (fault ? 'text-amber-400' : 'text-emerald-400');

      iftSet('ift-status', fault ? 'FAULT INJECTED' : 'HEALTHY',
        fault ? 'text-[10px] font-mono px-2 py-1 rounded border bg-rose-500/10 text-rose-300 border-rose-500/30' :
        'text-[10px] font-mono px-2 py-1 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30');

      iftSet('ift-contactor', f.symptoms.contactor, fault ? warnClass : healthyClass);
      iftSet('ift-motor', f.symptoms.motor, fault ? warnClass : healthyClass);
      iftSet('ift-control', f.symptoms.control, f.symptoms.control === 'ABSENT' ? 'text-rose-400' : healthyClass);
      iftSet('ift-phase', f.symptoms.phase, f.symptoms.phase === 'HEALTHY' ? healthyClass : 'text-rose-400');
      iftSet('ift-interlock', f.symptoms.interlock, f.symptoms.interlock === 'SAFE' ? healthyClass : 'text-rose-400');

      iftSet('ift-fault-name', f.name, fault ? warnClass : 'text-slate-400');
      iftSet('ift-test-result', industrialTest, industrialTest === 'PASS' ? healthyClass :
        industrialTest === 'FAIL' ? 'text-rose-400' : 'text-slate-400');
      iftSet('ift-risk', f.risk, f.risk === 'HIGH' ? 'text-rose-400' : f.risk === 'MEDIUM' ? 'text-amber-400' : healthyClass);
      iftSet('ift-training', fault ? 'DIAGNOSE' : 'READY', fault ? 'text-amber-400' : 'text-cyan-400');

      const d = document.getElementById('ift-diagnosis');
      const t = document.getElementById('ift-test');
      if (d) d.innerText = message || f.diagnosis;
      if (t) t.innerText = f.test;
    }

    function injectIndustrialFault() {
      safeSound('click');
      const select = document.getElementById('ift-fault-select');
      activeIndustrialFault = select ? select.value : 'none';
      industrialTest = 'NOT RUN';
  
    const iftFaultSelect = document.getElementById('ift-fault-select');
    if (iftFaultSelect) {
      iftFaultSelect.addEventListener('change', () => {
        industrialTest = 'NOT RUN';
        const choice = industrialFaults[iftFaultSelect.value] || industrialFaults.none;
        const d = document.getElementById('ift-diagnosis');
        if (d) d.innerText = `Selected: ${choice.name}. Press INJECT FAULT to activate it.`;
        iftSet('ift-test-result', 'NOT RUN', 'text-slate-400');
      });
    }

    updateIndustrialFaultUI();
    }

    function clearIndustrialFault() {
      safeSound('click');
      activeIndustrialFault = 'none';
      industrialTest = 'NOT RUN';
      const select = document.getElementById('ift-fault-select');
      if (select) select.value = 'none';
      updateIndustrialFaultUI('Fault cleared. Verify the circuit is safe before returning it to service.');
    }

    function runIndustrialTest(type) {
      safeSound('click');
      if (activeIndustrialFault === 'none') {
        industrialTest = 'PASS';
        updateIndustrialFaultUI(type === 'control'
          ? 'Control test PASS: supply and control path are healthy.'
          : 'Power test PASS: three-phase supply and motor path are healthy.');
        return;
      }

      const controlFaults = ['control_open','stop_open','coil_open','olr_trip','aux_open'];
      const powerFaults = ['phase_loss','interlock'];

      const fail = type === 'control'
        ? controlFaults.includes(activeIndustrialFault)
        : powerFaults.includes(activeIndustrialFault);

      industrialTest = fail ? 'FAIL' : 'PASS';
      updateIndustrialFaultUI(fail
        ? `${type.toUpperCase()} TEST FAIL: symptoms match the injected fault. Follow the recommended isolation/test procedure.`
        : `${type.toUpperCase()} TEST PASS: this section does not show the injected fault. Trace the other section.`);
    }

    updateIndustrialFaultUI();

    // Industrial Controls — v5.82 DOL state machine
    let dolTransitionToken = 0;
    let dolRunning = false;
    let dolOverloadTripped = false;
    let dolEmergency = false;

    function setDolText(id, text, cls) {
      const el = document.getElementById(id);
      if (el) { el.innerText = text; if (cls) el.className = cls; }
    }

    function updateDolUI(message) {
      const healthy = !dolOverloadTripped && !dolEmergency;
      setDolText('dol-contactor-state', dolRunning ? 'ENERGIZED (LATCHED)' : 'DE-ENERGIZED',
        dolRunning ? 'font-bold text-emerald-400' : 'font-bold text-slate-400');
      setDolText('dol-motor-state', dolRunning ? 'RUNNING (1440 RPM)' : 'STOPPED',
        dolRunning ? 'font-bold text-cyan-400' : 'font-bold text-slate-400');
      setDolText('dol-km1-lamp', dolRunning ? 'ON' : 'OFF', dolRunning ? 'font-bold text-emerald-400' : 'font-bold text-slate-500');
      setDolText('dol-motor-lamp', dolRunning ? 'RUNNING' : 'STOPPED', dolRunning ? 'font-bold text-cyan-400' : 'font-bold text-slate-500');
      setDolText('dol-olr-state', dolOverloadTripped ? 'TRIPPED' : 'CLOSED',
        dolOverloadTripped ? 'font-bold text-rose-400' : 'font-bold text-emerald-400');
      setDolText('dol-olr-state-2', dolOverloadTripped ? 'TRIPPED' : 'RESET',
        dolOverloadTripped ? 'font-bold text-rose-400' : 'font-bold text-emerald-400');
      setDolText('dol-safety-state', dolEmergency ? 'E-STOP ACTIVE' : (dolOverloadTripped ? 'FAULT' : 'READY'),
        dolEmergency || dolOverloadTripped ? 'text-[10px] font-mono px-2 py-1 rounded border bg-rose-500/10 text-rose-300 border-rose-500/30' :
        'text-[10px] font-mono px-2 py-1 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30');
      setDolText('dol-fault-state', dolEmergency ? 'EMERGENCY STOP' : (dolOverloadTripped ? 'OLR TRIP' : 'NONE'),
        dolEmergency || dolOverloadTripped ? 'text-rose-400' : 'text-slate-400');
      setDolText('dol-rpm-state', dolRunning ? '1440' : '0', dolRunning ? 'text-cyan-400' : 'text-slate-400');
      setDolText('dol-control-health', healthy ? 'HEALTHY' : 'LOCKED',
        healthy ? 'text-emerald-400' : 'text-rose-400');
      setDolText('dol-supply-state', dolEmergency ? 'CONTROL OFF' : '3Φ READY',
        dolEmergency ? 'text-rose-400' : 'text-emerald-400');

      const diag = document.getElementById('dol-diagnostic');
      if (diag) {
        diag.innerText = message || (
          dolEmergency ? 'Diagnostic: Emergency stop is active. Reset E-STOP before starting.' :
          dolOverloadTripped ? 'Diagnostic: OLR 95-96 is open after overload. Reset the relay before restarting.' :
          dolRunning ? 'Diagnostic: K1 coil energized and auxiliary NO contact is sealing the START command.' :
          'Diagnostic: Control circuit healthy. Press START to energize K1.'
        );
        diag.className = 'rounded-lg border p-3 text-[10px] font-mono ' +
          (dolEmergency || dolOverloadTripped ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' :
           dolRunning ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' :
           'border-cyan-500/20 bg-cyan-500/5 text-cyan-300');
      }

      // Animate the key control contacts.
      const activeStroke = dolRunning ? '#22c55e' : '#64748b';
      ['dol-svg-stop','dol-svg-olr','dol-svg-start','dol-svg-aux'].forEach(id => {
        const g = document.getElementById(id);
        if (g) g.setAttribute('stroke', id === 'dol-svg-olr' && dolOverloadTripped ? '#ef4444' : activeStroke);
      });
      const coil = document.getElementById('dol-svg-coil');
      if (coil) {
        coil.setAttribute('stroke', dolRunning ? '#22c55e' : (dolEmergency || dolOverloadTripped ? '#ef4444' : '#64748b'));
        coil.setAttribute('fill', dolRunning ? '#052e16' : '#0f172a');
      }
    }

    function triggerDolStart() {
      safeSound('click');
      if (dolEmergency) {
        updateDolUI('Start blocked: Emergency Stop is active. Reset the emergency condition first.');
        return;
      }
      if (dolOverloadTripped) {
        updateDolUI('Start blocked: OLR is tripped. Press RESET after the overload condition is cleared.');
        return;
      }
      dolRunning = true;
      updateDolUI('START pressed → K1 coil energized → K1 auxiliary NO seals the control circuit → motor runs.');
    }

    function triggerDolStop() {
      safeSound('click');
      ++dolTransitionToken;
      dolRunning = false;
      updateDolUI('STOP pressed → K1 coil de-energized → main contacts open → motor stopped.');
    }

    function triggerDolEmergency() {
      safeSound('spark');
      ++dolTransitionToken;
      dolEmergency = true;
      dolRunning = false;
      updateDolUI('EMERGENCY STOP opened the control circuit. Motor is de-energized.');
    }

    function triggerDolOverload() {
      safeSound('spark');
      ++dolTransitionToken;
      dolOverloadTripped = true;
      dolRunning = false;
      updateDolUI('Thermal Overload Relay tripped: 95-96 opened and K1 dropped out. Investigate overload before reset.');
    }

    function resetDolFault() {
      safeSound('click');
      ++dolTransitionToken;
      dolEmergency = false;
      dolOverloadTripped = false;
      dolRunning = false;
      updateDolUI('Fault reset complete. Control circuit is ready for a new START command.');
    }

    updateDolUI();

    let sdSequenceTimer = null;

    // v5.83 Forward/Reverse starter — electrical + mechanical interlock
    let frTransitionToken = 0;
    let frDirection = "STOPPED";
    let frOverloadTripped = false;

    function frSet(id, text, cls) {
      const el = document.getElementById(id);
      if (el) { el.innerText = text; if (cls) el.className = cls; }
    }

    function updateForwardReverse(message) {
      const running = frDirection !== "STOPPED";
      const forward = frDirection === "FORWARD";
      const reverse = frDirection === "REVERSE";
      const fault = frOverloadTripped;

      frSet('fr-fwd-lamp', forward ? 'ON' : 'OFF', forward ? 'font-bold text-emerald-400' : 'font-bold text-slate-500');
      frSet('fr-rev-lamp', reverse ? 'ON' : 'OFF', reverse ? 'font-bold text-cyan-400' : 'font-bold text-slate-500');
      frSet('fr-motor-lamp', running ? (forward ? 'RUNNING FWD' : 'RUNNING REV') : 'STOPPED',
        running ? 'font-bold text-cyan-400' : 'font-bold text-slate-500');
      frSet('fr-direction', frDirection, running ? 'text-cyan-400' : 'text-slate-400');
      frSet('fr-fault', fault ? 'OLR TRIP' : 'NONE', fault ? 'text-rose-400' : 'text-slate-400');
      frSet('fr-interlock', 'SAFE', 'text-emerald-400');
      frSet('fr-safety-state', fault ? 'FAULT' : (running ? frDirection : 'READY'),
        fault ? 'text-[10px] font-mono px-2 py-1 rounded border bg-rose-500/10 text-rose-300 border-rose-500/30' :
        'text-[10px] font-mono px-2 py-1 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30');

      const f = document.getElementById('fr-f-coil');
      const r = document.getElementById('fr-r-coil');
      if (f) { f.setAttribute('stroke', forward ? '#22c55e' : '#64748b'); f.setAttribute('fill', forward ? '#052e16' : '#0f172a'); }
      if (r) { r.setAttribute('stroke', reverse ? '#22d3ee' : '#64748b'); r.setAttribute('fill', reverse ? '#083344' : '#0f172a'); }

      ['fr-stop','fr-olr'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('stroke', fault && id === 'fr-olr' ? '#ef4444' : '#64748b');
      });

      const diag = document.getElementById('fr-diagnostic');
      if (diag) {
        diag.innerText = message || (
          fault ? 'Diagnostic: OLR 95-96 is open. Reset the overload before restarting.' :
          forward ? 'Diagnostic: KM-F energized. KM-R is mechanically/electrically interlocked OFF.' :
          reverse ? 'Diagnostic: KM-R energized. KM-F is mechanically/electrically interlocked OFF.' :
          'Diagnostic: Starter healthy. Choose FORWARD or REVERSE.'
        );
        diag.className = 'rounded-lg border p-3 text-[10px] font-mono ' +
          (fault ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' :
           running ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' :
           'border-cyan-500/20 bg-cyan-500/5 text-cyan-300');
      }
    }

    function triggerForward() {
      safeSound('click');
      if (frOverloadTripped) { updateForwardReverse('FORWARD blocked: OLR is tripped. Reset the overload first.'); return; }
      if (frDirection === 'REVERSE') {
        const token = ++frTransitionToken;
        frDirection = 'STOPPED';
        updateForwardReverse('Interlock: REVERSE was active. Motor stopped before FORWARD could be energized.');
        setTimeout(() => {
          if (token !== frTransitionToken || frOverloadTripped) return;
          frDirection = 'FORWARD';
          updateForwardReverse('FORWARD selected after a safe stop. KM-F energized; KM-R remains locked out.');
        }, 500);
        return;
      }
      frDirection = 'FORWARD';
      updateForwardReverse();
    }

    function triggerReverse() {
      safeSound('click');
      if (frOverloadTripped) { updateForwardReverse('REVERSE blocked: OLR is tripped. Reset the overload first.'); return; }
      if (frDirection === 'FORWARD') {
        const token = ++frTransitionToken;
        frDirection = 'STOPPED';
        updateForwardReverse('Interlock: FORWARD was active. Motor stopped before REVERSE could be energized.');
        setTimeout(() => {
          if (token !== frTransitionToken || frOverloadTripped) return;
          frDirection = 'REVERSE';
          updateForwardReverse('REVERSE selected after a safe stop. KM-R energized; KM-F remains locked out.');
        }, 500);
        return;
      }
      frDirection = 'REVERSE';
      updateForwardReverse();
    }

    function triggerForwardReverseStop() {
      safeSound('click');
      ++frTransitionToken;
      frDirection = 'STOPPED';
      updateForwardReverse('STOP pressed → both contactors de-energized.');
    }

    function triggerForwardReverseOverload() {
      safeSound('spark');
      ++frTransitionToken;
      frOverloadTripped = true;
      frDirection = 'STOPPED';
      updateForwardReverse('OLR tripped → both contactors dropped out and the motor stopped.');
    }

    function resetForwardReverse() {
      safeSound('click');
      ++frTransitionToken;
      frOverloadTripped = false;
      frDirection = 'STOPPED';
      updateForwardReverse('Forward/Reverse starter reset. Interlocks healthy.');
    }

    updateForwardReverse();


    // v5.84 Star-Delta state machine
    let sdStage = "IDLE";
    
    let sdDeadTimer = null;
    let sdOverloadTripped = false;
    let sdSequenceToken = 0;

    function sdSet(id, text, cls) {
      const el = document.getElementById(id);
      if (el) { el.innerText = text; if (cls) el.className = cls; }
    }

    function updateStarDeltaUI(message) {
      const star = sdStage === "STAR";
      const delta = sdStage === "DELTA";
      const running = star || delta;
      const fault = sdOverloadTripped;

      sdSet('sd-km1-lamp', running ? 'ON' : 'OFF', running ? 'font-bold text-emerald-400' : 'font-bold text-slate-500');
      sdSet('sd-km2-lamp', star ? 'ON' : 'OFF', star ? 'font-bold text-amber-400' : 'font-bold text-slate-500');
      sdSet('sd-km3-lamp', delta ? 'ON' : 'OFF', delta ? 'font-bold text-cyan-400' : 'font-bold text-slate-500');
      sdSet('sd-motor-lamp', running ? (star ? 'STARTING / STAR' : 'RUNNING / DELTA') : 'STOPPED',
        running ? 'font-bold text-cyan-400' : 'font-bold text-slate-500');

      sdSet('sd-stage', sdStage, running ? 'text-cyan-300' : (fault ? 'text-rose-400' : 'text-slate-400'));
      sdSet('sd-fault', fault ? 'OLR TRIP' : 'NONE', fault ? 'text-rose-400' : 'text-slate-400');
      sdSet('sd-interlock', star && delta ? 'FAULT' : 'SAFE', star && delta ? 'text-rose-400' : 'text-emerald-400');

      const ms = Number(document.getElementById('sd-transition-ms')?.value || 3000);
      sdSet('sd-timer', star ? `${Math.max(0, Math.round(ms/1000))} s` : delta ? 'COMPLETE' : '—',
        star ? 'text-amber-400' : 'text-slate-400');

      sdSet('sd-safety-state', fault ? 'FAULT' : running ? sdStage : 'READY',
        fault ? 'text-[10px] font-mono px-2 py-1 rounded border bg-rose-500/10 text-rose-300 border-rose-500/30' :
        'text-[10px] font-mono px-2 py-1 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/30');

      const setCoil = (id,on,colorOn) => {
        const e=document.getElementById(id);
        if(e){e.setAttribute('stroke',on?colorOn:'#64748b');e.setAttribute('fill',on?'#052e16':'#0f172a');}
      };
      setCoil('sd-km1-coil', running, '#22c55e');
      setCoil('sd-km2-coil', star, '#f59e0b');
      setCoil('sd-km3-coil', delta, '#22d3ee');

      const starBranch=document.getElementById('sd-star-branch');
      const deltaBranch=document.getElementById('sd-delta-branch');
      if(starBranch) starBranch.setAttribute('stroke',star?'#f59e0b':'#64748b');
      if(deltaBranch) deltaBranch.setAttribute('stroke',delta?'#22d3ee':'#64748b');

      const diag=document.getElementById('sd-diagnostic');
      if(diag){
        diag.innerText = message || (
          fault ? 'Diagnostic: OLR 95-96 is open. Reset the overload before restarting.' :
          star ? 'Diagnostic: KM1 + KM2 energized. Star starting stage is active.' :
          delta ? 'Diagnostic: Transition complete. KM2 is open and KM3 Delta is energized.' :
          'Diagnostic: Starter healthy. Press START SEQUENCE to begin.'
        );
        diag.className='rounded-lg border p-3 text-[10px] font-mono ' +
          (fault ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' :
           running ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' :
           'border-cyan-500/20 bg-cyan-500/5 text-cyan-300');
      }
    }

    function clearStarDeltaTimers() {
      if(sdSequenceTimer){ clearTimeout(sdSequenceTimer); sdSequenceTimer=null; }
      if(sdDeadTimer){ clearTimeout(sdDeadTimer); sdDeadTimer=null; }
    }

    function startStarDeltaSequence() {
      safeSound('click');
      if(sdOverloadTripped){
        updateStarDeltaUI('START blocked: OLR is tripped. Reset the overload first.');
        return;
      }
      if(sdStage === "STAR" || sdStage === "DELTA"){
        updateStarDeltaUI('Sequence is already running. Use STOP before starting again.');
        return;
      }

      clearStarDeltaTimers();
      const token = ++sdSequenceToken;
      sdStage = "STAR";
      updateStarDeltaUI('START pressed → KM1 + KM2 energized. Timer started.');

      const ms = Number(document.getElementById('sd-transition-ms')?.value || 3000);
      sdSequenceTimer = setTimeout(() => {
        if(token !== sdSequenceToken || sdOverloadTripped || sdStage !== "STAR") return;
        // Mandatory break-before-make dead time prevents Star + Delta overlap.
        sdStage = "TRANSITION";
        sdSequenceTimer = null;
        updateStarDeltaUI('Timer elapsed → KM2 STAR opened. Dead-time interlock active before KM3 DELTA.');
        sdDeadTimer = setTimeout(() => {
          if(token !== sdSequenceToken || sdOverloadTripped || sdStage !== "TRANSITION") return;
          sdStage = "DELTA";
          sdDeadTimer = null;
          updateStarDeltaUI('Transition complete → KM3 DELTA energized. KM2 remains electrically and mechanically locked out.');
        }, 350);
      }, ms);
    }

    function stopStarDeltaSequence() {
      safeSound('click');
      ++sdSequenceToken;
      clearStarDeltaTimers();
      sdStage = "IDLE";
      updateStarDeltaUI('STOP pressed → all three contactors de-energized.');
    }

    function triggerStarDeltaOverload() {
      safeSound('spark');
      ++sdSequenceToken;
      clearStarDeltaTimers();
      sdOverloadTripped = true;
      sdStage = "FAULT";
      updateStarDeltaUI('OLR tripped → KM1, KM2 and KM3 dropped out. Investigate the overload before reset.');
    }

    function resetStarDelta() {
      safeSound('click');
      ++sdSequenceToken;
      clearStarDeltaTimers();
      sdOverloadTripped = false;
      sdStage = "IDLE";
      updateStarDeltaUI('Fault reset complete. Star-Delta starter is ready.');
    }


    const sdTransitionSlider = document.getElementById('sd-transition-ms');
    if (sdTransitionSlider) {
      sdTransitionSlider.addEventListener('input', () => {
        if (sdStage === 'STAR' || sdStage === 'TRANSITION' || sdStage === 'DELTA') {
          updateStarDeltaUI('Transition setting changed. It will apply to the next START sequence.');
        } else {
          updateStarDeltaUI();
        }
      });
    }

    updateStarDeltaUI();

    // CRITICAL FIX: this data array was referenced by renderFaults() and
    // checkFaultAnswer() below but was never declared anywhere in the file.
    // That caused a ReferenceError as soon as the page loaded (renderFaults()
    // runs during DOMContentLoaded), which silently aborted every init step
    // that was scheduled to run after it in the same handler — breaking the
    // quiz, the multimeter probes, the back-button history setup, the initial
    // Home screen render, the calculators, and the oscilloscope animation.
    const faultCases = [
      {
        id: 1,
        title: "Fault Case #1: Unprotected LED on 12V Supply",
        diagram: "Battery (12V) ────── Switch ────── LED (Anode → Cathode) ────── Battery (-)",
        question: "What catastrophic fault occurs when the switch closes?",
        options: [
          "LED glows with normal brightness",
          "LED burns out instantaneously due to unbounded forward current",
          "Battery voltage drops to 0V permanently without damage",
          "Current reverses flow direction"
        ],
        correct: 1,
        explanation: "Semiconductors have negligible resistance once forward threshold is reached. Without a series resistor, current exceeds 500mA, destroying the junction in milliseconds."
      },
      {
        id: 2,
        title: "Fault Case #2: Ammeter Connected Across Power Rails",
        diagram: "Battery (+) ────── [ Ammeter 10A Port ] ────── Battery (-)",
        question: "Why is connecting an Ammeter in parallel across power rails dangerous?",
        options: [
          "Ammeters have huge internal resistance and will block all current",
          "Ammeters have near-zero internal resistance, creating a dead short-circuit",
          "The voltmeter reading becomes negative",
          "It safely measures battery open-circuit voltage"
        ],
        correct: 1,
        explanation: "Ammeters are designed for series insertion and have internal shunts with milli-ohm resistance. Connecting directly across voltage rails causes instant short-circuit current."
      },
      {
        id: 3,
        title: "Fault Case #3: Relay Coil Without a Flyback Diode",
        diagram: "Transistor (C) ────── Relay Coil ────── +12V Rail (No diode across coil)",
        question: "What happens the instant the transistor switches the coil OFF?",
        options: [
          "Nothing — coils have no memory of current",
          "A large inductive back-EMF voltage spike can destroy the switching transistor",
          "The relay coil resistance increases permanently",
          "The 12V rail voltage doubles indefinitely"
        ],
        correct: 1,
        explanation: "An inductor resists sudden current change (V = -L·di/dt). Interrupting coil current abruptly generates a high-voltage reverse spike that can exceed the transistor's breakdown rating unless clamped by a flyback diode."
      },
      {
        id: 4,
        title: "Fault Case #4: Electrolytic Capacitor Wired Reverse-Polarity",
        diagram: "12V (+) ────── Cathode (-) [ELECTROLYTIC CAP] Anode (+) ────── Ground",
        question: "What is the most likely outcome of powering this circuit?",
        options: [
          "The capacitor works normally regardless of orientation",
          "The dielectric breaks down internally, causing heating, venting, or an explosive rupture",
          "The capacitor simply stores less charge than rated",
          "The capacitor converts to a resistor permanently"
        ],
        correct: 1,
        explanation: "Electrolytic capacitors have a polarized oxide dielectric layer that only forms and holds up correctly under forward bias. Reverse voltage breaks this layer down, causing internal gas build-up that can vent or rupture the case — always match + to the higher-potential rail."
      },
      {
        id: 5,
        title: "Fault Case #5: MCB Undersized for Motor Starting Current",
        diagram: "3Φ Supply ────── 16A Type-B MCB ────── 5.5kW Motor (FLA 11A, DOL start)",
        question: "The motor trips the breaker every time it starts, even though full-load current is well under 16A. Why?",
        options: [
          "The motor is wired with reversed phases",
          "DOL starting draws 6-8× full-load current for a second or two, and a Type-B curve trips too fast for that inrush",
          "The MCB is rated too high and should be replaced with a smaller one",
          "The supply voltage is too low for the motor"
        ],
        correct: 1,
        explanation: "Direct-On-Line starting produces a large but brief inrush current. A Type-B MCB trips magnetically at only 3-5× its rating, so it nuisance-trips on normal motor starting. Motor circuits normally use a Type-C or Type-D breaker (or a motor-rated MCCB/soft starter) that tolerates that inrush without tripping."
      },
      {
        id: 6,
        title: "Fault Case #6: Current Transformer Secondary Left Open",
        diagram: "3Φ Line (energized) ── through CT primary ── CT secondary: (OPEN, no meter/burden connected)",
        question: "The primary conductor is still carrying load current. What is the danger of leaving the CT secondary open like this?",
        options: [
          "Nothing — an open secondary just means the meter reads zero safely",
          "The CT develops a very high, potentially lethal open-circuit voltage across its secondary terminals",
          "The primary conductor current drops to zero",
          "The CT will simply overheat the primary conductor"
        ],
        correct: 1,
        explanation: "A current transformer is a current-driven device: as long as primary current flows, the core keeps trying to force that current through the secondary. With no burden (meter/relay) connected, all the secondary's ampere-turns go into building an extremely high, unclamped voltage spike — often over a thousand volts — which is why a CT secondary must always be shorted before disconnecting the burden, never left open on a live circuit."
      }
    ];

    function renderFaults() {
      const container = document.getElementById('faults-container');
      if (!container) return;
      container.innerHTML = faultCases.map(f => `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-rose-400 font-mono">${f.title}</span>
            <span class="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono">Troubleshoot</span>
          </div>
          <div class="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-cyan-300">${f.diagram}</div>
          <p class="text-xs font-semibold text-slate-200">${f.question}</p>
          <div class="space-y-1.5">
            ${f.options.map((opt, i) => `
              <button onclick="checkFaultAnswer(${f.id}, ${i})" class="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-800 text-xs text-slate-300 transition">${opt}</button>
            `).join('')}
          </div>
          <div id="fault-feedback-${f.id}" class="hidden p-3 rounded text-xs font-mono"></div>
        </div>
      `).join('');
    }

    function checkFaultAnswer(faultId, selectedIdx) {
      const f = faultCases.find(x => x.id === faultId);
      const fb = document.getElementById(`fault-feedback-${faultId}`);
      fb.classList.remove('hidden');
      if (selectedIdx === f.correct) {
        SoundEngine.playBeep(1200, 0.15);
        fb.className = "p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded text-xs leading-relaxed";
        fb.innerHTML = `<strong>✓ Correct Diagnosis:</strong> ${f.explanation}`;
        trackProgress(10);
      } else {
        safeSound('spark');
        fb.className = "p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded text-xs leading-relaxed";
        fb.innerHTML = `<strong>✕ Incorrect:</strong> Re-examine component impedance and Ohm's law.`;
      }
    }

    // Quiz Engine
    // FIX: expanded from 2 to 5 questions so the UI (which always
    // said "Question X of 5") actually matches reality.
    const quizQuestions = [
      { q: "Where must an Ammeter be connected to measure current?", opts: ["In Parallel with the load", "In Series with the circuit loop", "Directly across the supply", "To Earth Ground"], a: 1, exp: "Ammeters have near-zero resistance and must be in series." },
      { q: "What is the primary function of a reverse-biased flyback diode across a DC relay coil?", opts: ["Increase coil voltage", "Dissipate inductive kickback back-EMF spikes", "Convert DC to AC", "Speed up relay switching"], a: 1, exp: "Flyback diodes clamp high inductive back-EMF spikes (-L di/dt)." },
      { q: "In Ohm's Law, if voltage is held constant and resistance increases, what happens to current?", opts: ["Current increases", "Current decreases", "Current stays the same", "Current becomes negative"], a: 1, exp: "I = V/R — with V fixed, current is inversely proportional to resistance." },
      { q: "Why does a Star-Delta starter reduce motor inrush current at start-up?", opts: ["It doubles the supply voltage", "It applies only phase voltage (V/√3) to each winding in Star mode", "It disconnects one phase entirely", "It runs the motor at half frequency"], a: 1, exp: "In Star, each winding sees line voltage divided by √3, cutting starting current to about a third compared to a Direct-On-Line start." },
      { q: "What is the correct series resistor calculation for an LED with Vcc=5V, LED Vf=2V, desired If=20mA?", opts: ["250 Ω", "150 Ω", "100 Ω", "500 Ω"], a: 1, exp: "R = (Vcc − Vf) / If = (5 − 2) / 0.02 = 150 Ω." }
    ];

    let currentQuizIndex = 0;
    let quizScore = 0;

    function renderQuizQuestion() {
      const q = quizQuestions[currentQuizIndex];
      document.getElementById('quiz-progress-text').innerText = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
      document.getElementById('quiz-question').innerText = q.q;
      document.getElementById('quiz-feedback').classList.add('hidden');
      document.getElementById('btn-quiz-next').classList.add('hidden');

      const optsDiv = document.getElementById('quiz-options');
      optsDiv.innerHTML = q.opts.map((opt, i) => `
        <button onclick="handleQuizAnswer(${i})" class="w-full text-left p-3 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 text-xs text-slate-200 transition">${opt}</button>
      `).join('');
    }

    function handleQuizAnswer(idx) {
      const q = quizQuestions[currentQuizIndex];
      const fb = document.getElementById('quiz-feedback');
      fb.classList.remove('hidden');

      // FIX: lock out further answer clicks once this question is answered
      document.querySelectorAll('#quiz-options button').forEach(btn => btn.disabled = true);

      if (idx === q.a) {
        SoundEngine.playBeep(1200, 0.1);
        quizScore++;
        document.getElementById('quiz-score').innerText = quizScore;
        fb.className = "p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs";
        fb.innerHTML = `<strong>✓ Correct:</strong> ${q.exp}`;
        trackProgress(5);
      } else {
        safeSound('spark');
        fb.className = "p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs";
        fb.innerHTML = `<strong>✕ Incorrect:</strong> ${q.exp}`;
      }

      document.getElementById('btn-quiz-next').classList.remove('hidden');
    }

    function nextQuizQuestion() {
      safeSound('click');
      currentQuizIndex++;
      if (currentQuizIndex < quizQuestions.length) {
        renderQuizQuestion();
      } else {
        document.getElementById('quiz-content').innerHTML = `
          <div class="text-center py-6 space-y-3">
            <h4 class="text-lg font-bold text-emerald-400">Quiz Completed!</h4>
            <p class="text-xs text-slate-300">Your Final Score: ${quizScore} / ${quizQuestions.length}</p>
          </div>
        `;
        document.getElementById('btn-quiz-next').classList.add('hidden');
      }
    }

    function restartQuiz() {
      safeSound('click');
      currentQuizIndex = 0;
      quizScore = 0;
      document.getElementById('quiz-score').innerText = "0";
      // FIX: restore the quiz-content skeleton in case a completed
      // quiz replaced it with the "Quiz Completed!" summary markup.
      document.getElementById('quiz-content').innerHTML = `
        <h4 id="quiz-question" class="text-sm font-semibold text-slate-200"></h4>
        <div id="quiz-options" class="space-y-2"></div>
        <div id="quiz-feedback" class="hidden p-3 rounded-lg text-xs font-mono"></div>
      `;
      renderQuizQuestion();
    }

    // Calculators
    function setCalcTab(tab) {
      safeSound('click');
      ['ohm', 'led', 'divider', 'seriesparallel', 'acpower'].forEach(t => {
        const el = document.getElementById(`calc-${t}`);
        if (el) el.classList.add('hidden');
        const tabBtn = document.getElementById(`tab-${t}`);
        if (tabBtn) tabBtn.className = 'px-4 py-2 rounded-lg text-xs font-bold uppercase transition text-slate-400 hover:text-white';
      });
      document.getElementById(`calc-${tab}`).classList.remove('hidden');
      document.getElementById(`tab-${tab}`).className = 'px-4 py-2 rounded-lg text-xs font-bold uppercase transition bg-cyan-500/20 text-cyan-400 border border-cyan-500/40';
    }

    function calculateOhm() {
      const v = parseFloat(document.getElementById('ohm-v').value);
      const r = parseFloat(document.getElementById('ohm-r').value);
      if (!Number.isFinite(v) || !Number.isFinite(r) || r <= 0) {
        document.getElementById('res-ohm-i').innerText = '—';
        document.getElementById('res-ohm-p').innerText = 'Invalid R';
        return;
      }
      const i = v / r;
      const p = v * i;
      document.getElementById('res-ohm-i').innerText = (i * 1000).toFixed(2) + ' mA';
      document.getElementById('res-ohm-p').innerText = p.toFixed(3) + ' W';
    }

    function calculateLED() {
      const vs = parseFloat(document.getElementById('led-vs').value);
      const vf = parseFloat(document.getElementById('led-vf').value);
      const if_ma = parseFloat(document.getElementById('led-if').value);
      if (!Number.isFinite(vs) || !Number.isFinite(vf) || !Number.isFinite(if_ma) || if_ma <= 0 || vs <= vf) {
        document.getElementById('res-led-r').innerText = vs <= vf ? 'No headroom' : '—';
        document.getElementById('res-led-p').innerText = 'Check inputs';
        return;
      }
      const r = (vs - vf) / (if_ma / 1000);
      const p = Math.pow(if_ma / 1000, 2) * r * 1000;
      document.getElementById('res-led-r').innerText = r.toFixed(1) + ' Ω';
      document.getElementById('res-led-p').innerText = p.toFixed(1) + ' mW';
    }

    function calculateDivider() {
      const vin = parseFloat(document.getElementById('div-vin').value);
      const r1 = parseFloat(document.getElementById('div-r1').value);
      const r2 = parseFloat(document.getElementById('div-r2').value);
      if (!Number.isFinite(vin) || !Number.isFinite(r1) || !Number.isFinite(r2) || r1 < 0 || r2 < 0 || (r1 + r2) <= 0) {
        document.getElementById('res-div-vout').innerText = 'Invalid inputs';
        return;
      }
      const vout = vin * (r2 / (r1 + r2));
      document.getElementById('res-div-vout').innerText = vout.toFixed(2) + ' V';
    }

    function calculateSeriesParallel() {
      const r1 = parseFloat(document.getElementById('sp-r1').value);
      const r2 = parseFloat(document.getElementById('sp-r2').value);
      if (!Number.isFinite(r1) || !Number.isFinite(r2) || r1 < 0 || r2 < 0 || (r1 + r2) <= 0) {
        document.getElementById('res-sp-series').innerText = 'Invalid';
        document.getElementById('res-sp-parallel').innerText = 'Invalid';
        return;
      }
      document.getElementById('res-sp-series').innerText = (r1 + r2).toFixed(2) + ' Ω';
      const parallel = (r1 === 0 || r2 === 0) ? 0 : ((r1 * r2) / (r1 + r2));
      document.getElementById('res-sp-parallel').innerText = parallel.toFixed(2) + ' Ω';
    }

    function calculate3Phase() {
      const vl = parseFloat(document.getElementById('ac-vl').value) || 0;
      const il = parseFloat(document.getElementById('ac-il').value) || 0;
      let pf = parseFloat(document.getElementById('ac-pf').value);
      if (isNaN(pf)) pf = 0.85;
      pf = Math.min(1, Math.max(0, pf)); // FIX: clamp power factor to a physically valid 0-1 range
      document.getElementById('res-ac-p').innerText = ((Math.sqrt(3) * vl * il * pf) / 1000).toFixed(2) + ' kW';
      document.getElementById('res-ac-s').innerText = ((Math.sqrt(3) * vl * il) / 1000).toFixed(2) + ' kVA';
    }

    // Live Source Series Demo Circuit — v5.98 smooth AC/DC waveform engine
    let isCircuitClosed = true;
    let homePolarity = 1; // +1 = normal polarity, -1 = reversed / 180° phase
    let homeFlowMode = 'conventional';
    let homeSourceType = 'dc';
    let homeSourceVoltage = 9.0; // DC volts or AC RMS volts
    let homeAcFrequency = 50.0; // Hz
    let homeAcMetricsCache = null;
    let homeScopeFrame = 0;
    let scopePhase = 0;
    let scopeAnimHandle = null;
    // v102: tracks whether #scopeCanvas is actually on-screen (its parent
    // section is not hidden via in-app tab switching, not just browser-tab
    // visibility). Set by the IntersectionObserver wired up further below.
    let scopeCanvasVisible = true;
    const HOME_LOAD_R = 470;
    const HOME_LED_VF = 2.0;

    function homeClampNumber(v, min, max, fallback) {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
    }

    function homeAcPeak() {
      return homeSourceVoltage * Math.SQRT2;
    }

    // Current through the series LED + resistor at a given source voltage.
    // The LED conducts only when its forward voltage is exceeded.
    function homeInstantCurrent(sourceV) {
      const signedV = sourceV * homePolarity;
      const forward = signedV - HOME_LED_VF;
      return forward > 0 ? forward / HOME_LOAD_R : 0;
    }

    // RMS current and real source power for the nonlinear LED + resistor load.
    function homeAcMetrics() {
      const cacheKey = `${homeSourceVoltage}|${homeAcFrequency}|${homePolarity}`;
      if (homeAcMetricsCache && homeAcMetricsCache.key === cacheKey) return homeAcMetricsCache.value;
      const samples = 2048;
      const peak = homeAcPeak();
      let sumI2 = 0;
      let sumVI = 0;
      let sumI = 0;
      for (let k = 0; k < samples; k++) {
        const theta = (2 * Math.PI * k) / samples;
        const sourceV = peak * Math.sin(theta);
        const i = homeInstantCurrent(sourceV);
        sumI2 += i * i;
        sumVI += sourceV * i;
        sumI += i;
      }
      const value = {
        rmsI: Math.sqrt(sumI2 / samples),
        realPowerW: sumVI / samples,
        avgI: sumI / samples
      };
      homeAcMetricsCache = { key: cacheKey, value };
      return value;
    }

    function homeSourceInstantaneous(tSeconds) {
      if (homeSourceType !== 'ac') return homeSourceVoltage * homePolarity;
      return homeAcPeak() * Math.sin(2 * Math.PI * homeAcFrequency * tSeconds) * homePolarity;
    }

    function updateHomeSourceUI() {
      const type = homeSourceType === 'ac' ? 'ac' : 'dc';
      const dc = document.getElementById('home-dc-source');
      const ac = document.getElementById('home-ac-source');
      const freqWrap = document.getElementById('home-source-frequency-wrap');
      const unit = document.getElementById('home-source-voltage-unit');
      const input = document.getElementById('home-source-voltage');
      const freq = document.getElementById('home-source-frequency');
      const dcLabel = document.getElementById('home-dc-source-label');
      const acLabel = document.getElementById('home-ac-source-label');
      const title = document.querySelector('[data-i18n="liveCircuitHeading"]');

      if (dc) dc.style.display = type === 'dc' ? 'block' : 'none';
      if (ac) ac.style.display = type === 'ac' ? 'block' : 'none';
      if (freqWrap) {
        freqWrap.classList.toggle('hidden', type !== 'ac');
        freqWrap.classList.toggle('flex', type === 'ac');
      }
      if (unit) unit.textContent = type === 'ac' ? 'V RMS' : 'V';
      if (input) input.value = Number(homeSourceVoltage).toFixed(1);
      if (freq) freq.value = Number(homeAcFrequency).toFixed(1);
      if (dcLabel) dcLabel.textContent = `${homeSourceVoltage.toFixed(1)}V DC`;
      if (acLabel) acLabel.textContent = `${homeSourceVoltage.toFixed(1)}V AC RMS`;

      if (title) {
        title.textContent = type === 'ac'
          ? 'Live AC Series Circuit Simulation'
          : 'Live DC Series Circuit Simulation';
      }

      const sub = document.querySelector('[data-i18n="liveCircuitSub"]');
      if (sub) {
        sub.textContent = type === 'ac'
          ? 'RMS source • nonlinear LED load • real-time waveform telemetry'
          : 'Closed-Loop Current & Mathematical Telemetry Tracing';
      }

      const status = document.getElementById('current-direction-status');
      if (status && type === 'ac') {
        status.textContent = isCircuitClosed
          ? 'CURRENT: ALTERNATING (AC) • PHASE-DEPENDENT'
          : 'CURRENT: 0 A • SWITCH OPEN';
        status.className = 'px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold';
      }
    }

    function togglePolarity() {
      safeSound('click');
      homePolarity *= -1;
      homeAcMetricsCache = null;
      const btn = document.getElementById('btn-polarity');
      const batteryPlus = document.getElementById('battery-plus-label');
      const batteryMinus = document.getElementById('battery-minus-label');
      const plusLine = document.getElementById('battery-plus-line');
      const minusLine = document.getElementById('battery-minus-line');

      if (homeSourceType === 'dc') {
        if (batteryPlus && batteryMinus) {
          batteryPlus.textContent = homePolarity > 0 ? '+' : '−';
          batteryMinus.textContent = homePolarity > 0 ? '−' : '+';
          batteryPlus.setAttribute('fill', homePolarity > 0 ? '#f87171' : '#60a5fa');
          batteryMinus.setAttribute('fill', homePolarity > 0 ? '#60a5fa' : '#f87171');
        }
        if (plusLine && minusLine) {
          plusLine.setAttribute('stroke', homePolarity > 0 ? '#ef4444' : '#3b82f6');
          minusLine.setAttribute('stroke', homePolarity > 0 ? '#3b82f6' : '#ef4444');
        }
      }

      if (window.NilSparkLabCurrentFlow) {
        window.NilSparkLabCurrentFlow.setPolarity(homePolarity);
        window.NilSparkLabCurrentFlow.setMode(homeFlowMode);
      }

      if (btn) {
        btn.textContent = homeSourceType === 'ac'
          ? (homePolarity > 0 ? '↕ Phase 0°' : '↕ Phase 180°')
          : (homePolarity > 0 ? '↕ Swap Polarity' : '↕ Polarity Reversed');
        btn.className = homePolarity > 0
          ? 'px-4 py-2 rounded-lg text-xs font-bold uppercase transition bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-300'
          : 'px-4 py-2 rounded-lg text-xs font-bold uppercase transition bg-amber-500/15 border border-amber-500/60 text-amber-300';
      }
      updateHomeFlow();
      updateHomeTelemetry();
    }

    // FIX: setFlowMode() and toggleSwitch() were called by the Home page's
    // Conventional/Electron buttons and the Open/Close Switch button (see
    // onclick="setFlowMode(...)" / onclick="toggleSwitch()" above), but
    // neither function existed anywhere in the file. isCircuitClosed and
    // homeFlowMode were only ever *read* by updateHomeFlow()/updateHomeTelemetry()/
    // updateHomeLiveVisual() — nothing ever assigned them from a user action,
    // so clicking either button threw "ReferenceError: ... is not defined"
    // and did nothing. Added here to match the same pattern togglePolarity()
    // already uses (update state, restyle the button, re-render).
    function setFlowMode(mode) {
      safeSound('click');
      homeFlowMode = mode === 'electron' ? 'electron' : 'conventional';
      const btnConv = document.getElementById('btn-conv');
      const btnElec = document.getElementById('btn-elec');
      if (btnConv) btnConv.className = homeFlowMode === 'conventional'
        ? 'px-3 py-1 rounded bg-cyan-600 text-white font-semibold'
        : 'px-3 py-1 rounded text-slate-400 hover:text-white';
      if (btnElec) btnElec.className = homeFlowMode === 'electron'
        ? 'px-3 py-1 rounded bg-amber-600 text-white font-semibold'
        : 'px-3 py-1 rounded text-slate-400 hover:text-white';
      if (window.NilSparkLabCurrentFlow) window.NilSparkLabCurrentFlow.setMode(homeFlowMode);
      updateHomeFlow();
      updateHomeTelemetry();
    }

    function toggleSwitch() {
      safeSound('click');
      isCircuitClosed = !isCircuitClosed;
      const btn = document.getElementById('btn-switch');
      const blade = document.getElementById('switch-blade');
      const label = document.getElementById('switch-label');
      if (btn) {
        btn.textContent = isCircuitClosed ? 'Open Switch' : 'Close Switch';
        btn.className = isCircuitClosed
          ? 'px-4 py-2 rounded-lg text-xs font-bold uppercase transition bg-rose-500/20 border border-rose-500 text-rose-300'
          : 'px-4 py-2 rounded-lg text-xs font-bold uppercase transition bg-emerald-500/20 border border-emerald-500 text-emerald-300';
      }
      if (blade) {
        blade.setAttribute('y2', isCircuitClosed ? '15' : '-5');
        blade.setAttribute('stroke', isCircuitClosed ? '#22d3ee' : '#f43f5e');
      }
      if (label) label.textContent = isCircuitClosed ? 'SWITCH (CLOSED)' : 'SWITCH (OPEN)';
      updateHomeFlow();
      updateHomeTelemetry();
      updateHomeLiveVisual(performance.now() / 1000);
    }

    function updateHomeFlow() {
      const trace = document.getElementById('current-trace');
      if (!trace) return;

      const arrows = {
        left: document.getElementById('flow-arrow-left'),
        top: document.getElementById('flow-arrow-top'),
        right: document.getElementById('flow-arrow-right'),
        bottom: document.getElementById('flow-arrow-bottom')
      };

      if (homeSourceType === 'ac') {
        trace.setAttribute('d', 'M 100 140 L 100 50 L 440 50 L 440 230 L 100 230 Z');
        trace.setAttribute('stroke', homeFlowMode === 'conventional' ? '#22d3ee' : '#f59e0b');
        trace.setAttribute('stroke-dasharray', '8, 12');
        trace.classList.remove('animate-flow-fwd', 'animate-flow-rev');
        if (isCircuitClosed) {
          trace.style.display = 'block';
          const phaseSign = Math.sin(scopePhase) * homePolarity;
          const conventionalSign = homeFlowMode === 'conventional' ? phaseSign : -phaseSign;
          trace.classList.add(conventionalSign >= 0 ? 'animate-flow-fwd' : 'animate-flow-rev');
        } else {
          trace.style.display = 'none';
        }

        if (arrows.left && arrows.top && arrows.right && arrows.bottom) {
          const phaseSign = Math.sin(scopePhase) * homePolarity;
          const conventionalSign = homeFlowMode === 'conventional' ? phaseSign : -phaseSign;
          const fwd = conventionalSign >= 0;
          arrows.left.textContent = fwd ? '↑' : '↓';
          arrows.top.textContent = fwd ? '→' : '←';
          arrows.right.textContent = fwd ? '↓' : '↑';
          arrows.bottom.textContent = fwd ? '←' : '→';
          document.getElementById('current-direction-arrows').style.display =
            isCircuitClosed ? 'block' : 'none';
        }

        const status = document.getElementById('current-direction-status');
        if (status) {
          status.textContent = isCircuitClosed
            ? 'CURRENT: ALTERNATING (AC) • PHASE-DEPENDENT'
            : 'CURRENT: 0 A • SWITCH OPEN';
          status.className = 'px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold';
        }
      } else {
        const conventionalForward = homePolarity > 0;
        const forward = homeFlowMode === 'conventional'
          ? conventionalForward
          : !conventionalForward;

        trace.setAttribute('d', 'M 100 140 L 100 50 L 440 50 L 440 230 L 100 230 Z');
        trace.setAttribute('stroke', homeFlowMode === 'conventional' ? '#22d3ee' : '#f59e0b');
        trace.setAttribute('stroke-dasharray', '8, 12');
        trace.classList.remove('animate-flow-fwd', 'animate-flow-rev');
        void trace.getBoundingClientRect();
        trace.classList.add(forward ? 'animate-flow-fwd' : 'animate-flow-rev');
        trace.style.display = isCircuitClosed ? 'block' : 'none';

        if (arrows.left && arrows.top && arrows.right && arrows.bottom) {
          arrows.left.textContent = forward ? '↑' : '↓';
          arrows.top.textContent = forward ? '→' : '←';
          arrows.right.textContent = forward ? '↓' : '↑';
          arrows.bottom.textContent = forward ? '←' : '→';
          document.getElementById('current-direction-arrows').style.display =
            isCircuitClosed ? 'block' : 'none';
        }

        const status = document.getElementById('current-direction-status');
        if (status) {
          status.textContent = isCircuitClosed
            ? (forward ? 'CURRENT DIRECTION: CLOCKWISE (↑ → ↓ ←)' : 'CURRENT DIRECTION: REVERSE / COUNTER-CLOCKWISE (↓ ← ↑ →)')
            : 'CURRENT: 0 A • SWITCH OPEN';
          status.className = forward
            ? 'px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold'
            : 'px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold';
        }
      }

      document.documentElement.dataset.homePolarity =
        homePolarity > 0 ? 'normal' : 'reversed';
      document.documentElement.dataset.homeFlow =
        homeSourceType === 'ac' ? 'alternating' : (homePolarity > 0 ? 'forward' : 'reverse');
      document.documentElement.dataset.currentDirection =
        homeSourceType === 'ac' ? 'alternating' : (homeFlowMode === 'conventional'
          ? (homePolarity > 0 ? 'forward' : 'reverse')
          : (homePolarity > 0 ? 'reverse' : 'forward'));
    }

    function updateHomeTelemetry() {
      const r = HOME_LOAD_R;
      const vEl = document.getElementById('stat-voltage');
      const iEl = document.getElementById('stat-current');
      const rP = document.getElementById('stat-res-power');
      const tP = document.getElementById('stat-total-power');
      const iLabel = document.querySelector('[data-i18n="telemetryCurrent"]');
      const vLabel = document.querySelector('[data-i18n="telemetryEmf"]');
      if (!vEl || !iEl || !rP || !tP) return;

      if (!isCircuitClosed) {
        vEl.textContent = '0.0 V';
        iEl.textContent = '0.00 mA';
        rP.textContent = '0.0 mW';
        tP.textContent = '0.0 mW';
        if (iLabel) iLabel.textContent = homeSourceType === 'ac' ? 'Loop Current (RMS)' : 'Loop Current (I = V/R)';
        if (vLabel) vLabel.textContent = homeSourceType === 'ac' ? 'Source Voltage (RMS)' : 'Supply Voltage';
        return;
      }

      if (homeSourceType === 'dc') {
        const v = homeSourceVoltage;
        const i = homeInstantCurrent(v);
        const iMa = i * 1000;
        vEl.textContent = `${v.toFixed(1)} V`;
        iEl.textContent = `${iMa.toFixed(2)} mA`;
        rP.textContent = `${((i * i) * r * 1000).toFixed(1)} mW`;
        tP.textContent = `${(v * i * 1000).toFixed(1)} mW`;
        if (iLabel) iLabel.textContent = 'Loop Current (I = (V−Vf)/R)';
        if (vLabel) vLabel.textContent = 'Supply Voltage';
      } else {
        const vRms = homeSourceVoltage;
        const metrics = homeAcMetrics();
        vEl.textContent = `${vRms.toFixed(1)} V RMS`;
        iEl.textContent = `${(metrics.rmsI * 1000).toFixed(2)} mA RMS`;
        rP.textContent = `${(metrics.rmsI * metrics.rmsI * r * 1000).toFixed(1)} mW`;
        tP.textContent = `${(metrics.realPowerW * 1000).toFixed(1)} mW`;
        if (iLabel) iLabel.textContent = 'Loop Current (RMS)';
        if (vLabel) vLabel.textContent = 'Source Voltage (RMS)';
      }
    }

    function updateHomeLiveVisual(tSeconds) {
      const led = document.getElementById('led-bulb');
      if (!led) return;
      if (!isCircuitClosed) {
        led.setAttribute('fill', '#334155');
        led.style.opacity = '0.45';
        return;
      }

      const instV = homeSourceInstantaneous(tSeconds);
      const i = homeInstantCurrent(instV);
      if (homeSourceType === 'dc') {
        led.setAttribute('fill', i > 0 ? '#ef4444' : '#334155');
        led.style.opacity = i > 0 ? '1' : '0.45';
      } else {
        const brightness = Math.min(1, i / 0.03);
        led.setAttribute('fill', i > 0 ? '#ef4444' : '#334155');
        led.style.opacity = String(0.35 + brightness * 0.65);
      }
    }

    function setHomeSourceType(type) {
      safeSound('click');
      homeSourceType = type === 'ac' ? 'ac' : 'dc';
      homeAcMetricsCache = null;
      if (homeSourceType === 'ac') homeAcFrequency = homeClampNumber(homeAcFrequency, 0.1, 10000, 50);
      const select = document.getElementById('home-source-type');
      if (select) select.value = homeSourceType;
      const btn = document.getElementById('btn-polarity');
      if (btn) {
        btn.textContent = homeSourceType === 'ac'
          ? (homePolarity > 0 ? '↕ Phase 0°' : '↕ Phase 180°')
          : (homePolarity > 0 ? '↕ Swap Polarity' : '↕ Polarity Reversed');
      }
      updateHomeSourceUI();
      updateHomeTelemetry();
      updateHomeFlow();
    }

    function setHomeSourceVoltage(value) {
      homeSourceVoltage = homeClampNumber(value, 0.1, 240, 9.0);
      homeAcMetricsCache = null;
      updateHomeSourceUI();
      updateHomeTelemetry();
    }

    function setHomeSourceFrequency(value) {
      homeAcFrequency = homeClampNumber(value, 0.1, 10000, 50.0);
      homeAcMetricsCache = null;
      updateHomeSourceUI();
    }

    // Backward-compatible function used by older code paths.
    function updateStats(v, r) {
      if (arguments.length >= 2 && Number.isFinite(Number(v)) && Number.isFinite(Number(r))) {
        homeSourceVoltage = Math.max(0, Number(v));
        if (r > 0) {
          updateHomeTelemetry();
          return;
        }
      }
      updateHomeTelemetry();
    }

    function animateScope() {
      const canvas = document.getElementById('scopeCanvas');
      const now = performance.now();
      const tSeconds = now / 1000;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = 0; y < canvas.height; y += 30) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();

        // Zero/center reference line
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        const sourcePeak = homeSourceType === 'ac' ? homeAcPeak() : homeSourceVoltage;
        const maxDisplay = Math.max(sourcePeak, 2.5);
        ctx.strokeStyle = isCircuitClosed ? '#22d3ee' : '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x++) {
          const normalizedTime = x / canvas.width;
          const spanSeconds = homeSourceType === 'ac'
            ? Math.max(1 / Math.max(homeAcFrequency, 0.1) * 3, 0.012)
            : 0.12;
          const t = (now / 1000) + normalizedTime * spanSeconds;
          let yValue = isCircuitClosed ? homeSourceInstantaneous(t) : 0;

          // Scope is CH1 across the source: AC = sine, DC = flat line.
          const y = (canvas.height / 2) - (yValue / maxDisplay) * (canvas.height * 0.40);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        scopePhase = homeSourceType === 'ac'
          ? (2 * Math.PI * homeAcFrequency * tSeconds) % (2 * Math.PI)
          : 0;

        updateHomeLiveVisual(tSeconds);
        homeScopeFrame++;
        if (homeScopeFrame % 3 === 0) updateHomeFlow();
        if (homeScopeFrame % 10 === 0) updateHomeTelemetry();
      }
      if (!document.hidden && scopeCanvasVisible) {
        scopeAnimHandle = requestAnimationFrame(animateScope);
      } else {
        scopeAnimHandle = null;
      }
    }

    updateHomeSourceUI();

    // Keyboard Shortcuts (Ctrl+Z: Undo, Ctrl+Y: Redo)
    window.addEventListener('keydown', (e) => {
      // FIX: don't hijack Ctrl+Z / Ctrl+Y while the user is typing in
      // a text input, number field, or textarea elsewhere on the page.
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undoAction();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redoAction();
      }
    });

    // Progress Tracking & Navigation
    // Rebrand migration: fall back to the old pre-rename key so existing
    // visitors don't lose their saved progress.
    let currentProgress = parseInt(
      SafeStore.get('nilsparklab_progress', null) ?? SafeStore.get('electrolab_progress', '0'),
      10
    ) || 0;
    function trackProgress(inc) {
      currentProgress = Math.min(100, currentProgress + inc);
      SafeStore.set('nilsparklab_progress', currentProgress.toString());
      document.getElementById('progress-val').innerText = currentProgress + '%';
    }

    // FIX: labels that quote a live count (component count, quiz
    // question count) are now generated from the actual array
    // lengths instead of hardcoded numbers that silently drifted
    // out of sync with the data (e.g. "50+ Components" when only
    // 6 existed, "20+ Questions" when only 2 existed).
    function refreshDynamicLabels() {
      const compCount = componentsDatabase.length;
      const quizCount = quizQuestions.length;

      const exploreBtn = document.getElementById('btn-explore-components');
      if (exploreBtn) exploreBtn.innerText = currentLang === 'hi' ? `${compCount}+ कंपोनेंट देखें →` : `Explore ${compCount}+ Components →`;

      const cardCompTitle = document.getElementById('card-comp-title');
      if (cardCompTitle) cardCompTitle.innerText = currentLang === 'hi' ? `${compCount}+ कंपोनेंट` : `${compCount}+ Components`;

      const compHeading = document.getElementById('comp-heading');
      if (compHeading) compHeading.innerText = currentLang === 'hi' ? `कंपोनेंट डायरेक्टरी (${compCount}+ कंपोनेंट)` : `Component Directory (${compCount}+ Components)`;

      const allPill = document.getElementById('pill-All');
      if (allPill) allPill.innerText = currentLang === 'hi' ? `सभी (${compCount})` : `All (${compCount})`;

      const cardQuizDesc = document.getElementById('card-quiz-desc');
      if (cardQuizDesc) cardQuizDesc.innerText = `${quizCount} Questions`;
    }

    function showSection(sectionId, updateHistory = true) {
      safeSound('click');
      const sections = ['home', 'components', 'study', 'symbols', 'builder', 'industrial', 'projects', 'faults', 'calculators', 'quiz', 'safety'];
      sections.forEach(s => {
        const secEl = document.getElementById(`sec-${s}`);
        if (secEl) secEl.classList.add('hidden');
        const navEl = document.getElementById(`nav-${s}`);
        if (navEl) {
          navEl.classList.remove('bg-cyan-500', 'text-slate-950', 'font-bold');
          navEl.classList.add('text-slate-400');
        }
      });

      const targetSec = document.getElementById(`sec-${sectionId}`);
      if (targetSec) targetSec.classList.remove('hidden');

      const targetNav = document.getElementById(`nav-${sectionId}`);
      if (targetNav) {
        targetNav.classList.add('bg-cyan-500', 'text-slate-950', 'font-bold');
        targetNav.classList.remove('text-slate-400');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // FIX: push a browser history entry for each section change so the
      // phone/browser Back button navigates within the app (e.g. from
      // Circuit Builder back to Home) instead of leaving the page.
      // updateHistory=false is used when we're responding to a Back/Forward
      // press itself, to avoid pushing a duplicate entry.
      if (updateHistory && (!history.state || history.state.section !== sectionId)) {
        history.pushState({ section: sectionId }, '', '#' + sectionId);
      }
    }

    // FIX: handle the phone/browser Back (and Forward) button by switching
    // to whichever section is recorded in that history entry, falling back
    // to Home if none is set.
    window.addEventListener('popstate', (e) => {
      const sectionId = (e.state && e.state.section) || 'home';
      showSection(sectionId, false);
    });

    function toggleMobileMenu() {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    }

    // v99 — purely cosmetic: add a soft shadow under the sticky header once
    // the page scrolls, for depth separation from content underneath.
    (function elabV99HeaderScrollShadow(){
      const headerEl = document.querySelector('header.sticky');
      if (!headerEl) return;
      const applyShadow = () => {
        headerEl.classList.toggle('elab-scrolled', window.scrollY > 4);
      };
      window.addEventListener('scroll', applyShadow, { passive: true });
      applyShadow();
    })();

    // Perf fix: pause the header's backdrop-filter blur while the page is
    // actively scrolling. backdrop-filter forces a re-blur of everything
    // behind a sticky element on every scroll frame, which is a common
    // cause of scroll jank — removing it during motion and restoring it
    // ~150ms after scrolling stops keeps the visual effect at rest while
    // eliminating that per-frame GPU cost during the scroll itself.
    (function elabScrollBlurPause(){
      let scrollEndTimer = null;
      const onScroll = () => {
        document.body.classList.add('elab-is-scrolling');
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => {
          document.body.classList.remove('elab-is-scrolling');
        }, 150);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    })();

    // PWA: register the service worker so the app shell is cached and the
    // app can be installed / used offline after the first visit.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {
          // Registration can fail harmlessly in sandboxed/preview contexts
          // (e.g. no https origin) — the rest of the app still works fine.
        });
      });
    }

    // PWA: capture the browser's install prompt and show our own
    // "Install App" button instead of relying on the browser's default UI,
    // which many users never notice.
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById('btn-install-app');
      if (btn) btn.classList.remove('hidden');
    });

    async function installNilSparkLabApp() {
      SoundEngine.playClick();
      const btn = document.getElementById('btn-install-app');
      if (!deferredInstallPrompt) {
        // No captured prompt (already installed, unsupported browser, or
        // criteria not yet met) — hide the button rather than do nothing.
        if (btn) btn.classList.add('hidden');
        return;
      }
      deferredInstallPrompt.prompt();
      try {
        await deferredInstallPrompt.userChoice;
      } finally {
        deferredInstallPrompt = null;
        if (btn) btn.classList.add('hidden');
      }
    }

    window.addEventListener('appinstalled', () => {
      const btn = document.getElementById('btn-install-app');
      if (btn) btn.classList.add('hidden');
      deferredInstallPrompt = null;
    });

    window.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      setLanguage(currentLang);
      renderComponents(componentsDatabase);
      renderSymbols();
      renderFaults();
      renderQuizQuestion();
      initDraggableProbes();
      refreshDynamicLabels();
      document.getElementById('progress-val').innerText = currentProgress + '%';
      // FIX: set Home as the base history entry (without pushing a new one)
      // so the very first Back press from any section lands on Home.
      history.replaceState({ section: 'home' }, '', '#home');
      showSection('home', false);
      calculateOhm();
      calculateLED();
      calculateDivider();
      calculateSeriesParallel();
      calculate3Phase();
      animateScope();
    });

    // FIX: stop the oscilloscope's requestAnimationFrame loop when
    // the tab/page is hidden, instead of burning CPU/battery forever
    // in the background.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (scopeAnimHandle) cancelAnimationFrame(scopeAnimHandle);
        scopeAnimHandle = null;
      } else if (!scopeAnimHandle && scopeCanvasVisible) {
        animateScope();
      }
    });

    // v102: also stop the same loop when the Home section itself is
    // switched away from in-app (showSection() just toggles a `hidden`
    // class — the browser tab stays visible, so visibilitychange alone
    // never catches this). IntersectionObserver correctly reports
    // display:none content as non-intersecting, so this reuses the same
    // start/stop path as the tab-visibility check above.
    (function () {
      const scopeCanvasEl = document.getElementById('scopeCanvas');
      if (!scopeCanvasEl || typeof IntersectionObserver !== 'function') return;
      const scopeVisibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          scopeCanvasVisible = entry.isIntersecting;
          if (!scopeCanvasVisible) {
            if (scopeAnimHandle) cancelAnimationFrame(scopeAnimHandle);
            scopeAnimHandle = null;
          } else if (!document.hidden && !scopeAnimHandle) {
            animateScope();
          }
        });
      });
      scopeVisibilityObserver.observe(scopeCanvasEl);
    })();
  