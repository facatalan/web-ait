import { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';

function UserMenuContent() {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-dark-700 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="px-5 py-2.5 bg-white/10 border border-white/30 text-white text-sm
                 font-medium rounded-full hover:bg-white/20 hover:border-white/50 transition-all"
      >
        Ingresar
      </a>
    );
  }

  const initial = user.email?.[0]?.toUpperCase() || '?';

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center
                 text-white font-semibold hover:ring-2 hover:ring-accent-purple/50 transition-all"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-white/10
                      rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm text-white truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-dark-700
                     hover:text-white transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}

export function UserMenu() {
  return (
    <AuthProvider>
      <UserMenuContent />
    </AuthProvider>
  );
}
