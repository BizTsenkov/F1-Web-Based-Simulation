import { Router } from "express";
import { getDB } from "../db.js";

const router = Router();

/**
 * POST /api/races
 * Записва резултатите от едно цяло състезание в race_results.
 *
 * Body: {
 *   trackId: number,
 *   weather: string,
 *   results: [{ pilotId, position, tyre, strategy, status, points }, ...]
 * }
 */
router.post("/", (req, res) => {
  const db = getDB();
  const { trackId, weather, results } = req.body;

  if (!trackId || !weather || !Array.isArray(results) || results.length === 0) {
    return res
      .status(400)
      .json({ error: "trackId, weather and results are required" });
  }

  const insert = db.prepare(`
    INSERT INTO race_results
      (track_id, pilot_base_id, position, tyre, strategy, status, points, weather)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = db.transaction(() => {
    for (const r of results) {
      insert.run(
        trackId,
        r.pilotId,
        r.position,
        r.tyre,
        r.strategy,
        r.status,
        r.points,
        weather,
      );
    }
  });

  insertAll();
  res.json({ success: true, inserted: results.length });
});

/**
 * GET /api/races
 * Връща резюме на всички изиграни състезания.
 */
router.get("/", (req, res) => {
  const db = getDB();

  const races = db
    .prepare(
      `
    SELECT DISTINCT
      t.id      AS trackId,
      t.round,
      t.name    AS track,
      t.country,
      rr.weather
    FROM race_results rr
    JOIN tracks t ON t.id = rr.track_id
    ORDER BY t.round
  `,
    )
    .all();

  res.json(races);
});

export default router;
