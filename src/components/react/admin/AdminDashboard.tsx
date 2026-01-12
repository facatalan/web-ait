import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../../lib/supabase';

// Admin emails configuration - add authorized admin emails here
const ADMIN_EMAILS = [
  'felipe@ai-thinking.io',
  'felipe@neuroboost.ai',
  'contacto@neuroboost.ai',
  'facatalan@gmail.com'
  // Add more admin emails here
];

interface Program {
  id: string;
  slug: string;
  title: string;
}

interface StudentProgress {
  user_id: string;
  full_name: string;
  email: string;
  granted_at: string;
  completed_count: number;
  last_activity: string | null;
}

interface LessonsData {
  count: number;
  courses: string[];
}

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  // Load programs on mount
  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        loadPrograms();
      } else {
        setLoading(false);
      }
    }
  }, [isAdmin, authLoading]);

  // Load students when program is selected
  useEffect(() => {
    if (selectedProgram) {
      loadProgramData(selectedProgram);
    }
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, slug, title')
        .eq('is_active', true)
        .order('title');

      if (error) throw error;

      setPrograms(data || []);

      // Auto-select first program
      if (data && data.length > 0) {
        setSelectedProgram(data[0].slug);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading programs:', err);
      setError('Error al cargar los programas');
      setLoading(false);
    }
  };

  const loadProgramData = async (programSlug: string) => {
    setLoading(true);
    setError('');

    try {
      // Load lesson count from API
      const lessonsResponse = await fetch(`/api/programs/${programSlug}/lessons-count`);
      if (!lessonsResponse.ok) throw new Error('Failed to load lesson count');
      const lessonsData: LessonsData = await lessonsResponse.json();
      setTotalLessons(lessonsData.count);

      // Load student progress from RPC
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_program_progress', {
          p_program_slug: programSlug
        });

      if (progressError) throw progressError;

      setStudents(progressData || []);
    } catch (err) {
      console.error('Error loading program data:', err);
      setError('Error al cargar los datos del programa');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculatePercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">Cargando...</div>
      </div>
    );
  }

  // Show unauthorized message if not admin
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
      {/* Program Selector */}
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
        <label htmlFor="program-select" className="block text-sm font-medium text-white/80 mb-2">
          Selecciona un programa
        </label>
        <select
          id="program-select"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-blue/50"
        >
          {programs.map((program) => (
            <option key={program.id} value={program.slug}>
              {program.title}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Students Table */}
      {selectedProgram && !loading && (
        <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Progreso de Estudiantes
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {students.length} estudiante{students.length !== 1 ? 's' : ''} inscrito{students.length !== 1 ? 's' : ''}
            </p>
          </div>

          {students.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              No hay estudiantes inscritos en este programa aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Alumno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Acceso desde
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Última actividad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {students.map((student) => {
                    const percentage = calculatePercentage(student.completed_count, totalLessons);
                    return (
                      <tr key={student.user_id} className="hover:bg-dark-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {student.full_name || 'Sin nombre'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/60">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/60">
                            {formatDate(student.granted_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-white">
                              {student.completed_count} / {totalLessons}
                            </div>
                            <div className="flex-1 max-w-[100px] bg-dark-600 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-accent-blue h-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-white/80 font-medium">
                              {percentage}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/60">
                            {formatDate(student.last_activity)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
