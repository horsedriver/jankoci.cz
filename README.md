# Jan Kočí — Portfolio v2.1

Proof-first bilingual portfolio for [jankoci.cz](https://jankoci.cz).

## Status

The Astro site is the production website. The `main` branch is deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml`; the custom domain is `jankoci.cz` and HTTPS is enforced in
GitHub Pages settings.

The site is currently localized in English and Czech on shared URLs. Language detection and the
manual CZ/EN switch run in the browser and persist the optional `jk-language` preference in local
storage. A future routing change may move Czech content to dedicated `/cs/` URLs for stronger
international SEO.

## Local development

```bash
npm install
npm run dev
```

Run the complete validation suite:

```bash
npm run check
```

The suite validates sensitive public source content, Astro types and content schemas, the static
build, localization parity and generated local links.

## Architecture

- Astro 7 static output with directory-style trailing-slash routes.
- Shared layout and components in `src/layouts/` and `src/components/`.
- English case studies in `src/content/work/`.
- Czech case studies in `src/content/work-cs/`, paired one-to-one by entry ID.
- Five main pages and four generated case-study routes.
- Presentation-only career kit published under `/cv/`.

## Content model

Each case study declares:

- operational maturity;
- evidence quality;
- public or anonymized visibility;
- measurable outcomes;
- relevant capabilities.

`scripts/check-localization.mjs` rejects missing language pairs and metadata drift between the two
collections. The build also scans public source content for infrastructure identifiers, IP addresses
and common secret patterns.

## CV publication

`scripts/prepare-cv.mjs` copies the presentation-only career kit from the repository root into
`/cv/` during development and production builds. Navigation links to `/cv/` work without JavaScript;
where supported, the portfolio enhances them into an in-page dialog.

## Deployment

Pull requests run `.github/workflows/quality.yml` and upload the generated `dist` directory as a
review artifact. A push to `main` runs validation again and deploys `dist` to the protected
`github-pages` environment.

Rollback is performed by reverting the production commit on `main` and allowing the Pages workflow
to redeploy the previous static output. DNS and the GitHub Pages custom-domain setting are managed
separately from application code.
