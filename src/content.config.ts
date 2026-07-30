import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const commonFields = {
  title: z.string(),
  eyebrow: z.string(),
  summary: z.string(),
  order: z.number().int(),
  period: z.string(),
  role: z.string(),
  featured: z.boolean().default(false),
  outcomes: z.array(z.string()).min(1),
  capabilities: z.array(z.string()).min(1),
  externalUrl: z.url().optional()
};

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    ...commonFields,
    status: z.enum(["Production", "Shipped", "Open source", "Active", "Prototype", "Archived"]),
    evidence: z.enum(["Source-backed", "Documented", "Recollection"]),
    visibility: z.enum(["Public", "Anonymized"])
  })
});

const workCs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work-cs" }),
  schema: z.object({
    ...commonFields,
    status: z.enum(["Produkce", "Dodáno", "Open source", "Aktivní", "Prototyp", "Archivováno"]),
    evidence: z.enum(["Podloženo zdroji", "Zdokumentováno", "Vzpomínka"]),
    visibility: z.enum(["Veřejné", "Anonymizované"])
  })
});

export const collections = { work, workCs };
