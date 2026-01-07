import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Revisa tu email</h3>
            <p className="text-gray-400 mb-4">
              Hemos enviado un enlace de recuperacion a <strong className="text-white">{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              El enlace expira en 1 hora. Si no lo ves, revisa tu carpeta de spam.
            </p>
            <a
              href="/login"
              className="inline-block mt-6 text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              Volver al inicio de sesion
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg
                       text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue
                       transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-blue hover:bg-accent-blue/80 text-white font-semibold
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Volver al inicio de sesion
          </a>
        </div>
      </div>
    </div>
  );
}
