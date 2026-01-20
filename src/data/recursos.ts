export type Recurso = {
  title: string;
  description: string;
  url: string;
  benefits: string[];
  pages: string;
};

export const RECURSOS: Record<string, Recurso> = {
  'guia-ia-profesionales': {
    title: 'Guía de IA para Profesionales',
    description: 'Aprende a integrar la inteligencia artificial en tu trabajo diario de manera efectiva y estratégica.',
    url: 'https://www.ai-thinking.io/documents/guia-ia-profesionales.pdf',
    benefits: [
      'Conceptos fundamentales de IA explicados de forma simple',
      'Herramientas prácticas que puedes usar hoy',
      'Casos de uso reales para tu industria',
      'Checklist de implementación paso a paso',
    ],
    pages: '24',
  },
  'guia-madurez-ai': {
    title: 'Guía de Madurez AI',
    description: 'Evalúa el nivel de adopción de inteligencia artificial en tu organización y descubre los próximos pasos para escalar.',
    url: 'https://www.ai-thinking.io/documents/guia-madurez-ai.pdf',
    benefits: [
      'Framework de 5 niveles de madurez AI',
      'Autoevaluación para tu organización',
      'Roadmap personalizado según tu nivel',
      'Métricas clave para medir progreso',
    ],
    pages: '18',
  },
  'caso-carolina': {
    title: 'Caso Carolina: De 8 horas por propuesta a 2',
    description: 'Descubre cómo una consultora de RRHH con 18 años de experiencia recuperó 27 horas al mes construyendo su Digital Brain con IA.',
    url: 'https://www.notion.so/Caso-Carolina-De-8-horas-por-propuesta-a-2-2da5042285fc80acbd84c4ce432acfc3',
    benefits: [
      'Reduce el tiempo de propuestas en un 75%',
      'Sistema Digital Brain de 5 componentes replicable',
      'Metodología Define-Amplifica-Refina paso a paso',
      'Resultados reales: 27 horas recuperadas al mes',
    ],
    pages: '5',
  },
  'privacidad-ia-2026': {
    title: 'Privacidad e IA: Guía 2026',
    description: 'Aprende a proteger tus datos y los de tu organización mientras aprovechas el poder de la inteligencia artificial de forma segura y ética.',
    url: 'https://www.ai-thinking.io/lead-magnets/recurso_privacidad_ia_2026.pdf',
    benefits: [
      'Marco legal actualizado de privacidad en IA para 2026',
      'Checklist de cumplimiento para uso empresarial de IA',
      'Mejores prácticas para proteger datos sensibles',
      'Guía de configuración de privacidad en herramientas populares',
    ],
    pages: '17',
  },
};
