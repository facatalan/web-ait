import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Props {
  programSlug: string;
  onPostCreated: () => void;
}

type PostType = 'post' | 'recording' | 'announcement';

export function CreateProgramPost({ programSlug, onPostCreated }: Props) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('post');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('posts').insert({
      program_slug: programSlug,
      author_id: user.id,
      content: content.trim(),
      post_type: postType,
    });

    if (!error) {
      setContent('');
      setPostType('post');
      setShowTypeSelector(false);
      onPostCreated();
    }

    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-800 border border-white/10 rounded-2xl p-4 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Comparte algo con la comunidad..."
        className="w-full bg-dark-700 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-accent-blue/50 transition-colors"
        rows={3}
      />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              postType !== 'post'
                ? 'bg-accent-purple/20 text-accent-purple'
                : 'bg-dark-700 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {postType === 'post' && 'Tipo'}
            {postType === 'recording' && 'Grabación'}
            {postType === 'announcement' && 'Anuncio'}
          </button>

          {showTypeSelector && (
            <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setPostType('post'); setShowTypeSelector(false); }}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  postType === 'post' ? 'bg-dark-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => { setPostType('recording'); setShowTypeSelector(false); }}
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                  postType === 'recording' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" />
                </svg>
                Grabación
              </button>
              <button
                type="button"
                onClick={() => { setPostType('announcement'); setShowTypeSelector(false); }}
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                  postType === 'announcement' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Anuncio
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}
