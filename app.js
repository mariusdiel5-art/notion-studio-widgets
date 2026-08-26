(() => {
  "use strict";

  const STORAGE = {
    theme: "studio-widgets:theme",
    pomodoro: "studio-widgets:pomodoro"
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
    zinseszins: "calculator"
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
        <p class="lede">Vier kleine, präzise Widgets für Fokus, Zeitgefühl und langfristige Planung – ohne Anmeldung, Cookies oder fremde Dienste.</p>
      </section>
      <section class="widget-grid" aria-label="Verfügbare Widgets">
        ${homeCard("01", "Analoge Uhr", "Sekundengenaue Ortszeit, Datum und Zeitzone in einer reduzierten Zifferblatt-Ansicht.", "clock")}
        ${homeCard("02", "Pomodoro", "Ein belastbarer 25/5/15-Timer mit lokalem Sitzungszähler und Wiederaufnahme nach einem Reload.", "pomodoro")}
        ${homeCard("03", "Zeitfortschritt", "Tag, Woche, Monat und Jahr als live berechnete Fortschrittsringe.", "progress")}
        ${homeCard("04", "Zinseszins", "Interaktiver Sparrechner mit Einzahlung, Rendite, Laufzeit und klar ausgewiesenem Zinsertrag.", "calculator")}
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

  function renderNotFound() {
    document.title = "Nicht gefunden · Studio Widgets";
    app.innerHTML = `
      <section class="error-state">
        <p class="eyebrow">404</p>
        <h2>Dieses Widget gibt es nicht.</h2>
        <p class="lede">Zurück zur Übersicht und eines der vier verfügbaren Werkzeuge öffnen.</p>
        <p><a class="button" href="/">Zur Übersicht</a></p>
      </section>`;
  }

  switch (route) {
    case "home": renderHome(); initializeTheme(); break;
    case "clock": renderClock(); break;
    case "pomodoro": renderPomodoro(); break;
    case "progress": renderProgress(); break;
    case "calculator": renderCalculator(); break;
    default: renderNotFound(); initializeTheme();
  }
})();
