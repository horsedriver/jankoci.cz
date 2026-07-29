# Jan Kočí — Portfolio v2.1

Proof-first portfolio for [jankoci.cz](https://jankoci.cz).

## Status

Phase 1 is an isolated Astro prototype. The production site remains served from `main` until a
separate deployment approval.

## Local development

```bash
npm install
npm run dev
```

Run the complete validation suite:

```bash
npm run check
```

## Content model

Case studies live in `src/content/work/`. Each entry declares:

- operational maturity;
- evidence quality;
- public or anonymized visibility;
- measurable outcomes;
- relevant capabilities.

The build scans public source content for infrastructure identifiers, IP addresses and common
secret patterns.

## CV preservation

`scripts/prepare-cv.mjs` copies the current presentation-only career kit from the repository root
into `/cv/` during the build. The portfolio and CV therefore remain separate products without
maintaining two manual copies of the career kit.

## Deployment

This phase adds validation only. It does not change GitHub Pages, DNS, `main` or the live site.
Moving production from the current root deployment to the Astro `dist/` artifact requires a
separate reviewed decision.
