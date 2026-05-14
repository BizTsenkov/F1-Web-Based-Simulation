import { Router } from "express";
import { getDB } from "../db.js";

const router = Router();

/**
 * GET /api/drivers
 * Връща всички пилоти с ТЕКУЩИТЕ им рейтинги (pilots_current)
 * и данните за отбора (teams).
 */
router.get("/", (req, res) => {
  const db = getDB();

  const drivers = db
    .prepare(
      `
    SELECT
      pb.id            AS id,
      pb.name          AS name,
      t.name           AS team,
      t.car_performance AS carPerformance,
      t.reliability    AS reliability,
      pc.exp           AS experience,
      pc.rac           AS racecraft,
      pc.awa           AS awareness,
      pc.pac           AS pace,
      pc.ovr           AS overall,
      pc.points        AS points
    FROM pilots_base pb
    JOIN pilots_current pc ON pc.pilot_base_id = pb.id
    JOIN teams t           ON t.id = pb.team_id
    ORDER BY pb.id
  `,
    )
    .all();

  res.json(drivers);
});

/**
 * GET /api/drivers/base
 * Връща БАЗОВИТЕ (начални) рейтинги — използва се за "Initial Driver Ratings" таблицата.
 */
router.get("/base", (req, res) => {
  const db = getDB();

  const drivers = db
    .prepare(
      `
    SELECT
      pb.id   AS id,
      pb.name AS name,
      t.name  AS team,
      pb.exp  AS experience,
      pb.rac  AS racecraft,
      pb.awa  AS awareness,
      pb.pac  AS pace,
      pb.ovr  AS overall
    FROM pilots_base pb
    JOIN teams t ON t.id = pb.team_id
    ORDER BY pb.id
  `,
    )
    .all();

  res.json(drivers);
});

/**
 * POST /api/drivers/ratings
 * Обновява pilots_current след всяко състезание.
 *
 * Body: { ratings: [{ pilotId, exp, rac, awa, pac, ovr, points }, ...] }
 */
router.post("/ratings", (req, res) => {
  const db = getDB();
  const { ratings } = req.body;

  if (!Array.isArray(ratings) || ratings.length === 0) {
    return res.status(400).json({ error: "ratings array is required" });
  }

  const update = db.prepare(`
    UPDATE pilots_current
    SET exp = ?, rac = ?, awa = ?, pac = ?, ovr = ?, points = ?
    WHERE pilot_base_id = ?
  `);

  const updateAll = db.transaction(() => {
    for (const r of ratings) {
      update.run(r.exp, r.rac, r.awa, r.pac, r.ovr, r.points, r.pilotId);
    }
  });

  updateAll();
  res.json({ success: true, updated: ratings.length });
});

/**
 * GET /api/drivers/:id/results
 * Връща всички резултати за конкретен пилот от race_results.
 */
router.get("/:id/results", (req, res) => {
  const db = getDB();
  const pilotId = parseInt(req.params.id, 10);

  const results = db
    .prepare(
      `
    SELECT
      rr.id,
      t.round,
      t.name    AS track,
      t.country,
      rr.position,
      rr.tyre,
      rr.strategy,
      rr.status,
      rr.points,
      rr.weather
    FROM race_results rr
    JOIN tracks t ON t.id = rr.track_id
    WHERE rr.pilot_base_id = ?
    ORDER BY t.round
  `,
    )
    .all(pilotId);

  res.json(results);
});

export default router;
