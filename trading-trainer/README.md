# NEON TERMINAL — Trading Trainer

Lokaler Paper-Trading-Simulator und Lernwerkzeug für Anfänger.
**Kein echtes Geld, kein Broker-Anschluss, keine Anlageberatung** — 100 % Spielgeld auf deinem eigenen Rechner.

## Starten

```bash
cd trading-trainer
npm install     # nur beim ersten Mal
npm run dev
```

Dann im Browser öffnen: **http://localhost:5173**

Das startet gleichzeitig:
- die API mit SQLite-Datenbank auf Port `5175` (Datei: `trading-trainer/data/trainer.db`)
- das Frontend (Vite) auf Port `5173`

Beenden mit `Strg+C`.

## Module

| Modul | Was es kann |
|---|---|
| **Dashboard** | Watchlist mit 6 Krypto-Märkten (EUR), Live-Kurse über die kostenlose Binance-API, TradingView-Chart, News-Feed (RSS: tagesschau Wirtschaft, CoinDesk) |
| **Paper Trading** | 10.000 € Spielgeld, Long & Short, Stop-Loss/Take-Profit (werden serverseitig automatisch ausgelöst), Pflichtfeld „Warum dieser Trade?" (min. 20 Zeichen) |
| **Journal** | Speichert jeden Trade in SQLite, zeigt Trefferquote, Profit-Faktor, Gewinnkurve und erkennt 6 typische Fehlermuster (kein Stop-Loss, Übergröße, Revenge-Trading, Verluste laufen lassen, schlechtes CRV, dünne Begründungen) |
| **KI-Einschätzung** | Regelbasierte Analyse (Momentum, RSI, Spanne, Volatilität) — lokal, ohne Cloud. Liefert Argumente **für und gegen**, nie Kaufanweisungen, plus ehrliche Unsicherheit. Jede Einschätzung wird nach 30 Min automatisch gegen den echten Kurs geprüft: „Wie oft lag die KI richtig?" |
| **Lernbereich** | 6 Lektionen (Stop-Loss, Positionsgröße, Risk-Management, Trend, Volumen, Hebel) mit je einem Quiz; Fortschritt wird gespeichert |

## Offline-Verhalten

Ohne Internet schaltet die App automatisch auf einen realistischen Kurs-Simulator um
(Badge „SIMULATOR" statt „LIVE-KURSE"). Alle Module funktionieren auch offline;
nur TradingView-Chart und echte News brauchen eine Verbindung.

## Konto zurücksetzen

```bash
curl -X POST http://localhost:5175/api/reset
```

…oder die Datei `trading-trainer/data/trainer.db` löschen (setzt auch Journal, KI-Bilanz und Lernfortschritt zurück).

## Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS · Framer Motion · Recharts · Express · better-sqlite3
