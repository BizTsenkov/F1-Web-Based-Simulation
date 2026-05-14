const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function getDifficultyModifier(difficulty) {
  switch (difficulty) {
    case "very easy":
      return 0.6;
    case "easy":
      return 0.8;
    case "medium":
      return 1.0;
    case "hard":
      return 1.25;
    case "very hard":
      return 1.5;
    default:
      return 1.0;
  }
}

function getWeatherModifier(weather) {
  switch (weather) {
    case "sunny":
      return 1.0;
    case "cloudy":
      return 1.1;
    case "light rain":
      return 1.3;
    case "heavy rain":
      return 1.6;
    default:
      return 1.0;
  }
}

function getWeatherPerformanceModifier(weather) {
  switch (weather) {
    case "sunny":
      return 1.0;
    case "cloudy":
      return 0.99;
    case "light rain":
      return 0.96;
    case "heavy rain":
      return 0.92;
    default:
      return 1.0;
  }
}

function getAwarenessWeight(weather) {
  switch (weather) {
    case "sunny":
      return 0.1;
    case "cloudy":
      return 0.12;
    case "light rain":
      return 0.16;
    case "heavy rain":
      return 0.2;
    default:
      return 0.1;
  }
}

function getStrategy(weather, difficulty) {
  if (weather === "light rain" || weather === "heavy rain")
    return "Wet strategy";
  const r = Math.random();
  if (difficulty === "very hard") return r < 0.65 ? "2-stop" : "1-stop";
  if (difficulty === "hard") return r < 0.55 ? "2-stop" : "1-stop";
  if (difficulty === "medium") return r < 0.4 ? "2-stop" : "1-stop";
  return r < 0.3 ? "2-stop" : "1-stop";
}

function getTyreForTrackWeatherAndStrategy(track, weather, strategy) {
  if (weather === "light rain") return "Intermediates";
  if (weather === "heavy rain") return "Wets";

  const { soft, medium, hard } = track.compounds;
  const r = Math.random();
  const S = `Soft (${soft})`,
    M = `Medium (${medium})`,
    H = `Hard (${hard})`;

  if (strategy === "2-stop") {
    return r < 0.6 ? S : r < 0.9 ? M : H;
  }
  if (soft === "C6" || soft === "C5") return r < 0.2 ? S : r < 0.7 ? M : H;
  if (soft === "C4") return r < 0.1 ? S : r < 0.65 ? M : H;
  return r < 0.05 ? S : r < 0.55 ? M : H;
}

function getTyrePerformanceModifier(tyre, weather) {
  const dry = weather === "sunny" || weather === "cloudy";
  if (tyre.startsWith("Soft")) return dry ? 1.03 : 0.85;
  if (tyre.startsWith("Medium")) return dry ? 1.0 : 0.8;
  if (tyre.startsWith("Hard")) return dry ? 0.97 : 0.75;
  if (tyre === "Intermediates") {
    if (weather === "light rain") return 1.02;
    if (weather === "heavy rain") return 0.9;
    return 0.7;
  }
  if (tyre === "Wets") {
    if (weather === "heavy rain") return 1.02;
    if (weather === "light rain") return 0.95;
    return 0.6;
  }
  return 1.0;
}

function getStrategyModifier(strategy, tyre, weather, difficulty) {
  if (strategy === "Wet strategy") {
    return weather === "light rain" || weather === "heavy rain" ? 1.01 : 0.92;
  }
  if (strategy === "1-stop") {
    if (tyre.startsWith("Hard")) return 1.02;
    if (tyre.startsWith("Medium"))
      return difficulty === "very easy" || difficulty === "easy" ? 1.01 : 0.99;
    if (tyre.startsWith("Soft")) return 0.95;
  }
  if (strategy === "2-stop") {
    if (tyre.startsWith("Soft")) return 1.03;
    if (tyre.startsWith("Medium")) return 1.01;
    if (tyre.startsWith("Hard")) return 0.97;
  }
  return 1.0;
}

/**
 * simulateRace
 *
 * @param {Array}  drivers  - масив от pilots_current (включва carPerformance и reliability)
 * @param {Array}  _teams   - не се използва (данните са в drivers), запазен за съвместимост
 * @param {Object} track    - обект от /api/tracks
 * @param {string} weather  - "sunny"|"cloudy"|"light rain"|"heavy rain" (от Open-Meteo API)
 */
function simulateRace(drivers, _teams, track, weather) {
  const diffMod = getDifficultyModifier(track.difficulty);
  const wxMod = getWeatherModifier(weather);
  const wxPerfMod = getWeatherPerformanceModifier(weather);
  const awaWeight = getAwarenessWeight(weather);
  const nightMod = track.isNight ? 1.1 : 1.0;
  const riskMod = diffMod * wxMod * nightMod;

  const results = drivers.map((driver) => {
    // carPerformance и reliability идват директно от driver (JOIN с teams в DB)
    const carPerformance = driver.carPerformance ?? 70;
    const reliability = driver.reliability ?? 80;

    const strategy = getStrategy(weather, track.difficulty);
    const tyre = getTyreForTrackWeatherAndStrategy(track, weather, strategy);
    const tyreMod = getTyrePerformanceModifier(tyre, weather);
    const stratMod = getStrategyModifier(
      strategy,
      tyre,
      weather,
      track.difficulty,
    );

    const baseSkill =
      driver.overall * 0.35 +
      driver.pace * 0.25 +
      driver.racecraft * 0.2 +
      driver.awareness * awaWeight +
      driver.experience * 0.1;

    const score =
      (carPerformance * 0.7 + baseSkill * 0.3) *
        wxPerfMod *
        tyreMod *
        stratMod +
      randomBetween(-8, 8);

    const mechDnf = Math.random() < (100 - reliability) * 0.004 * riskMod;
    const crashDnf =
      !mechDnf && Math.random() < (100 - driver.awareness) * 0.0015 * riskMod;

    const status = mechDnf ? "DNF-MECH" : crashDnf ? "DNF-CRASH" : "FIN";

    return {
      ...driver,
      tyre,
      strategy,
      performanceScore: status === "FIN" ? score : -999,
      racePoints: 0,
      status,
    };
  });

  results.sort((a, b) => b.performanceScore - a.performanceScore);

  let pi = 0;
  results.forEach((d) => {
    d.racePoints =
      d.status === "FIN" && pi < POINTS_SYSTEM.length ? POINTS_SYSTEM[pi++] : 0;
  });

  return {
    weather,
    results: results.map((d, i) => ({
      position: i + 1,
      id: d.id,
      name: d.name,
      team: d.team,
      tyre: d.tyre,
      strategy: d.strategy,
      status: d.status,
      racePoints: d.racePoints,
      performanceScore: Number(d.performanceScore.toFixed(2)),
    })),
  };
}

export { simulateRace };
