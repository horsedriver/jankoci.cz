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
  const html = await readBuiltPage(page);
  requireText(html, 'data-lang="en"', page || "/");
  requireText(html, 'data-lang="cs"', page || "/");
  requireText(html, "data-title-cs=", page || "/");
  requireText(html, "data-content-cs=", page || "/");
}

const home = await readBuiltPage("");
requireText(home, 'preference.get("jk-language")', "/");
requireText(home, 'navigator.language.toLowerCase().startsWith("cs")', "/");
requireText(home, 'data-set-lang="cs"', "/");
requireText(home, 'data-set-lang="en"', "/");
requireText(home, 'data-content-cs="cs_CZ"', "/");
requireText(home, 'href="/cv/" data-cv-open', "/");

const contact = await readBuiltPage("contact");
requireText(contact, "data-href-cs=", "/contact/");
requireText(contact, "Syst%C3%A9mov%C3%A1%20architektura", "/contact/");

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
  const page = `/work/${id}/`;
  const html = await readBuiltPage(join("work", id));
  requireText(html, 'class="localized-block" data-lang="en"', page);
  requireText(html, 'class="localized-block" data-lang="cs"', page);

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

console.log(`Localization check passed for ${pagePaths.length} pages and ${englishEntries.length} case studies.`);
