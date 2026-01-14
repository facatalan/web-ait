import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CreateProgramPost } from './CreateProgramPost';
import { PostCard } from './PostCard';

interface Author {
  username: string;
  full_name: string;
  avatar_url: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface Props {
  programSlug: string;
  programTitle: string;
}

export function ProgramFeed({ programSlug, programTitle }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccessAndLoad();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('program-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `program_slug=eq.${programSlug}`,
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [programSlug]);

  async function checkAccessAndLoad() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    // Verificar acceso al programa
    const { data: access } = await supabase.rpc('has_program_access', {
      p_user_id: user.id,
      p_program_slug: programSlug,
    });

    if (access) {
      setHasAccess(true);
      await loadPosts();
    }

    setLoading(false);
  }

  async function loadPosts() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        author_id,
        author:profiles!author_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('program_slug', programSlug)
      .order('created_at', { ascending: false });

    if (!postsData) return;

    // Obtener conteos de likes y comentarios
    const postsWithCounts = await Promise.all(
      postsData.map(async (post) => {
        const [likesResult, commentsResult, userLikedResult] = await Promise.all([
          supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
          supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
          user
            ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        return {
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          author_id: post.author_id,
          author: Array.isArray(post.author) ? post.author[0] : post.author,
          likes_count: likesResult.count || 0,
          comments_count: commentsResult.count || 0,
          user_has_liked: !!userLikedResult.data,
        };
      })
    );

    setPosts(postsWithCounts);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Inicia sesion para participar</h3>
        <p className="text-gray-400 mb-6">Necesitas una cuenta para ver y participar en la comunidad</p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-semibold rounded-lg transition-colors"
        >
          Iniciar sesion
        </a>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-accent-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Comunidad exclusiva</h3>
        <p className="text-gray-400 mb-6">La comunidad esta disponible para estudiantes del programa</p>
        <a
          href={`/programas/${programSlug}`}
          className="inline-block px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Ver programa
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Comunidad</h1>
        <p className="text-gray-400">{programTitle}</p>
      </div>

      <CreateProgramPost programSlug={programSlug} onPostCreated={loadPosts} />

      {posts.length === 0 ? (
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Sin publicaciones aun</h3>
          <p className="text-gray-500">Se el primero en compartir algo con la comunidad</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onUpdate={loadPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
