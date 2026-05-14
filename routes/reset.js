import { Router } from "express";
import { initDB } from "../db.js";

const router = Router();

/**
 * POST /api/reset
 * Re-seeds the in-memory database from scratch.
 * Equivalent to restarting the server.
 */
router.post("/", (req, res) => {
  try {
    initDB();
    res.json({ success: true });
  } catch (err) {
    console.error("Reset failed:", err);
    res.status(500).json({ error: "Reset failed" });
  }
});

export default router;
