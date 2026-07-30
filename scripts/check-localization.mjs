import { readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const dist = resolve("dist");
const sourceRoot = resolve("src/content");
const failures = [];

async function readBuiltPage(path) {
  return readFile(join(dist, path, "index.html"), "utf8");
}

function requireText(html, text, page) {
  if (!html.includes(text)) failures.push(`${page}: missing ${text}`);
}

function rejectText(html, text, page) {
  if (html.includes(text)) failures.push(`${page}: contains legacy marker ${text}`);
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    failures.push(`${file}: missing frontmatter`);
    return { values: new Map(), arrays: new Map() };
  }

  const values = new Map();
  const arrays = new Map();
  let activeArray = null;

  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trimEnd();
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && activeArray) {
      arrays.get(activeArray).push(item[1].trim());
      continue;
    }

    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!field) continue;
    const [, key, rawValue] = field;
    if (!rawValue) {
      activeArray = key;
      arrays.set(key, []);
    } else {
      activeArray = null;
      values.set(key, rawValue.trim());
    }
  }

  return { values, arrays };
}

const pagePaths = ["", "work", "about", "lab", "contact"];
for (const page of pagePaths) {
  const route = page ? `/${page}/` : "/";
  const en = await readBuiltPage(page);
  const cs = await readBuiltPage(join("cs", page));

  requireText(en, '<html lang="en" data-language="en"', route);
  requireText(cs, '<html lang="cs" data-language="cs"', `/cs${route}`);
  requireText(en, `rel="canonical" href="https://jankoci.cz${route}"`, route);
  requireText(cs, `rel="canonical" href="https://jankoci.cz/cs${route}"`, `/cs${route}`);
  requireText(en, `hreflang="cs" href="https://jankoci.cz/cs${route}"`, route);
  requireText(cs, `hreflang="en" href="https://jankoci.cz${route}"`, `/cs${route}`);
  requireText(en, `data-language-link="cs"`, route);
  requireText(cs, `data-language-link="en"`, `/cs${route}`);
  rejectText(en, 'navigator.language.toLowerCase()', route);
  rejectText(en, 'localStorage.getItem("jk-language")', route);
}

const homeEn = await readBuiltPage("");
const homeCs = await readBuiltPage("cs");
requireText(homeEn, "Infrastructure intelligence", "/");
requireText(homeEn, "governed by humans", "/");
requireText(homeCs, "Inteligentní správa infrastruktury", "/cs/");
requireText(homeCs, "řízená lidmi", "/cs/");
requireText(homeEn, 'href="/cv/" data-cv-open', "/");

const contactCs = await readBuiltPage(join("cs", "contact"));
requireText(contactCs, "Syst%C3%A9mov%C3%A1%20architektura", "/cs/contact/");

const englishEntries = (await readdir(join(sourceRoot, "work")))
  .filter((file) => file.endsWith(".md"))
  .map((file) => basename(file, ".md"))
  .sort();
const czechEntries = (await readdir(join(sourceRoot, "work-cs")))
  .filter((file) => file.endsWith(".md"))
  .map((file) => basename(file, ".md"))
  .sort();

if (JSON.stringify(englishEntries) !== JSON.stringify(czechEntries)) {
  failures.push("Case-study IDs differ between work and work-cs collections.");
}

for (const id of englishEntries) {
  const route = `/work/${id}/`;
  const enHtml = await readBuiltPage(join("work", id));
  const csHtml = await readBuiltPage(join("cs", "work", id));
  requireText(enHtml, 'class="localized-block" data-lang="en"', route);
  requireText(csHtml, 'class="localized-block" data-lang="cs"', `/cs${route}`);
  requireText(csHtml, `rel="canonical" href="https://jankoci.cz/cs${route}"`, `/cs${route}`);

  const englishPath = join(sourceRoot, "work", `${id}.md`);
  const czechPath = join(sourceRoot, "work-cs", `${id}.md`);
  const english = parseFrontmatter(await readFile(englishPath, "utf8"), englishPath);
  const czech = parseFrontmatter(await readFile(czechPath, "utf8"), czechPath);

  for (const field of ["order", "featured", "externalUrl"]) {
    const en = english.values.get(field) || "";
    const cs = czech.values.get(field) || "";
    if (en !== cs) failures.push(`${id}: ${field} differs between languages (${en} !== ${cs})`);
  }

  for (const field of ["title", "eyebrow", "summary", "period", "role", "status", "evidence", "visibility"]) {
    if (!english.values.get(field)) failures.push(`${id}: English ${field} is empty`);
    if (!czech.values.get(field)) failures.push(`${id}: Czech ${field} is empty`);
  }

  for (const field of ["outcomes", "capabilities"]) {
    const en = english.arrays.get(field) || [];
    const cs = czech.arrays.get(field) || [];
    if (!en.length) failures.push(`${id}: English ${field} is empty`);
    if (!cs.length) failures.push(`${id}: Czech ${field} is empty`);
    if (en.length !== cs.length) failures.push(`${id}: ${field} count differs (${en.length} !== ${cs.length})`);
  }
}

if (failures.length) {
  console.error("Localization check failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Static localization check passed for ${pagePaths.length} page pairs and ${englishEntries.length} case-study pairs.`);
