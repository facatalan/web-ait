# AI-Thinking Platform - Especificación Técnica Completa

> **Dominio:** www.ai-thinking.io  
> **Estado actual:** Astro funcionando en Netlify  
> **Fecha:** Enero 2025

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura de URLs](#4-estructura-de-urls)
5. [Base de Datos](#5-base-de-datos)
6. [Autenticación](#6-autenticación)
7. [Sistema de Cursos](#7-sistema-de-cursos)
8. [Sistema de Comunidad](#8-sistema-de-comunidad)
9. [Control de Acceso](#9-control-de-acceso)
10. [Video Hosting con Mux](#10-video-hosting-con-mux)
11. [Estructura de Archivos](#11-estructura-de-archivos)
12. [Workflows Operativos](#12-workflows-operativos)
13. [Configuraciones](#13-configuraciones)
14. [Plan de Implementación](#14-plan-de-implementación)
15. [Costos Estimados](#15-costos-estimados)
16. [Funcionalidades Futuras](#16-funcionalidades-futuras)

---

## 1. Visión General

### Qué es la plataforma

Plataforma de formación online que combina:
- **Cursos en video** con contenido estructurado
- **Comunidades por curso** para interacción entre participantes
- **Acceso controlado** manualmente por el administrador

### Modelo de negocio

- Cobro manual externo a la plataforma (transferencia, PayPal, etc.)
- Administrador otorga acceso a cursos específicos después del pago
- Sin pasarela de pagos integrada en el MVP

### Escala objetivo

- **Inicial:** 100-500 usuarios
- **Mediano plazo:** 500-2,000 usuarios
- **Cursos iniciales:** 3-10 programas de formación

---

## 2. Stack Tecnológico

### Frontend

| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Astro** | Framework principal | Ya implementado, excelente para contenido estático |
| **React** | Islands interactivos | Componentes dinámicos (auth, feed, video player) |
| **TypeScript** | Tipado | Seguridad y mantenibilidad |
| **Tailwind CSS** | Estilos | Consistencia, ya configurado |

### Backend

| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Supabase** | Base de datos | PostgreSQL, Auth, Realtime, Edge Functions |
| **Supabase Auth** | Autenticación | Email + Google OAuth |
| **Supabase Realtime** | Tiempo real | Feed de comunidad en vivo |
| **Supabase Edge Functions** | Serverless | Tokens de video, lógica de negocio |

### Video

| Tecnología | Uso | Justificación |
|------------|-----|---------------|
| **Mux** | Video hosting | Streaming adaptativo, tokens firmados, analytics |
| **@mux/mux-player-react** | Reproductor | Integración nativa con Mux |

### Hosting & Deploy

| Tecnología | Uso |
|------------|-----|
| **Netlify** | Hosting del sitio Astro |
| **GitHub** | Repositorio y CI/CD |

### Contenido

| Tecnología | Uso |
|------------|-----|
| **MDX** | Contenido de lecciones |
| **Content Collections** | Gestión de cursos en Astro |

---

## 3. Arquitectura

### Paradigma: Astro + React Islands

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CAPA ESTÁTICA (Astro)                                    │
│   ─────────────────────                                     │
│   • Landing page                                            │
│   • Páginas de cursos (estructura)                         │
│   • Contenido MDX de lecciones                             │
│   • SEO optimizado                                          │
│   • 0 JavaScript donde no se necesita                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   CAPA DINÁMICA (React Islands)                            │
│   ─────────────────────────────                             │
│   • Autenticación (login, registro, sesión)                │
│   • Video player protegido                                  │
│   • Feed de comunidad                                       │
│   • Comentarios y likes                                     │
│   • Tracking de progreso                                    │
│   • Perfil de usuario                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   CAPA DE DATOS (Supabase)                                 │
│   ────────────────────────                                  │
│   • PostgreSQL con RLS                                      │
│   • Autenticación                                           │
│   • Realtime subscriptions                                  │
│   • Edge Functions                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de datos

```
MDX (contenido) ──────────────────┐
                                  │
                                  ▼
                         ┌──────────────────┐
Usuario ────► Astro ────►│ Página renderizada│
                         │ (HTML estático)   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ React Islands    │
                         │ se hidratan      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Supabase         │
                         │ (auth, datos)    │
                         └──────────────────┘
```

---

## 4. Estructura de URLs

### URLs públicas

| URL | Descripción | Contenido |
|-----|-------------|-----------|
| `/` | Landing principal | Presentación, propuesta de valor |
| `/cursos` | Catálogo de cursos | Lista de todos los cursos disponibles |
| `/cursos/[slug]` | Página de curso | Descripción, temario, CTA |
| `/login` | Autenticación | Login y registro |

### URLs protegidas (requieren autenticación)

| URL | Descripción | Contenido |
|-----|-------------|-----------|
| `/comunidad` | Feed agregado | Posts de todas las comunidades del usuario |
| `/cursos/[slug]/comunidad` | Comunidad del curso | Feed específico del curso |
| `/cursos/[slug]/[leccion]` | Lección | Video + contenido |
| `/perfil` | Perfil del usuario | Datos, cursos, progreso |
| `/ranking` | Leaderboard | (Futuro, no en MVP) |

### URLs de administración

| URL | Descripción |
|-----|-------------|
| `/admin` | (Futuro) Panel de administración |

---

## 5. Base de Datos

### Diagrama de entidades

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  profiles   │     │   courses   │     │   lessons   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ username    │     │ slug        │     │ course_id   │───┐
│ full_name   │     │ title       │     │ slug        │   │
│ avatar_url  │     │ description │     │ title       │   │
│ bio         │     │ created_at  │     │ is_free     │   │
│ created_at  │     └─────────────┘     │ order_index │   │
│ updated_at  │            │            └─────────────┘   │
└─────────────┘            │                              │
       │                   │                              │
       │            ┌──────┴───────┐                      │
       │            ▼              ▼                      │
       │     ┌─────────────┐ ┌─────────────┐             │
       │     │   posts     │ │user_courses │             │
       │     ├─────────────┤ ├─────────────┤             │
       │     │ id (PK)     │ │ id (PK)     │             │
       └────►│ author_id   │ │ user_id     │◄────────────┘
             │ course_id   │ │ course_id   │
             │ content     │ │ granted_at  │
             │ created_at  │ │ granted_by  │
             └─────────────┘ └─────────────┘
                    │
          ┌────────┴────────┐
          ▼                 ▼
   ┌─────────────┐   ┌─────────────┐
   │  comments   │   │    likes    │
   ├─────────────┤   ├─────────────┤
   │ id (PK)     │   │ id (PK)     │
   │ post_id     │   │ user_id     │
   │ author_id   │   │ post_id     │
   │ content     │   │ created_at  │
   │ created_at  │   └─────────────┘
   └─────────────┘

   ┌──────────────────┐
   │ lesson_progress  │
   ├──────────────────┤
   │ id (PK)          │
   │ user_id          │
   │ lesson_slug      │
   │ course_slug      │
   │ completed        │
   │ progress_seconds │
   │ updated_at       │
   └──────────────────┘
```

### SQL de creación de tablas

```sql
-- =============================================
-- TABLA: profiles
-- Extiende auth.users con datos adicionales
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX profiles_username_idx ON profiles(username);

-- =============================================
-- TABLA: courses
-- Metadata de cursos (sincronizada desde MDX)
-- =============================================
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX courses_slug_idx ON courses(slug);

-- =============================================
-- TABLA: lessons
-- Metadata de lecciones (sincronizada desde MDX)
-- =============================================
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  mux_playback_id TEXT,
  duration_seconds INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, slug)
);

CREATE INDEX lessons_course_idx ON lessons(course_id);

-- =============================================
-- TABLA: user_courses
-- Control de acceso: qué usuarios tienen qué cursos
-- =============================================
CREATE TABLE user_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT,  -- Nota de quién/por qué se dio acceso
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX user_courses_user_idx ON user_courses(user_id);
CREATE INDEX user_courses_course_idx ON user_courses(course_id);

-- =============================================
-- TABLA: posts
-- Posts de la comunidad (asociados a un curso)
-- =============================================
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX posts_course_idx ON posts(course_id);
CREATE INDEX posts_author_idx ON posts(author_id);
CREATE INDEX posts_created_idx ON posts(created_at DESC);

-- =============================================
-- TABLA: comments
-- Comentarios en posts
-- =============================================
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX comments_post_idx ON comments(post_id);

-- =============================================
-- TABLA: likes
-- Likes en posts
-- =============================================
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX likes_post_idx ON likes(post_id);
CREATE INDEX likes_user_idx ON likes(user_id);

-- =============================================
-- TABLA: lesson_progress
-- Progreso del usuario en lecciones
-- =============================================
CREATE TABLE lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, course_slug, lesson_slug)
);

CREATE INDEX lesson_progress_user_idx ON lesson_progress(user_id);
CREATE INDEX lesson_progress_course_idx ON lesson_progress(course_slug);
```

### Row Level Security (RLS)

```sql
-- =============================================
-- RLS: profiles
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver perfiles
CREATE POLICY "Perfiles públicos" 
  ON profiles FOR SELECT 
  USING (true);

-- Solo el usuario puede editar su perfil
CREATE POLICY "Usuario edita su perfil" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserción solo del propio perfil
CREATE POLICY "Insertar perfil propio" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =============================================
-- RLS: courses
-- =============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Cursos visibles para todos
CREATE POLICY "Cursos públicos" 
  ON courses FOR SELECT 
  USING (true);

-- =============================================
-- RLS: lessons
-- =============================================
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Lecciones visibles para todos (el acceso al video se controla aparte)
CREATE POLICY "Lecciones públicas" 
  ON lessons FOR SELECT 
  USING (true);

-- =============================================
-- RLS: user_courses
-- =============================================
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Usuario solo ve sus propios accesos
CREATE POLICY "Ver mis cursos" 
  ON user_courses FOR SELECT 
  USING (auth.uid() = user_id);

-- =============================================
-- RLS: posts
-- =============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Ver posts solo de cursos a los que tengo acceso
CREATE POLICY "Ver posts de mis cursos" 
  ON posts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_courses 
      WHERE user_courses.user_id = auth.uid() 
        AND user_courses.course_id = posts.course_id
    )
  );

-- Crear posts solo en cursos a los que tengo acceso
CREATE POLICY "Crear posts en mis cursos" 
  ON posts FOR INSERT 
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM user_courses 
      WHERE user_courses.user_id = auth.uid() 
        AND user_courses.course_id = posts.course_id
    )
  );

-- Editar/borrar solo mis posts
CREATE POLICY "Editar mis posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Borrar mis posts" 
  ON posts FOR DELETE 
  USING (auth.uid() = author_id);

-- =============================================
-- RLS: comments
-- =============================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Ver comentarios de posts que puedo ver
CREATE POLICY "Ver comentarios" 
  ON comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      JOIN user_courses ON user_courses.course_id = posts.course_id
      WHERE posts.id = comments.post_id 
        AND user_courses.user_id = auth.uid()
    )
  );

-- Crear comentarios en posts que puedo ver
CREATE POLICY "Crear comentarios" 
  ON comments FOR INSERT 
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM posts 
      JOIN user_courses ON user_courses.course_id = posts.course_id
      WHERE posts.id = comments.post_id 
        AND user_courses.user_id = auth.uid()
    )
  );

-- Borrar solo mis comentarios
CREATE POLICY "Borrar mis comentarios" 
  ON comments FOR DELETE 
  USING (auth.uid() = author_id);

-- =============================================
-- RLS: likes
-- =============================================
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Ver likes de posts que puedo ver
CREATE POLICY "Ver likes" 
  ON likes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      JOIN user_courses ON user_courses.course_id = posts.course_id
      WHERE posts.id = likes.post_id 
        AND user_courses.user_id = auth.uid()
    )
  );

-- Gestionar solo mis likes
CREATE POLICY "Gestionar mis likes" 
  ON likes FOR ALL 
  USING (auth.uid() = user_id);

-- =============================================
-- RLS: lesson_progress
-- =============================================
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Solo veo mi progreso
CREATE POLICY "Ver mi progreso" 
  ON lesson_progress FOR SELECT 
  USING (auth.uid() = user_id);

-- Solo gestiono mi progreso
CREATE POLICY "Gestionar mi progreso" 
  ON lesson_progress FOR ALL 
  USING (auth.uid() = user_id);
```

### Triggers y funciones

```sql
-- =============================================
-- TRIGGER: Crear perfil automáticamente al registrarse
-- =============================================
-- DECISIÓN: Username usa el email completo sanitizado
-- Ejemplo: facatalan@gmail.com → facatalan_gmail_com
-- Razón: Evita colisiones entre usuarios con mismo nombre local
--        en diferentes dominios (ej: juan@gmail.com vs juan@hotmail.com)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    LOWER(REGEXP_REPLACE(NEW.email, '[^a-z0-9]', '_', 'g')),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- FUNCIÓN: Verificar acceso a lección
-- =============================================
CREATE OR REPLACE FUNCTION can_access_lesson(
  p_user_id UUID,
  p_course_slug TEXT,
  p_lesson_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_course_id UUID;
  v_is_free BOOLEAN;
  v_has_access BOOLEAN;
BEGIN
  -- Obtener curso y verificar si lección es gratis
  SELECT c.id, l.is_free 
  INTO v_course_id, v_is_free
  FROM courses c
  JOIN lessons l ON l.course_id = c.id
  WHERE c.slug = p_course_slug 
    AND l.slug = p_lesson_slug;

  -- Si no existe la lección, no hay acceso
  IF v_course_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Lecciones gratis: acceso para todos (incluso sin login)
  IF v_is_free THEN
    RETURN TRUE;
  END IF;

  -- Usuario no autenticado: solo lecciones gratis
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verificar si el usuario tiene acceso al curso
  SELECT EXISTS(
    SELECT 1 FROM user_courses
    WHERE user_id = p_user_id
      AND course_id = v_course_id
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCIÓN: Verificar acceso a curso
-- =============================================
CREATE OR REPLACE FUNCTION has_course_access(
  p_user_id UUID,
  p_course_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM user_courses uc
    JOIN courses c ON c.id = uc.course_id
    WHERE uc.user_id = p_user_id
      AND c.slug = p_course_slug
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Autenticación

### Proveedores habilitados

| Proveedor | Estado |
|-----------|--------|
| Email/Password | ✅ Habilitado |
| Google OAuth | ✅ Habilitado |

### Configuración en Supabase

1. **Authentication → Providers → Email**
   - Enable Email provider: ✅
   - Confirm email: ✅ (recomendado)
   - Secure email change: ✅

2. **Authentication → Providers → Google**
   - Enable Google provider: ✅
   - Client ID: (de Google Cloud Console)
   - Client Secret: (de Google Cloud Console)

### Configuración de Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto o seleccionar existente
3. APIs & Services → Credentials → Create OAuth Client ID
4. Application type: Web application
5. Authorized JavaScript origins: `https://www.ai-thinking.io`
6. Authorized redirect URIs: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
7. Copiar Client ID y Client Secret a Supabase

### Flujo de autenticación

```
Usuario visita /login
        │
        ▼
┌─────────────────────────────────────┐
│  Opciones de login:                 │
│                                     │
│  [    Continuar con Google    ]     │
│                                     │
│  ─────────── o ───────────          │
│                                     │
│  Email: [________________]          │
│  Password: [________________]       │
│                                     │
│  [ Iniciar sesión ]                 │
│                                     │
│  ¿No tienes cuenta? Regístrate      │
└─────────────────────────────────────┘
        │
        ▼
  Supabase Auth
        │
        ├── Email: envía magic link o verifica password
        │
        └── Google: redirect a Google → callback → sesión
        │
        ▼
  Sesión creada → Redirect a /comunidad
```

---

## 7. Sistema de Cursos

### Estructura de contenido (MDX)

```
src/content/cursos/
├── fundamentos-ia/
│   ├── _curso.json              # Metadata del curso
│   ├── 01-introduccion.mdx      # Lección 1
│   ├── 02-conceptos.mdx         # Lección 2
│   └── 03-herramientas.mdx      # Lección 3
├── prompting-avanzado/
│   ├── _curso.json
│   ├── 01-intro.mdx
│   └── ...
└── agentes-ia/
    ├── _curso.json
    └── ...
```

### Formato de `_curso.json`

```json
{
  "title": "Fundamentos de IA",
  "description": "Aprende los conceptos básicos de la inteligencia artificial",
  "thumbnail": "/cursos/fundamentos-ia/cover.jpg",
  "order": 1
}
```

### Formato de lección MDX

```mdx
---
title: "Introducción a la IA"
description: "En esta lección aprenderás qué es la IA y su historia"
videoId: "a4nOgmxGWg00R..."
duration: 845
isFree: true
order: 1
---

# Introducción a la IA

En esta lección exploraremos los fundamentos...

## ¿Qué es la Inteligencia Artificial?

La inteligencia artificial es...

## Historia breve

Los orígenes de la IA se remontan a...
```

### Content Collection en Astro

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const cursosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoId: z.string(),
    duration: z.number(),
    isFree: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = {
  cursos: cursosCollection,
};
```

### Script de sincronización a Supabase

```typescript
// scripts/sync-courses.ts
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const CURSOS_DIR = 'src/content/cursos';

async function sync() {
  console.log('🔄 Sincronizando cursos con Supabase...\n');
  
  const courseDirs = fs.readdirSync(CURSOS_DIR)
    .filter(f => fs.statSync(path.join(CURSOS_DIR, f)).isDirectory());

  for (const courseSlug of courseDirs) {
    const coursePath = path.join(CURSOS_DIR, courseSlug);
    
    // Leer metadata del curso
    const metaPath = path.join(coursePath, '_curso.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`⚠️  ${courseSlug}: falta _curso.json, saltando...`);
      continue;
    }
    
    const courseMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    
    // Upsert curso
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .upsert({
        slug: courseSlug,
        title: courseMeta.title,
        description: courseMeta.description || null,
        thumbnail_url: courseMeta.thumbnail || null,
      })
      .select()
      .single();

    if (courseError) {
      console.error(`❌ Error en curso ${courseSlug}:`, courseError.message);
      continue;
    }

    console.log(`📚 ${course.title}`);
    
    // Leer lecciones MDX
    const mdxFiles = fs.readdirSync(coursePath)
      .filter(f => f.endsWith('.mdx'))
      .sort();

    for (const file of mdxFiles) {
      const filePath = path.join(coursePath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter } = matter(content);
      
      const lessonSlug = file.replace('.mdx', '');
      
      const { error: lessonError } = await supabase
        .from('lessons')
        .upsert({
          course_id: course.id,
          slug: lessonSlug,
          title: frontmatter.title,
          mux_playback_id: frontmatter.videoId || null,
          duration_seconds: frontmatter.duration || 0,
          is_free: frontmatter.isFree || false,
          order_index: frontmatter.order || 0,
        });

      if (lessonError) {
        console.error(`  ❌ Error en lección ${lessonSlug}:`, lessonError.message);
      } else {
        const freeTag = frontmatter.isFree ? ' (GRATIS)' : '';
        console.log(`   📄 ${frontmatter.title}${freeTag}`);
      }
    }
    
    console.log('');
  }

  console.log('✅ Sincronización completada');
}

sync().catch(console.error);
```

### Integración con build de Netlify

```json
// package.json
{
  "scripts": {
    "build": "astro build && npm run sync-courses",
    "sync-courses": "tsx scripts/sync-courses.ts"
  }
}
```

---

## 8. Sistema de Comunidad

### Modelo conceptual

- **Cada curso tiene su propia comunidad**
- El usuario solo ve posts de cursos a los que tiene acceso
- `/comunidad` muestra el feed agregado de todas sus comunidades
- `/cursos/[slug]/comunidad` muestra solo esa comunidad

### Estructura de un post

```typescript
interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  course: {
    id: string;
    slug: string;
    title: string;
  };
  content: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;  // Si el usuario actual dio like
}
```

### Query para feed agregado

```typescript
// Obtener posts de todos los cursos del usuario
const { data: posts } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    image_url,
    created_at,
    author:profiles!author_id (
      id,
      username,
      full_name,
      avatar_url
    ),
    course:courses!course_id (
      id,
      slug,
      title
    ),
    likes (count),
    comments (count)
  `)
  .order('created_at', { ascending: false })
  .limit(20);
```

### Query para comunidad específica

```typescript
// Obtener posts de un curso específico
const { data: posts } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    image_url,
    created_at,
    author:profiles!author_id (
      id,
      username,
      full_name,
      avatar_url
    ),
    likes (count),
    comments (count)
  `)
  .eq('course_id', courseId)
  .order('created_at', { ascending: false })
  .limit(20);
```

---

## 9. Control de Acceso

### Modelo de permisos

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   USUARIO                                                   │
│      │                                                      │
│      ├── ¿Lección marcada como is_free?                    │
│      │      └── ✅ Acceso permitido                        │
│      │                                                      │
│      ├── ¿Tiene registro en user_courses para este curso?  │
│      │      └── ✅ Acceso permitido                        │
│      │                                                      │
│      └── ¿No cumple ninguna condición?                     │
│             └── ❌ Mostrar paywall/mensaje                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dar acceso a un usuario (manual)

**Opción A: Desde Supabase Dashboard**

1. Ir a Table Editor → `user_courses`
2. Insert Row
3. Completar:
   - `user_id`: (UUID del usuario)
   - `course_id`: (UUID del curso)
   - `granted_by`: "Pago manual - Enero 2025"

**Opción B: Query SQL**

```sql
-- Dar acceso a un usuario a un curso
-- Nota: username es el email sanitizado (ej: juan@gmail.com → juan_gmail_com)
INSERT INTO user_courses (user_id, course_id, granted_by)
SELECT
  p.id,
  c.id,
  'Pago manual - Enero 2025'
FROM profiles p, courses c
WHERE p.username = 'juan_gmail_com'
  AND c.slug = 'fundamentos-ia';
```

**Opción C: Script helper**

```typescript
// scripts/grant-access.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function grantAccess(username: string, courseSlug: string, note: string) {
  // Obtener usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!profile) {
    console.error(`❌ Usuario "${username}" no encontrado`);
    return;
  }

  // Obtener curso
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('slug', courseSlug)
    .single();

  if (!course) {
    console.error(`❌ Curso "${courseSlug}" no encontrado`);
    return;
  }

  // Dar acceso
  const { error } = await supabase
    .from('user_courses')
    .upsert({
      user_id: profile.id,
      course_id: course.id,
      granted_by: note
    });

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log(`✅ ${username} ahora tiene acceso a "${course.title}"`);
  }
}

// Uso: npx tsx scripts/grant-access.ts juan_perez fundamentos-ia "Pago PayPal"
const [,, username, courseSlug, note] = process.argv;
grantAccess(username, courseSlug, note || 'Acceso manual');
```

### Revocar acceso

```sql
-- Revocar acceso
-- Nota: username es el email sanitizado (ej: juan@gmail.com → juan_gmail_com)
DELETE FROM user_courses
WHERE user_id = (SELECT id FROM profiles WHERE username = 'juan_gmail_com')
  AND course_id = (SELECT id FROM courses WHERE slug = 'fundamentos-ia');
```

### Verificación en frontend (React Island)

```tsx
// src/components/react/ProtectedLesson.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  courseSlug: string;
  lessonSlug: string;
  videoId: string;
  isFree: boolean;
}

export default function ProtectedLesson({ 
  courseSlug, 
  lessonSlug, 
  videoId,
  isFree 
}: Props) {
  const [access, setAccess] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    // Lecciones gratis siempre tienen acceso
    if (isFree) {
      setAccess('granted');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setAccess('denied');
      return;
    }

    // Verificar acceso en base de datos
    const { data } = await supabase.rpc('can_access_lesson', {
      p_user_id: user.id,
      p_course_slug: courseSlug,
      p_lesson_slug: lessonSlug
    });

    setAccess(data ? 'granted' : 'denied');
  }

  if (access === 'loading') {
    return <VideoSkeleton />;
  }

  if (access === 'denied') {
    return <AccessDenied courseSlug={courseSlug} />;
  }

  return <VideoPlayer videoId={videoId} lessonSlug={lessonSlug} />;
}
```

---

## 10. Video Hosting con Mux

### Configuración inicial

1. Crear cuenta en [mux.com](https://mux.com)
2. Obtener credenciales:
   - **Token ID** y **Token Secret** (Settings → API Access Tokens)
   - **Signing Key ID** y **Private Key** (Settings → Signing Keys)

### Variables de entorno

```bash
# .env.local
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-token-secret
MUX_SIGNING_KEY_ID=your-signing-key-id
MUX_SIGNING_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
```

### Workflow para subir videos

```
1. Ir a Mux Dashboard
   └── https://dashboard.mux.com

2. Video → Assets → Create new asset

3. Configurar:
   └── Playback policy: SIGNED (protegido)
   └── Encoding tier: Baseline ($0.007/min)

4. Subir archivo .mp4

5. Esperar procesamiento (~1-5 min)

6. Copiar Playback ID
   └── Ejemplo: a4nOgmxGWg00R02xyzABC

7. Usar en MDX:
   ---
   videoId: "a4nOgmxGWg00R02xyzABC"
   duration: 845
   ---
```

### Edge Function para tokens firmados

```typescript
// supabase/functions/get-video-token/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticación
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    const { courseSlug, lessonSlug } = await req.json();

    // Verificar acceso (usa la función de la base de datos)
    const { data: hasAccess } = await supabase.rpc('can_access_lesson', {
      p_user_id: user?.id ?? null,
      p_course_slug: courseSlug,
      p_lesson_slug: lessonSlug
    });

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener playback ID de la lección
    const { data: lesson } = await supabase
      .from('lessons')
      .select('mux_playback_id')
      .eq('slug', lessonSlug)
      .single();

    if (!lesson?.mux_playback_id) {
      return new Response(
        JSON.stringify({ error: 'Video not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar token JWT para Mux
    const privateKey = await jose.importPKCS8(
      Deno.env.get('MUX_SIGNING_PRIVATE_KEY')!.replace(/\\n/g, '\n'),
      'RS256'
    );
    
    const token = await new jose.SignJWT({
      sub: lesson.mux_playback_id,
      aud: 'v',
      exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 horas
      kid: Deno.env.get('MUX_SIGNING_KEY_ID')!
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    return new Response(
      JSON.stringify({ 
        playbackId: lesson.mux_playback_id, 
        token 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Componente VideoPlayer

```tsx
// src/components/react/VideoPlayer.tsx
import { useEffect, useState, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { supabase } from '@/lib/supabase';

interface Props {
  courseSlug: string;
  lessonSlug: string;
  onComplete?: () => void;
}

export default function VideoPlayer({ courseSlug, lessonSlug, onComplete }: Props) {
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSavedTime = useRef(0);

  useEffect(() => {
    loadVideo();
  }, [courseSlug, lessonSlug]);

  async function loadVideo() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/get-video-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ courseSlug, lessonSlug }),
        }
      );

      if (!response.ok) {
        throw new Error('No tienes acceso a este video');
      }

      const data = await response.json();
      setPlaybackId(data.playbackId);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTimeUpdate(currentTime: number) {
    // Guardar progreso cada 10 segundos
    if (currentTime - lastSavedTime.current < 10) return;
    lastSavedTime.current = currentTime;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      progress_seconds: Math.floor(currentTime),
    });
  }

  async function handleEnded() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    onComplete?.();
  }

  if (loading) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Cargando video...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={playbackId!}
      tokens={{ playback: token! }}
      streamType="on-demand"
      style={{ aspectRatio: '16/9', borderRadius: '0.5rem' }}
      onTimeUpdate={(e: any) => handleTimeUpdate(e.target.currentTime)}
      onEnded={handleEnded}
    />
  );
}
```

---

## 11. Estructura de Archivos

```
www.ai-thinking.io/
├── public/
│   ├── admin/                    # (Futuro: Decap CMS)
│   ├── cursos/                   # Assets de cursos (thumbnails)
│   │   └── fundamentos-ia/
│   │       └── cover.jpg
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── astro/                # Componentes Astro (estáticos)
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── CourseCard.astro
│   │   │   └── LessonNav.astro
│   │   │
│   │   └── react/                # React Islands (dinámicos)
│   │       ├── auth/
│   │       │   ├── AuthProvider.tsx
│   │       │   ├── LoginForm.tsx
│   │       │   └── UserMenu.tsx
│   │       ├── community/
│   │       │   ├── Feed.tsx
│   │       │   ├── PostCard.tsx
│   │       │   ├── CreatePost.tsx
│   │       │   └── Comments.tsx
│   │       ├── courses/
│   │       │   ├── VideoPlayer.tsx
│   │       │   ├── ProtectedLesson.tsx
│   │       │   └── ProgressTracker.tsx
│   │       └── profile/
│   │           └── ProfileCard.tsx
│   │
│   ├── content/
│   │   ├── config.ts             # Content Collections config
│   │   └── cursos/               # Contenido MDX
│   │       ├── fundamentos-ia/
│   │       │   ├── _curso.json
│   │       │   ├── 01-introduccion.mdx
│   │       │   └── 02-conceptos.mdx
│   │       └── prompting-avanzado/
│   │           ├── _curso.json
│   │           └── ...
│   │
│   ├── layouts/
│   │   ├── Layout.astro          # Layout base
│   │   ├── CourseLayout.astro    # Layout para lecciones
│   │   └── CommunityLayout.astro # Layout para comunidad
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase
│   │   └── utils.ts              # Utilidades
│   │
│   ├── pages/
│   │   ├── index.astro           # Landing
│   │   ├── login.astro           # Autenticación
│   │   ├── comunidad.astro       # Feed agregado
│   │   ├── perfil.astro          # Perfil usuario
│   │   ├── ranking.astro         # (Futuro)
│   │   └── cursos/
│   │       ├── index.astro       # Catálogo
│   │       └── [curso]/
│   │           ├── index.astro   # Página del curso
│   │           ├── comunidad.astro # Comunidad del curso
│   │           └── [leccion].astro # Lección
│   │
│   ├── stores/                   # Estado compartido (nanostores)
│   │   └── auth.ts
│   │
│   └── types/
│       └── database.ts           # Tipos TypeScript
│
├── scripts/
│   ├── sync-courses.ts           # Sincroniza MDX → Supabase
│   └── grant-access.ts           # Dar acceso a usuarios
│
├── supabase/
│   └── functions/
│       └── get-video-token/
│           └── index.ts
│
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── .env.local                    # Variables de entorno (no en Git)
```

---

## 12. Workflows Operativos

### Crear un curso nuevo

```bash
# 1. Crear carpeta del curso
mkdir -p src/content/cursos/nuevo-curso

# 2. Crear metadata
cat > src/content/cursos/nuevo-curso/_curso.json << 'EOF'
{
  "title": "Nombre del Curso",
  "description": "Descripción del curso",
  "thumbnail": "/cursos/nuevo-curso/cover.jpg",
  "order": 1
}
EOF

# 3. Agregar thumbnail
cp mi-imagen.jpg public/cursos/nuevo-curso/cover.jpg

# 4. Crear primera lección (ver siguiente sección)

# 5. Push
git add .
git commit -m "Nuevo curso: Nombre del Curso"
git push

# 6. Netlify hace build + sync automático
# 7. Curso disponible en ~2 minutos
```

### Crear una lección

```bash
# 1. Subir video a Mux Dashboard
#    - Ir a dashboard.mux.com
#    - Video → Assets → Create new asset
#    - Playback policy: SIGNED
#    - Copiar el Playback ID resultante

# 2. Crear archivo MDX
cat > src/content/cursos/mi-curso/01-intro.mdx << 'EOF'
---
title: "Introducción"
description: "En esta lección aprenderás..."
videoId: "PLAYBACK_ID_DE_MUX"
duration: 600
isFree: true
order: 1
---

# Introducción

Contenido de la lección en Markdown...

## Subtítulo

Más contenido...
EOF

# 3. Push
git add .
git commit -m "Nueva lección: Introducción"
git push
```

### Dar acceso a un usuario

**Método 1: Supabase Dashboard**

1. Ir a supabase.com → Tu proyecto
2. Table Editor → `user_courses`
3. Insert Row
4. Llenar:
   - `user_id`: (buscar en tabla `profiles`)
   - `course_id`: (buscar en tabla `courses`)
   - `granted_by`: "Pago manual - Fecha"

**Método 2: Script CLI**

```bash
# Dar acceso (usar email sanitizado como username)
# Ejemplo: juan@gmail.com → juan_gmail_com
npx tsx scripts/grant-access.ts juan_gmail_com fundamentos-ia "Pago PayPal - Enero 2025"

# Resultado:
# ✅ juan_gmail_com ahora tiene acceso a "Fundamentos de IA"
```

**Método 3: SQL directo**

```sql
-- Username es email sanitizado (ej: juan@gmail.com → juan_gmail_com)
INSERT INTO user_courses (user_id, course_id, granted_by)
SELECT p.id, c.id, 'Pago manual - Enero 2025'
FROM profiles p, courses c
WHERE p.username = 'juan_gmail_com'
  AND c.slug = 'fundamentos-ia';
```

### Revocar acceso

```sql
DELETE FROM user_courses
WHERE user_id = (SELECT id FROM profiles WHERE username = 'juan_gmail_com')
  AND course_id = (SELECT id FROM courses WHERE slug = 'fundamentos-ia');
```

### Ver usuarios de un curso

```sql
SELECT
  p.username,
  uc.granted_at,
  uc.granted_by
FROM user_courses uc
JOIN profiles p ON p.id = uc.user_id
JOIN courses c ON c.id = uc.course_id
WHERE c.slug = 'fundamentos-ia'
ORDER BY uc.granted_at DESC;
```

---

## 13. Configuraciones

### Variables de entorno

```bash
# .env.local (desarrollo local)
# .env.production (en Netlify)

# Supabase
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...  # Solo para scripts

# Mux (solo para upload script, si se usa)
MUX_TOKEN_ID=xxxxx
MUX_TOKEN_SECRET=xxxxx
```

### Configuración de Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Role = ["admin"]}
```

### astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'hybrid',  // Algunas páginas SSR
  adapter: netlify(),
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY),
    },
  },
});
```

### Supabase Edge Functions secrets

Configurar en Supabase Dashboard → Settings → Edge Functions:

```
MUX_SIGNING_KEY_ID=xxxxx
MUX_SIGNING_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
```

---

## 14. Plan de Implementación

### Fase 1: Fundación (Semana 1)

| Día | Tarea |
|-----|-------|
| 1 | Crear proyecto Supabase, configurar Auth (Email + Google) |
| 2 | Crear todas las tablas y RLS |
| 3 | Configurar triggers y funciones |
| 4 | Crear estructura de carpetas en el proyecto Astro |
| 5 | Implementar cliente Supabase y tipos TypeScript |

### Fase 2: Autenticación (Semana 2)

| Día | Tarea |
|-----|-------|
| 1-2 | Crear AuthProvider (React), LoginForm, flujo de registro |
| 3 | Implementar página /login |
| 4 | Crear UserMenu, protección de rutas |
| 5 | Testing de auth, fix bugs |

### Fase 3: Cursos (Semana 3)

| Día | Tarea |
|-----|-------|
| 1 | Configurar Content Collections, crear primer curso de prueba |
| 2 | Implementar script de sincronización |
| 3 | Crear páginas de catálogo y detalle de curso |
| 4 | Configurar Mux, subir videos de prueba |
| 5 | Implementar Edge Function para tokens |

### Fase 4: Video Player (Semana 4)

| Día | Tarea |
|-----|-------|
| 1-2 | Crear componente VideoPlayer con Mux |
| 3 | Implementar ProtectedLesson y control de acceso |
| 4 | Tracking de progreso |
| 5 | Testing completo del flujo de cursos |

### Fase 5: Comunidad (Semana 5)

| Día | Tarea |
|-----|-------|
| 1-2 | Crear Feed, PostCard, CreatePost |
| 3 | Implementar likes y comentarios |
| 4 | Feed agregado en /comunidad |
| 5 | Comunidad por curso en /cursos/[slug]/comunidad |

### Fase 6: Polish y Deploy (Semana 6)

| Día | Tarea |
|-----|-------|
| 1-2 | Página de perfil |
| 3 | UI/UX polish, responsive |
| 4 | Testing final, fix bugs |
| 5 | Deploy producción, documentación |

---

## 15. Costos Estimados

### Servicios (MVP)

| Servicio | Plan | Costo mensual |
|----------|------|---------------|
| **Supabase** | Free | $0 |
| **Netlify** | Free | $0 |
| **Mux** | Pay-as-go | ~$0-5 |
| **Dominio** | (ya tienes) | $0 |
| **Total MVP** | | **$0-5/mes** |

### Mux detallado

| Concepto | Precio |
|----------|--------|
| Encoding | $0.007/min de video (único) |
| Storage | Incluido |
| Delivery | $0.00096/min visto |
| Free tier | 100,000 min delivery/mes |

**Ejemplo: 30 videos de 15 min**
- Encoding: 450 min × $0.007 = **$3.15** (único)
- 500 usuarios × 5 videos/mes × 15 min = 37,500 min = **$0** (dentro del free tier)

### Cuándo escalar (costos futuros)

| Escenario | Supabase | Mux | Total |
|-----------|----------|-----|-------|
| 500 usuarios | Free | ~$10 | ~$10/mes |
| 1,000 usuarios | Pro $25 | ~$30 | ~$55/mes |
| 2,000+ usuarios | Pro $25 | ~$80 | ~$105/mes |

---

## 16. Funcionalidades Futuras

### No incluidas en MVP (agregar después)

| Feature | Complejidad | Prioridad |
|---------|-------------|-----------|
| Gamificación (puntos, niveles) | Media | Alta |
| Notificaciones | Media | Media |
| Leaderboard | Baja | Media |
| Búsqueda | Baja | Media |
| Panel de admin | Alta | Alta |
| Pagos con Stripe | Alta | Media |
| Decap CMS | Baja | Baja |
| App móvil | Alta | Baja |
| Certificados | Media | Baja |
| Eventos en vivo | Alta | Baja |

### Para gamificación (cuando se implemente)

```sql
-- Agregar campos a profiles
ALTER TABLE profiles ADD COLUMN points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;

-- Trigger para puntos por actividad
CREATE OR REPLACE FUNCTION update_points_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Lógica de puntos
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Para notificaciones (cuando se implemente)

```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'like', 'comment', 'new_lesson'
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Checklist de Lanzamiento

```
ANTES DE LANZAR
═══════════════

[ ] Supabase
    [ ] Todas las tablas creadas
    [ ] RLS habilitado en todas las tablas
    [ ] Triggers funcionando
    [ ] Edge Function desplegada
    [ ] Secrets configurados

[ ] Mux
    [ ] Cuenta creada
    [ ] Signing Keys generadas
    [ ] Al menos 1 video de prueba subido

[ ] Netlify
    [ ] Variables de entorno configuradas
    [ ] Build funcionando
    [ ] Deploy automático desde GitHub

[ ] Autenticación
    [ ] Login con email funciona
    [ ] Login con Google funciona
    [ ] Registro crea perfil automáticamente
    [ ] Logout funciona

[ ] Cursos
    [ ] Al menos 1 curso con lecciones
    [ ] Sync a Supabase funciona
    [ ] Video player reproduce
    [ ] Progreso se guarda

[ ] Comunidad
    [ ] Crear post funciona
    [ ] Likes funcionan
    [ ] Comentarios funcionan
    [ ] Feed filtra por cursos del usuario

[ ] Control de acceso
    [ ] Lecciones gratis accesibles sin login
    [ ] Lecciones de pago bloqueadas sin acceso
    [ ] Dar acceso manual funciona
    [ ] Video no reproduce sin token válido
```

---

*Documento generado: Enero 2026*
*Plataforma: www.ai-thinking.io*