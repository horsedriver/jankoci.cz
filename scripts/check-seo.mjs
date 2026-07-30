import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const dist = resolve("dist");
const failures = [];

async function requireFile(path) {
  try { await access(join(dist, path)); }
  catch { failures.push(`Missing dist/${path}`); }
}

async function htmlFiles(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) result.push(...await htmlFiles(full));
    else if (extname(entry.name) === ".html") result.push(full);
  }
  return result;
}

for (const file of ["robots.txt", "sitemap.xml", "og-card.svg", "404.html", "cv/index.html"]) {
  await requireFile(file);
}

const robots = await readFile(join(dist, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://jankoci.cz/sitemap.xml")) failures.push("robots.txt does not advertise the canonical sitemap");

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const route of ["/", "/work/", "/about/", "/lab/", "/contact/", "/cv/", "/cs/", "/cs/work/", "/cs/about/", "/cs/lab/", "/cs/contact/"]) {
  if (!sitemap.includes(`<loc>https://jankoci.cz${route}</loc>`)) failures.push(`sitemap.xml is missing ${route}`);
}

for (const match of sitemap.matchAll(/<loc>https:\/\/jankoci\.cz([^<]+)<\/loc>/g)) {
  const route = match[1];
  const target = route === "/" ? "index.html" : route.endsWith("/") ? join(route.slice(1), "index.html") : route.slice(1);
  await requireFile(target);
}

for (const file of await htmlFiles(dist)) {
  if (file.includes(`${join(dist, "cv")}/`)) continue;
  const html = await readFile(file, "utf8");
  const label = file.replace(dist, "dist");
  const is404 = file === join(dist, "404.html");
  for (const marker of [
    'rel="canonical"',
    'property="og:image"',
    'name="twitter:card" content="summary_large_image"',
    is404 ? 'name="robots" content="noindex,follow"' : 'name="robots" content="index,follow,max-image-preview:large"',
    'type="application/ld+json"'
  ]) {
    if (!html.includes(marker)) failures.push(`${label}: missing ${marker}`);
  }
}

const notFound = await readFile(join(dist, "404.html"), "utf8");
if (!notFound.includes('rel="canonical" href="https://jankoci.cz/"')) failures.push("404.html must canonicalize to the home page");
if (sitemap.includes("/404")) failures.push("sitemap.xml must not contain the 404 route");

if (failures.length) {
  console.error("SEO check failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("SEO output check passed.");
