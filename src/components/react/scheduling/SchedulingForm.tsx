import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface FormData {
  name: string;
  phone: string;
  email: string;
  q1_usage: string;
  q2_situation: string;
  q3_role: string;
  q3_role_other: string;
  q4_timing: string;
  q5_problem: string;
}

const initialData: FormData = {
  name: '',
  phone: '',
  email: '',
  q1_usage: '',
  q2_situation: '',
  q3_role: '',
  q3_role_other: '',
  q4_timing: '',
  q5_problem: '',
};

const CALENDAR_URL = 'https://calendar.app.google/tAUMt9rzKuxNGobK9';

// Validaciones
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^[\d\s+()-]{8,}$/.test(phone.replace(/\s/g, ''));
const isValidName = (name: string) => name.trim().length >= 3 && name.trim().includes(' ');

export function SchedulingForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const totalSteps = 7; // datos + 5 preguntas + final

  const updateField = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const getFieldError = (field: string): string | null => {
    if (!touched[field]) return null;
    switch (field) {
      case 'name':
        if (!data.name.trim()) return 'Ingresa tu nombre';
        if (!isValidName(data.name)) return 'Ingresa nombre y apellido';
        return null;
      case 'email':
        if (!data.email) return 'Ingresa tu email';
        if (!isValidEmail(data.email)) return 'Email inválido';
        return null;
      case 'phone':
        if (!data.phone) return 'Ingresa tu teléfono';
        if (!isValidPhone(data.phone)) return 'Teléfono inválido (mín. 8 dígitos)';
        return null;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return isValidName(data.name) && isValidEmail(data.email) && isValidPhone(data.phone);
      case 1:
        return data.q1_usage;
      case 2:
        return data.q2_situation;
      case 3:
        return data.q3_role && (data.q3_role !== 'otro' || data.q3_role_other);
      case 4:
        return data.q4_timing;
      case 5:
        return data.q5_problem.length >= 10;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Enviar datos a Supabase
      const { error } = await supabase.from('leads_scheduling').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        q1_usage: data.q1_usage,
        q2_situation: data.q2_situation,
        q3_role: data.q3_role,
        q3_role_other: data.q3_role === 'otro' ? data.q3_role_other : null,
        q4_timing: data.q4_timing,
        q5_problem: data.q5_problem,
        source: new URLSearchParams(window.location.search).get('source') || 'direct',
      });

      if (error) {
        console.error('Error saving lead:', error);
        // Guardar en localStorage como backup si falla
        localStorage.setItem('scheduling_data_backup', JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error('Error:', err);
    }

    // Redirigir al calendario (siempre, incluso si falla el guardado)
    window.location.href = CALENDAR_URL;
  };

  const RadioOption = ({
    value,
    label,
    field,
    selected
  }: {
    value: string;
    label: string;
    field: keyof FormData;
    selected: boolean;
  }) => (
    <label
      className={`flex items-center gap-3 w-full p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-accent-purple bg-accent-purple/10 text-white'
          : 'border-white/10 bg-dark-800 text-gray-300 hover:border-white/20'
      }`}
    >
      <input
        type="radio"
        name={field}
        value={value}
        checked={selected}
        onChange={() => updateField(field, value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        selected ? 'border-accent-purple' : 'border-gray-500'
      }`}>
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-accent-purple" />}
      </span>
      <span className="text-base">{label}</span>
    </label>
  );

  const ProgressBar = () => (
    <div className="w-full bg-dark-700 rounded-full h-1.5 mb-8">
      <div
        className="bg-gradient-to-r from-accent-blue to-accent-purple h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <ProgressBar />

      {/* Step 0: Datos personales */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Agenda tu llamada
            </h2>
            <p className="text-gray-400">
              Completa tus datos para continuar
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Nombre completo</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => markTouched('name')}
              placeholder="Nombre y apellido"
              className={`w-full px-4 py-3 bg-dark-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                getFieldError('name') ? 'border-red-500' : 'border-white/10 focus:border-accent-purple'
              }`}
            />
            {getFieldError('name') && (
              <p className="text-red-400 text-xs mt-1">{getFieldError('name')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onBlur={() => markTouched('phone')}
              placeholder="+56 9 1234 5678"
              className={`w-full px-4 py-3 bg-dark-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                getFieldError('phone') ? 'border-red-500' : 'border-white/10 focus:border-accent-purple'
              }`}
            />
            {getFieldError('phone') && (
              <p className="text-red-400 text-xs mt-1">{getFieldError('phone')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => markTouched('email')}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 bg-dark-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                getFieldError('email') ? 'border-red-500' : 'border-white/10 focus:border-accent-purple'
              }`}
            />
            {getFieldError('email') && (
              <p className="text-red-400 text-xs mt-1">{getFieldError('email')}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Pregunta FIT */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-8">
            <p className="text-sm text-accent-purple mb-2">Pregunta 1 de 5</p>
            <h2 className="text-xl font-bold text-white">
              ¿Ya usas ChatGPT u otras herramientas de IA en tu trabajo?
            </h2>
          </div>

          <div className="space-y-3">
            <RadioOption
              field="q1_usage"
              value="diario"
              label="Sí, todos los días"
              selected={data.q1_usage === 'diario'}
            />
            <RadioOption
              field="q1_usage"
              value="semanal"
              label="Sí, al menos una vez a la semana"
              selected={data.q1_usage === 'semanal'}
            />
            <RadioOption
              field="q1_usage"
              value="casi_nunca"
              label="No, casi no las uso"
              selected={data.q1_usage === 'casi_nunca'}
            />
          </div>
        </div>
      )}

      {/* Step 2: Pregunta PROBLEMA */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center mb-8">
            <p className="text-sm text-accent-purple mb-2">Pregunta 2 de 5</p>
            <h2 className="text-xl font-bold text-white">
              ¿Cuál describe mejor tu situación actual con IA?
            </h2>
          </div>

          <div className="space-y-3">
            <RadioOption
              field="q2_situation"
              value="resultados_genericos"
              label="Uso IA pero los resultados son genéricos — termino reescribiendo todo"
              selected={data.q2_situation === 'resultados_genericos'}
            />
            <RadioOption
              field="q2_situation"
              value="sin_sistema"
              label="No tengo sistema, improviso cada vez que necesito algo"
              selected={data.q2_situation === 'sin_sistema'}
            />
            <RadioOption
              field="q2_situation"
              value="cursos_sin_resultado"
              label="Probé cursos de IA pero no cambió nada en mi trabajo real"
              selected={data.q2_situation === 'cursos_sin_resultado'}
            />
            <RadioOption
              field="q2_situation"
              value="superficie"
              label="Siento que estoy 'arañando la superficie' de lo que podría hacer"
              selected={data.q2_situation === 'superficie'}
            />
            <RadioOption
              field="q2_situation"
              value="ninguna"
              label="Ninguna de las anteriores"
              selected={data.q2_situation === 'ninguna'}
            />
          </div>
        </div>
      )}

      {/* Step 3: Pregunta ROL */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center mb-8">
            <p className="text-sm text-accent-purple mb-2">Pregunta 3 de 5</p>
            <h2 className="text-xl font-bold text-white">
              ¿Cuál es tu rol actual?
            </h2>
          </div>

          <div className="space-y-3">
            <RadioOption
              field="q3_role"
              value="consultor"
              label="Consultor/a independiente"
              selected={data.q3_role === 'consultor'}
            />
            <RadioOption
              field="q3_role"
              value="director"
              label="Director/a o Gerente en empresa"
              selected={data.q3_role === 'director'}
            />
            <RadioOption
              field="q3_role"
              value="profesional_b2b"
              label="Profesional de servicios B2B (abogado, contador, arquitecto, etc.)"
              selected={data.q3_role === 'profesional_b2b'}
            />
            <RadioOption
              field="q3_role"
              value="otro"
              label="Otro"
              selected={data.q3_role === 'otro'}
            />
          </div>

          {data.q3_role === 'otro' && (
            <input
              type="text"
              value={data.q3_role_other}
              onChange={(e) => updateField('q3_role_other', e.target.value)}
              placeholder="Especifica tu rol..."
              className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors mt-4"
            />
          )}
        </div>
      )}

      {/* Step 4: Pregunta TIMING */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center mb-8">
            <p className="text-sm text-accent-purple mb-2">Pregunta 4 de 5</p>
            <h2 className="text-xl font-bold text-white">
              ¿Cuándo te gustaría resolver esto?
            </h2>
          </div>

          <div className="space-y-3">
            <RadioOption
              field="q4_timing"
              value="urgente"
              label="Lo antes posible — ya perdí demasiado tiempo"
              selected={data.q4_timing === 'urgente'}
            />
            <RadioOption
              field="q4_timing"
              value="2_3_meses"
              label="En los próximos 2-3 meses"
              selected={data.q4_timing === '2_3_meses'}
            />
            <RadioOption
              field="q4_timing"
              value="explorando"
              label="Estoy explorando opciones, sin urgencia"
              selected={data.q4_timing === 'explorando'}
            />
            <RadioOption
              field="q4_timing"
              value="informacion"
              label="Solo quiero información por ahora"
              selected={data.q4_timing === 'informacion'}
            />
          </div>
        </div>
      )}

      {/* Step 5: Pregunta INTENCIÓN */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="text-center mb-8">
            <p className="text-sm text-accent-purple mb-2">Pregunta 5 de 5</p>
            <h2 className="text-xl font-bold text-white">
              ¿Cuál es el problema más grande que enfrentas con IA en tu trabajo?
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Cuéntanos en 2-3 oraciones
            </p>
          </div>

          <textarea
            value={data.q5_problem}
            onChange={(e) => updateField('q5_problem', e.target.value)}
            placeholder="Describe tu situación..."
            rows={4}
            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors resize-none"
          />
          <p className="text-xs text-gray-500 text-right">
            {data.q5_problem.length} caracteres (mínimo 10)
          </p>
        </div>
      )}

      {/* Step 6: Confirmación */}
      {step === 6 && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-accent-purple/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Perfecto, {data.name.split(' ')[0]}!
            </h2>
            <p className="text-gray-400">
              Gracias por responder. Ahora selecciona el horario que mejor te acomode.
            </p>
          </div>

          <div className="bg-dark-800 border border-white/10 rounded-xl p-4 text-left">
            <p className="text-sm text-gray-500 mb-1">Tus datos:</p>
            <p className="text-white">{data.name}</p>
            <p className="text-gray-400 text-sm">{data.email}</p>
            <p className="text-gray-400 text-sm">{data.phone}</p>
          </div>
        </div>
      )}

      {/* Botón de continuar */}
      <div className="mt-8">
        {step < 6 ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:opacity-90'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {step === 0 ? 'Continuar' : 'Siguiente'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-accent-blue to-accent-purple rounded-xl font-medium text-lg text-white hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? 'Redirigiendo...' : 'Elegir horario'}
          </button>
        )}

        {step > 0 && step < 6 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 py-3 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Volver
          </button>
        )}
      </div>
    </div>
  );
}
