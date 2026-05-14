# F1-Web-Based-Simulation

A web-based simulation of the 2026 Formula 1 season. Simulate all 22 races, track driver ratings, view standings, and export results.

---

## Requirements

- [Node.js](https://nodejs.org) (version 18 or higher)

---

## Getting Started

**1. Download / clone the project folder**

**2. Open a terminal inside the project folder**

**3. Install dependencies**
```bash
npm install
```

**4. Start the server**
```bash
npm start
```

**5. Open your browser and go to**
```
http://localhost:3000
```

---

## Stopping the Server

Press `Ctrl + C` in the terminal.

---

## Restarting a New Season

Click the **Reset Season** button inside the app. This will clear all progress and start fresh.

---

## Exporting Results

Click the **Export JSON** button at any point during the simulation. This will:
- Save the current standings to the **History** page
- Download a `.json` file to your computer

---

## Simulation History

Click the **History** button in the header to view all previously exported simulations. From there you can delete individual entries or clear all history.

---

## Language

The app supports **English** and **Bulgarian**. Use the **EN / BG** toggle in the top right corner to switch languages.

---

## Project Structure

```
f1-simulator/
├── server.js              # Express server entry point
├── db.js                  # SQLite in-memory database
├── package.json
├── data/
│   └── simulations.json   # Saved simulation history
├── routes/
│   ├── drivers.js
│   ├── tracks.js
│   ├── teams.js
│   ├── weather.js
│   ├── races.js
│   ├── reset.js
│   └── history.js
└── public/
    ├── index.html         # Main simulator page
    ├── history.html       # Simulation history page
    ├── styles.css
    └── js/
        ├── main.js
        ├── simulation.js
        ├── translations.js
        └── history.js
```

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Server environment |
| Express.js | REST API framework |
| SQLite (better-sqlite3) | In-memory database |
| Vanilla JS | Frontend logic |
| HTML / CSS | UI and styling |
| Open-Meteo API | Real-time weather data |

---

## Notes

- The database is **in-memory** it resets every time the server restarts
- Weather data is fetched in **real time** from Open-Meteo (no API key needed)
- The `node_modules` folder is not included run `npm install` to generate it
- Simulation history is saved permanently in `data/simulations.json`

---

## Disclaimer

This project is a **non-commercial academic diploma project** created for educational purposes only.

The following assets used in this project are the property of their respective owners:

- **Driver numbers** - © Formula 1 / respective drivers
- **Driver images** — © Formula 1 / respective teams
- **Team car images** — © Formula 1 / respective constructors  
- **Tyre compound images** — © Pirelli

These images are used purely for educational and demonstrative purposes within an academic context and are not intended for commercial use. No copyright infringement is intended.

All Formula 1 related trademarks, logos and images are the property of **Formula One World Championship Limited**, a subsidiary of **Liberty Media Corporation**.
