# Autohaus Lead-System — Einrichtung

**Walter Workflows · Einmalpreis 1.900 €**

Diese Anleitung ist für **dich** geschrieben, nicht für den Kunden. Du brauchst sie
einmal pro Autohaus. Reine Einrichtungszeit nach etwas Übung: **rund 45 Minuten.**

Der Workflow selbst wird dabei **nicht verändert**. Angepasst wird ausschliesslich
ein einziger Node: `EINSTELLUNGEN`. Das ist der ganze Sinn der Konstruktion — du
baust ihn einmal und verkaufst dieselbe Datei beliebig oft.

---

## Was du brauchst

| Was | Wofür | Kosten |
|---|---|---|
| n8n (Cloud oder selbst gehostet) | führt den Workflow aus | ab ca. 20 €/Monat |
| Anthropic API-Schlüssel | Anfragen verstehen, Antworten schreiben | ca. 1–3 Cent pro Anfrage |
| Google-Konto des Autohauses | Tabelle als CRM, Kalender für Probefahrten | 0 € |
| SMTP-Zugang des Autohauses | Mailversand aus der eigenen Adresse | 0 € |
| IMAP-Zugang (optional) | Portal-Mails automatisch einlesen | 0 € |

---

## Schritt 1 — Google-Tabelle anlegen

Eine neue Google-Tabelle mit **zwei Blättern**. Die Kopfzeilen liegen als CSV bei:

- `autohaus-tabelle-leads.csv` → Blatt **`Leads`**
- `autohaus-tabelle-fahrzeuge.csv` → Blatt **`Fahrzeuge`**

Beide CSV einfach importieren oder die erste Zeile hineinkopieren. Die Spaltennamen
müssen **exakt** so heissen — der Workflow schreibt anhand dieser Namen.

Die Tabellen-ID steht in der URL:
`docs.google.com/spreadsheets/d/`**`DIESER_TEIL`**`/edit`

### Blatt `Fahrzeuge` füllen

Der Bestand kann von Hand gepflegt oder aus dem Händlerprogramm exportiert werden.
Wichtig ist nur die Spalte `Status`:

- leer oder `verfuegbar` → wird dem Interessenten angeboten
- `verkauft` → wird vollständig ignoriert

Ohne Bestandsliste funktioniert das System trotzdem — es antwortet dann allgemeiner
und ordnet kein konkretes Fahrzeug zu.

---

## Schritt 2 — Zugänge in n8n anlegen

Fünf Zugangsdaten, alle unter *Credentials → New*:

| Typ in n8n | Name vergeben | Inhalt |
|---|---|---|
| **Header Auth** | `Claude API` | Name: `x-api-key` · Wert: der Anthropic-Schlüssel |
| **Google Sheets OAuth2** | `Google Sheets` | Google-Konto des Autohauses |
| **Google Calendar OAuth2** | `Google Calendar` | dasselbe Konto |
| **SMTP** | `Autohaus SMTP` | Mailserver des Autohauses |
| **IMAP** | `Autohaus IMAP` | nur nötig, wenn Portal-Mails gelesen werden |

> **Wichtig beim Claude-Zugang:** es ist *Header Auth*, nicht *Bearer*. Der
> Header heisst `x-api-key`, der Wert ist der reine Schlüssel ohne Zusatz.

---

## Schritt 3 — Workflow importieren

In n8n oben rechts *…* → **Import from File** → `autohaus-lead-system.json`.

Danach einmal durch alle Nodes gehen, die ein rotes Dreieck zeigen, und den
passenden Zugang auswählen. Betroffen sind:

- die beiden **KI**-Nodes → `Claude API`
- alle **CRM:** und **… laden**-Nodes → `Google Sheets`
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

sheetId:       '...',                        // aus der Tabellen-URL
kalenderId:    'primary',                    // oder die ID eines eigenen Kalenders

verkaeufer: [                                // beliebig viele
  { name: 'Max Mustermann', email: 'max@…',  marken: ['BMW','MINI'] },
  { name: 'Anna Beispiel',  email: 'anna@…', marken: ['VW','Audi'] }
],
verkaufsleitung: 'leitung@…',                // bekommt den Tagesbericht

webhookBasis:  'https://deine-n8n-adresse/webhook',   // ohne / am Ende
```

**Zur Verkäufer-Zuteilung:** Passt eine Marke aus `marken` zum angefragten
Fahrzeug, bekommt dieser Verkäufer den Lead. Passt keine, wird gleichmässig
verteilt. Sollen alle Anfragen an eine Adresse gehen: nur einen Eintrag anlegen.

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

## Schritt 6 — Testlauf

1. **Workflow noch nicht aktivieren.** Erst auf *Execute Workflow* klicken und
   das Formular einmal abschicken. Prüfen: Zeile in der Tabelle? Mail beim
   Testkunden? Mail beim Verkäufer?
2. In der Kundenmail auf einen **Terminvorschlag** klicken. Prüfen: Kalender­eintrag
   da? Bestätigungsmail da? Spalte `Termin` gefüllt?
3. In der Tabelle bei einer Testzeile `Eingang` auf ein Datum vor 3 Tagen setzen,
   dann den Zeitplan-Trigger manuell auslösen. Prüfen: kommt die Nachfass-Mail?
4. Erst wenn alles sitzt: Workflow **aktivieren**.

> **Was du dem Kunden beim Testlauf zeigst:** die Antwortzeit. Formular abschicken,
> auf die Uhr schauen, Mail kommt. Das verkauft das System besser als jede Erklärung.

---

## Wie das System arbeitet

### Eine Anfrage kommt herein

1. Formular oder Postfach → alles wird auf ein Format gebracht
2. **Ist das ein bekannter Interessent, der antwortet?** Dann sofort Kette stoppen
   und den Verkäufer informieren. Es geht keine automatische Mail mehr raus.
3. Sonst: Fahrzeugbestand laden, Claude analysiert die Anfrage und schreibt die
   Antwort in einem einzigen Aufruf
4. Zeile ins CRM, Antwort an den Interessenten, Bescheid an den Verkäufer

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

Wer geantwortet hat oder einen Termin hat, wird **nie** nachgefasst. Jede Stufe wird
in der Spalte `NaechsterSchritt` vermerkt — dadurch kann derselbe Lauf mehrmals
am Tag starten, ohne dass eine Mail doppelt rausgeht.

---

## Wenn etwas ausfällt

| Fall | Verhalten |
|---|---|
| Claude nicht erreichbar | drei Versuche; danach geht eine saubere Empfangsbestätigung raus, der Verkäufer bekommt den Hinweis, selbst zu lesen. **Keine Anfrage geht verloren.** |
| Mailversand scheitert | der Ablauf bricht nicht ab, die CRM-Zeile bleibt erhalten |
| Kalender nicht erreichbar | Termin steht trotzdem im CRM, Bestätigung geht raus |
| Tabelle leer | kein Absturz, es passiert schlicht nichts |
| Terminlink abgelaufen | eigene Fehlerseite mit der Telefonnummer |

---

## Laufende Kosten für den Händler

Pro Anfrage ein Claude-Aufruf (Analyse + Antwort zusammen), pro Nachfass-Mail ein
weiterer, deutlich kleinerer. Bei 100 Anfragen im Monat liegen die reinen
KI-Kosten im **niedrigen einstelligen Eurobereich**. Dazu kommt n8n.

Das ist das Argument für einen Monatsbeitrag: du übernimmst Betrieb, Überwachung
und Anpassungen, der Händler hat eine Rechnung statt drei Verträgen.

---

## Was du bewusst nicht versprichst

- **Kein automatischer Upload** zu mobile.de oder AutoScout24. Die Portale erlauben
  das nicht zuverlässig.
- **Keine Preisverhandlung** durch die KI. Sie nennt nur, was in der Bestandsliste
  steht, und macht keine Zusagen.
- **Keine Bewertung der Inzahlungnahme** per Mail. Sie bestätigt, dass eine
  Bewertung möglich ist — die Summe nennt der Verkäufer.

Diese drei Grenzen stehen im System und in den Prompts. Halte sie auch im
Verkaufsgespräch ein — sie sind der Grund, warum das System nicht peinlich wird.

---

## Was du pro Neukunde anfasst

1. Tabelle duplizieren (2 Minuten)
2. Fünf Zugänge anlegen (20 Minuten)
3. Workflow importieren, Zugänge zuweisen (10 Minuten)
4. `EINSTELLUNGEN` ausfüllen (5 Minuten)
5. Testlauf (10 Minuten)

**Der Workflow selbst wird nie verändert.** Sobald du eine Verbesserung baust,
baust du sie einmal — und lieferst sie an alle Kunden aus.
