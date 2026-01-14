import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Author {
  username: string;
  full_name: string;
  avatar_url: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: Author;
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
  post: Post;
  currentUserId?: string;
  onUpdate: () => void;
}

export function PostCard({ post, currentUserId, onUpdate }: Props) {
  const [isLiking, setIsLiking] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(post.user_has_liked);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(post.likes_count);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  // Estados para editar/eliminar
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === post.author_id;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  async function handleLike() {
    if (!currentUserId || isLiking) return;

    setIsLiking(true);

    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticLikesCount(wasLiked ? optimisticLikesCount - 1 : optimisticLikesCount + 1);

    if (wasLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('likes')
        .insert({ post_id: post.id, user_id: currentUserId });
    }

    setIsLiking(false);
  }

  async function toggleComments() {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    setLoadingComments(true);

    const { data } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        author:profiles!author_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(
        data.map((c) => ({
          ...c,
          author: Array.isArray(c.author) ? c.author[0] : c.author,
        }))
      );
    }

    setLoadingComments(false);
  }

  async function handleEdit() {
    if (!editContent.trim() || isUpdating) return;

    setIsUpdating(true);

    const { error } = await supabase
      .from('posts')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', post.id);

    if (!error) {
      setIsEditing(false);
      onUpdate();
    }

    setIsUpdating(false);
  }

  async function handleDelete() {
    if (isDeleting) return;

    setIsDeleting(true);

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    if (!error) {
      onUpdate();
    }

    setIsDeleting(false);
    setShowDeleteConfirm(false);
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId || isSubmittingComment) return;

    setIsSubmittingComment(true);

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        author_id: currentUserId,
        content: newComment.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        author:profiles!author_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (!error && data) {
      const newCommentData = {
        ...data,
        author: Array.isArray(data.author) ? data.author[0] : data.author,
      };
      setComments([...comments, newCommentData]);
      setCommentsCount(commentsCount + 1);
      setNewComment('');
    }

    setIsSubmittingComment(false);
  }

  const displayName = post.author.full_name || post.author.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-dark-800 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {post.author.avatar_url ? (
          <img
            src={post.author.avatar_url}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{displayName}</span>
            <span className="text-gray-500 text-sm">@{post.author.username}</span>
          </div>
          <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
        </div>

        {/* Menú de opciones para el autor */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-dark-700 border border-white/10 rounded-lg shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/10 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-dark-700 border border-white/10 rounded-xl p-3 text-gray-300 resize-none focus:outline-none focus:border-accent-blue/50 transition-colors"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEdit}
              disabled={!editContent.trim() || isUpdating}
              className="px-3 py-1.5 text-sm bg-accent-blue hover:bg-accent-blue/80 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isUpdating ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 whitespace-pre-wrap mb-4">{post.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 text-gray-500">
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          className={`flex items-center gap-2 transition-colors ${
            optimisticLiked
              ? 'text-red-500'
              : 'hover:text-red-500 disabled:hover:text-gray-500'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={optimisticLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm">{optimisticLikesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className={`flex items-center gap-2 transition-colors hover:text-accent-blue ${
            showComments ? 'text-accent-blue' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">{commentsCount}</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Comments list */}
              {comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {comments.map((comment) => {
                    const commentDisplayName = comment.author.full_name || comment.author.username;
                    const commentInitials = commentDisplayName.slice(0, 2).toUpperCase();

                    return (
                      <div key={comment.id} className="flex gap-3">
                        {comment.author.avatar_url ? (
                          <img
                            src={comment.author.avatar_url}
                            alt={commentDisplayName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {commentInitials}
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <div className="bg-dark-700 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{commentDisplayName}</span>
                              <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-300">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* New comment form */}
              {currentUserId && (
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-grow bg-dark-700 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {isSubmittingComment ? '...' : 'Enviar'}
                  </button>
                </form>
              )}

              {!currentUserId && (
                <p className="text-sm text-gray-500 text-center py-2">
                  <a href="/login" className="text-accent-blue hover:underline">Inicia sesion</a> para comentar
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Eliminar publicacion</h3>
            <p className="text-gray-400 mb-4">¿Estas seguro? Esta accion no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
