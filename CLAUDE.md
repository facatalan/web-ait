# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page for **AIThinking** - a methodology for professionals to strategically collaborate with AI. Built with Astro 5 and Tailwind CSS, featuring a modern dark theme with gradient effects. The site is in Spanish.

## Commands

```bash
npm run dev      # Start development server on localhost:4321
npm run build    # Build for production
npm run preview  # Preview production build
```

## Dependencies

- `astro`: ^5.16.6
- `@astrojs/tailwind`: ^6.0.2
- `tailwindcss`: ^3.4.19

## Project Structure

```
web-ait/
├── src/
│   ├── components/       # 12 Astro components
│   │   ├── Header.astro      # Fixed nav with glassmorphism
│   │   ├── Hero.astro        # Full-height hero with dual glow effects
│   │   ├── Partners.astro    # AI platform logos (OpenAI, Anthropic, etc.)
│   │   ├── Audience.astro    # Target audience criteria cards
│   │   ├── System.astro      # 3-pillar methodology cards
│   │   ├── Results.astro     # 3-level outcome progression
│   │   ├── Instructor.astro  # Bio section with experience list
│   │   ├── Decision.astro    # Red pill/blue pill metaphor
│   │   ├── Testimonials.astro # Client quotes grid
│   │   ├── FAQ.astro         # Accordion with <details>/<summary>
│   │   ├── CTA.astro         # Contact section (id="contact")
│   │   └── Footer.astro      # Social links and copyright
│   ├── layouts/
│   │   └── Layout.astro      # Base template with global styles
│   └── pages/
│       └── index.astro       # Main landing page
├── public/
│   └── images/
│       ├── logo.png
│       ├── instructor.jpg
│       ├── logos/            # Partner logos (5 files)
│       ├── backgrounds/      # Hero and section backgrounds
│       ├── icons/            # System icons and pildoras.png
│       └── avatars/          # Testimonial avatars (4 files)
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json             # Path alias: @/* -> src/*
```

## Design System

### Colors (tailwind.config.mjs)

| Token | Hex | Usage |
|-------|-----|-------|
| `dark-900` | #0a0a0f | Page background |
| `dark-800` | #12121a | Component backgrounds |
| `dark-700` | #1a1a25 | Card backgrounds |
| `dark-600` | #22222f | Elevated surfaces |
| `accent-blue` | #3b82f6 | Primary accent, CTAs |
| `accent-purple` | #8b5cf6 | Secondary accent |
| `accent-cyan` | #06b6d4 | Tertiary accent |

### Typography

- **Font**: Inter (loaded via Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Global CSS Classes (Layout.astro)

```css
.gradient-text    /* Blue-purple-cyan gradient text */
.gradient-border  /* Gradient border with dark background */
.glow            /* Blue glow box-shadow effect */
```

### Visual Effects

- **Glassmorphism**: `backdrop-blur-lg` + semi-transparent backgrounds
- **Glow effects**: Blur circles with accent colors
- **Hover states**: Border color transitions, translate-y, opacity changes

## Component Patterns

### Data Structure

All components use local `const` arrays for data instead of props:

```astro
---
const items = [
  { title: '...', description: '...' }
]
---
{items.map(item => <Card {...item} />)}
```

### Section Numbering

Sections use numbered badges with accent colors:
- 02: Audience (accent-blue)
- 03: System (accent-purple)
- 04: Results (accent-cyan)
- 05: Instructor (accent-blue)
- 06: Testimonials (accent-cyan)

### Card Pattern

```html
<div class="bg-dark-800 border border-white/10 rounded-2xl p-6
            hover:border-accent-blue/50 transition-colors">
```

## Important Notes

1. **Static Site**: No client-side JavaScript; completely static build
2. **Hardcoded Content**: All text is in Spanish and hardcoded in components
3. **No Form Handling**: CTA uses `mailto:contacto@neuroboost.ai`
4. **Image Dependencies**: Components expect specific images in `/public/images/`
5. **Responsive**: Mobile-first with `md:` and `lg:` breakpoints

## Known Issues

- **Dynamic Tailwind Classes**: `Results.astro` uses dynamic classes like `bg-${color}/20` which may not purge correctly. Consider using static class names.
- **Section Numbering**: Section "05" appears twice (Instructor and Decision).

---

## Platform Roadmap

The landing page is evolving into a full course platform. See [specs/Courses.md](specs/Courses.md) for the complete technical specification.

### Summary

| Aspect | Details |
|--------|---------|
| **Domain** | www.ai-thinking.io |
| **Target Stack** | Astro + React Islands + Supabase + Mux |
| **Features** | Video courses, community per course, manual access control |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Video** | Mux with signed tokens |
| **Database** | PostgreSQL via Supabase with RLS |

### Key Tables (Supabase)

- `profiles` - User data extending auth.users
- `courses` - Course metadata (synced from MDX)
- `lessons` - Lesson metadata with Mux playback IDs
- `user_courses` - Access control (manual grant)
- `posts`, `comments`, `likes` - Community features
- `lesson_progress` - Video progress tracking

### Planned URL Structure

| Route | Description |
|-------|-------------|
| `/cursos` | Course catalog |
| `/cursos/[slug]` | Course detail page |
| `/cursos/[slug]/[leccion]` | Lesson with video |
| `/cursos/[slug]/comunidad` | Course community |
| `/comunidad` | Aggregated feed |
| `/login` | Authentication |
| `/perfil` | User profile |

### Content Structure

```
src/content/cursos/
├── fundamentos-ia/
│   ├── _curso.json           # Course metadata
│   ├── 01-introduccion.mdx   # Lesson with frontmatter
│   └── ...
```

### Convenciones de Archivos en Cursos

**IMPORTANTE** - En `src/content/cursos/` distinguimos entre:

| Extensión | Tipo | Descripción | Se cuenta en progreso |
|-----------|------|-------------|----------------------|
| `.mdx` | Lección | Clases con video | **Sí** |
| `.md` | Recurso | Plantillas, guías descargables | No |

Al desarrollar features de **conteo de lecciones o progreso**, siempre filtrar:
```ts
lessons.filter(l => l.id.endsWith('.mdx'))
```

Archivos que aplican este filtro:
- `src/pages/programas/[programa]/index.astro`
- `src/pages/programas/[programa]/[curso]/index.astro`
- `src/pages/programas/[programa]/[curso]/[leccion].astro`
- `src/pages/api/programs/[programa]/lessons-count.ts`

### Implementation Phases

1. **Foundation** - Supabase setup, tables, RLS
2. **Authentication** - Login, registration, session
3. **Courses** - Content Collections, sync script
4. **Video Player** - Mux integration, access control
5. **Community** - Feed, posts, likes, comments
6. **Polish & Deploy** - Profile, UI/UX, testing
