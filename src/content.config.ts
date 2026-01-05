import { defineCollection, z } from 'astro:content';

// Schema para attachments (documentos adjuntos)
const attachmentSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.enum(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'other']).optional(),
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
    attachments: z.array(attachmentSchema).optional(),
  }),
});

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

export const collections = { cursos, programas };
