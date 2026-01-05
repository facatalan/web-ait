import { useState, type FormEvent } from 'react';

interface Props {
  documentSlug: string;
  documentTitle: string;
  documentUrl: string;
  buttonText?: string;
  source?: string;
}

export function LeadCaptureForm({
  documentSlug,
  documentTitle,
  documentUrl,
  buttonText = "Descargar gratis",
  source
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-lead-magnet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          documentSlug,
          documentTitle,
          documentUrl,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-dark-800 border border-green-500/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          ¡Revisa tu correo!
        </h3>
        <p className="text-gray-400">
          Te hemos enviado <strong className="text-white">{documentTitle}</strong> a tu email.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          Si no lo ves, revisa tu carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={status === 'loading'}
          className="flex-1 px-4 py-3 bg-dark-900 border border-white/10 rounded-lg
                     text-white placeholder-gray-500
                     focus:outline-none focus:border-accent-blue
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple
                     text-white font-semibold rounded-lg
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-opacity whitespace-nowrap"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando...
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm">
          {errorMessage || 'Ocurrió un error. Por favor intenta de nuevo.'}
        </p>
      )}

      <p className="text-gray-500 text-xs text-center">
        Te enviaremos el documento a tu correo. Sin spam.
      </p>
    </form>
  );
}
