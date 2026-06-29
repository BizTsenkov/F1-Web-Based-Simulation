import { simulateRace } from "./simulation.js";
import translations from "./translations.js";

// ── State ─────────────────────────────────────────────────────
let driversData = [];
let tracksData = [];
let roundNumber = 0;
let raceHistory = [];
let initialDriversSnapshot = [];
let currentLang = localStorage.getItem("f1lang") || "en";

// ── Last race state (for language re-render) ──────────────────
let lastTrack = null;
let lastWeather = null;
let lastResults = null;
let lastRatingChanges = null;

// ── Session storage key ───────────────────────────────────────
const SESSION_KEY = "f1_session";

// ── Image maps ────────────────────────────────────────────────

const DRIVER_IMAGE_MAP = {
  "Pierre Gasly": "Gasly",
  "Franco Colapinto": "Colapinto",
  "Fernando Alonso": "Alonso",
  "Lance Stroll": "Stroll",
  "Nico Hulkenberg": "Hulkenberg",
  "Gabriel Bortoleto": "Bortoleto",
  "Sergio Perez": "Perez",
  "Valtteri Bottas": "Bottas",
  "Charles Leclerc": "Leclerc",
  "Lewis Hamilton": "Hamilton",
  "Esteban Ocon": "Ocon",
  "Oliver Bearman": "Bearman",
  "Lando Norris": "Norris",
  "Oscar Piastri": "Piastri",
  "George Russell": "Russell",
  "Kimi Antonelli": "Antonelli",
  "Liam Lawson": "Lawson",
  "Arvid Lindblad": "Lindblad",
  "Max Verstappen": "Verstappen",
  "Isack Hadjar": "Hadjar",
  "Carlos Sainz": "Sainz",
  "Alex Albon": "Albon",
};

const DRIVER_NUMBER_MAP = {
  "Lando Norris": "1",
  "Max Verstappen": "3",
  "Gabriel Bortoleto": "5",
  "Isack Hadjar": "6",
  "Pierre Gasly": "10",
  "Sergio Perez": "11",
  "Kimi Antonelli": "12",
  "Fernando Alonso": "14",
  "Charles Leclerc": "16",
  "Lance Stroll": "18",
  "Alex Albon": "23",
  "Nico Hulkenberg": "27",
  "Liam Lawson": "30",
  "Esteban Ocon": "31",
  "Arvid Lindblad": "41",
  "Franco Colapinto": "43",
  "Lewis Hamilton": "44",
  "Carlos Sainz": "55",
  "George Russell": "63",
  "Valtteri Bottas": "77",
  "Oscar Piastri": "81",
  "Oliver Bearman": "87",
};

const TEAM_IMAGE_MAP = {
  Alpine: "Alpine",
  "Aston Martin": "Aston Martin",
  Audi: "Audi",
  Cadillac: "Cadillac",
  Ferrari: "Ferrari",
  Haas: "Haas",
  McLaren: "McLaren",
  Mercedes: "Mercedes",
  "Racing Bulls": "RB",
  "Red Bull": "Red Bull",
  Williams: "Williams",
};

const TEAM_CAR_MAP = {
  Alpine: "2026alpine",
  "Aston Martin": "2026astonmartin",
  Audi: "2026audi",
  Cadillac: "2026cadillac",
  Ferrari: "2026ferrari",
  Haas: "2026haas",
  McLaren: "2026mclaren",
  Mercedes: "2026mercedes",
  "Racing Bulls": "2026rb",
  "Red Bull": "2026redbull",
  Williams: "2026williams",
};

const TEAM_COLOR_CLASS = {
  Mercedes: "team-Mercedes",
  Ferrari: "team-Ferrari",
  McLaren: "team-McLaren",
  Haas: "team-Haas",
  "Red Bull": "team-Red-Bull",
  "Racing Bulls": "team-Racing-Bulls",
  Alpine: "team-Alpine",
  Audi: "team-Audi",
  Williams: "team-Williams",
  Cadillac: "team-Cadillac",
  "Aston Martin": "team-Aston-Martin",
};

const TEAM_CSS_VAR = {
  Mercedes: "#75f1d3",
  Ferrari: "#d52e37",
  McLaren: "#ef8733",
  Haas: "#dfe1e2",
  "Red Bull": "#4570c0",
  "Racing Bulls": "#7091f8",
  Alpine: "#479fe2",
  Audi: "#eb4526",
  Williams: "#3267d4",
  Cadillac: "#aaaadd",
  "Aston Martin": "#4b9774",
};

// ── Image helpers ─────────────────────────────────────────────

function driverImg(name) {
  const file = DRIVER_IMAGE_MAP[name];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");
  const avatar = file
    ? `<img class="driver-avatar" src="images/drivers/${file}.png" alt="${name}"
        onerror="this.outerHTML='<div class=\\'driver-avatar-fallback\\'>${initials}</div>'">`
    : `<div class="driver-avatar-fallback">${initials}</div>`;
  const num = DRIVER_NUMBER_MAP[name];
  const number = num
    ? `<img class="driver-number" src="images/numbers/${num}.png" alt="${num}" onerror="this.style.display='none'">`
    : "";
  return `${avatar}${number}`;
}

function teamImg(team) {
  const file = TEAM_IMAGE_MAP[team];
  if (!file) return "";
  return `<img class="team-logo" src="images/teams/${file}.png" alt="${team}" onerror="this.style.display='none'">`;
}

function carImg(team) {
  const file = TEAM_CAR_MAP[team];
  if (!file) return "";
  return `<img class="team-car" src="images/teams/${file}.avif" alt="${team} car" onerror="this.style.display='none'">`;
}

function flagImg(country) {
  const countryCode = {
    Australia: "au",
    China: "cn",
    Japan: "jp",
    "United States": "us",
    Canada: "ca",
    Monaco: "mc",
    Spain: "es",
    Austria: "at",
    "United Kingdom": "gb",
    Belgium: "be",
    Hungary: "hu",
    Netherlands: "nl",
    Italy: "it",
    Azerbaijan: "az",
    Singapore: "sg",
    Mexico: "mx",
    Brazil: "br",
    Qatar: "qa",
    "United Arab Emirates": "ae",
  }[country];
  if (!countryCode) return "";
  return `<img class="flag" src="https://flagcdn.com/w40/${countryCode}.png" alt="${country}">`;
}

function tyreClass(tyre) {
  if (tyre.startsWith("Soft")) return "tyre-soft";
  if (tyre.startsWith("Medium")) return "tyre-medium";
  if (tyre.startsWith("Hard")) return "tyre-hard";
  if (tyre === "Intermediates") return "tyre-inter";
  if (tyre === "Wets") return "tyre-wet";
  return "";
}

function tyreImg(tyre) {
  let file = null;
  if (tyre.startsWith("Soft")) file = "soft";
  else if (tyre.startsWith("Medium")) file = "medium";
  else if (tyre.startsWith("Hard")) file = "hard";
  else if (tyre === "Intermediates") file = "inter";
  else if (tyre === "Wets") file = "wet";
  const img = file
    ? `<img class="tyre-img" src="images/tyres/${file}.webp" alt="${tyre}" onerror="this.style.display='none'">`
    : "";
  return `<span class="tyre-cell">${img}<span class="${tyreClass(tyre)}">${tyre}</span></span>`;
}

function statusClass(status) {
  if (status === "FIN") return "status-fin";
  if (status === "DNF-MECH") return "status-dnf-mech";
  if (status === "DNF-CRASH") return "status-dnf-crash";
  return "";
}

function posClass(pos) {
  if (pos === 1) return "pos-1";
  if (pos === 2) return "pos-2";
  if (pos === 3) return "pos-3";
  return "pos-other";
}

// ── Language ──────────────────────────────────────────────────

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function translateStatus(s) {
  return (
    { FIN: t("fin"), "DNF-MECH": t("dnfMech"), "DNF-CRASH": t("dnfCrash") }[
      s
    ] || s
  );
}

function translateStrategy(strategy) {
  const map = {
    "1-stop": t("oneStop"),
    "2-stop": t("twoStop"),
    "Wet strategy": t("wetStrategy"),
  };
  return map[strategy] || strategy;
}

function translateWeather(w) {
  return (
    {
      sunny: t("sunny"),
      cloudy: t("cloudy"),
      "light rain": t("lightRain"),
      "heavy rain": t("heavyRain"),
    }[w] || w
  );
}

function translateDifficulty(d) {
  return (
    {
      "very easy": t("veryEasy"),
      easy: t("easy"),
      medium: t("medium"),
      hard: t("hard"),
      "very hard": t("veryHard"),
    }[d] || d
  );
}

function difficultyBadgeClass(diff) {
  return (
    {
      "very easy": "badge-difficulty-very-easy",
      easy: "badge-difficulty-easy",
      medium: "badge-difficulty-medium",
      hard: "badge-difficulty-hard",
      "very hard": "badge-difficulty-very-hard",
    }[diff] || ""
  );
}

window.setLanguage = function (lang) {
  currentLang = lang;
  localStorage.setItem("f1lang", lang);
  document.getElementById("langEN").classList.toggle("active", lang === "en");
  document.getElementById("langBG").classList.toggle("active", lang === "bg");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.title = t("title");
  const btn = document.getElementById("simulateBtn");
  const historyBtn = document.getElementById("historyBtn");
  if (historyBtn) historyBtn.textContent = `🗂️ ${t("historyBtn")}`;
  if (!btn.disabled)
    btn.textContent = roundNumber > 0 ? t("simulateBtn") : t("startBtn");
  if (driversData.length > 0) {
    if (roundNumber >= tracksData.length) {
  document.getElementById("raceInfo").innerHTML =
    renderDriverPodium(driversData);
} else if (lastTrack && lastWeather) {
  document.getElementById("raceInfo").innerHTML = renderRaceInfo(
    lastTrack,
    lastWeather,
  );
}
    if (lastResults)
      document.getElementById("raceResultsTable").innerHTML =
        renderRaceResultsTable(lastResults);
    if (lastRatingChanges)
      document.getElementById("ratingsTable").innerHTML =
        renderRatingsTable(lastRatingChanges);
    if (initialDriversSnapshot.length > 0)
      document.getElementById("initialRatingsTable").innerHTML =
        renderInitialRatingsTable(initialDriversSnapshot);
    document.getElementById("standingsTable").innerHTML =
      renderStandingsTable(driversData);
    document.getElementById("constructorsTable").innerHTML =
      renderConstructorStandingsTable(
        calculateConstructorStandings(driversData),
      );
    document.getElementById("historyCards").innerHTML =
      renderHistoryCards(raceHistory);
  }
};

// ── Session persistence ───────────────────────────────────────

function saveSession() {
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        roundNumber,
        raceHistory,
        driversData,
        tracksData,
        initialDriversSnapshot,
        lastTrack,
        lastWeather,
        lastResults,
        lastRatingChanges,
      }),
    );
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

function restoreSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return false;
    const s = JSON.parse(saved);
    roundNumber = s.roundNumber;
    raceHistory = s.raceHistory;
    driversData = s.driversData;
    tracksData = s.tracksData;
    initialDriversSnapshot = s.initialDriversSnapshot;
    lastTrack = s.lastTrack;
    lastWeather = s.lastWeather;
    lastResults = s.lastResults;
    lastRatingChanges = s.lastRatingChanges;
    return true;
  } catch (err) {
    console.error("Failed to restore session:", err);
    return false;
  }
}

// ── API ───────────────────────────────────────────────────────

async function loadDrivers() {
  return (await fetch("/api/drivers")).json();
}
async function loadInitialDrivers() {
  return (await fetch("/api/drivers/base")).json();
}
async function loadTracks() {
  return (await fetch("/api/tracks")).json();
}

async function fetchWeatherForTrack(trackName) {
  try {
    return (
      await (
        await fetch(`/api/weather/${encodeURIComponent(trackName)}`)
      ).json()
    ).weather;
  } catch {
    return "sunny";
  }
}

async function saveRatingsToDB(drivers) {
  await fetch("/api/drivers/ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ratings: drivers.map((d) => ({
        pilotId: d.id,
        exp: d.experience,
        rac: d.racecraft,
        awa: d.awareness,
        pac: d.pace,
        ovr: d.overall,
        points: d.points,
      })),
    }),
  });
}

async function saveRaceResultsToDB(track, weather, results) {
  await fetch("/api/races", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      trackId: track.id,
      weather,
      results: results.map((r) => ({
        pilotId: r.id,
        position: r.position,
        tyre: r.tyre,
        strategy: r.strategy,
        status: r.status,
        points: r.racePoints,
      })),
    }),
  });
}

async function saveSimulationToServer(data) {
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ── Logic ─────────────────────────────────────────────────────

function updateStandings(drivers, raceResults) {
  raceResults.forEach((r) => {
    const d = drivers.find((d) => d.name === r.name);
    if (d) {
      d.points += r.racePoints;
      if (!d.finishPositions) d.finishPositions = [];
      d.finishPositions.push(r.position);
    }
  });

  drivers.sort((a, b) => {
    // Primary sort: points
    if (b.points !== a.points) return b.points - a.points;

    // Tiebreaker: most 1st places, then 2nd, then 3rd, etc.
    const posA = a.finishPositions || [];
    const posB = b.finishPositions || [];
    for (let pos = 1; pos <= 22; pos++) {
      const countA = posA.filter((p) => p === pos).length;
      const countB = posB.filter((p) => p === pos).length;
      if (countA !== countB) return countB - countA;
    }
    return 0;
  });
}

function updateRatings(drivers, raceResults) {
  return raceResults
    .map((result) => {
      const driver = drivers.find((d) => d.name === result.name);
      if (!driver) return null;
      const before = {
        overall: driver.overall,
        pace: driver.pace,
        racecraft: driver.racecraft,
        awareness: driver.awareness,
      };
      const delta = result.position <= 10 ? (11 - result.position) * 0.1 : -0.2;
      driver.overall = Math.max(1, Math.min(100, driver.overall + delta));
      driver.pace = Math.max(1, Math.min(100, driver.pace + delta * 0.5));
      driver.racecraft = Math.max(
        1,
        Math.min(100, driver.racecraft + delta * 0.3),
      );
      if (result.status === "DNF-CRASH")
        driver.awareness = Math.max(1, Math.min(100, driver.awareness - 0.5));
      return {
        name: driver.name,
        team: driver.team,
        overallBefore: before.overall,
        overallAfter: driver.overall,
        paceBefore: before.pace,
        paceAfter: driver.pace,
        racecraftBefore: before.racecraft,
        racecraftAfter: driver.racecraft,
        awarenessBefore: before.awareness,
        awarenessAfter: driver.awareness,
      };
    })
    .filter(Boolean);
}

function calculateConstructorStandings(drivers) {
  const map = {};
  drivers.forEach((d) => {
    if (!map[d.team]) map[d.team] = { team: d.team, points: 0 };
    map[d.team].points += d.points;
  });
  return Object.values(map).sort((a, b) => b.points - a.points);
}

// ── Render helpers ────────────────────────────────────────────

function driverCell(name) {
  return `<div class="driver-cell">${driverImg(name)}<span class="driver-name">${name}</span></div>`;
}

function teamCell(team) {
  return `<div class="team-cell">${teamImg(team)}<span class="team-color-dot ${TEAM_COLOR_CLASS[team] || ""}"></span>${team}</div>`;
}

function getDeltaClass(d) {
  return d > 0 ? "positive" : d < 0 ? "negative" : "neutral";
}
function formatDelta(d) {
  return d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);
}

// ── Points gap chart ──────────────────────────────────────────

function renderPointsGapChart(constructors) {
  if (!constructors.length || constructors[0].points === 0) return "";
  const leader = constructors[0].points;
  return `
    <div class="points-gap-chart">
      <div class="points-gap-title">${t("pointsGapTitle")}</div>
      ${constructors
        .map((c) => {
          const pct = Math.round((c.points / leader) * 100);
          const gap = leader - c.points;
          const color = TEAM_CSS_VAR[c.team] || "#6b6b8a";
          return `
          <div class="points-gap-row">
            <div class="points-gap-name">${c.team}</div>
            <div class="points-gap-bar-wrap">
              <div class="points-gap-bar" style="width:${pct}%; background:${color}"></div>
            </div>
            <div class="points-gap-val">${c.points}${gap > 0 ? ` <span style="color:var(--muted);font-size:0.75rem">(−${gap})</span>` : ""}</div>
          </div>`;
        })
        .join("")}
    </div>`;
}

// ── Driver podium (season end) ────────────────────────────────

function renderDriverPodium(drivers) {
  const top3 = drivers.slice(0, 3);
  const order = [1, 0, 2];
  const heights = ["60px", "90px", "40px"];
  const medals = ["🥈", "🥇", "🥉"];
  return `
    <div class="podium-wrap">
      <div class="podium-title">🏆 ${t("seasonChampion")}</div>
      <div class="podium-row">
        ${order
          .map((idx, vi) => {
            const d = top3[idx];
            if (!d) return "";
            const file = DRIVER_IMAGE_MAP[d.name];
            const initials = d.name
              .split(" ")
              .map((w) => w[0])
              .join("");
            const avatar = file
              ? `<img class="podium-avatar" src="images/drivers/${file}.png" alt="${d.name}" onerror="this.outerHTML='<div class=\\'podium-avatar-fallback\\'>${initials}</div>'">`
              : `<div class="podium-avatar-fallback">${initials}</div>`;
            const color = TEAM_CSS_VAR[d.team] || "#6b6b8a";
            return `
            <div class="podium-driver">
              <div class="podium-medal">${medals[vi]}</div>
              ${avatar}
              <div class="podium-name">${d.name}</div>
              <div class="podium-team" style="color:${color}">${d.team}</div>
              <div class="podium-block" style="height:${heights[vi]};background:${color}22;border-top:3px solid ${color}">
                <span class="podium-pts">${d.points} ${t("pts")}</span>
              </div>
            </div>`;
          })
          .join("")}
      </div>
    </div>`;
}

// ── Render ────────────────────────────────────────────────────

function renderRaceInfo(track, weather) {
  return `
    <div class="race-info-item">
      <span class="race-info-label">${t("round")}</span>
      <span class="race-info-value large">${track.round}</span>
    </div>
    <div class="race-info-item">
      <span class="race-info-label">${t("track")}</span>
      <span class="race-info-value">${track.name}
        <span class="badge ${difficultyBadgeClass(track.difficulty)}" style="margin-left:6px">${translateDifficulty(track.difficulty)}</span>
      </span>
    </div>
    <div class="race-info-item">
      <span class="race-info-label">${t("country")}</span>
      <span class="race-info-value">${flagImg(track.country)}${track.country}</span>
    </div>
    <div class="race-info-item">
      <span class="race-info-label">${t("weather")}</span>
      <span class="race-info-value">${translateWeather(weather)}
        <span class="badge badge-weather" style="margin-left:6px">🌐 ${t("liveAPI")}</span>
      </span>
    </div>
    <div class="race-info-item">
      <span class="race-info-label">${t("time")}</span>
      <span class="race-info-value">
        ${
          track.isNight
            ? `<span class="badge badge-night">🌙 ${t("nightRace")}</span>`
            : `<span class="badge badge-difficulty-easy">☀️ ${t("dayRace")}</span>`
        }
      </span>
    </div>
    <div class="race-info-item">
      <span class="race-info-label">${t("sprintWeekend")}</span>
      <span class="race-info-value">
        ${
          track.hasSprint
            ? `<span class="badge badge-sprint">⚡ ${t("yes")}</span>`
            : `<span style="color:var(--muted)">${t("no")}</span>`
        }
      </span>
    </div>
    <div class="race-info-item">
      <span class="race-info-label">${t("compounds")}</span>
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">
        ${tyreImg(`Soft (${track.compounds.soft})`)}
        ${tyreImg(`Medium (${track.compounds.medium})`)}
        ${tyreImg(`Hard (${track.compounds.hard})`)}
      </div>
    </div>
  `;
}

function renderRaceResultsTable(results) {
  return `<div class="table-wrapper"><table>
    <thead><tr>
      <th>${t("pos")}</th><th>${t("driver")}</th><th>${t("team")}</th>
      <th>${t("tyre")}</th><th>${t("strategy")}</th><th>${t("status")}</th><th>${t("points")}</th>
    </tr></thead>
    <tbody>${results
      .map(
        (d) => `<tr>
      <td><span class="pos-badge ${posClass(d.position)}">${d.position}</span></td>
      <td>${driverCell(d.name)}</td>
      <td>${teamCell(d.team)}</td>
      <td>${tyreImg(d.tyre)}</td>
      <td>${translateStrategy(d.strategy)}</td>
      <td><span class="${statusClass(d.status)}">${translateStatus(d.status)}</span></td>
      <td><span class="points-chip ${d.racePoints > 0 ? "has-points" : ""}">${d.racePoints}</span></td>
    </tr>`,
      )
      .join("")}</tbody>
  </table></div>`;
}

function renderStandingsTable(drivers) {
  return `<div class="table-wrapper"><table>
    <thead><tr>
      <th>${t("pos")}</th><th>${t("driver")}</th><th>${t("team")}</th><th>${t("points")}</th><th>${t("ovr")}</th>
    </tr></thead>
    <tbody>${drivers
      .map(
        (d, i) => `<tr ${i === 0 ? 'class="standings-leader"' : ""}>
      <td><span class="pos-badge ${posClass(i + 1)}">${i + 1}</span></td>
      <td>${driverCell(d.name)}</td>
      <td>${teamCell(d.team)}</td>
      <td><span class="points-chip ${d.points > 0 ? "has-points" : ""}">${d.points}</span></td>
      <td>${d.overall.toFixed(1)}</td>
    </tr>`,
      )
      .join("")}</tbody>
  </table></div>`;
}

function renderConstructorStandingsTable(constructors) {
  return `
    <div class="table-wrapper"><table>
      <thead><tr><th>${t("pos")}</th><th>${t("team")}</th><th>${t("points")}</th></tr></thead>
      <tbody>${constructors
        .map(
          (c, i) => `<tr>
        <td><span class="pos-badge ${posClass(i + 1)}">${i + 1}</span></td>
        <td>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            ${teamCell(c.team)}
            ${carImg(c.team)}
          </div>
        </td>
        <td><span class="points-chip ${c.points > 0 ? "has-points" : ""}">${c.points}</span></td>
      </tr>`,
        )
        .join("")}</tbody>
    </table></div>
    ${renderPointsGapChart(constructors)}`;
}

function renderInitialRatingsTable(drivers) {
  return `<div class="table-wrapper"><table>
    <thead><tr>
      <th>${t("driver")}</th><th>${t("team")}</th>
      <th>${t("exp")}</th><th>${t("rac")}</th><th>${t("awa")}</th><th>${t("pac")}</th><th>${t("ovr")}</th>
    </tr></thead>
    <tbody>${drivers
      .map(
        (d) => `<tr>
      <td>${driverCell(d.name)}</td>
      <td>${teamCell(d.team)}</td>
      <td>${d.experience}</td><td>${d.racecraft}</td><td>${d.awareness}</td><td>${d.pace}</td>
      <td><strong>${d.overall}</strong></td>
    </tr>`,
      )
      .join("")}</tbody>
  </table></div>`;
}

function renderRatingsTable(ratingChanges) {
  return `<div class="table-wrapper"><table>
    <thead><tr>
      <th>${t("driver")}</th>
      <th>${t("ovr")}</th><th>Δ</th>
      <th>${t("pac")}</th><th>Δ</th>
      <th>${t("rac")}</th><th>Δ</th>
      <th>${t("awa")}</th><th>Δ</th>
    </tr></thead>
    <tbody>${ratingChanges
      .map((d) => {
        const oD = d.overallAfter - d.overallBefore,
          pD = d.paceAfter - d.paceBefore;
        const rD = d.racecraftAfter - d.racecraftBefore,
          aD = d.awarenessAfter - d.awarenessBefore;
        return `<tr>
        <td>${driverCell(d.name)}</td>
        <td>${d.overallAfter.toFixed(1)}</td>   <td class="${getDeltaClass(oD)}">${formatDelta(oD)}</td>
        <td>${d.paceAfter.toFixed(1)}</td>      <td class="${getDeltaClass(pD)}">${formatDelta(pD)}</td>
        <td>${d.racecraftAfter.toFixed(1)}</td> <td class="${getDeltaClass(rD)}">${formatDelta(rD)}</td>
        <td>${d.awarenessAfter.toFixed(1)}</td> <td class="${getDeltaClass(aD)}">${formatDelta(aD)}</td>
      </tr>`;
      })
      .join("")}</tbody>
  </table></div>`;
}

function renderHistoryCards(history) {
  if (!history.length)
    return `<div class="empty-state"><div class="empty-state-icon">📜</div><div class="empty-state-text">${t("noRacesYet")}</div></div>`;
  return `<div class="history-list">${history
    .map(
      (race) => `
    <details class="history-card">
      <summary class="history-card-header">
        <span class="history-card-title">${t("round")} ${race.round} — ${race.track}</span>
        <div class="history-card-meta">
          ${flagImg(race.country)}<span>${race.country}</span><span>·</span>
          <span>${translateWeather(race.weather)}</span><span>·</span>
          <span class="badge ${difficultyBadgeClass(race.difficulty)}">${translateDifficulty(race.difficulty)}</span>
          <span class="history-chevron">▼</span>
        </div>
      </summary>
      <div class="history-card-body">
        <div class="history-results">
          ${race.results
            .map(
              (d) => `
            <div class="history-result-row">
              <span class="pos-badge ${posClass(d.position)}">${d.position}</span>
              <span style="font-weight:600">${d.name}</span>
              ${tyreImg(d.tyre)}
              <span class="${statusClass(d.status)}" style="font-size:0.78rem">${translateStatus(d.status)}</span>
              <span class="points-chip ${d.racePoints > 0 ? "has-points" : ""}" style="font-size:0.75rem">${d.racePoints}pt</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </details>
  `,
    )
    .join("")}</div>`;
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLang);

  const restored = restoreSession();
  if (restored && driversData.length > 0) {
    // Re-render everything from restored session
    if (initialDriversSnapshot.length > 0)
      document.getElementById("initialRatingsTable").innerHTML =
        renderInitialRatingsTable(initialDriversSnapshot);
    if (roundNumber >= tracksData.length) {
  document.getElementById("raceInfo").innerHTML =
    renderDriverPodium(driversData);
} else if (lastTrack && lastWeather) {
  document.getElementById("raceInfo").innerHTML = renderRaceInfo(
    lastTrack,
    lastWeather,
  );
}
    if (lastResults)
      document.getElementById("raceResultsTable").innerHTML =
        renderRaceResultsTable(lastResults);
    if (lastRatingChanges)
      document.getElementById("ratingsTable").innerHTML =
        renderRatingsTable(lastRatingChanges);
    document.getElementById("standingsTable").innerHTML =
      renderStandingsTable(driversData);
    document.getElementById("constructorsTable").innerHTML =
      renderConstructorStandingsTable(
        calculateConstructorStandings(driversData),
      );
    document.getElementById("historyCards").innerHTML =
      renderHistoryCards(raceHistory);
    document.getElementById("simulateBtn").textContent =
      roundNumber > 0 ? t("simulateBtn") : t("startBtn");
  } else {
    document.getElementById("simulateBtn").textContent = t("startBtn");
  }

  // Save session when navigating to history page
  document.getElementById("historyBtn").addEventListener("click", () => {
    saveSession();
  });
});

// ── Simulate button ───────────────────────────────────────────
const btn = document.getElementById("simulateBtn");

btn.addEventListener("click", async () => {
  btn.disabled = true;
  btn.textContent = t("loading");

  try {
    if (driversData.length === 0) {
      driversData = await loadDrivers();
      driversData.forEach((d) => (d.finishPositions = []));
      initialDriversSnapshot = await loadInitialDrivers();
      document.getElementById("initialRatingsTable").innerHTML =
        renderInitialRatingsTable(initialDriversSnapshot);
    }
    if (tracksData.length === 0) tracksData = await loadTracks();

    if (roundNumber >= tracksData.length) {
      document.getElementById("raceInfo").innerHTML =
        renderDriverPodium(driversData);
      document.getElementById("standingsTable").innerHTML =
        renderStandingsTable(driversData);
      document.getElementById("constructorsTable").innerHTML =
        renderConstructorStandingsTable(
          calculateConstructorStandings(driversData),
        );
      return;
    }

    const currentTrack = tracksData[roundNumber++];
    const weather = await fetchWeatherForTrack(currentTrack.name);
    const raceData = simulateRace(
      driversData,
      driversData,
      currentTrack,
      weather,
    );
    const results = raceData.results;

    updateStandings(driversData, results);
    const ratingChanges = updateRatings(driversData, results);

    lastTrack = currentTrack;
    lastWeather = weather;
    lastResults = results;
    lastRatingChanges = ratingChanges;

    await saveRatingsToDB(driversData);
    await saveRaceResultsToDB(
      currentTrack,
      weather,
      results.map((r) => ({
        ...r,
        id: driversData.find((d) => d.name === r.name)?.id,
      })),
    );

    raceHistory.push({
      round: currentTrack.round,
      track: currentTrack.name,
      country: currentTrack.country,
      weather,
      difficulty: currentTrack.difficulty,
      results,
    });

    document.getElementById("raceInfo").innerHTML = renderRaceInfo(
      currentTrack,
      weather,
    );
    document.getElementById("raceResultsTable").innerHTML =
      renderRaceResultsTable(results);
    document.getElementById("standingsTable").innerHTML =
      renderStandingsTable(driversData);
    document.getElementById("constructorsTable").innerHTML =
      renderConstructorStandingsTable(
        calculateConstructorStandings(driversData),
      );
    document.getElementById("ratingsTable").innerHTML =
      renderRatingsTable(ratingChanges);
    document.getElementById("historyCards").innerHTML =
      renderHistoryCards(raceHistory);
  } catch (err) {
    console.error("Simulation error:", err);
    alert("Something went wrong. Check the console.");
  } finally {
    btn.disabled = false;
    btn.textContent = roundNumber > 0 ? t("simulateBtn") : t("startBtn");
  }
});

// ── Reset ─────────────────────────────────────────────────────
document.getElementById("resetBtn").addEventListener("click", async () => {
  if (!confirm(t("resetConfirm"))) return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    const res = await fetch("/api/reset", { method: "POST" });
    if (res.ok) window.location.reload();
    else alert("Reset failed. Check the console.");
  } catch (err) {
    console.error("Reset error:", err);
    alert("Reset failed. Check the console.");
  }
});

// ── Export + Save to server ───────────────────────────────────
document.getElementById("exportBtn").addEventListener("click", async () => {
  if (raceHistory.length === 0) {
    alert(t("exportEmpty"));
    return;
  }

  const constructors = calculateConstructorStandings(driversData).map(
    (c, i) => ({
      position: i + 1,
      team: c.team,
      points: c.points,
    }),
  );

  const data = {
    id: crypto.randomUUID(),
    exportedAt: new Date().toISOString(),
    roundsCompleted: roundNumber,
    totalRounds: tracksData.length,
    driverStandings: driversData.map((d, i) => ({
      position: i + 1,
      name: d.name,
      team: d.team,
      points: d.points,
      ovr: parseFloat(d.overall.toFixed(1)),
      pac: parseFloat(d.pace.toFixed(1)),
      rac: parseFloat(d.racecraft.toFixed(1)),
      awa: parseFloat(d.awareness.toFixed(1)),
      exp: parseFloat(d.experience.toFixed(1)),
    })),
    constructorStandings: constructors,
  };

  try {
    await saveSimulationToServer(data);
  } catch (err) {
    console.error("Failed to save to server history:", err);
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `f1_2026_season_round${roundNumber}.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert(t("exportSaved"));
});
