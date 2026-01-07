import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

type FormState = 'loading' | 'ready' | 'success' | 'expired';

export function ResetPasswordForm() {
  const [formState, setFormState] = useState<FormState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase automaticamente procesa los tokens de la URL
    // y dispara onAuthStateChange con evento PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setFormState('ready');
        }
      }
    );

    // Verificar si ya hay una sesion activa (token ya procesado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setFormState('ready');
      } else {
        // Dar tiempo para que Supabase procese los tokens de la URL
        const timeout = setTimeout(() => {
          setFormState((current) => current === 'loading' ? 'expired' : current);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setFormState('success');

      // Redirigir despues de mostrar mensaje de exito
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contrasena');
    } finally {
      setLoading(false);
    }
  };

  // Estado: Cargando
  if (formState === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Verificando enlace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Link expirado o invalido
  if (formState === 'expired') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Enlace invalido o expirado</h3>
            <p className="text-gray-400 mb-6">
              El enlace de recuperacion ha expirado o ya fue utilizado.
              Solicita uno nuevo.
            </p>
            <a
              href="/forgot-password"
              className="inline-block px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white
                       font-semibold rounded-lg transition-colors"
            >
              Solicitar nuevo enlace
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Exito
  if (formState === 'success') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Contrasena actualizada</h3>
            <p className="text-gray-400">
              Tu contrasena ha sido cambiada exitosamente. Redirigiendo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Formulario listo
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-2">
              Nueva contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg
                       text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue
                       transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-400 mb-2">
              Confirmar contrasena
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg
                       text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue
                       transition-colors"
              placeholder="••••••••"
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
            {loading ? 'Actualizando...' : 'Actualizar contrasena'}
          </button>
        </form>
      </div>
    </div>
  );
}
