import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno:');
  console.error('   - PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY (service role key, no anon key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CURSOS_DIR = path.join(process.cwd(), 'src/content/cursos');

interface LessonData {
  title: string;
  description?: string;
  videoId?: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
  course: string;
  courseTitle: string;
  courseDescription?: string;
}

async function sync() {
  console.log('🔄 Sincronizando cursos con Supabase...\n');

  const courseDirs = fs.readdirSync(CURSOS_DIR)
    .filter(f => fs.statSync(path.join(CURSOS_DIR, f)).isDirectory());

  for (const courseSlug of courseDirs) {
    const coursePath = path.join(CURSOS_DIR, courseSlug);

    // Leer archivos MDX del curso
    const mdxFiles = fs.readdirSync(coursePath)
      .filter(f => f.endsWith('.mdx'))
      .sort();

    if (mdxFiles.length === 0) {
      console.warn(`⚠️  ${courseSlug}: sin archivos MDX, saltando...`);
      continue;
    }

    // Obtener metadata del curso desde la primera lección
    const firstFile = path.join(coursePath, mdxFiles[0]);
    const firstContent = fs.readFileSync(firstFile, 'utf-8');
    const { data: firstData } = matter(firstContent) as { data: LessonData };

    // Upsert curso
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .upsert({
        slug: courseSlug,
        title: firstData.courseTitle,
        description: firstData.courseDescription || null,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (courseError) {
      console.error(`❌ Error en curso ${courseSlug}:`, courseError.message);
      continue;
    }

    console.log(`📚 ${course.title}`);

    // Procesar cada lección
    for (const file of mdxFiles) {
      const filePath = path.join(coursePath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter } = matter(content) as { data: LessonData };

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
        }, { onConflict: 'course_id,slug' });

      if (lessonError) {
        console.error(`   ❌ Error en lección ${lessonSlug}:`, lessonError.message);
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
