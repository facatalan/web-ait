import { defineCollection, z } from 'astro:content';

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

export const collections = { cursos };
