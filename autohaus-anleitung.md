# Autohaus Lead-System — Einrichtung

**Walter Workflows · Einmalpreis 1.900 €**

Diese Anleitung ist für **dich** geschrieben, nicht für den Kunden. Du brauchst sie
einmal pro Autohaus. Reine Einrichtungszeit nach etwas Übung: **rund 40 Minuten.**

Der Workflow selbst wird dabei **nicht verändert**. Angepasst wird ausschliesslich
ein einziger Node: `EINSTELLUNGEN`. Das ist der ganze Sinn der Konstruktion — du
baust ihn einmal und verkaufst dieselbe Datei beliebig oft.

---

## Die vier Dateien

| Datei | Wohin |
|---|---|
| `autohaus-datenbank.sql` | einmal in der Datenbank ausführen |
| `autohaus-lead-system.json` | in n8n importieren |
| `autohaus-dashboard.html` | irgendwo hochladen, Link an den Händler |
| `autohaus-anleitung.md` | diese Datei, bleibt bei dir |

---

## Was du brauchst

| Was | Wofür | Kosten |
|---|---|---|
| n8n (Cloud oder selbst gehostet) | führt den Workflow aus | ab ca. 20 €/Monat |
| PostgreSQL-Datenbank | Leads, Fahrzeuge, Verlauf | Supabase kostenlos |
| Anthropic API-Schlüssel | Anfragen verstehen, Antworten schreiben | ca. 1–3 Cent pro Anfrage |
| Google-Kalender des Autohauses | Probefahrt-Termine | 0 € |
| SMTP-Zugang des Autohauses | Mailversand aus der eigenen Adresse | 0 € |
| IMAP-Zugang (optional) | Portal-Mails automatisch einlesen | 0 € |

**Keine Tabellen.** Alles liegt in einer echten Datenbank, und der Händler
sieht es im Dashboard.

---

## Schritt 1 — Datenbank anlegen

**Bei Supabase** (kostenlos, empfohlen): Projekt anlegen → *SQL Editor* →
Inhalt von `autohaus-datenbank.sql` einfügen → **Run**.

Das legt an:

| Tabelle | Inhalt |
|---|---|
| `leads` | jede Anfrage mit Erkennung, Score, Verkäufer, Status, Nachfass-Stufe |
| `fahrzeuge` | der Bestand, den die KI anbieten darf |
| `verlauf` | jeder einzelne Schritt protokolliert |
| `kennzahlen` | fertige Auswertung für das Dashboard |

Dazu zwei Beispielfahrzeuge zum Testen — die kannst du später löschen.

**Verbindungsdaten holen:** Supabase → *Project Settings* → *Database* →
**Connection String** → Reiter **Session pooler**. Diesen nehmen, nicht die
direkte Verbindung — der Pooler funktioniert auch dort, wo IPv6 fehlt
(gilt für n8n Cloud).

---

## Schritt 2 — Zugänge in n8n anlegen

Fünf Zugangsdaten, alle unter *Credentials → New*:

| Typ in n8n | Name vergeben | Inhalt |
|---|---|---|
| **Postgres** | `Autohaus DB` | Host, Port, Datenbank, Benutzer, Passwort aus dem Connection String. **SSL auf `require`** |
| **Header Auth** | `Claude API` | Name: `x-api-key` · Wert: der Anthropic-Schlüssel |
| **Google Calendar OAuth2** | `Google Calendar` | Konto des Autohauses |
| **SMTP** | `Autohaus SMTP` | Mailserver des Autohauses |
| **IMAP** | `Autohaus IMAP` | nur, wenn Portal-Mails gelesen werden |

> **Häufigster Fehler:** Beim Claude-Zugang ist es *Header Auth*, nicht *Bearer*.
> Der Header heisst `x-api-key`, der Wert ist der reine Schlüssel ohne Zusatz.

---

## Schritt 3 — Workflow importieren

In n8n oben rechts *…* → **Import from File** → `autohaus-lead-system.json`.

Danach die Nodes mit rotem Dreieck durchgehen und den Zugang auswählen:

- alle **SQL**-Nodes (Lead suchen, Lead speichern, CRM: …, API: Datenbank) → `Autohaus DB`
- die beiden **KI**-Nodes → `Claude API`
- **Kalendereintrag** → `Google Calendar`
- alle **Mail**-Nodes → `Autohaus SMTP`
- **Postfach (IMAP)** → `Autohaus IMAP`

---

## Schritt 4 — Den Node `EINSTELLUNGEN` ausfüllen

Das ist die eigentliche Arbeit. Alles andere bleibt unangetastet.

```js
autohaus:      'Autohaus Muster GmbH',      // Name wie in Mails erscheinen soll
ort:           'Musterstadt',
telefon:       '0123 456789',
webseite:      'https://www.autohaus-muster.de',
absenderName:  'Autohaus Muster GmbH',      // Absender der Kundenmails
absenderEmail: 'info@autohaus-muster.de',   // muss zum SMTP-Zugang passen

kalenderId:    'primary',                    // oder die ID eines eigenen Kalenders

verkaeufer: [                                // beliebig viele
  { name: 'Max Mustermann', email: 'max@…',  marken: ['BMW','MINI'] },
  { name: 'Anna Beispiel',  email: 'anna@…', marken: ['VW','Audi'] }
],
verkaufsleitung: 'leitung@…',                // bekommt den Tagesbericht

webhookBasis:   'https://deine-n8n-adresse/webhook',   // ohne / am Ende
dashboardToken: 'ein-langer-eigener-schluessel',       // frei wählbar, aber lang
```

**Zur Verkäufer-Zuteilung:** Passt eine Marke aus `marken` zum angefragten
Fahrzeug, bekommt dieser Verkäufer den Lead. Passt keine, wird gleichmässig
verteilt. Sollen alle Anfragen an eine Adresse gehen: nur einen Eintrag anlegen.

**Zum `dashboardToken`:** Der schützt den Zugang zum Dashboard. Nimm etwas
Langes und Zufälliges — pro Kunde einen eigenen.

**Optional feinjustierbar:**

| Wert | Standard | Bedeutung |
|---|---|---|
| `terminZeiten` | `10:00, 14:00, 16:30` | die drei angebotenen Probefahrt-Uhrzeiten |
| `terminDauerMin` | `45` | Länge des Kalendereintrags |
| `vorlaufTage` | `1` | frühester Termin (1 = ab morgen, nur Werktage) |
| `nachfassTage` | `2, 5, 10` | wann nachgefasst wird |
| `archivNachTagen` | `45` | ab wann ein toter Lead geschlossen wird |
| `berichtSenden` | `true` | Tagesbericht an die Verkaufsleitung |

---

## Schritt 5 — Formular anbinden

Der Workflow nimmt jede POST-Anfrage auf
`https://deine-n8n-adresse/webhook/autohaus-anfrage` entgegen. Erwartete Felder:

```
name, email, telefon, betreff, nachricht
```

Alternative Namen werden ebenfalls erkannt (`message`, `phone`, `subject`, `mail`).
Ein Minimalformular für die Website des Autohauses:

```html
<form method="POST" action="https://deine-n8n-adresse/webhook/autohaus-anfrage">
  <input name="name"      placeholder="Ihr Name" required>
  <input name="email"     type="email" placeholder="E-Mail" required>
  <input name="telefon"   placeholder="Telefon">
  <textarea name="nachricht" placeholder="Ihre Nachricht" required></textarea>
  <button>Anfrage senden</button>
</form>
```

**Portal-Anfragen:** mobile.de und AutoScout24 schicken Anfragen per E-Mail. Diese
Adresse wird per IMAP eingelesen — am besten ein eigenes Postfach dafür, damit
nicht jede beliebige Mail als Anfrage verarbeitet wird.

---

## Schritt 6 — Dashboard bereitstellen

`autohaus-dashboard.html` ist eine einzelne Datei ohne Server-Anteil. Lade sie
irgendwo hoch — Netlify, Vercel, GitHub Pages oder der Webspace des Autohauses.

Beim ersten Aufruf fragt sie nach zwei Angaben:

1. **Adresse der Schnittstelle** → `https://deine-n8n-adresse/webhook/autohaus-api`
2. **Zugangsschlüssel** → derselbe Wert wie `dashboardToken`

Beides wird nur im Browser des Händlers gespeichert. **Das Dashboard spricht
nie direkt mit der Datenbank** — nur mit dem n8n-Webhook. Die Zugangsdaten der
Datenbank verlassen n8n nie.

Was der Händler dort tut:

- **Pipeline** — alle Vorgänge nach Status, Klick auf einen Lead zeigt die
  komplette Erkennung, die Originalnachricht und den ganzen Verlauf
- **Status ändern**, Verkäufer umtragen, Nachfassen stoppen
- **Gesprächsnotizen** eintragen, die im Verlauf stehen bleiben
- **Fahrzeuge** anlegen, ändern, löschen

---

## Schritt 7 — Testlauf

1. **Workflow noch nicht aktivieren.** Erst auf *Execute Workflow* klicken und
   das Formular einmal abschicken. Prüfen: Zeile in der Datenbank? Mail beim
   Testkunden? Mail beim Verkäufer? Lead im Dashboard?
2. In der Kundenmail auf einen **Terminvorschlag** klicken. Prüfen: Kalender­eintrag
   da? Bestätigungsmail da? Lead in der Spalte *Probefahrt*?
3. In der Datenbank bei einer Testzeile `eingang` auf ein Datum vor 3 Tagen setzen
   (`update leads set eingang = now() - interval '3 days' where lead_id = '…'`),
   dann den Zeitplan-Trigger manuell auslösen. Prüfen: kommt die Nachfass-Mail?
4. Erst wenn alles sitzt: Workflow **aktivieren**.

> **Was du dem Kunden beim Testlauf zeigst:** die Antwortzeit. Formular abschicken,
> auf die Uhr schauen, Mail kommt — und der Lead erscheint im Dashboard. Das
> verkauft das System besser als jede Erklärung.

---

## Wie das System arbeitet

### Eine Anfrage kommt herein

1. Formular oder Postfach → alles wird auf ein Format gebracht
2. **Die Datenbank wird gefragt: kennen wir diese Adresse mit offenem Vorgang?**
   - **Ja** → das ist eine Kundenantwort. Kette sofort stoppen, Verkäufer informieren.
   - **Nein** → weiter
3. Fahrzeugbestand laden, Claude erkennt die Anfrage und schreibt die Antwort
   in **einem einzigen Aufruf**
4. Lead anlegen, Antwort an den Interessenten, Bescheid an den Verkäufer

Die Antwort enthält **drei anklickbare Probefahrt-Termine**. Ein Klick trägt den
Termin in den Kalender ein, bestätigt dem Kunden, informiert den Verkäufer und
stoppt die Nachfass-Kette.

### Jeden Morgen um 07:00

| Aufgabe | Regel |
|---|---|
| Nachfassen | Tag 2, 5 und 10 nach der Anfrage — Text je Fall neu geschrieben |
| Erinnerung | 24 Stunden vor jeder bestätigten Probefahrt |
| Archivieren | nach 45 Tagen ohne Reaktion |
| Tagesbericht | Kennzahlen und die heissesten Leads an die Verkaufsleitung |

Wer geantwortet hat oder einen Termin hat, wird **nie** nachgefasst.

**Der Doppelversand-Schutz** sitzt in der Spalte `nachfass_stufe` — dort steht
schlicht `0`, `2`, `5` oder `10`. Der Lauf kann beliebig oft starten, es geht
garantiert nie eine Mail zweimal raus.

---

## Wenn etwas ausfällt

| Fall | Verhalten |
|---|---|
| Claude nicht erreichbar | drei Versuche; danach geht eine saubere Empfangsbestätigung raus, der Verkäufer bekommt den Hinweis, selbst zu lesen. **Keine Anfrage geht verloren.** |
| Mailversand scheitert | der Ablauf bricht nicht ab, der Lead bleibt in der Datenbank |
| Kalender nicht erreichbar | Termin steht trotzdem im Lead, Bestätigung geht raus |
| Datenbank leer | kein Absturz, es passiert schlicht nichts |
| Terminlink abgelaufen oder unbekannt | eigene Fehlerseite mit der Telefonnummer |
| Falscher Dashboard-Schlüssel | Zugriff wird abgewiesen, es wird nichts gelesen |

**Zur Sicherheit der Schnittstelle:** Jede SQL-Abfrage wird im Node
`API: Anfrage prüfen` fest im Code gebaut. Vom Dashboard kommen ausschliesslich
**Werte**, niemals Abfragetext. Ein Einschleusversuch landet als harmloser
Text in einem Parameter.

---

## Laufende Kosten für den Händler

Pro Anfrage ein Claude-Aufruf (Analyse und Antwort zusammen), pro Nachfass-Mail
ein weiterer, deutlich kleinerer. Bei 100 Anfragen im Monat liegen die reinen
KI-Kosten im **niedrigen einstelligen Eurobereich**. Dazu n8n und ggf. die
Datenbank — bei Supabase im kostenlosen Rahmen.

Das ist das Argument für einen Monatsbeitrag: du übernimmst Betrieb, Überwachung
und Anpassungen, der Händler hat eine Rechnung statt vier Verträgen.

---

## Was du bewusst nicht versprichst

- **Kein automatischer Upload** zu mobile.de oder AutoScout24. Die Portale erlauben
  das nicht zuverlässig.
- **Keine Preisverhandlung** durch die KI. Sie nennt nur, was im Bestand steht,
  und macht keine Zusagen.
- **Keine Bewertung der Inzahlungnahme** per Mail. Sie bestätigt, dass eine
  Bewertung möglich ist — die Summe nennt der Verkäufer.

Diese drei Grenzen stehen im System und in den Prompts. Halte sie auch im
Verkaufsgespräch ein — sie sind der Grund, warum das System nicht peinlich wird.

---

## Bestand automatisch befüllen (Zusatzleistung, ca. 600 €)

Der Händler kann seine Fahrzeuge im Dashboard pflegen — das funktioniert ab dem
ersten Tag bei jedem Kunden. Wer den Bestand schon woanders hat, bekommt einen
**zweiten, kleinen Workflow**: er holt nachts den Bestand aus der Quelle
(Portal-Schnittstelle von mobile.de oder AutoScout24, XML-Feed, CSV-Export) und
schreibt ihn in die Tabelle `fahrzeuge`.

Der entscheidende Punkt: **das Hauptsystem bleibt unangetastet.** Es liest
weiterhin nur die Datenbank und weiss nichts davon, woher die Daten kommen. Pro
Kunde baust du nur den kleinen Importer, nicht am grossen Workflow.

So bleibt der Standard in 40 Minuten installiert — und die Anbindung ist eine
bezahlte Zusatzleistung statt einer Voraussetzung.

---

## Was du pro Neukunde anfasst

1. Supabase-Projekt anlegen, SQL einfügen (5 Minuten)
2. Fünf Zugänge in n8n anlegen (20 Minuten)
3. Workflow importieren, Zugänge zuweisen (8 Minuten)
4. `EINSTELLUNGEN` ausfüllen (5 Minuten)
5. Dashboard hochladen, Link übergeben (2 Minuten)
6. Testlauf (10 Minuten)

**Der Workflow selbst wird nie verändert.** Sobald du eine Verbesserung baust,
baust du sie einmal — und lieferst sie an alle Kunden aus.
