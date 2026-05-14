import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, "..", "data", "simulations.json");

const router = Router();

// Ensure data directory and file exist
function ensureFile() {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, "[]");
}

function readHistory() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeHistory(history) {
  ensureFile();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * GET /api/history
 * Returns all saved simulations, newest first.
 */
router.get("/", (req, res) => {
  const history = readHistory();
  res.json(
    history.sort((a, b) => new Date(b.exportedAt) - new Date(a.exportedAt)),
  );
});

/**
 * POST /api/history
 * Saves a new simulation.
 * Body: { id, exportedAt, roundsCompleted, totalRounds, driverStandings, constructorStandings }
 */
router.post("/", (req, res) => {
  const simulation = req.body;
  if (!simulation || !simulation.id) {
    return res.status(400).json({ error: "Invalid simulation data" });
  }
  const history = readHistory();
  history.push(simulation);
  writeHistory(history);
  res.json({ success: true });
});

/**
 * DELETE /api/history/:id
 * Deletes a simulation by ID.
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const history = readHistory().filter((s) => s.id !== id);
  writeHistory(history);
  res.json({ success: true });
});

/**
 * DELETE /api/history
 * Deletes all simulations.
 */
router.delete("/", (req, res) => {
  writeHistory([]);
  res.json({ success: true });
});

export default router;
