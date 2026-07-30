import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

const dist = resolve("dist");
const site = "https://jankoci.cz";

async function htmlFiles(path) {
  const files = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(full));
    else if (entry.name === "index.html") files.push(full);
  }
  return files;
}

function routeFor(file) {
  const directory = relative(dist, dirname(file)).split(sep).join("/");
  return directory ? `/${directory}/` : "/";
}

function localizedRoute(route) {
  return route === "/" ? "/cs/" : `/cs${route}`;
}

function setLocalizedAttribute(html, attribute, dataAttribute) {
  const pattern = new RegExp(`(${attribute}=")[^"]*("[^>]*${dataAttribute}="([^"]*)")`, "g");
  return html.replace(pattern, (_, prefix, suffix, localized) => `${prefix}${localized}${suffix}`);
}

function localizeAnchor(tag) {
  if (tag.includes('data-language-link="en"')) return tag.replace(/\saria-current="page"/g, "");
  if (tag.includes('data-language-link="cs"')) {
    return tag.includes('aria-current="page"') ? tag : tag.replace(">", ' aria-current="page">');
  }

  return tag.replace(/href="(\/(?:work|about|lab|contact)(?:\/[^"?#]*)?\/|\/)"/g, (_, href) => {
    return `href="${localizedRoute(href)}"`;
  });
}

function transform(html, route) {
  const englishUrl = `${site}${route}`;
  const czechRoute = localizedRoute(route);
  const czechUrl = `${site}${czechRoute}`;

  let output = html
    .replace('<html lang="en" data-language="en" data-language-ready="true">', '<html lang="cs" data-language="cs" data-language-ready="true">')
    .replace(/<title data-title-en="[^"]*" data-title-cs="([^"]*)">[^<]*<\/title>/, '<title data-title-en="$1" data-title-cs="$1">$1</title>')
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${czechUrl}">`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*">/, `<link rel="alternate" hreflang="en" href="${englishUrl}">`)
    .replace(/<link rel="alternate" hreflang="cs" href="[^"]*">/, `<link rel="alternate" hreflang="cs" href="${czechUrl}">`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/, `<link rel="alternate" hreflang="x-default" href="${englishUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${czechUrl}">`)
    .replace(/<a\b[^>]*>/g, localizeAnchor);

  output = setLocalizedAttribute(output, "content", "data-content-cs");
  output = setLocalizedAttribute(output, "aria-label", "data-aria-cs");
  output = setLocalizedAttribute(output, "href", "data-href-cs");

  output = output
    .replace(/<a href="[^"]*" data-language-link="cs"([^>]*)>/, `<a href="${czechRoute}" data-language-link="cs"$1 aria-current="page">`)
    .replace(/<a href="[^"]*" data-language-link="en"([^>]*)\saria-current="page">/, `<a href="${route}" data-language-link="en"$1>`)
    .replace(/<a href="[^"]*" data-language-link="en"([^>]*)>/, `<a href="${route}" data-language-link="en"$1>`);

  return output;
}

const sources = (await htmlFiles(dist)).filter((file) => {
  const rel = relative(dist, file).split(sep).join("/");
  return !rel.startsWith("cv/") && !rel.startsWith("cs/");
});

for (const source of sources) {
  const route = routeFor(source);
  const target = join(dist, localizedRoute(route), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, transform(await readFile(source, "utf8"), route));
}

console.log(`Generated ${sources.length} canonical Czech routes under /cs/.`);
