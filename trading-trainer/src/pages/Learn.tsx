import { Link } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { PageHeader } from '../components/PageHeader';
import { usePolling } from '../hooks/usePolling';
import type { LessonProgress } from '../lib/api';
import { LESSONS } from '../data/lessons';

export function Learn() {
  const { data } = usePolling<{ progress: Record<string, LessonProgress> }>('/api/lessons/progress', 30000);
  const progress = data?.progress ?? {};
  const done = LESSONS.filter((l) => progress[l.id]).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Lernbereich"
        subtitle={`Grundlagen vor Gewinnen · ${done} von ${LESSONS.length} Lektionen abgeschlossen`}
      />

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-glow to-profit shadow-glow-violet transition-all duration-700"
          style={{ width: `${(done / LESSONS.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {LESSONS.map((lesson, i) => {
          const p = progress[lesson.id];
          const perfect = p && p.score === p.total;
          return (
            <Link key={lesson.id} to={`/lernen/${lesson.id}`}>
              <GlassCard hover delay={i * 0.06} className="flex h-full flex-col px-6 py-6" glow={perfect ? 'green' : 'none'}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{lesson.icon}</span>
                  {p ? (
                    <span
                      className={`num rounded-md border px-2 py-1 text-[10px] font-bold ${
                        perfect
                          ? 'border-profit/40 bg-profit/10 text-profit'
                          : 'border-violet-glow/40 bg-violet-glow/10 text-violet-soft'
                      }`}
                    >
                      ✓ {p.score}/{p.total} PUNKTE
                    </span>
                  ) : (
                    <span className="num rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-ink-faint">
                      OFFEN
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{lesson.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-dim">{lesson.teaser}</p>
                <div className="label mt-4">≈ {lesson.minutes} Min · Quiz mit {lesson.quiz.length} Fragen</div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
