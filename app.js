(() => {
  "use strict";

  const STORAGE = {
    theme: "studio-widgets:theme",
    pomodoro: "studio-widgets:pomodoro",
    whiteboard: "studio-widgets:whiteboard"
  };

  const MODES = {
    focus: { label: "Fokus", minutes: 25 },
    short: { label: "Kurze Pause", minutes: 5 },
    long: { label: "Lange Pause", minutes: 15 }
  };

  const params = new URLSearchParams(window.location.search);
  const routeAliases = {
    clock: "clock",
    uhr: "clock",
    pomodoro: "pomodoro",
    focus: "pomodoro",
    fokus: "pomodoro",
    progress: "progress",
    fortschritt: "progress",
    calculator: "calculator",
    zinseszins: "calculator",
    whiteboard: "whiteboard",
    board: "whiteboard",
    tafel: "whiteboard"
  };

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const pathCandidate = pathParts.at(-1) || "";
  const pathRoute = routeAliases[pathCandidate.toLowerCase()] ? pathCandidate : "";
  const rawRoute = params.get("widget") || pathRoute || window.location.hash.slice(1);
  const route = routeAliases[rawRoute.toLowerCase()] || (rawRoute ? "not-found" : "home");
  const embed = params.get("embed") === "1" || params.get("embed") === "true";
  const app = document.querySelector("#app");

  if (embed) document.body.classList.add("embed");

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Widgets still work when iframe storage is disabled.
    }
  }

  function initializeTheme() {
    const requested = params.get("theme");
    const stored = safeStorageGet(STORAGE.theme);
    const initial = ["light", "dark"].includes(requested) ? requested : stored;
    if (initial) document.documentElement.dataset.theme = initial;

    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.addEventListener("click", toggleTheme);
    });
  }

  function toggleTheme() {
    const isDark = document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    safeStorageSet(STORAGE.theme, next);
  }

  function themeButton() {
    return `
      <button class="icon-button embed-theme-toggle theme-toggle" type="button" aria-label="Farbschema wechseln" title="Farbschema wechseln">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.4 15.1A8.4 8.4 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15Z" />
        </svg>
      </button>`;
  }

  function widgetFrame(title, eyebrow, content) {
    return `
      <section class="widget-page">
        <div class="widget-heading">
          <div>
            <a class="back-link" href="./">← Alle Widgets</a>
            <p class="eyebrow">${eyebrow}</p>
            <h1>${title}</h1>
          </div>
        </div>
        <div class="widget-shell">
          ${themeButton()}
          ${content}
        </div>
      </section>`;
  }

  function renderHome() {
    document.title = "Studio Widgets";
    app.innerHTML = `
      <section class="home-hero">
        <p class="eyebrow">Native Ergänzungen für Notion</p>
        <h1>Werkzeuge, die ruhig im Hintergrund arbeiten.</h1>
        <p class="lede">Fünf kleine, präzise Widgets für Fokus, Zeitgefühl, Planung und freie Gedanken – ohne Anmeldung, Cookies oder fremde Dienste.</p>
      </section>
      <section class="widget-grid" aria-label="Verfügbare Widgets">
        ${homeCard("01", "Analoge Uhr", "Sekundengenaue Ortszeit, Datum und Zeitzone in einer reduzierten Zifferblatt-Ansicht.", "clock")}
        ${homeCard("02", "Pomodoro", "Ein belastbarer 25/5/15-Timer mit lokalem Sitzungszähler und Wiederaufnahme nach einem Reload.", "pomodoro")}
        ${homeCard("03", "Zeitfortschritt", "Tag, Woche, Monat und Jahr als live berechnete Fortschrittsringe.", "progress")}
        ${homeCard("04", "Zinseszins", "Interaktiver Sparrechner mit Einzahlung, Rendite, Laufzeit und klar ausgewiesenem Zinsertrag.", "calculator")}
        ${homeCard("05", "Whiteboard", "Eine stiftfähige Zeichenfläche mit Undo, lokalem Autosave und PNG-Export.", "whiteboard")}
      </section>`;
  }

  function homeCard(index, title, copy, target) {
    return `
      <a class="widget-card" href="?widget=${target}">
        <span class="card-index">${index}</span>
        <h2>${title}</h2>
        <p>${copy}</p>
        <span class="card-link">Öffnen</span>
      </a>`;
  }

  function updateActiveNavigation(active) {
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const target = new URL(link.href).searchParams.get("widget");
      if (target === active) link.setAttribute("aria-current", "page");
    });
  }

  function clockFace() {
    const ticks = Array.from({ length: 60 }, (_, index) => {
      const angle = (index * 6 - 90) * Math.PI / 180;
      const major = index % 5 === 0;
      const outer = 145;
      const inner = major ? 132 : 138;
      const x1 = 160 + Math.cos(angle) * inner;
      const y1 = 160 + Math.sin(angle) * inner;
      const x2 = 160 + Math.cos(angle) * outer;
      const y2 = 160 + Math.sin(angle) * outer;
      return `<line class="clock-tick${major ? " major" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }).join("");

    const numerals = [12, 3, 6, 9].map((number, index) => {
      const angle = (index * 90 - 90) * Math.PI / 180;
      return `<text class="clock-numeral" x="${160 + Math.cos(angle) * 113}" y="${160 + Math.sin(angle) * 113}">${number}</text>`;
    }).join("");

    return `
      <svg class="analog-clock" viewBox="0 0 320 320" role="img" aria-label="Analoge Uhr">
        <circle class="clock-face" cx="160" cy="160" r="153" />
        ${ticks}
        ${numerals}
        <line id="hour-hand" class="clock-hand hour" x1="160" y1="166" x2="160" y2="102" />
        <line id="minute-hand" class="clock-hand minute" x1="160" y1="169" x2="160" y2="70" />
        <line id="second-hand" class="clock-hand second" x1="160" y1="176" x2="160" y2="54" />
        <circle class="clock-pin" cx="160" cy="160" r="6" />
      </svg>`;
  }

  function renderClock() {
    document.title = "Analoge Uhr · Studio Widgets";
    updateActiveNavigation("clock");
    app.innerHTML = widgetFrame("Analoge Uhr", "Zeit · Europe/Berlin", `
      <div class="widget-meta">
        <span><span class="status-dot"></span>Live</span>
        <span id="clock-week">Kalenderwoche</span>
      </div>
      <div class="clock-layout">
        <div class="clock-stage">${clockFace()}</div>
        <div class="clock-info">
          <p class="eyebrow">Lokale Zeit</p>
          <p class="digital-time" id="digital-time">00:00:00</p>
          <p class="clock-date" id="clock-date"></p>
          <div class="timezone-label"><span class="status-dot"></span><span id="timezone-name"></span></div>
        </div>
      </div>`);

    initializeTheme();
    const hourHand = document.querySelector("#hour-hand");
    const minuteHand = document.querySelector("#minute-hand");
    const secondHand = document.querySelector("#second-hand");
    const digital = document.querySelector("#digital-time");
    const dateLabel = document.querySelector("#clock-date");
    const timezone = document.querySelector("#timezone-name");
    const week = document.querySelector("#clock-week");

    function setHand(hand, degrees) {
      hand.setAttribute("transform", `rotate(${degrees} 160 160)`);
    }

    function updateClock() {
      const now = new Date();
      const milliseconds = now.getMilliseconds();
      const seconds = now.getSeconds() + milliseconds / 1000;
      const minutes = now.getMinutes() + seconds / 60;
      const hours = (now.getHours() % 12) + minutes / 60;
      setHand(secondHand, seconds * 6);
      setHand(minuteHand, minutes * 6);
      setHand(hourHand, hours * 30);

      digital.textContent = now.toLocaleTimeString("de-DE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      dateLabel.textContent = new Intl.DateTimeFormat("de-DE", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric"
      }).format(now);
      timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Lokale Zeitzone";
      week.textContent = `Kalenderwoche ${isoWeek(now)}`;
      window.requestAnimationFrame(updateClock);
    }

    updateClock();
  }

  function isoWeek(date) {
    const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    current.setUTCDate(current.getUTCDate() + 4 - (current.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
    return Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  }

  function renderPomodoro() {
    document.title = "Pomodoro · Studio Widgets";
    updateActiveNavigation("pomodoro");
    app.innerHTML = widgetFrame("Pomodoro", "Fokus · 25 / 5 / 15", `
      <div class="widget-meta">
        <span><span class="status-dot"></span>Bereit</span>
        <span>Lokale Speicherung</span>
      </div>
      <div class="pomodoro-layout">
        <div class="timer-stage">
          <div class="timer-ring">
            <svg viewBox="0 0 320 320" aria-hidden="true">
              <circle class="ring-track" cx="160" cy="160" r="148" />
              <circle id="timer-ring-value" class="ring-value" cx="160" cy="160" r="148" />
            </svg>
            <div class="timer-center" aria-live="polite">
              <div id="timer-label" class="timer-label">Fokus</div>
              <div id="timer-time" class="timer-time">25:00</div>
            </div>
          </div>
        </div>
        <div class="timer-panel">
          <div class="segmented-control" aria-label="Timer-Modus">
            <button type="button" data-mode="focus" aria-pressed="true">Fokus</button>
            <button type="button" data-mode="short" aria-pressed="false">5 Min</button>
            <button type="button" data-mode="long" aria-pressed="false">15 Min</button>
          </div>
          <div class="timer-actions">
            <button id="timer-toggle" class="button" type="button">Starten</button>
            <button id="timer-reset" class="button secondary" type="button">Reset</button>
          </div>
          <p class="timer-hint">Leertaste: Start / Pause · R: Reset</p>
          <div class="session-count">
            <strong id="session-count">0</strong>
            <span>Fokussitzungen heute abgeschlossen</span>
          </div>
        </div>
      </div>`);

    initializeTheme();
    const circumference = 2 * Math.PI * 148;
    const ring = document.querySelector("#timer-ring-value");
    ring.style.strokeDasharray = String(circumference);

    let state = loadPomodoroState();
    const timeElement = document.querySelector("#timer-time");
    const labelElement = document.querySelector("#timer-label");
    const toggle = document.querySelector("#timer-toggle");
    const reset = document.querySelector("#timer-reset");
    const count = document.querySelector("#session-count");

    function loadPomodoroState() {
      const fallback = {
        mode: "focus",
        remaining: MODES.focus.minutes * 60,
        running: false,
        endAt: null,
        sessions: 0,
        sessionDate: localDateKey(new Date())
      };
      const stored = safeStorageGet(STORAGE.pomodoro);
      if (!stored) return fallback;
      try {
        const parsed = { ...fallback, ...JSON.parse(stored) };
        if (!MODES[parsed.mode]) return fallback;
        if (parsed.sessionDate !== localDateKey(new Date())) {
          parsed.sessions = 0;
          parsed.sessionDate = localDateKey(new Date());
        }
        if (parsed.running && parsed.endAt) {
          parsed.remaining = Math.max(0, Math.ceil((parsed.endAt - Date.now()) / 1000));
          if (parsed.remaining <= 0) {
            if (parsed.mode === "focus") parsed.sessions += 1;
            parsed.running = false;
            parsed.endAt = null;
          }
        }
        return parsed;
      } catch {
        return fallback;
      }
    }

    function saveState() {
      safeStorageSet(STORAGE.pomodoro, JSON.stringify(state));
    }

    function durationForMode() {
      return MODES[state.mode].minutes * 60;
    }

    function syncFromClock() {
      if (!state.running || !state.endAt) return;
      const next = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
      if (next <= 0) {
        state.remaining = 0;
        state.running = false;
        state.endAt = null;
        if (state.mode === "focus") state.sessions += 1;
        saveState();
        playChime();
      } else {
        state.remaining = next;
      }
    }

    function renderTimer() {
      syncFromClock();
      const minutes = Math.floor(state.remaining / 60);
      const seconds = state.remaining % 60;
      timeElement.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      labelElement.textContent = MODES[state.mode].label;
      toggle.textContent = state.running ? "Pausieren" : state.remaining === 0 ? "Neu starten" : "Starten";
      count.textContent = String(state.sessions);
      document.title = `${timeElement.textContent} · ${MODES[state.mode].label}`;

      const progress = 1 - state.remaining / durationForMode();
      ring.style.strokeDashoffset = String(circumference * Math.min(1, Math.max(0, progress)));
      document.querySelectorAll("[data-mode]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode));
      });
    }

    function toggleTimer() {
      syncFromClock();
      if (state.remaining <= 0) state.remaining = durationForMode();
      state.running = !state.running;
      state.endAt = state.running ? Date.now() + state.remaining * 1000 : null;
      saveState();
      renderTimer();
    }

    function resetTimer() {
      state.running = false;
      state.endAt = null;
      state.remaining = durationForMode();
      saveState();
      renderTimer();
    }

    function switchMode(mode) {
      state.mode = mode;
      state.running = false;
      state.endAt = null;
      state.remaining = MODES[mode].minutes * 60;
      saveState();
      renderTimer();
    }

    toggle.addEventListener("click", toggleTimer);
    reset.addEventListener("click", resetTimer);
    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => switchMode(button.dataset.mode));
    });
    document.addEventListener("keydown", (event) => {
      if (event.target.matches("button, input")) return;
      if (event.code === "Space") {
        event.preventDefault();
        toggleTimer();
      }
      if (event.key.toLowerCase() === "r") resetTimer();
    });
    document.addEventListener("visibilitychange", renderTimer);

    renderTimer();
    window.setInterval(() => {
      renderTimer();
      if (state.running) saveState();
    }, 250);
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  function playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      oscillator.frequency.setValueAtTime(880, context.currentTime + 0.18);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.55);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.58);
    } catch {
      // The visual completion state is sufficient when audio is unavailable.
    }
  }

  function progressRing(id) {
    return `
      <div class="progress-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="54" />
          <circle id="${id}-ring" class="ring-value" cx="60" cy="60" r="54" />
        </svg>
        <strong id="${id}-percent">0%</strong>
      </div>`;
  }

  function renderProgress() {
    document.title = "Zeitfortschritt · Studio Widgets";
    updateActiveNavigation("progress");
    const cards = [
      ["day", "Tag", "Seit Mitternacht"],
      ["week", "Woche", "Montag bis Sonntag"],
      ["month", "Monat", "Aktueller Kalendermonat"],
      ["year", "Jahr", "1. Januar bis 31. Dezember"]
    ];
    app.innerHTML = widgetFrame("Zeitfortschritt", "Zeit · Jetzt", `
      <div class="widget-meta">
        <span><span class="status-dot"></span>Live berechnet</span>
        <span id="progress-now"></span>
      </div>
      <div class="progress-layout">
        <div class="progress-grid">
          ${cards.map(([id, title, copy]) => `
            <article class="progress-card">
              ${progressRing(id)}
              <div>
                <h3>${title}</h3>
                <p>${copy}</p>
                <span class="progress-remaining" id="${id}-remaining"></span>
              </div>
            </article>`).join("")}
        </div>
      </div>`);
    initializeTheme();

    const circumference = 2 * Math.PI * 54;
    cards.forEach(([id]) => {
      const ring = document.querySelector(`#${id}-ring`);
      ring.style.strokeDasharray = String(circumference);
    });

    function updateProgress() {
      const now = new Date();
      const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const mondayOffset = (now.getDay() + 6) % 7;
      const startWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
      const endWeek = new Date(startWeek.getFullYear(), startWeek.getMonth(), startWeek.getDate() + 7);
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const startYear = new Date(now.getFullYear(), 0, 1);
      const endYear = new Date(now.getFullYear() + 1, 0, 1);
      const ranges = {
        day: [startDay, endDay],
        week: [startWeek, endWeek],
        month: [startMonth, endMonth],
        year: [startYear, endYear]
      };

      Object.entries(ranges).forEach(([id, [start, end]]) => {
        const progress = (now - start) / (end - start);
        const percent = progress * 100;
        document.querySelector(`#${id}-ring`).style.strokeDashoffset = String(circumference * (1 - progress));
        document.querySelector(`#${id}-percent`).textContent = `${percent.toFixed(id === "day" ? 1 : 2)}%`;
        document.querySelector(`#${id}-remaining`).textContent = `${formatDuration(end - now)} verbleibend`;
      });

      document.querySelector("#progress-now").textContent = now.toLocaleString("de-DE", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
      });
    }

    updateProgress();
    window.setInterval(updateProgress, 1000);
  }

  function formatDuration(milliseconds) {
    const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days} T ${hours} Std`;
    if (hours > 0) return `${hours} Std ${minutes} Min`;
    return `${minutes} Min`;
  }

  function renderCalculator() {
    document.title = "Zinseszins · Studio Widgets";
    updateActiveNavigation("calculator");
    const fields = [
      { id: "principal", label: "Startkapital", min: 0, max: 100000, step: 500, value: 1000 },
      { id: "monthly", label: "Monatliche Sparrate", min: 0, max: 5000, step: 25, value: 200 },
      { id: "years", label: "Laufzeit", min: 1, max: 40, step: 1, value: 10 },
      { id: "rate", label: "Rendite p. a.", min: 0, max: 20, step: 0.1, value: 8 }
    ];
    app.innerHTML = widgetFrame("Zinseszins", "Finanzen · Projektion", `
      <div class="widget-meta">
        <span>Monatliche Verzinsung</span>
        <span>Unverbindliche Modellrechnung</span>
      </div>
      <div class="calculator-layout">
        <form class="calculator-controls" id="calculator-form">
          ${fields.map((field) => `
            <div class="range-field">
              <div class="range-label">
                <label for="${field.id}">${field.label}</label>
                <output id="${field.id}-output" for="${field.id}"></output>
              </div>
              <input id="${field.id}" type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${field.value}" />
            </div>`).join("")}
        </form>
        <div class="calculator-results" aria-live="polite">
          <span class="result-overline">Voraussichtliches Vermögen</span>
          <strong class="projected-balance" id="projected-balance">0 €</strong>
          <span class="free-money" id="free-money">+ 0 € Zinsertrag</span>
          <div class="chart-wrap">
            <svg id="growth-chart" viewBox="0 0 520 190" preserveAspectRatio="none" role="img" aria-label="Entwicklung von Einzahlungen und Vermögen">
              <line class="chart-grid" x1="0" y1="1" x2="520" y2="1" />
              <line class="chart-grid" x1="0" y1="95" x2="520" y2="95" />
              <line class="chart-grid" x1="0" y1="189" x2="520" y2="189" />
              <path class="chart-contributions" id="contribution-line" d="" />
              <path class="chart-balance" id="balance-line" d="" />
            </svg>
          </div>
          <div class="result-breakdown">
            <div><span>Eigene Einzahlungen</span><strong id="contributions">0 €</strong></div>
            <div><span>Zinsertrag</span><strong id="interest">0 €</strong></div>
          </div>
        </div>
      </div>`);
    initializeTheme();

    const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
    const values = Object.fromEntries(fields.map(({ id }) => [id, document.querySelector(`#${id}`)]));

    function updateCalculator() {
      const principal = Number(values.principal.value);
      const monthly = Number(values.monthly.value);
      const years = Number(values.years.value);
      const annualRate = Number(values.rate.value) / 100;
      document.querySelector("#principal-output").textContent = euro.format(principal);
      document.querySelector("#monthly-output").textContent = `${euro.format(monthly)} / Monat`;
      document.querySelector("#years-output").textContent = `${years} ${years === 1 ? "Jahr" : "Jahre"}`;
      document.querySelector("#rate-output").textContent = `${(annualRate * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;

      const points = calculateGrowth(principal, monthly, years, annualRate);
      const finalPoint = points[points.length - 1];
      const interest = Math.max(0, finalPoint.balance - finalPoint.contributions);
      document.querySelector("#projected-balance").textContent = euro.format(finalPoint.balance);
      document.querySelector("#free-money").textContent = `+ ${euro.format(interest)} „freies Geld“ durch Zinseszins`;
      document.querySelector("#contributions").textContent = euro.format(finalPoint.contributions);
      document.querySelector("#interest").textContent = euro.format(interest);
      drawGrowthChart(points);
    }

    function calculateGrowth(principal, monthly, years, annualRate) {
      const monthlyRate = annualRate / 12;
      const months = years * 12;
      let balance = principal;
      const points = [{ balance, contributions: principal }];
      for (let month = 1; month <= months; month += 1) {
        balance = balance * (1 + monthlyRate) + monthly;
        if (month % 12 === 0 || month === months) {
          points.push({ balance, contributions: principal + monthly * month });
        }
      }
      return points;
    }

    function drawGrowthChart(points) {
      const width = 520;
      const height = 188;
      const max = Math.max(1, ...points.map((point) => point.balance));
      const pathFor = (key) => points.map((point, index) => {
        const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
        const y = height - (point[key] / max) * (height - 8);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      document.querySelector("#balance-line").setAttribute("d", pathFor("balance"));
      document.querySelector("#contribution-line").setAttribute("d", pathFor("contributions"));
    }

    Object.values(values).forEach((input) => input.addEventListener("input", updateCalculator));
    updateCalculator();
  }

  function renderWhiteboard() {
    document.title = "Whiteboard · Studio Widgets";
    updateActiveNavigation("whiteboard");
    const colors = ["#222222", "#7c6046", "#b34b4b", "#3f7258", "#426c91", "#7a5d9a"];
    app.innerHTML = widgetFrame("Whiteboard", "Ideen · Skizzen · Notizen", `
      <div class="widget-meta whiteboard-meta">
        <span><span class="status-dot"></span><span id="whiteboard-save-status">Lokal bereit</span></span>
        <span>Nur in diesem Browser gespeichert</span>
      </div>
      <div class="whiteboard-layout">
        <div class="whiteboard-toolbar" role="toolbar" aria-label="Zeichenwerkzeuge">
          <div class="tool-group" aria-label="Werkzeug">
            <button class="tool-button" id="whiteboard-pen" type="button" aria-pressed="true" title="Stift (P)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.7 5.3 4 4M4 20l4.2-1 10-10a2.8 2.8 0 0 0-4-4l-10 10L4 20Z"/><path d="m12.8 6.2 4 4"/></svg>
              <span>Stift</span>
            </button>
            <button class="tool-button" id="whiteboard-eraser" type="button" aria-pressed="false" title="Radierer (E)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8.2 18.8-4-4a2 2 0 0 1 0-2.8l7.7-7.7a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L13 18.8H8.2Z"/><path d="m9.5 6.7 7.8 7.8M8.2 18.8H21"/></svg>
              <span>Radierer</span>
            </button>
          </div>
          <span class="toolbar-divider" aria-hidden="true"></span>
          <div class="color-tools" aria-label="Stiftfarbe">
            ${colors.map((color, index) => `
              <button
                class="color-swatch"
                type="button"
                data-whiteboard-color="${color}"
                style="--swatch: ${color}"
                aria-label="Farbe ${index + 1}"
                aria-pressed="${index === 0 ? "true" : "false"}"
              ></button>`).join("")}
            <label class="custom-color" title="Eigene Farbe">
              <span class="visually-hidden">Eigene Farbe</span>
              <input id="whiteboard-color" type="color" value="#222222" aria-label="Eigene Stiftfarbe" />
            </label>
          </div>
          <span class="toolbar-divider" aria-hidden="true"></span>
          <label class="stroke-control" for="whiteboard-width">
            <span>Stärke</span>
            <input id="whiteboard-width" type="range" min="1" max="24" step="1" value="4" />
            <output id="whiteboard-width-output" for="whiteboard-width">4</output>
          </label>
          <div class="toolbar-spacer"></div>
          <div class="tool-group" aria-label="Verlauf">
            <button class="tool-button icon-only" id="whiteboard-undo" type="button" title="Rückgängig (⌘Z)" aria-label="Rückgängig" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7-5 5 5 5"/><path d="M20 17a7 7 0 0 0-7-7H4"/></svg>
            </button>
            <button class="tool-button icon-only" id="whiteboard-redo" type="button" title="Wiederholen (⇧⌘Z)" aria-label="Wiederholen" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 7 5 5-5 5"/><path d="M4 17a7 7 0 0 1 7-7h9"/></svg>
            </button>
          </div>
          <button class="tool-button quiet-action" id="whiteboard-clear" type="button">Leeren</button>
          <button class="tool-button export-action" id="whiteboard-export" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>
            <span>PNG</span>
          </button>
        </div>
        <div class="whiteboard-canvas-wrap">
          <canvas
            id="whiteboard-canvas"
            tabindex="0"
            aria-label="Freie Zeichenfläche. Mit Maus, Touch oder Stift zeichnen."
            data-tool="pen"
          ></canvas>
          <div class="whiteboard-canvas-hint" id="whiteboard-canvas-hint">
            <span>Zeichne mit Maus, Touch oder Stift</span>
            <span>P · Stift&nbsp;&nbsp; E · Radierer&nbsp;&nbsp; ⌘Z · Rückgängig</span>
          </div>
        </div>
      </div>
      <dialog class="confirm-dialog" id="whiteboard-clear-dialog" aria-labelledby="whiteboard-clear-title">
        <form method="dialog">
          <p class="eyebrow">Whiteboard leeren</p>
          <h3 id="whiteboard-clear-title">Alles wirklich löschen?</h3>
          <p>Die aktuelle Zeichenfläche wird geleert. Direkt danach kannst du den Schritt noch rückgängig machen.</p>
          <div class="dialog-actions">
            <button class="button secondary" value="cancel">Abbrechen</button>
            <button class="button danger" id="whiteboard-confirm-clear" type="button">Whiteboard leeren</button>
          </div>
        </form>
      </dialog>`);

    initializeTheme();

    const canvas = document.querySelector("#whiteboard-canvas");
    const canvasWrap = document.querySelector(".whiteboard-canvas-wrap");
    const hint = document.querySelector("#whiteboard-canvas-hint");
    const penButton = document.querySelector("#whiteboard-pen");
    const eraserButton = document.querySelector("#whiteboard-eraser");
    const colorInput = document.querySelector("#whiteboard-color");
    const widthInput = document.querySelector("#whiteboard-width");
    const widthOutput = document.querySelector("#whiteboard-width-output");
    const undoButton = document.querySelector("#whiteboard-undo");
    const redoButton = document.querySelector("#whiteboard-redo");
    const clearButton = document.querySelector("#whiteboard-clear");
    const clearDialog = document.querySelector("#whiteboard-clear-dialog");
    const confirmClear = document.querySelector("#whiteboard-confirm-clear");
    const exportButton = document.querySelector("#whiteboard-export");
    const saveStatus = document.querySelector("#whiteboard-save-status");

    let context = canvas.getContext("2d", { alpha: true });
    let logicalWidth = 1;
    let logicalHeight = 1;
    let pixelRatio = 1;
    let tool = "pen";
    let activeStrokeTool = "pen";
    let color = colorInput.value;
    let strokeWidth = Number(widthInput.value);
    let drawing = false;
    let pointerId = null;
    let lastPoint = null;
    let hasInk = false;
    let initialized = false;
    let saveTimer = null;
    let restoreVersion = 0;
    let history = [];
    let historyIndex = -1;

    function setTool(nextTool) {
      tool = nextTool;
      canvas.dataset.tool = nextTool;
      penButton.setAttribute("aria-pressed", String(nextTool === "pen"));
      eraserButton.setAttribute("aria-pressed", String(nextTool === "eraser"));
    }

    function setColor(nextColor, matchedSwatch = null) {
      color = nextColor;
      colorInput.value = nextColor;
      document.querySelectorAll("[data-whiteboard-color]").forEach((swatch) => {
        swatch.setAttribute("aria-pressed", String(swatch === matchedSwatch || swatch.dataset.whiteboardColor.toLowerCase() === nextColor.toLowerCase()));
      });
      setTool("pen");
    }

    function resizeCanvas(preserve = true) {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(rect.width));
      const nextHeight = Math.max(1, Math.floor(rect.height));
      const nextRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const targetWidth = Math.round(nextWidth * nextRatio);
      const targetHeight = Math.round(nextHeight * nextRatio);
      if (canvas.width === targetWidth && canvas.height === targetHeight) return;

      let previous = null;
      if (preserve && canvas.width > 1 && canvas.height > 1) {
        previous = document.createElement("canvas");
        previous.width = canvas.width;
        previous.height = canvas.height;
        previous.getContext("2d").drawImage(canvas, 0, 0);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      logicalWidth = nextWidth;
      logicalHeight = nextHeight;
      pixelRatio = nextRatio;
      context = canvas.getContext("2d", { alpha: true });
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";

      if (previous) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, targetWidth, targetHeight);
        context.restore();
      }
    }

    function pointerPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.min(logicalWidth, Math.max(0, event.clientX - rect.left)),
        y: Math.min(logicalHeight, Math.max(0, event.clientY - rect.top)),
        pressure: event.pointerType === "pen" && event.pressure > 0 ? event.pressure : 0.5
      };
    }

    function lineSize(point) {
      const pressureFactor = point.pressure === 0.5 ? 1 : 0.55 + point.pressure * 0.9;
      return strokeWidth * pressureFactor * (activeStrokeTool === "eraser" ? 3 : 1);
    }

    function prepareStroke(point) {
      context.globalCompositeOperation = activeStrokeTool === "eraser" ? "destination-out" : "source-over";
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = lineSize(point);
      context.lineCap = "round";
      context.lineJoin = "round";
    }

    function drawDot(point) {
      context.save();
      prepareStroke(point);
      context.beginPath();
      context.arc(point.x, point.y, Math.max(0.5, lineSize(point) / 2), 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function drawSegment(from, to) {
      context.save();
      prepareStroke(to);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    }

    function beginStroke(event) {
      if (!initialized || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      drawing = true;
      pointerId = event.pointerId;
      activeStrokeTool = event.pointerType === "pen" && event.button === 5 ? "eraser" : tool;
      lastPoint = pointerPoint(event);
      canvas.setPointerCapture(event.pointerId);
      drawDot(lastPoint);
      hasInk = true;
      hint.hidden = true;
    }

    function continueStroke(event) {
      if (!drawing || event.pointerId !== pointerId) return;
      event.preventDefault();
      const samples = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [event];
      samples.forEach((sample) => {
        const nextPoint = pointerPoint(sample);
        drawSegment(lastPoint, nextPoint);
        lastPoint = nextPoint;
      });
    }

    function endStroke(event) {
      if (!drawing || event.pointerId !== pointerId) return;
      event.preventDefault();
      drawing = false;
      if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
      pointerId = null;
      lastPoint = null;
      pushHistory();
      queueAutosave();
    }

    function snapshot() {
      return canvas.toDataURL("image/png");
    }

    function pushHistory() {
      const state = { data: snapshot(), hasInk };
      if (history[historyIndex]?.data === state.data) return;
      history = history.slice(0, historyIndex + 1);
      history.push(state);
      if (history.length > 24) history.shift();
      historyIndex = history.length - 1;
      updateHistoryButtons();
    }

    function updateHistoryButtons() {
      undoButton.disabled = historyIndex <= 0;
      redoButton.disabled = historyIndex < 0 || historyIndex >= history.length - 1;
    }

    function restoreSnapshot(dataUrl, inkState = true) {
      const version = ++restoreVersion;
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          if (version !== restoreVersion) return resolve(false);
          context.save();
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);
          context.restore();
          hasInk = inkState;
          hint.hidden = !inkState;
          resolve(true);
        };
        image.onerror = () => resolve(false);
        image.src = dataUrl;
      });
    }

    async function undo() {
      if (historyIndex <= 0) return;
      historyIndex -= 1;
      updateHistoryButtons();
      const state = history[historyIndex];
      await restoreSnapshot(state.data, state.hasInk);
      queueAutosave();
    }

    async function redo() {
      if (historyIndex >= history.length - 1) return;
      historyIndex += 1;
      updateHistoryButtons();
      const state = history[historyIndex];
      await restoreSnapshot(state.data, state.hasInk);
      queueAutosave();
    }

    function clearCanvas() {
      restoreVersion += 1;
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
      hasInk = false;
      hint.hidden = false;
      pushHistory();
      queueAutosave();
    }

    function queueAutosave() {
      window.clearTimeout(saveTimer);
      saveStatus.textContent = "Wird gespeichert …";
      saveTimer = window.setTimeout(saveBoard, 220);
    }

    function saveBoard() {
      try {
        window.localStorage.setItem(STORAGE.whiteboard, JSON.stringify({
          version: 1,
          image: snapshot(),
          hasInk
        }));
        saveStatus.textContent = "Lokal gespeichert";
      } catch {
        saveStatus.textContent = "Lokaler Speicher nicht verfügbar";
      }
    }

    function exportPng() {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportContext = exportCanvas.getContext("2d");
      exportContext.fillStyle = "#fbfbfa";
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      exportContext.drawImage(canvas, 0, 0);
      exportCanvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `whiteboard-${date}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    }

    penButton.addEventListener("click", () => setTool("pen"));
    eraserButton.addEventListener("click", () => setTool("eraser"));
    document.querySelectorAll("[data-whiteboard-color]").forEach((swatch) => {
      swatch.addEventListener("click", () => setColor(swatch.dataset.whiteboardColor, swatch));
    });
    colorInput.addEventListener("input", () => setColor(colorInput.value));
    widthInput.addEventListener("input", () => {
      strokeWidth = Number(widthInput.value);
      widthOutput.textContent = String(strokeWidth);
    });
    undoButton.addEventListener("click", undo);
    redoButton.addEventListener("click", redo);
    clearButton.addEventListener("click", () => {
      if (typeof clearDialog.showModal === "function") clearDialog.showModal();
      else if (window.confirm("Das gesamte Whiteboard leeren?")) clearCanvas();
    });
    confirmClear.addEventListener("click", () => {
      clearCanvas();
      clearDialog.close();
    });
    exportButton.addEventListener("click", exportPng);
    canvas.addEventListener("pointerdown", beginStroke);
    canvas.addEventListener("pointermove", continueStroke);
    canvas.addEventListener("pointerup", endStroke);
    canvas.addEventListener("pointercancel", endStroke);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("keydown", (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (modifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (modifier && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.target.matches("input, button")) return;
      if (key === "p") setTool("pen");
      if (key === "e") setTool("eraser");
    });

    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
      if (initialized) resizeCanvas(true);
    }) : null;
    if (resizeObserver) resizeObserver.observe(canvasWrap);
    else window.addEventListener("resize", () => resizeCanvas(true));

    window.requestAnimationFrame(async () => {
      resizeCanvas(false);
      const saved = safeStorageGet(STORAGE.whiteboard);
      if (saved) {
        let savedImage = saved;
        let savedHasInk = true;
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.image === "string") {
            savedImage = parsed.image;
            savedHasInk = parsed.hasInk !== false;
          }
        } catch {
          // Backwards compatible with an earlier raw data URL.
        }
        await restoreSnapshot(savedImage, savedHasInk);
      }
      history = [{ data: snapshot(), hasInk }];
      historyIndex = 0;
      updateHistoryButtons();
      initialized = true;
      saveStatus.textContent = saved ? "Lokal wiederhergestellt" : "Lokal bereit";
    });
  }

  function renderNotFound() {
    document.title = "Nicht gefunden · Studio Widgets";
    app.innerHTML = `
      <section class="error-state">
        <p class="eyebrow">404</p>
        <h2>Dieses Widget gibt es nicht.</h2>
        <p class="lede">Zurück zur Übersicht und eines der fünf verfügbaren Werkzeuge öffnen.</p>
        <p><a class="button" href="/">Zur Übersicht</a></p>
      </section>`;
  }

  switch (route) {
    case "home": renderHome(); initializeTheme(); break;
    case "clock": renderClock(); break;
    case "pomodoro": renderPomodoro(); break;
    case "progress": renderProgress(); break;
    case "calculator": renderCalculator(); break;
    case "whiteboard": renderWhiteboard(); break;
    default: renderNotFound(); initializeTheme();
  }
})();
