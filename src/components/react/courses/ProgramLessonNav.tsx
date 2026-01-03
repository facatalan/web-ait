import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Lesson {
  slug: string;
  title: string;
  order: number;
}

interface Props {
  programSlug: string;
  programTitle: string;
  courseSlug: string;
  courseTitle: string;
  weekNumber: number;
  weekTitle: string;
  currentLessonSlug: string;
  lessons: Lesson[];
}

interface ProgressMap {
  [lessonSlug: string]: {
    completed: boolean;
    progressSeconds: number;
  };
}

export function ProgramLessonNav({
  programSlug,
  programTitle,
  courseSlug,
  courseTitle,
  weekNumber,
  weekTitle,
  currentLessonSlug,
  lessons,
}: Props) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [courseSlug]);

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_slug, completed, progress_seconds')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug);

    if (data) {
      const progressMap: ProgressMap = {};
      data.forEach((item) => {
        progressMap[item.lesson_slug] = {
          completed: item.completed,
          progressSeconds: item.progress_seconds,
        };
      });
      setProgress(progressMap);
    }
  }

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="sticky top-24 bg-dark-800 border border-white/10 rounded-2xl p-4">
      {/* Program breadcrumb */}
      <a
        href={`/programas/${programSlug}`}
        className="text-sm text-gray-400 hover:text-white mb-2 block"
      >
        ← {programTitle}
      </a>

      {/* Week badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 bg-accent-purple/10 text-accent-purple text-xs rounded-full">
          Semana {weekNumber}
        </span>
      </div>

      <h3 className="text-white font-semibold mb-2 truncate">{courseTitle}</h3>

      {/* Community link */}
      <a
        href={`/programas/${programSlug}/comunidad`}
        className="flex items-center gap-2 px-3 py-2 mb-3 text-sm text-gray-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        Comunidad
      </a>

      {/* Progress bar */}
      {isLoggedIn && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{completedCount} de {totalLessons} completadas</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <nav className="space-y-1">
        {lessons.map((lesson, i) => {
          const isActive = lesson.slug === currentLessonSlug;
          const lessonProgress = progress[lesson.slug];
          const isCompleted = lessonProgress?.completed;

          return (
            <a
              key={lesson.slug}
              href={`/programas/${programSlug}/${courseSlug}/${lesson.slug}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                    ? 'bg-accent-blue text-white'
                    : 'bg-dark-700'
              }`}>
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className="truncate">{lesson.title}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
