import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    summary: z.string(),
    order: z.number().int(),
    status: z.enum(["Production", "Shipped", "Open source", "Active", "Prototype", "Archived"]),
    period: z.string(),
    role: z.string(),
    evidence: z.enum(["Source-backed", "Documented", "Recollection"]),
    visibility: z.enum(["Public", "Anonymized"]),
    featured: z.boolean().default(false),
    outcomes: z.array(z.string()).min(1),
    capabilities: z.array(z.string()).min(1),
    externalUrl: z.url().optional()
  })
});

export const collections = { work };
