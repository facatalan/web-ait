-- Tabla para leads del formulario de agendamiento
CREATE TABLE leads_scheduling (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Datos personales
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Respuestas del cuestionario
  q1_usage TEXT,           -- diario, semanal, casi_nunca
  q2_situation TEXT,       -- resultados_genericos, sin_sistema, cursos_sin_resultado, superficie, ninguna
  q3_role TEXT,            -- consultor, director, profesional_b2b, otro
  q3_role_other TEXT,      -- texto libre si eligió "otro"
  q4_timing TEXT,          -- urgente, 2_3_meses, explorando, informacion
  q5_problem TEXT,         -- texto libre

  -- Metadata
  source TEXT,             -- origen del lead (instagram, evaluacion, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices útiles
  CONSTRAINT leads_scheduling_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para búsquedas comunes
CREATE INDEX idx_leads_scheduling_email ON leads_scheduling(email);
CREATE INDEX idx_leads_scheduling_created ON leads_scheduling(created_at DESC);
CREATE INDEX idx_leads_scheduling_timing ON leads_scheduling(q4_timing);

-- RLS: permitir inserts desde el cliente (anon)
ALTER TABLE leads_scheduling ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserts públicos
CREATE POLICY "Allow public inserts" ON leads_scheduling
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para que solo admins puedan leer
CREATE POLICY "Only authenticated can read" ON leads_scheduling
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE leads_scheduling IS 'Leads capturados desde el formulario de agendamiento /agendar';
