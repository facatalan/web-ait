import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../../lib/supabase';
import { VideoPlayer } from './VideoPlayer';

interface Props {
  programSlug: string;
  courseSlug: string;
  lessonSlug: string;
  videoId?: string;
  isFree: boolean;
  children: ReactNode;
}

type AccessState = 'loading' | 'granted' | 'denied' | 'login_required';

export function ProtectedProgramLesson({ programSlug, courseSlug, lessonSlug, videoId, isFree, children }: Props) {
  const [access, setAccess] = useState<AccessState>('loading');

  useEffect(() => {
    checkAccess();
  }, [programSlug, isFree]);

  async function checkAccess() {
    // Lecciones gratis siempre tienen acceso
    if (isFree) {
      setAccess('granted');
      return;
    }

    // Verificar si hay usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setAccess('login_required');
      return;
    }

    // Verificar acceso al programa
    const { data: hasAccess } = await supabase.rpc('has_program_access', {
      p_user_id: user.id,
      p_program_slug: programSlug,
    });

    setAccess(hasAccess ? 'granted' : 'denied');
  }

  if (access === 'loading') {
    return (
      <div className="aspect-video bg-dark-800 border border-white/10 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (access === 'login_required') {
    return (
      <div className="aspect-video bg-dark-800 border border-white/10 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Inicia sesion para continuar</h3>
          <p className="text-gray-400 mb-6">Necesitas una cuenta para acceder a esta leccion</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-semibold rounded-lg transition-colors"
          >
            Iniciar sesion
          </a>
        </div>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="aspect-video bg-dark-800 border border-white/10 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-accent-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Contenido Premium</h3>
          <p className="text-gray-400 mb-6">
            Esta leccion requiere acceso al programa completo
          </p>
          <a
            href={`/programas/${programSlug}`}
            className="inline-block px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Ver programa
          </a>
        </div>
      </div>
    );
  }

  // access === 'granted'
  return (
    <>
      <div className="mb-8">
        <VideoPlayer
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          playbackId={videoId}
        />
      </div>
      {children}
    </>
  );
}
