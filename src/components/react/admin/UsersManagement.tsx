import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../../lib/supabase';

// Admin emails configuration
const ADMIN_EMAILS = [
  'felipe@ai-thinking.io',
  'felipe@neuroboost.ai',
  'contacto@neuroboost.ai',
  'facatalan@gmail.com'
];

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface Program {
  id: string;
  slug: string;
  title: string;
}

interface UserAccess {
  user_id: string;
  program_id: string;
  granted_at: string;
}

interface UserWithAccess extends User {
  programs: Program[];
}

export function UsersManagement() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithAccess[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [isAddingAccess, setIsAddingAccess] = useState(false);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load all programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('id, slug, title')
        .eq('is_active', true)
        .order('title');

      if (programsError) throw programsError;
      setAllPrograms(programsData || []);

      // Load all users with their programs using RPC function
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users_with_programs');

      if (usersError) throw usersError;

      // Transform data
      const usersWithAccess: UserWithAccess[] = (usersData || []).map((user: any) => ({
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
        programs: user.programs || []
      }));

      setUsers(usersWithAccess);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async () => {
    if (!selectedUser || !selectedProgram) return;

    setIsAddingAccess(true);
    setError('');

    try {
      const { error } = await supabase
        .from('user_programs')
        .insert({
          user_id: selectedUser,
          program_id: selectedProgram,
          granted_at: new Date().toISOString()
        });

      if (error) throw error;

      // Reload data
      await loadData();
      setSelectedUser(null);
      setSelectedProgram('');
    } catch (err: any) {
      console.error('Error granting access:', err);
      if (err.code === '23505') {
        setError('El usuario ya tiene acceso a este programa');
      } else {
        setError('Error al otorgar acceso');
      }
    } finally {
      setIsAddingAccess(false);
    }
  };

  const revokeAccess = async (userId: string, programId: string) => {
    if (!confirm('¿Estás seguro de que quieres revocar este acceso?')) return;

    setError('');

    try {
      const { error } = await supabase
        .from('user_programs')
        .delete()
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (error) throw error;

      // Reload data
      await loadData();
    } catch (err) {
      console.error('Error revoking access:', err);
      setError('Error al revocar acceso');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">Cargando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Acceso Denegado</h2>
        <p className="text-white/60">
          No tienes permisos para acceder al panel de administración.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Add Access Section */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Otorgar Acceso a Programa</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-white/80 mb-2">
              Usuario
            </label>
            <select
              id="user-select"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue/50"
            >
              <option value="">Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="program-select" className="block text-sm font-medium text-white/80 mb-2">
              Programa
            </label>
            <select
              id="program-select"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue/50"
            >
              <option value="">Selecciona un programa</option>
              {allPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={grantAccess}
              disabled={!selectedUser || !selectedProgram || isAddingAccess}
              className="w-full px-6 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingAccess ? 'Otorgando...' : 'Otorgar Acceso'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            Usuarios Registrados
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            No hay usuarios registrados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Programas con Acceso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {user.full_name || 'Sin nombre'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/60">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/60">
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.programs.length === 0 ? (
                        <span className="text-sm text-white/40 italic">Sin acceso a programas</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.programs.map((program) => (
                            <div
                              key={program.id}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 rounded-full text-sm text-accent-blue"
                            >
                              <span>{program.title}</span>
                              <button
                                onClick={() => revokeAccess(user.id, program.id)}
                                className="hover:text-red-400 transition-colors"
                                title="Revocar acceso"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
