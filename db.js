import Database from "better-sqlite3";

let db;

const TEAMS_SEED = [
  { name: "Mercedes", carPerformance: 94, reliability: 89 },
  { name: "Ferrari", carPerformance: 91, reliability: 87 },
  { name: "McLaren", carPerformance: 90, reliability: 88 },
  { name: "Haas", carPerformance: 84, reliability: 82 },
  { name: "Red Bull", carPerformance: 83, reliability: 84 },
  { name: "Racing Bulls", carPerformance: 80, reliability: 82 },
  { name: "Alpine", carPerformance: 78, reliability: 81 },
  { name: "Audi", carPerformance: 77, reliability: 81 },
  { name: "Williams", carPerformance: 75, reliability: 83 },
  { name: "Cadillac", carPerformance: 73, reliability: 79 },
  { name: "Aston Martin", carPerformance: 71, reliability: 80 },
];

const PILOTS_SEED = [
  {
    name: "Pierre Gasly",
    team: "Alpine",
    exp: 42,
    rac: 18,
    awa: 85,
    pac: 39,
    ovr: 40,
  },
  {
    name: "Franco Colapinto",
    team: "Alpine",
    exp: 6,
    rac: 1,
    awa: 88,
    pac: 23,
    ovr: 24,
  },
  {
    name: "Fernando Alonso",
    team: "Aston Martin",
    exp: 100,
    rac: 38,
    awa: 81,
    pac: 52,
    ovr: 60,
  },
  {
    name: "Lance Stroll",
    team: "Aston Martin",
    exp: 44,
    rac: 12,
    awa: 84,
    pac: 28,
    ovr: 35,
  },
  {
    name: "Nico Hulkenberg",
    team: "Audi",
    exp: 59,
    rac: 17,
    awa: 81,
    pac: 32,
    ovr: 40,
  },
  {
    name: "Gabriel Bortoleto",
    team: "Audi",
    exp: 6,
    rac: 5,
    awa: 79,
    pac: 36,
    ovr: 28,
  },
  {
    name: "Sergio Perez",
    team: "Cadillac",
    exp: 66,
    rac: 39,
    awa: 86,
    pac: 58,
    ovr: 58,
  },
  {
    name: "Valtteri Bottas",
    team: "Cadillac",
    exp: 58,
    rac: 49,
    awa: 89,
    pac: 31,
    ovr: 51,
  },
  {
    name: "Charles Leclerc",
    team: "Ferrari",
    exp: 40,
    rac: 66,
    awa: 85,
    pac: 75,
    ovr: 68,
  },
  {
    name: "Lewis Hamilton",
    team: "Ferrari",
    exp: 89,
    rac: 89,
    awa: 90,
    pac: 59,
    ovr: 79,
  },
  {
    name: "Esteban Ocon",
    team: "Haas",
    exp: 42,
    rac: 18,
    awa: 85,
    pac: 32,
    ovr: 38,
  },
  {
    name: "Oliver Bearman",
    team: "Haas",
    exp: 6,
    rac: 12,
    awa: 89,
    pac: 38,
    ovr: 33,
  },
  {
    name: "Lando Norris",
    team: "McLaren",
    exp: 36,
    rac: 64,
    awa: 90,
    pac: 87,
    ovr: 71,
  },
  {
    name: "Oscar Piastri",
    team: "McLaren",
    exp: 16,
    rac: 77,
    awa: 93,
    pac: 86,
    ovr: 72,
  },
  {
    name: "George Russell",
    team: "Mercedes",
    exp: 36,
    rac: 46,
    awa: 87,
    pac: 80,
    ovr: 62,
  },
  {
    name: "Kimi Antonelli",
    team: "Mercedes",
    exp: 6,
    rac: 42,
    awa: 83,
    pac: 61,
    ovr: 49,
  },
  {
    name: "Liam Lawson",
    team: "Racing Bulls",
    exp: 8,
    rac: 9,
    awa: 83,
    pac: 43,
    ovr: 33,
  },
  {
    name: "Arvid Lindblad",
    team: "Racing Bulls",
    exp: 5,
    rac: 8,
    awa: 80,
    pac: 40,
    ovr: 30,
  },
  {
    name: "Max Verstappen",
    team: "Red Bull",
    exp: 55,
    rac: 100,
    awa: 86,
    pac: 84,
    ovr: 85,
  },
  {
    name: "Isack Hadjar",
    team: "Red Bull",
    exp: 5,
    rac: 15,
    awa: 91,
    pac: 58,
    ovr: 40,
  },
  {
    name: "Carlos Sainz",
    team: "Williams",
    exp: 54,
    rac: 40,
    awa: 82,
    pac: 52,
    ovr: 53,
  },
  {
    name: "Alex Albon",
    team: "Williams",
    exp: 30,
    rac: 17,
    awa: 83,
    pac: 42,
    ovr: 39,
  },
];

const TRACKS_SEED = [
  {
    round: 1,
    name: "Albert Park Circuit",
    country: "Australia",
    hasSprint: 0,
    isNight: 0,
    difficulty: "very easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: -37.8497,
    lon: 144.968,
  },
  {
    round: 2,
    name: "Shanghai International Circuit",
    country: "China",
    hasSprint: 1,
    isNight: 0,
    difficulty: "hard",
    soft: "C4",
    medium: "C3",
    hard: "C2",
    lat: 31.3389,
    lon: 121.2198,
  },
  {
    round: 3,
    name: "Suzuka Circuit",
    country: "Japan",
    hasSprint: 0,
    isNight: 0,
    difficulty: "medium",
    soft: "C3",
    medium: "C2",
    hard: "C1",
    lat: 34.8431,
    lon: 136.5407,
  },
  {
    round: 4,
    name: "Miami International Autodrome",
    country: "United States",
    hasSprint: 1,
    isNight: 0,
    difficulty: "medium",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 25.9581,
    lon: -80.2389,
  },
  {
    round: 5,
    name: "Circuit Gilles Villeneuve",
    country: "Canada",
    hasSprint: 1,
    isNight: 0,
    difficulty: "easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 45.5,
    lon: -73.5228,
  },
  {
    round: 6,
    name: "Circuit de Monaco",
    country: "Monaco",
    hasSprint: 0,
    isNight: 0,
    difficulty: "very hard",
    soft: "C6",
    medium: "C5",
    hard: "C4",
    lat: 43.7347,
    lon: 7.4205,
  },
  {
    round: 7,
    name: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    hasSprint: 0,
    isNight: 0,
    difficulty: "medium",
    soft: "C3",
    medium: "C2",
    hard: "C1",
    lat: 41.57,
    lon: 2.2611,
  },
  {
    round: 8,
    name: "Red Bull Ring",
    country: "Austria",
    hasSprint: 0,
    isNight: 0,
    difficulty: "very easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 47.2197,
    lon: 14.7647,
  },
  {
    round: 9,
    name: "Silverstone Circuit",
    country: "United Kingdom",
    hasSprint: 1,
    isNight: 0,
    difficulty: "easy",
    soft: "C3",
    medium: "C2",
    hard: "C1",
    lat: 52.0786,
    lon: -1.0169,
  },
  {
    round: 10,
    name: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    hasSprint: 0,
    isNight: 0,
    difficulty: "easy",
    soft: "C4",
    medium: "C3",
    hard: "C2",
    lat: 50.4372,
    lon: 5.9714,
  },
  {
    round: 11,
    name: "Hungaroring",
    country: "Hungary",
    hasSprint: 0,
    isNight: 0,
    difficulty: "hard",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 47.5789,
    lon: 19.2486,
  },
  {
    round: 12,
    name: "Circuit Zandvoort",
    country: "Netherlands",
    hasSprint: 1,
    isNight: 0,
    difficulty: "medium",
    soft: "C3",
    medium: "C2",
    hard: "C1",
    lat: 52.3888,
    lon: 4.5408,
  },
  {
    round: 13,
    name: "Monza Circuit",
    country: "Italy",
    hasSprint: 0,
    isNight: 0,
    difficulty: "very easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 45.6156,
    lon: 9.2811,
  },
  {
    round: 14,
    name: "Madring",
    country: "Spain",
    hasSprint: 0,
    isNight: 0,
    difficulty: "medium",
    soft: "C4",
    medium: "C3",
    hard: "C2",
    lat: 40.3517,
    lon: -3.715,
  },
  {
    round: 15,
    name: "Baku City Circuit",
    country: "Azerbaijan",
    hasSprint: 0,
    isNight: 0,
    difficulty: "very hard",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 40.3725,
    lon: 49.8533,
  },
  {
    round: 16,
    name: "Marina Bay Street Circuit",
    country: "Singapore",
    hasSprint: 1,
    isNight: 1,
    difficulty: "very hard",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 1.2914,
    lon: 103.864,
  },
  {
    round: 17,
    name: "Circuit of the Americas",
    country: "United States",
    hasSprint: 0,
    isNight: 0,
    difficulty: "easy",
    soft: "C4",
    medium: "C3",
    hard: "C2",
    lat: 30.1328,
    lon: -97.6411,
  },
  {
    round: 18,
    name: "Autodromo Hermanos Rodriguez",
    country: "Mexico",
    hasSprint: 0,
    isNight: 0,
    difficulty: "easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 19.4042,
    lon: -99.0907,
  },
  {
    round: 19,
    name: "Interlagos Circuit",
    country: "Brazil",
    hasSprint: 0,
    isNight: 0,
    difficulty: "easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: -23.7036,
    lon: -46.6997,
  },
  {
    round: 20,
    name: "Las Vegas Strip Circuit",
    country: "United States",
    hasSprint: 0,
    isNight: 1,
    difficulty: "hard",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 36.1147,
    lon: -115.1728,
  },
  {
    round: 21,
    name: "Lusail International Circuit",
    country: "Qatar",
    hasSprint: 0,
    isNight: 1,
    difficulty: "medium",
    soft: "C3",
    medium: "C2",
    hard: "C1",
    lat: 25.49,
    lon: 51.4542,
  },
  {
    round: 22,
    name: "Yas Marina Circuit",
    country: "United Arab Emirates",
    hasSprint: 0,
    isNight: 1,
    difficulty: "easy",
    soft: "C5",
    medium: "C4",
    hard: "C3",
    lat: 24.4672,
    lon: 54.6031,
  },
];

// ── Инициализация ─────────────────────────────────────────────────────────────

export function initDB() {
  db = new Database(":memory:");
  db.pragma("foreign_keys = ON");

  db.exec(`
    -- Отбори
    CREATE TABLE IF NOT EXISTS teams (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL UNIQUE,
      car_performance REAL    NOT NULL,
      reliability     REAL    NOT NULL
    );

    -- Писти
    CREATE TABLE IF NOT EXISTS tracks (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      round           INTEGER NOT NULL UNIQUE,
      name            TEXT    NOT NULL,
      country         TEXT    NOT NULL,
      has_sprint      INTEGER NOT NULL DEFAULT 0,
      is_night        INTEGER NOT NULL DEFAULT 0,
      difficulty      TEXT    NOT NULL,
      compound_soft   TEXT    NOT NULL,
      compound_medium TEXT    NOT NULL,
      compound_hard   TEXT    NOT NULL,
      lat             REAL    NOT NULL,
      lon             REAL    NOT NULL
    );

    -- Базови (начални) стойности — не се променят, служат за рестарт
    CREATE TABLE IF NOT EXISTS pilots_base (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT    NOT NULL,
      team_id INTEGER NOT NULL,
      exp     REAL    NOT NULL,
      rac     REAL    NOT NULL,
      awa     REAL    NOT NULL,
      pac     REAL    NOT NULL,
      ovr     REAL    NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    -- Текущи (живи) стойности — обновяват се след всяко състезание
    CREATE TABLE IF NOT EXISTS pilots_current (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pilot_base_id INTEGER NOT NULL UNIQUE,
      exp           REAL    NOT NULL,
      rac           REAL    NOT NULL,
      awa           REAL    NOT NULL,
      pac           REAL    NOT NULL,
      ovr           REAL    NOT NULL,
      points        REAL    NOT NULL DEFAULT 0,
      FOREIGN KEY (pilot_base_id) REFERENCES pilots_base(id)
    );

    -- Резултати от всяко състезание — свързва пилоти и писти
    CREATE TABLE IF NOT EXISTS race_results (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id      INTEGER NOT NULL,
      pilot_base_id INTEGER NOT NULL,
      position      INTEGER NOT NULL,
      tyre          TEXT    NOT NULL,
      strategy      TEXT    NOT NULL,
      status        TEXT    NOT NULL,
      points        REAL    NOT NULL DEFAULT 0,
      weather       TEXT    NOT NULL,
      FOREIGN KEY (track_id)      REFERENCES tracks(id),
      FOREIGN KEY (pilot_base_id) REFERENCES pilots_base(id)
    );
  `);

  const insertTeam = db.prepare(
    `INSERT INTO teams (name, car_performance, reliability) VALUES (?, ?, ?)`,
  );
  const insertTrack = db.prepare(`
    INSERT INTO tracks
      (round, name, country, has_sprint, is_night, difficulty,
       compound_soft, compound_medium, compound_hard, lat, lon)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertBase = db.prepare(
    `INSERT INTO pilots_base (name, team_id, exp, rac, awa, pac, ovr) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertCurrent = db.prepare(
    `INSERT INTO pilots_current (pilot_base_id, exp, rac, awa, pac, ovr, points) VALUES (?, ?, ?, ?, ?, ?, 0)`,
  );
  const getTeamId = db.prepare(`SELECT id FROM teams WHERE name = ?`);

  const seedAll = db.transaction(() => {
    for (const t of TEAMS_SEED) {
      insertTeam.run(t.name, t.carPerformance, t.reliability);
    }
    for (const t of TRACKS_SEED) {
      insertTrack.run(
        t.round,
        t.name,
        t.country,
        t.hasSprint,
        t.isNight,
        t.difficulty,
        t.soft,
        t.medium,
        t.hard,
        t.lat,
        t.lon,
      );
    }
    for (const p of PILOTS_SEED) {
      const team = getTeamId.get(p.team);
      if (!team) throw new Error(`Team not found: ${p.team}`);
      const { lastInsertRowid } = insertBase.run(
        p.name,
        team.id,
        p.exp,
        p.rac,
        p.awa,
        p.pac,
        p.ovr,
      );
      insertCurrent.run(lastInsertRowid, p.exp, p.rac, p.awa, p.pac, p.ovr);
    }
  });

  seedAll();
  console.log(
    `✅ DB ready — ${TEAMS_SEED.length} teams | ${TRACKS_SEED.length} tracks | ${PILOTS_SEED.length} pilots`,
  );
  return db;
}

export function getDB() {
  return db;
}
