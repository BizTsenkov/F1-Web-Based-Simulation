import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initDB } from "./db.js";
import driversRouter from "./routes/drivers.js";
import tracksRouter from "./routes/tracks.js";
import teamsRouter from "./routes/teams.js";
import weatherRouter from "./routes/weather.js";
import racesRouter from "./routes/races.js";
import resetRouter from "./routes/reset.js";
import historyRouter from "./routes/history.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

initDB();

app.use("/api/drivers", driversRouter);
app.use("/api/tracks", tracksRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/races", racesRouter);
app.use("/api/reset", resetRouter);
app.use("/api/history", historyRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
