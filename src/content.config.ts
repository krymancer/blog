import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  // Ignores files starting with _ (drafts-in-progress, partials).
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    /** Optional summary for link previews; defaults to the first paragraph. */
    description: z.string().optional(),
  }),
});

export const collections = { posts };
