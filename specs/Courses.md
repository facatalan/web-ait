# AI-Thinking Platform - Especificacion Tecnica

> **Dominio:** www.ai-thinking.io
> **Estado actual:** Astro + Supabase funcionando en Netlify
> **Fecha:** Enero 2025

---

## Tabla de Contenidos

1. [Vision General](#1-vision-general)
2. [Arquitectura](#2-arquitectura)
3. [Estructura de URLs](#3-estructura-de-urls)
4. [Sistema de Programas](#4-sistema-de-programas)
5. [Base de Datos](#5-base-de-datos)
6. [Control de Acceso](#6-control-de-acceso)
7. [Comunidad](#7-comunidad)
8. [Workflows Operativos](#8-workflows-operativos)

---

## 1. Vision General

### Jerarquia de contenido

```
PROGRAMA (lo que se compra)
    └── SEMANAS (agrupacion visual)
          └── CURSOS (reutilizables)
                └── LECCIONES (videos + contenido MDX)
```

### Donde vive cada cosa

| Que | Donde | Proposito |
|-----|-------|-----------|
| Contenido (videos, texto, estructura) | **Astro (MDX)** | Se genera en build time |
| Permisos (quien puede ver que) | **Supabase** | Se verifica en runtime |

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         ASTRO                                │
│  (Contenido estatico - se despliega con cada build)         │
├─────────────────────────────────────────────────────────────┤
│  src/content/programas/mi-programa.mdx                      │
│    └── weeks: [{courses: ["curso-a", "curso-b"]}]           │
│                                                              │
│  src/content/cursos/curso-a/                                │
│    ├── 01-leccion.mdx (videoId, isFree, etc)                │
│    └── 02-leccion.mdx                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                              │
│  (Control de acceso - dinamico en runtime)                  │
├─────────────────────────────────────────────────────────────┤
│  programs (slug, title)                                     │
│      │                                                       │
│      └── user_programs (user_id, program_id)                │
│                                                              │
│  has_program_access(user_id, program_slug) → true/false     │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de verificacion de acceso

```
Usuario visita /programas/aithinking-fundamentals/fundamentos-ia/01-intro
                                    │
                                    ▼
              ┌─────────────────────────────────────┐
              │  Astro sirve la pagina HTML         │
              │  (generada en build time)           │
              └─────────────────────────────────────┘
                                    │
                                    ▼
              ┌─────────────────────────────────────┐
              │  React: ProtectedProgramLesson      │
              │                                     │
              │  1. Es leccion gratis (isFree)?     │
              │     → Si: mostrar video             │
              │                                     │
              │  2. Usuario autenticado?            │
              │     → No: pedir login               │
              │                                     │
              │  3. has_program_access()?           │
              │     → Si: mostrar video             │
              │     → No: mostrar paywall           │
              └─────────────────────────────────────┘
```

---

## 3. Estructura de URLs

### URLs de Programas (sistema actual)

| URL | Descripcion |
|-----|-------------|
| `/programas` | Catalogo de programas |
| `/programas/[programa]` | Detalle del programa con semanas |
| `/programas/[programa]/comunidad` | Comunidad del programa |
| `/programas/[programa]/[curso]` | Lista de lecciones del curso |
| `/programas/[programa]/[curso]/[leccion]` | Leccion con video |

---

## 4. Sistema de Programas

### Crear un Programa (Astro)

Archivo: `src/content/programas/[programa-slug].mdx`

```yaml
---
title: "AIThinking Fundamentals"
description: "Programa completo de fundamentos de IA"
thumbnail: "/images/programs/aithinking-fundamentals.jpg"
isActive: true
weeks:
  - number: 1
    title: "Fundamentos de IA"
    description: "Introduccion a los conceptos basicos"
    courses:
      - "fundamentos-ia"
  - number: 2
    title: "Prompting Avanzado"
    courses:
      - "prompting-avanzado"
---

Contenido opcional del programa...
```

### Crear un Curso (Astro)

Carpeta: `src/content/cursos/[curso-slug]/`

Cada leccion es un archivo MDX:

```yaml
---
title: "Introduccion a la IA"
description: "Descripcion de la leccion"
videoId: "ID_DE_MUX_PLAYBACK"
duration: 600
isFree: true
order: 1
course: "fundamentos-ia"
courseTitle: "Fundamentos de IA"
courseDescription: "Descripcion del curso"
---

Contenido MDX de la leccion...
```

### Schema de Content Collections

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const weekSchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string().optional(),
  courses: z.array(z.string()),
});

const programas = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().optional(),
    isActive: z.boolean().default(true),
    weeks: z.array(weekSchema),
  }),
});

const cursos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoId: z.string().optional(),
    duration: z.number().optional(),
    isFree: z.boolean().default(false),
    order: z.number().default(0),
    course: z.string(),
    courseTitle: z.string(),
    courseDescription: z.string().optional(),
  }),
});

export const collections = { cursos, programas };
```

---

## 5. Base de Datos

### Tablas principales (simplificado)

```
programs
├── id (UUID, PK)
├── slug (TEXT, UNIQUE)
├── title (TEXT)
├── description (TEXT)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMPTZ)

user_programs
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── program_id (UUID, FK → programs)
├── granted_at (TIMESTAMPTZ)
└── granted_by (TEXT)

profiles
├── id (UUID, PK, FK → auth.users)
├── username (TEXT)
├── full_name (TEXT)
├── avatar_url (TEXT)
└── created_at (TIMESTAMPTZ)

posts
├── id (UUID, PK)
├── author_id (UUID, FK → profiles)
├── program_slug (TEXT)  -- Comunidad por programa
├── content (TEXT)
└── created_at (TIMESTAMPTZ)

comments, likes, lesson_progress...
```

### Funcion de verificacion de acceso

```sql
CREATE OR REPLACE FUNCTION has_program_access(
  p_user_id UUID,
  p_program_slug TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS(
    SELECT 1 FROM user_programs up
    JOIN programs p ON p.id = up.program_id
    WHERE up.user_id = p_user_id
      AND p.slug = p_program_slug
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Control de Acceso

### Logica de permisos

```
Leccion.isFree = true?
    └── ✅ Acceso permitido (sin login)

Usuario autenticado?
    └── No: ❌ Pedir login

has_program_access(user_id, program_slug)?
    └── Si: ✅ Acceso permitido
    └── No: ❌ Mostrar paywall
```

### Dar acceso a un usuario

```sql
-- Encontrar el usuario
SELECT id, email FROM profiles WHERE email = 'usuario@ejemplo.com';

-- Dar acceso al programa
INSERT INTO user_programs (user_id, program_id, granted_by)
SELECT
  'UUID-DEL-USUARIO',
  id,
  'Pago manual - Enero 2025'
FROM programs
WHERE slug = 'aithinking-fundamentals';
```

### Revocar acceso

```sql
DELETE FROM user_programs
WHERE user_id = 'UUID-DEL-USUARIO'
  AND program_id = (SELECT id FROM programs WHERE slug = 'aithinking-fundamentals');
```

### Ver usuarios con acceso

```sql
SELECT
  p.email,
  p.full_name,
  up.granted_at,
  up.granted_by
FROM user_programs up
JOIN profiles p ON p.id = up.user_id
JOIN programs pr ON pr.id = up.program_id
WHERE pr.slug = 'aithinking-fundamentals';
```

---

## 7. Comunidad

### Una comunidad por programa

- Posts se asocian con `program_slug`
- Solo usuarios con acceso al programa pueden ver/publicar
- Verificacion via `has_program_access()`

### Componentes React

| Componente | Ubicacion | Proposito |
|------------|-----------|-----------|
| `ProgramFeed` | `/programas/[programa]/comunidad` | Feed de la comunidad |
| `CreateProgramPost` | Dentro de ProgramFeed | Crear posts |
| `PostCard` | Reutilizable | Mostrar post con likes/comentarios |

---

## 8. Workflows Operativos

### Crear un nuevo programa

1. **En Astro:** Crear `src/content/programas/nuevo-programa.mdx`
2. **En Astro:** Crear cursos en `src/content/cursos/[curso]/`
3. **Deploy:** `git push` (Netlify hace build automatico)
4. **En Supabase:** Crear registro en tabla `programs`

```sql
INSERT INTO programs (slug, title, description, is_active)
VALUES ('nuevo-programa', 'Nombre del Programa', 'Descripcion', true);
```

### Agregar un curso a un programa existente

1. Crear lecciones MDX en `src/content/cursos/nuevo-curso/`
2. Editar el programa MDX y agregar el curso a una semana:

```yaml
weeks:
  - number: 1
    courses:
      - "curso-existente"
      - "nuevo-curso"  # Agregar aqui
```

3. Deploy con `git push`

### Dar acceso a multiples usuarios

```sql
-- Dar acceso a varios usuarios a un programa
INSERT INTO user_programs (user_id, program_id, granted_by)
SELECT p.id, pr.id, 'Batch - Enero 2025'
FROM profiles p, programs pr
WHERE p.email IN (
  'usuario1@email.com',
  'usuario2@email.com',
  'usuario3@email.com'
)
AND pr.slug = 'aithinking-fundamentals';
```

---

## Estructura de Archivos

```
src/
├── content/
│   ├── programas/
│   │   └── aithinking-fundamentals.mdx
│   └── cursos/
│       └── fundamentos-ia/
│           ├── 01-introduccion.mdx
│           ├── 02-tipos-de-ia.mdx
│           └── 03-modelos-lenguaje.mdx
│
├── pages/
│   ├── programas/
│   │   ├── index.astro
│   │   └── [programa]/
│   │       ├── index.astro
│   │       ├── comunidad.astro
│   │       └── [curso]/
│   │           ├── index.astro
│   │           └── [leccion].astro
│
├── components/react/
│   ├── courses/
│   │   ├── ProtectedProgramLesson.tsx
│   │   ├── ProgramLessonNav.tsx
│   │   └── VideoPlayer.tsx
│   └── community/
│       ├── ProgramFeed.tsx
│       ├── CreateProgramPost.tsx
│       └── PostCard.tsx
│
└── lib/
    └── supabase.ts
```

---

*Documento actualizado: Enero 2025*
