// ── Language ──────────────────────────────────────────────────
const translations = {
  en: {
    pos: "Pos",
    driver: "Driver",
    team: "Team",
    points: "Points",
    ovr: "OVR",
    driverStandingsTitle: "Driver Standings",
    constructorStandingsTitle: "Constructor Standings",
    seasonComplete: "Season Complete",
    seasonRound: "Round",
    of: "of",
    deleteSimulation: "Delete this simulation? This cannot be undone.",
    clearAllConfirm: "Delete ALL saved simulations? This cannot be undone.",
    loadingHistory: "Loading...",
    failedHistory: "Failed to load history.",
    noSimulationsYet:
      "No saved simulations yet. Export a season from the simulator to save it here.",
    backToSimulator: "← Back to Simulator",
    clearAll: "Clear All",
    delete: "Delete",
    historyTitle: "Simulation History",
    savedSimulations: "Saved Simulations",
  },
  bg: {
    pos: "Поз",
    driver: "Пилот",
    team: "Отбор",
    points: "Точки",
    ovr: "ОБЩ",
    driverStandingsTitle: "Класация на Пилотите",
    constructorStandingsTitle: "Класация на Конструкторите",
    seasonComplete: "Сезонът Приключи",
    seasonRound: "Рунд",
    of: "от",
    deleteSimulation: "Изтрий тази симулация? Това не може да бъде отменено.",
    clearAllConfirm:
      "Изтрий ВСИЧКИ запазени симулации? Това не може да бъде отменено.",
    loadingHistory: "Зареждане...",
    failedHistory: "Неуспешно зареждане на историята.",
    noSimulationsYet:
      "Все още няма запазени симулации. Експортирай сезон от симулатора за да го запазиш тук.",
    backToSimulator: "← Обратно към Симулатора",
    clearAll: "Изтрий Всички",
    delete: "Изтрий",
    historyTitle: "История на Симулациите",
    savedSimulations: "Запазени Симулации",
  },
};

let currentLang = localStorage.getItem("f1lang") || "en";

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function applyLanguage() {
  currentLang = localStorage.getItem("f1lang") || "en";
  document
    .getElementById("langEN")
    .classList.toggle("active", currentLang === "en");
  document
    .getElementById("langBG")
    .classList.toggle("active", currentLang === "bg");
  document.getElementById("pageTitle").textContent = t("historyTitle");
  document.getElementById("backBtn").textContent = t("backToSimulator");
  document.getElementById("clearAllBtn").textContent = t("clearAll");
  document.getElementById("panelTitle").textContent = t("savedSimulations");
  document.title = `F1 2026 ${t("historyTitle")}`;
}

window.setLanguage = function (lang) {
  currentLang = lang;
  localStorage.setItem("f1lang", lang);
  applyLanguage();
  render();
};

// ── Helpers ───────────────────────────────────────────────────

function posClass(pos) {
  if (pos === 1) return "pos-1";
  if (pos === 2) return "pos-2";
  if (pos === 3) return "pos-3";
  return "pos-other";
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderDriverTable(drivers) {
  return `<table>
    <thead><tr>
      <th>${t("pos")}</th><th>${t("driver")}</th><th>${t("team")}</th><th>${t("points")}</th><th>${t("ovr")}</th>
    </tr></thead>
    <tbody>${drivers
      .map(
        (d) => `<tr>
      <td><span class="pos-badge ${posClass(d.position)}">${d.position}</span></td>
      <td style="font-weight:600;color:var(--white)">${d.name}</td>
      <td style="color:var(--muted)">${d.team}</td>
      <td><span class="points-chip ${d.points > 0 ? "has-points" : ""}">${d.points}</span></td>
      <td>${d.ovr}</td>
    </tr>`,
      )
      .join("")}</tbody>
  </table>`;
}

function renderConstructorTable(constructors) {
  return `<table>
    <thead><tr>
      <th>${t("pos")}</th><th>${t("team")}</th><th>${t("points")}</th>
    </tr></thead>
    <tbody>${constructors
      .map(
        (c) => `<tr>
      <td><span class="pos-badge ${posClass(c.position)}">${c.position}</span></td>
      <td style="font-weight:600;color:var(--white)">${c.team}</td>
      <td><span class="points-chip ${c.points > 0 ? "has-points" : ""}">${c.points}</span></td>
    </tr>`,
      )
      .join("")}</tbody>
  </table>`;
}

// ── Actions ───────────────────────────────────────────────────

async function deleteSimulation(id) {
  if (!confirm(t("deleteSimulation"))) return;
  await fetch(`/api/history/${id}`, { method: "DELETE" });
  render();
}

async function clearAll() {
  if (!confirm(t("clearAllConfirm"))) return;
  await fetch("/api/history", { method: "DELETE" });
  render();
}

// ── Render ────────────────────────────────────────────────────

async function render() {
  const el = document.getElementById("historyList");
  el.innerHTML = `<div class="empty-state">
    <div class="empty-state-icon" style="font-size:1.5rem">⏳</div>
    <div class="empty-state-text">${t("loadingHistory")}</div>
  </div>`;

  let history = [];
  try {
    const res = await fetch("/api/history");
    history = await res.json();
  } catch {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <div class="empty-state-text">${t("failedHistory")}</div>
    </div>`;
    return;
  }

  if (!history.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📂</div>
      <div class="empty-state-text">${t("noSimulationsYet")}</div>
    </div>`;
    return;
  }

  el.innerHTML = `<div class="history-page-list">
    ${history
      .map((sim) => {
        const champion = sim.driverStandings?.[0];
        const isComplete = sim.roundsCompleted >= sim.totalRounds;
        const statusText = isComplete
          ? `🏁 ${t("seasonComplete")}`
          : `⏱️ ${t("seasonRound")} ${sim.roundsCompleted} ${t("of")} ${sim.totalRounds}`;
        return `
        <details class="sim-card">
          <summary>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
              <span class="sim-card-title">${statusText}</span>
              ${champion ? `<span class="champion-badge">🏆 ${champion.name}</span>` : ""}
            </div>
            <div class="sim-card-meta">
              <span>${formatDate(sim.exportedAt)}</span>
              <button class="delete-btn" onclick="event.stopPropagation(); deleteSimulation('${sim.id}')">${t("delete")}</button>
              <span class="history-chevron">▼</span>
            </div>
          </summary>
          <div class="sim-card-body">
            <div>
              <div class="sim-section-title">${t("driverStandingsTitle")}</div>
              <div class="table-wrapper">${renderDriverTable(sim.driverStandings)}</div>
            </div>
            <div>
              <div class="sim-section-title">${t("constructorStandingsTitle")}</div>
              <div class="table-wrapper">${renderConstructorTable(sim.constructorStandings)}</div>
            </div>
          </div>
        </details>`;
      })
      .join("")}
  </div>`;
}

// ── Init ──────────────────────────────────────────────────────
document.getElementById("clearAllBtn").addEventListener("click", clearAll);
applyLanguage();
render();
