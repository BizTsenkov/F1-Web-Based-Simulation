import { Router } from "express";
import { getDB } from "../db.js";

const router = Router();

/**
 * GET /api/teams
 * Връща всички отбори от DB.
 */
router.get("/", (req, res) => {
  const db = getDB();

  const teams = db
    .prepare(
      `
    SELECT
      id,
      name,
      car_performance AS carPerformance,
      reliability
    FROM teams
    ORDER BY car_performance DESC
  `,
    )
    .all();

  res.json(teams);
});

export default router;
