import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { PageHeader } from '../components/PageHeader';
import { apiPost } from '../lib/api';
import { LESSONS } from '../data/lessons';

export function LessonPage() {
  const { id } = useParams();
  const lesson = LESSONS.find((l) => l.id === id);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl">
        <GlassCard className="px-6 py-10 text-center">
          <p className="text-ink-dim">Lektion nicht gefunden.</p>
          <Link to="/lernen" className="mt-3 inline-block text-violet-soft hover:underline">← Zurück zum Lernbereich</Link>
        </GlassCard>
      </div>
    );
  }

  const allAnswered = lesson.quiz.every((_, i) => answers[i] != null);
  const score = lesson.quiz.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);

  async function submitQuiz() {
    setSubmitted(true);
    try {
      await apiPost(`/api/lessons/${lesson!.id}/complete`, { score, total: lesson!.quiz.length });
      setSaved(true);
    } catch {
      // Ergebnis wird lokal angezeigt, auch wenn das Speichern fehlschlägt
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/lernen" className="label mb-4 inline-block text-violet-soft transition-colors hover:text-ink">
        ← Lernbereich
      </Link>
      <PageHeader title={`${lesson.icon} ${lesson.title}`} subtitle={`≈ ${lesson.minutes} Minuten Lesezeit`} />

      <div className="space-y-5">
        {lesson.sections.map((s, i) => (
          <GlassCard key={i} className="px-7 py-6" delay={i * 0.08}>
            <h2 className="text-lg font-bold text-ink">
              <span className="num mr-2 text-violet-soft">{String(i + 1).padStart(2, '0')}</span>
              {s.heading}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-dim">{s.body}</p>
          </GlassCard>
        ))}
      </div>

      <div className="label mt-10 mb-4">Quiz — {lesson.quiz.length} Fragen</div>
      <div className="space-y-5">
        {lesson.quiz.map((q, qi) => (
          <GlassCard key={qi} className="px-7 py-6" delay={0.1}>
            <p className="font-semibold text-ink">
              <span className="num mr-2 text-violet-soft">F{qi + 1}</span>
              {q.q}
            </p>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = q.correct === oi;
                let cls = 'border-white/8 bg-white/[0.02] text-ink-dim hover:border-violet-glow/40 hover:text-ink';
                if (!submitted && chosen) cls = 'border-violet-glow/60 bg-violet-glow/15 text-violet-soft shadow-glow-violet';
                if (submitted && isCorrect) cls = 'border-profit/60 bg-profit/10 text-profit';
                if (submitted && chosen && !isCorrect) cls = 'border-loss/60 bg-loss/10 text-loss';
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${cls}`}
                  >
                    <span className="num mr-2 opacity-60">{String.fromCharCode(65 + oi)}</span>
                    {opt}
                    {submitted && isCorrect && <span className="float-right">✓</span>}
                    {submitted && chosen && !isCorrect && <span className="float-right">✗</span>}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 rounded-xl border border-violet-glow/25 bg-violet-glow/5 px-4 py-3 text-xs leading-relaxed text-ink-dim"
              >
                💡 {q.explanation}
              </motion.p>
            )}
          </GlassCard>
        ))}
      </div>

      {!submitted ? (
        <motion.button
          whileHover={{ scale: allAnswered ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          disabled={!allAnswered}
          onClick={submitQuiz}
          className="neon-btn mt-6 w-full border border-violet-glow/60 bg-violet-glow/15 text-base font-bold text-violet-soft shadow-glow-violet disabled:cursor-not-allowed disabled:opacity-40"
        >
          {allAnswered ? 'Quiz auswerten' : `Noch ${lesson.quiz.length - Object.keys(answers).length} Frage(n) offen`}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glass mt-6 px-7 py-6 text-center ${score === lesson.quiz.length ? 'shadow-glow-green' : 'shadow-glow-violet'}`}
        >
          <div className="label">Dein Ergebnis</div>
          <div className={`mt-2 text-4xl font-extrabold ${score === lesson.quiz.length ? 'text-profit' : 'text-violet-soft'}`}>
            {score} / {lesson.quiz.length}
          </div>
          <p className="mt-2 text-sm text-ink-dim">
            {score === lesson.quiz.length
              ? 'Perfekt! Du hast das Konzept verstanden.'
              : 'Lies dir die Erklärungen zu den falschen Antworten durch — genau da liegt der Lerneffekt.'}
            {saved && ' Fortschritt gespeichert.'}
          </p>
          <Link to="/lernen" className="mt-4 inline-block text-sm text-violet-soft hover:underline">
            ← Zurück zur Übersicht
          </Link>
        </motion.div>
      )}
    </div>
  );
}
