export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  minutes: number;
  teaser: string;
  sections: Array<{ heading: string; body: string }>;
  quiz: QuizQuestion[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'stop-loss',
    title: 'Stop-Loss: Deine Lebensversicherung',
    icon: '🛑',
    minutes: 8,
    teaser: 'Warum jeder Trade einen Ausstiegsplan braucht, BEVOR du einsteigst.',
    sections: [
      {
        heading: 'Was ist ein Stop-Loss?',
        body: 'Ein Stop-Loss ist ein vorher festgelegter Kurs, bei dem deine Position automatisch geschlossen wird — egal, was du in dem Moment fühlst. Er beantwortet die wichtigste Frage im Trading: „Wo habe ich unrecht?" Wenn du long gehst, weil du an steigende Kurse glaubst, gibt es einen Kurs, bei dem deine Idee objektiv widerlegt ist. Genau dort gehört der Stop hin — nicht dort, wo der Verlust „noch okay" wäre.',
      },
      {
        heading: 'Warum Anfänger ohne Stop untergehen',
        body: 'Ohne Stop-Loss wird aus einem kleinen Fehler ein Kontokiller. Der Mechanismus ist immer gleich: Der Kurs fällt, du hoffst auf die Erholung, der Verlust wächst, und je größer er wird, desto schwerer fällt das Verkaufen („jetzt lohnt es sich auch nicht mehr"). Ein Verlust von 50 % braucht 100 % Gewinn, nur um zurück auf null zu kommen. Der Stop-Loss schützt dich nicht vor Verlusten — er schützt dich vor RUINÖSEN Verlusten.',
      },
      {
        heading: 'Wo setzt man den Stop?',
        body: 'Der Stop gehört an eine technisch sinnvolle Stelle: unter die letzte Unterstützung (long) bzw. über den letzten Widerstand (short) — dort, wo deine Trade-Idee widerlegt ist. NICHT einfach „3 % unter Einstieg", weil sich das gut anfühlt. Danach rechnest du rückwärts: Abstand zum Stop bestimmt die Positionsgröße, nicht umgekehrt. Und: Ein Stop wird nie nach unten verschoben. Nie.',
      },
    ],
    quiz: [
      {
        q: 'Wann legst du den Stop-Loss fest?',
        options: ['Wenn die Position ins Minus läuft', 'Vor der Eröffnung des Trades', 'Wenn ich Zeit habe, auf den Chart zu schauen', 'Ein Stop-Loss ist optional'],
        correct: 1,
        explanation: 'Der Stop wird VOR dem Einstieg geplant — dann entscheidest du rational. Im laufenden Verlust entscheiden Angst und Hoffnung.',
      },
      {
        q: 'Dein Konto verliert 50 %. Wie viel Gewinn brauchst du, um den Verlust aufzuholen?',
        options: ['50 %', '75 %', '100 %', '150 %'],
        correct: 2,
        explanation: 'Aus 10.000 € werden 5.000 €. Um zurück auf 10.000 € zu kommen, müssen sich die 5.000 € verdoppeln — das sind 100 %. Deshalb: große Verluste um jeden Preis vermeiden.',
      },
      {
        q: 'Der Kurs nähert sich deinem Stop-Loss. Was ist richtig?',
        options: ['Stop tiefer setzen, um nicht ausgestoppt zu werden', 'Position verdoppeln, der Einstieg ist jetzt günstiger', 'Nichts tun — der Stop macht seinen Job', 'Stop entfernen und „aussitzen"'],
        correct: 2,
        explanation: 'Der Stop markiert den Punkt, an dem deine Idee widerlegt ist. Ihn zu verschieben heißt, die Widerlegung zu ignorieren — der häufigste Weg zu großen Verlusten.',
      },
    ],
  },
  {
    id: 'positionsgroesse',
    title: 'Positionsgröße: Die 1-%-Regel',
    icon: '⚖️',
    minutes: 10,
    teaser: 'Die wichtigste Formel im Trading — und warum sie über dein Überleben entscheidet.',
    sections: [
      {
        heading: 'Risiko ist nicht Positionsgröße',
        body: 'Anfänger fragen: „Wie viel investiere ich?" Profis fragen: „Wie viel riskiere ich?" Das ist nicht dasselbe. Eine 2.000-€-Position mit engem Stop kann weniger riskant sein als eine 500-€-Position ohne Stop. Dein Risiko ist der Betrag, den du verlierst, wenn der Stop-Loss ausgelöst wird: Risiko = (Einstieg − Stop) × Menge.',
      },
      {
        heading: 'Die 1-%-Regel',
        body: 'Riskiere pro Trade maximal 1 % (Anfänger) bis 2 % deines Kapitals. Bei 10.000 € Konto sind das 100 €. Die Formel für die Positionsgröße: Menge = Risikobetrag ÷ Abstand zum Stop. Beispiel: Konto 10.000 €, Risiko 1 % = 100 €. Einstieg 50 €, Stop 48 € → Abstand 2 € → Menge = 100 ÷ 2 = 50 Stück = 2.500 € Positionsgröße. Die Positionsgröße ist das ERGEBNIS der Rechnung, nie der Startpunkt.',
      },
      {
        heading: 'Warum so konservativ?',
        body: 'Verlustserien sind normal — auch gute Trader haben 5–8 Verlierer in Folge. Mit 1 % Risiko pro Trade verlierst du in so einer Serie 5–8 % des Kontos: ärgerlich, aber überlebbar. Mit 10 % Risiko pro Trade bist du nach derselben Serie um die Hälfte deines Kapitals erleichtert — und psychologisch erledigt. Trading ist ein Marathon: Wer überlebt, kann lernen. Wer sprintet, fliegt raus.',
      },
    ],
    quiz: [
      {
        q: 'Konto 10.000 €, Risiko 1 %, Einstieg 100 €, Stop-Loss 95 €. Wie viele Stück darfst du kaufen?',
        options: ['10 Stück', '20 Stück', '100 Stück', '2.000 Stück'],
        correct: 1,
        explanation: 'Risikobetrag 100 €. Abstand zum Stop: 5 €. Menge = 100 ÷ 5 = 20 Stück (= 2.000 € Positionsgröße).',
      },
      {
        q: 'Was bestimmt die Positionsgröße?',
        options: ['Wie überzeugt ich vom Trade bin', 'Risikobetrag geteilt durch Abstand zum Stop-Loss', 'Immer 10 % des Kontos', 'Je höher der mögliche Gewinn, desto größer die Position'],
        correct: 1,
        explanation: 'Positionsgröße ist reine Mathematik: Risikobetrag ÷ Stop-Abstand. Überzeugung ist kein Risikomanagement — die stärksten Überzeugungen produzieren die teuersten Fehler.',
      },
      {
        q: 'Warum maximal 1–2 % Risiko pro Trade?',
        options: ['Weil Gewinne sonst zu klein sind', 'Damit eine normale Verlustserie das Konto nicht ruiniert', 'Das ist eine gesetzliche Vorgabe', 'Damit man mehr Trades machen kann'],
        correct: 1,
        explanation: '5–8 Verlierer in Folge passieren jedem. Mit 1 % Risiko kostet das 5–8 % des Kontos. Mit 10 % Risiko wäre das Konto halbiert.',
      },
    ],
  },
  {
    id: 'risk-management',
    title: 'Risk-Management: Denken in Wahrscheinlichkeiten',
    icon: '🎲',
    minutes: 10,
    teaser: 'Chance-Risiko-Verhältnis, Erwartungswert — und warum die Trefferquote allein nichts aussagt.',
    sections: [
      {
        heading: 'Das Chance-Risiko-Verhältnis (CRV)',
        body: 'Bevor du einen Trade eingehst, kennst du zwei Zahlen: dein Risiko (Einstieg bis Stop) und deine realistische Chance (Einstieg bis Kursziel). Das Verhältnis daraus ist das CRV. Riskierst du 100 €, um realistisch 200 € zu gewinnen, ist dein CRV 1:2. Faustregel für Anfänger: Trades unter 1:1,5 gar nicht erst eingehen — die Mathematik arbeitet sonst gegen dich.',
      },
      {
        heading: 'Trefferquote × CRV = alles',
        body: 'Eine Trefferquote von 40 % klingt schlecht? Mit CRV 1:2 bist du damit profitabel: Von 10 Trades gewinnen 4 je 200 € (+800 €), 6 verlieren je 100 € (−600 €) → +200 €. Umgekehrt kann eine 70-%-Trefferquote ruinös sein, wenn die Verlierer dreimal so groß sind wie die Gewinner. Der Erwartungswert pro Trade = (Trefferquote × Ø-Gewinn) − (Verlustquote × Ø-Verlust). Nur diese Zahl zählt.',
      },
      {
        heading: 'Die Psycho-Fallen',
        body: 'Die drei teuersten Verhaltensmuster: (1) Revenge-Trading — nach einem Verlust sofort den nächsten Trade eröffnen, um es „zurückzuholen". (2) Gewinne früh mitnehmen, Verluste laufen lassen — genau falsch herum, das ruiniert dein CRV nachträglich. (3) Overtrading — handeln aus Langeweile statt wegen eines Setups. Dein Journal in dieser App erkennt alle drei Muster automatisch. Nimm die Warnungen ernst.',
      },
    ],
    quiz: [
      {
        q: 'Trefferquote 40 %, Ø-Gewinn 200 €, Ø-Verlust 100 €. Bist du profitabel?',
        options: ['Nein, unter 50 % Trefferquote verliert man immer', 'Ja: Erwartungswert +20 € pro Trade', 'Nur mit Hebel', 'Kann man nicht berechnen'],
        correct: 1,
        explanation: '(0,4 × 200) − (0,6 × 100) = 80 − 60 = +20 € pro Trade. Trefferquote allein sagt nichts — das Zusammenspiel mit dem CRV entscheidet.',
      },
      {
        q: 'Was ist Revenge-Trading?',
        options: ['Eine Short-Strategie', 'Direkt nach einem Verlust impulsiv neu einsteigen, um ihn zurückzuholen', 'Gegen den Trend handeln', 'Zwei Positionen gleichzeitig halten'],
        correct: 1,
        explanation: 'Nach einem Verlust ist das Urteilsvermögen nachweislich schlechter. Der „Rückhol-Trade" ist meist größer, schlechter geplant — und vergrößert den Schaden.',
      },
      {
        q: 'Welches CRV sollte ein Trade mindestens haben?',
        options: ['1:0,5 — Hauptsache hohe Trefferquote', 'Etwa 1:1,5 bis 1:2', 'Mindestens 1:10', 'CRV ist egal, wenn das Setup gut ist'],
        correct: 1,
        explanation: 'Ab ~1:1,5 verkraftet deine Strategie auch mittelmäßige Trefferquoten. Bei 1:10-Setups ist die Trefferquote meist so niedrig, dass es psychologisch kaum durchzuhalten ist.',
      },
    ],
  },
  {
    id: 'trend',
    title: 'Trend: Die Richtung des Marktes lesen',
    icon: '📈',
    minutes: 9,
    teaser: 'Hochs, Tiefs, gleitende Durchschnitte — und warum „the trend is your friend" stimmt.',
    sections: [
      {
        heading: 'Was ist ein Trend?',
        body: 'Ein Aufwärtstrend ist eine Serie höherer Hochs UND höherer Tiefs. Ein Abwärtstrend: tiefere Hochs und tiefere Tiefs. Klingt banal, aber die meisten Anfänger handeln dagegen — sie shorten steigende Märkte („zu teuer!") und kaufen fallende („so billig!"). Statistisch setzt sich ein bestehender Trend aber öfter fort, als dass er dreht. Mit dem Trend zu handeln heißt, den Rückenwind zu nutzen.',
      },
      {
        heading: 'Gleitende Durchschnitte als Kompass',
        body: 'Ein gleitender Durchschnitt (Moving Average, MA) glättet den Kurs: der MA50 zeigt den Durchschnitt der letzten 50 Kerzen. Einfache Lesart: Kurs über steigendem MA50 → Aufwärtstrend, Long-Setups suchen. Kurs unter fallendem MA50 → Abwärtstrend, Long-Trades meiden. Kreuzen sich kurzer und langer MA, wechselt oft das Regime. MAs sind keine Glaskugel — sie hinken dem Kurs hinterher — aber sie halten dich von der falschen Seite fern.',
      },
      {
        heading: 'Seitwärtsphasen: die Trader-Falle',
        body: 'Märkte trenden nur einen Teil der Zeit — oft laufen sie seitwärts in einer Spanne. In Seitwärtsphasen erzeugen Trendstrategien ein Fehlsignal nach dem anderen (Whipsaw). Erkennen: flache MAs, überlappende Kerzen, keine neuen Hochs/Tiefs. Die profitabelste Entscheidung ist dann oft: nichts tun. Kein Trade ist auch eine Position — und häufig die beste.',
      },
    ],
    quiz: [
      {
        q: 'Woran erkennst du einen Aufwärtstrend?',
        options: ['Der Kurs ist heute gestiegen', 'Höhere Hochs und höhere Tiefs in Serie', 'Der RSI ist über 50', 'Viele Leute reden darüber'],
        correct: 1,
        explanation: 'Die Struktur aus höheren Hochs UND höheren Tiefs ist die Definition. Ein einzelner grüner Tag ist Rauschen.',
      },
      {
        q: 'Der Kurs notiert deutlich unter dem fallenden MA50. Was folgt daraus für Anfänger?',
        options: ['Kaufen — das ist ein Schnäppchen', 'Long-Trades meiden: der Trend zeigt abwärts', 'Sofort All-in short gehen', 'Der MA50 ist bedeutungslos'],
        correct: 1,
        explanation: '„Billig" kann immer noch billiger werden. Gegen den Trend zu kaufen ist statistisch die schlechtere Wette. (All-in ist übrigens nie die Antwort — Positionsgröße!)',
      },
      {
        q: 'Was ist in einer Seitwärtsphase meist die beste Entscheidung?',
        options: ['Mehr Trades, um die Langeweile zu nutzen', 'Hebel erhöhen', 'Abwarten — kein Trade ist auch eine Position', 'Blind der letzten Bewegung folgen'],
        correct: 2,
        explanation: 'Seitwärtsmärkte produzieren Fehlsignale am Fließband. Kapital schonen und auf klare Verhältnisse warten schlägt Aktionismus.',
      },
    ],
  },
  {
    id: 'volumen',
    title: 'Volumen: Der Lügendetektor',
    icon: '📊',
    minutes: 7,
    teaser: 'Warum die gehandelte Menge verrät, ob eine Bewegung echt ist.',
    sections: [
      {
        heading: 'Was Volumen bedeutet',
        body: 'Volumen ist die gehandelte Menge pro Zeitraum — wie viele Stücke/Coins den Besitzer gewechselt haben. Es zeigt, wie viel Überzeugung hinter einer Kursbewegung steckt. Ein Ausbruch auf hohem Volumen bedeutet: Viele Marktteilnehmer stimmen mit echtem Geld ab. Derselbe Ausbruch auf Mini-Volumen ist oft nur Rauschen — und fällt in sich zusammen, sobald ein paar Verkäufer auftauchen.',
      },
      {
        heading: 'Volumen bestätigt (oder entlarvt) Bewegungen',
        body: 'Gesunder Aufwärtstrend: steigende Kurse auf steigendem Volumen, Rücksetzer auf dünnem Volumen — Käufer dominieren, Verkäufer sind zögerlich. Warnsignal: neue Hochs auf immer DÜNNEREM Volumen — der Trend läuft auf Reserve. Kapitulation: extreme Abverkäufe auf Rekordvolumen markieren manchmal das Tief, weil dort die letzten Panikverkäufer aussteigen. Volumen ersetzt kein Setup, aber es trennt glaubwürdige Bewegungen von Fassaden.',
      },
      {
        heading: 'Praktische Regeln',
        body: 'Regel 1: Ausbrüche aus Spannen nur ernst nehmen, wenn das Volumen deutlich über dem Durchschnitt liegt (z. B. 1,5× des 20-Perioden-Schnitts). Regel 2: In illiquiden Märkten (dünnes Volumen, weite Spreads) sind Kurse leicht manipulierbar — Finger weg, besonders bei kleinen Coins. Regel 3: Volumen-Spikes ohne Nachrichtenlage sind ein Grund für erhöhte Vorsicht, nicht für FOMO.',
      },
    ],
    quiz: [
      {
        q: 'Ein Kurs bricht über einen Widerstand aus — auf sehr niedrigem Volumen. Wie bewertest du das?',
        options: ['Stark bullisch, sofort kaufen', 'Skeptisch: ohne Volumen fehlt dem Ausbruch die Überzeugung', 'Volumen ist bei Ausbrüchen egal', 'Bärisch — niedriges Volumen heißt fallende Kurse'],
        correct: 1,
        explanation: 'Ausbrüche ohne Volumen scheitern überdurchschnittlich oft („Fakeout"). Echte Ausbrüche werden von echtem Geld getragen.',
      },
      {
        q: 'Was signalisieren neue Hochs bei immer dünnerem Volumen?',
        options: ['Der Trend wird stärker', 'Nichts Besonderes', 'Der Trend verliert an Substanz — Vorsicht', 'Ein garantierter Crash'],
        correct: 2,
        explanation: 'Immer weniger Käufer tragen die Bewegung. Das ist kein Verkaufssignal per se, aber ein Grund, Stops nachzuziehen und keine neuen Longs zu jagen.',
      },
      {
        q: 'Warum sind illiquide Märkte für Anfänger gefährlich?',
        options: ['Die Gebühren sind höher', 'Kurse sind dort leicht zu manipulieren und Spreads fressen die Gewinne', 'Man darf dort nur short gehen', 'Sie sind es nicht'],
        correct: 1,
        explanation: 'Bei dünnem Volumen bewegen schon kleine Orders den Kurs — ideal für Manipulation (Pump & Dump), fatal für Anfänger.',
      },
    ],
  },
  {
    id: 'hebel',
    title: 'Hebel: Warum 70 % der Anfänger verlieren',
    icon: '⚠️',
    minutes: 8,
    teaser: 'Was Leverage wirklich macht — mit deinem Konto und mit deinem Kopf.',
    sections: [
      {
        heading: 'Wie Hebel funktioniert',
        body: 'Hebel (Leverage) heißt: Du bewegst mehr Kapital, als du besitzt. Mit 10× Hebel steuerst du mit 1.000 € eine Position von 10.000 €. Eine Kursbewegung von +1 % bringt +10 % auf deinen Einsatz — und −1 % kostet −10 %. Der Hebel verstärkt ALLES: Gewinne, Verluste, Gebühren und vor allem deine Fehler. Er verändert nicht die Qualität deiner Entscheidungen, nur deren Wucht.',
      },
      {
        heading: 'Die Liquidation',
        body: 'Bei gehebelten Positionen gibt es einen Kurs, an dem deine Sicherheit (Margin) aufgebraucht ist — dort wird die Position zwangsweise geschlossen: die Liquidation. Bei 10× Hebel reicht dafür eine Bewegung von etwa 10 % gegen dich, bei 50× etwa 2 %. Krypto schwankt an normalen Tagen 3–5 %. Rechne selbst. Deshalb verlieren laut Aufsichtsbehörden 70–80 % der Privatanleger mit CFDs und gehebelten Produkten Geld — das steht als Pflichtwarnung auf jeder Broker-Seite.',
      },
      {
        heading: 'Der psychologische Hebel',
        body: 'Der unterschätzte Effekt: Hebel beschleunigt deine Emotionen. Wenn jede kleine Kursbewegung zweistellige Prozentzahlen auf dein Konto schreibt, triffst du keine ruhigen Entscheidungen mehr — du reagierst nur noch. Panikverkäufe am Tief, FOMO-Käufe am Hoch. Die Regel für Anfänger ist einfach: Hebel 1 (kein Hebel), bis du über Monate nachweislich profitabel bist. Dieser Simulator arbeitet bewusst ohne Hebel — erst das Handwerk, dann (vielleicht, irgendwann) der Verstärker.',
      },
    ],
    quiz: [
      {
        q: 'Du handelst mit 10× Hebel. Der Kurs fällt um 5 %. Was passiert mit deinem Einsatz?',
        options: ['−5 %', '−10 %', '−50 %', 'Nichts, der Hebel schützt'],
        correct: 2,
        explanation: 'Hebel multipliziert die Kursbewegung: 5 % × 10 = 50 % Verlust auf deine Margin. Noch 5 % weiter und du bist liquidiert.',
      },
      {
        q: 'Bei welchem Hebel wird eine 2-%-Bewegung gegen dich ungefähr zur Liquidation?',
        options: ['2×', '5×', '10×', '50×'],
        correct: 3,
        explanation: 'Grob gilt: Liquidation bei ~100 % ÷ Hebel Bewegung. Bei 50× reichen ~2 % — das ist bei Krypto Alltagsrauschen.',
      },
      {
        q: 'Was ist die sinnvollste Hebel-Regel für Anfänger?',
        options: ['Kleiner Hebel (5×) ist okay zum Lernen', 'Ohne Hebel handeln, bis man über Monate profitabel ist', 'Hebel nur bei sicheren Setups', 'Hoher Hebel, aber kleine Positionen'],
        correct: 1,
        explanation: '„Sichere Setups" existieren nicht, und auch 5× verwandelt normale Schwankungen in Kontostress. Erst konstant profitabel ohne Hebel — dann neu nachdenken.',
      },
    ],
  },
];
