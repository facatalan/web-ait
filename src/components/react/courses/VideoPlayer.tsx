import { useEffect, useState, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { supabase } from '../../../lib/supabase';

interface Props {
  courseSlug: string;
  lessonSlug: string;
  playbackId?: string;
  onComplete?: () => void;
}

export function VideoPlayer({ courseSlug, lessonSlug, playbackId, onComplete }: Props) {
  const [startTime, setStartTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastSavedTime = useRef(0);

  useEffect(() => {
    loadProgress();
  }, [courseSlug, lessonSlug]);

  async function loadProgress() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('lesson_progress')
        .select('progress_seconds')
        .eq('user_id', user.id)
        .eq('course_slug', courseSlug)
        .eq('lesson_slug', lessonSlug)
        .single();

      if (data?.progress_seconds) {
        setStartTime(data.progress_seconds);
      }
    }

    setLoading(false);
  }

  async function handleTimeUpdate(currentTime: number) {
    // Guardar progreso cada 10 segundos
    if (currentTime - lastSavedTime.current < 10) return;
    lastSavedTime.current = currentTime;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      progress_seconds: Math.floor(currentTime),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,course_slug,lesson_slug'
    });
  }

  async function handleEnded() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,course_slug,lesson_slug'
    });

    onComplete?.();
  }

  // Sin playbackId, mostrar placeholder
  if (!playbackId) {
    return (
      <div className="aspect-video bg-dark-800 border border-white/10 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">Video proximamente</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="aspect-video bg-dark-800 border border-white/10 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-gray-500">Cargando video...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-black not-prose">
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        startTime={startTime}
        accentColor="#3b82f6"
        style={{
          width: '100%',
          height: '100%',
        }}
        onTimeUpdate={(e: any) => handleTimeUpdate(e.target.currentTime)}
        onEnded={handleEnded}
      />
    </div>
  );
}
