import { defineCollection, z } from 'astro:content';

const features = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    order: z.number().int().positive(),
    title_it: z.string(),
    title_en: z.string(),
    body_it: z.string(),
    body_en: z.string(),
    screenshot: z.string(),
    icon: z.string(),
  }),
});

const milestones = defineCollection({
  type: 'content',
  schema: z.object({
    version: z.string(),
    date: z.string(),
    title_it: z.string(),
    title_en: z.string(),
    blurb_it: z.string(),
    blurb_en: z.string(),
  }),
});

export const collections = { features, milestones };
