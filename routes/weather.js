import { Router } from "express";

const router = Router();

/**
 * Координати (latitude / longitude) за всяка писта от календара.
 */
const TRACK_COORDS = {
  "Albert Park Circuit": { lat: -37.8497, lon: 144.968 },
  "Shanghai International Circuit": { lat: 31.3389, lon: 121.2198 },
  "Suzuka Circuit": { lat: 34.8431, lon: 136.5407 },
  "Miami International Autodrome": { lat: 25.9581, lon: -80.2389 },
  "Circuit Gilles Villeneuve": { lat: 45.5, lon: -73.5228 },
  "Circuit de Monaco": { lat: 43.7347, lon: 7.4205 },
  "Circuit de Barcelona-Catalunya": { lat: 41.57, lon: 2.2611 },
  "Red Bull Ring": { lat: 47.2197, lon: 14.7647 },
  "Silverstone Circuit": { lat: 52.0786, lon: -1.0169 },
  "Circuit de Spa-Francorchamps": { lat: 50.4372, lon: 5.9714 },
  Hungaroring: { lat: 47.5789, lon: 19.2486 },
  "Circuit Zandvoort": { lat: 52.3888, lon: 4.5408 },
  "Monza Circuit": { lat: 45.6156, lon: 9.2811 },
  Madring: { lat: 40.3517, lon: -3.715 },
  "Baku City Circuit": { lat: 40.3725, lon: 49.8533 },
  "Marina Bay Street Circuit": { lat: 1.2914, lon: 103.864 },
  "Circuit of the Americas": { lat: 30.1328, lon: -97.6411 },
  "Autodromo Hermanos Rodriguez": { lat: 19.4042, lon: -99.0907 },
  "Interlagos Circuit": { lat: -23.7036, lon: -46.6997 },
  "Las Vegas Strip Circuit": { lat: 36.1147, lon: -115.1728 },
  "Lusail International Circuit": { lat: 25.49, lon: 51.4542 },
  "Yas Marina Circuit": { lat: 24.4672, lon: 54.6031 },
};

/**
 * Преобразува данните от Open-Meteo в стринг за времето.
 * Open-Meteo WMO weather codes: https://open-meteo.com/en/docs
 */
function parseWeather(precipitation, weathercode) {
  // Силен дъжд
  if (precipitation >= 2.5) return "heavy rain";
  // Лек дъжд
  if (precipitation > 0) return "light rain";
  // Облачно (weathercode >= 3 = overcast/cloudy onwards)
  if (weathercode >= 3) return "cloudy";
  // Слънчево
  return "sunny";
}

/**
 * GET /api/weather/:trackName
 * Взема реалното текущо времe за дадената писта от Open-Meteo API.
 * При грешка връща fallback ("sunny").
 */
router.get("/:trackName", async (req, res) => {
  const trackName = decodeURIComponent(req.params.trackName);
  const coords = TRACK_COORDS[trackName];

  if (!coords) {
    console.warn(
      `⚠️  No coordinates for track: "${trackName}" — using fallback`,
    );
    return res.json({ weather: "sunny", source: "fallback-no-coords" });
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${coords.lat}` +
      `&longitude=${coords.lon}` +
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
