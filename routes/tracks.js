import { Router } from "express";
import { getDB } from "../db.js";

const router = Router();

/**
 * GET /api/tracks
 * Връща всички писти от DB, форматирани за съвместимост с simulation.js.
 */
router.get("/", (req, res) => {
  const db = getDB();

  const tracks = db
    .prepare(
      `
    SELECT
      id,
      round,
      name,
      country,
      has_sprint  AS hasSprint,
      is_night    AS isNight,
      difficulty,
      compound_soft   AS compoundSoft,
      compound_medium AS compoundMedium,
      compound_hard   AS compoundHard,
      lat,
      lon
    FROM tracks
    ORDER BY round
  `,
    )
    .all();

  // Форматираме compounds обект за съвместимост с simulation.js
  const formatted = tracks.map((t) => ({
    id: t.id,
    round: t.round,
    name: t.name,
    country: t.country,
    hasSprint: t.hasSprint === 1,
    isNight: t.isNight === 1,
    difficulty: t.difficulty,
    compounds: {
      soft: t.compoundSoft,
      medium: t.compoundMedium,
      hard: t.compoundHard,
    },
    lat: t.lat,
    lon: t.lon,
  }));

  res.json(formatted);
});

export default router;
