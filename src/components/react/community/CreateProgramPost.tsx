import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Props {
  programSlug: string;
  onPostCreated: () => void;
}

export function CreateProgramPost({ programSlug, onPostCreated }: Props) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    });

    if (!error) {
      setContent('');
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
      <div className="flex justify-end mt-3">
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
