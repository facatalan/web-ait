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

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('Felipe Catalán'),
    publishDate: z.date(),
    category: z.enum([
      'metodologia',
      'herramientas-ia',
      'casos-estudio',
      'prompting',
      'automatizacion',
      'industria'
    ]),
    tags: z.array(z.string()).default([]),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    isDraft: z.boolean().default(false),
    featured: z.boolean().default(false),
    readingTime: z.number().optional(),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogImage: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }).optional(),
  }),
});

export const collections = { cursos, programas, blog };
