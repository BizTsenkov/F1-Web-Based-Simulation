import { Router } from "express";
import { getDB } from "../db.js";

const router = Router();

/**
 * Преобразува данните от Open-Meteo в стринг за времето.
 * Open-Meteo WMO weather codes: https://open-meteo.com/en/docs
 */
function parseWeather(precipitation, weathercode) {
  if (precipitation >= 2.5) return "heavy rain";
  if (precipitation > 0) return "light rain";
  if (weathercode >= 3) return "cloudy";
  return "sunny";
}

/**
 * GET /api/weather/:trackName
 * Взема реалното текущо времe за дадената писта от Open-Meteo API.
 * Координатите се извличат от таблицата tracks в базата данни.
 * При грешка връща fallback ("sunny").
 */
router.get("/:trackName", async (req, res) => {
  const trackName = decodeURIComponent(req.params.trackName);
  const db = getDB();

  const track = db
    .prepare(`SELECT lat, lon FROM tracks WHERE name = ?`)
    .get(trackName);

  if (!track) {
    console.warn(
      `⚠️  No coordinates found in DB for track: "${trackName}" — using fallback`,
    );
    return res.json({ weather: "sunny", source: "fallback-no-coords" });
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${track.lat}` +
      `&longitude=${track.lon}` +
      `&current=precipitation,weathercode` +
      `&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const data = await response.json();

    const precipitation = data.current?.precipitation ?? 0;
    const weathercode = data.current?.weathercode ?? 0;
    const weather = parseWeather(precipitation, weathercode);

    console.log(
      `🌤  Weather for "${trackName}": ${weather}` +
        ` (precip=${precipitation}mm, code=${weathercode})`,
    );

    res.json({ weather, precipitation, weathercode, source: "open-meteo" });
  } catch (err) {
    console.error(`❌ Weather API error for "${trackName}":`, err.message);
    res.json({ weather: "sunny", source: "fallback-error" });
  }
});

export default router;
