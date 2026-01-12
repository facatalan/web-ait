import type { APIRoute } from 'astro';
import { getEntry, getCollection } from 'astro:content';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { programa } = params;

    if (!programa) {
      return new Response(JSON.stringify({ error: 'Program slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get program data
    const program = await getEntry('programas', programa);

    if (!program) {
      return new Response(JSON.stringify({ error: 'Program not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract all course slugs from program weeks
    const courseSlugs = program.data.weeks.flatMap((week) => week.courses);

    // Get all lessons
    const allLessons = await getCollection('cursos');

    // Filter lessons that belong to this program's courses
    const programLessons = allLessons.filter((lesson) =>
      courseSlugs.includes(lesson.data.course)
    );

    return new Response(JSON.stringify({
      count: programLessons.length,
      courses: courseSlugs,
      lessons: programLessons.map(l => ({
        slug: l.slug,
        course: l.data.course,
        title: l.data.title,
        order: l.data.order
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in lessons-count API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
