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

const pagePaths = ["", "work", "about", "lab", "contact"];
for (const page of pagePaths) {
  const html = await readBuiltPage(page);
  requireText(html, 'data-lang="en"', page || "/");
  requireText(html, 'data-lang="cs"', page || "/");
  requireText(html, "data-title-cs=", page || "/");
  requireText(html, "data-content-cs=", page || "/");
}

const home = await readBuiltPage("");
requireText(home, 'localStorage.getItem("jk-language")', "/");
requireText(home, 'navigator.language.toLowerCase().startsWith("cs")', "/");
requireText(home, 'data-set-lang="cs"', "/");
requireText(home, 'data-set-lang="en"', "/");
requireText(home, 'data-content-cs="cs_CZ"', "/");

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
  const html = await readBuiltPage(join("work", id));
  requireText(html, 'class="localized-block" data-lang="en"', `/work/${id}/`);
  requireText(html, 'class="localized-block" data-lang="cs"', `/work/${id}/`);
}

if (failures.length) {
  console.error("Localization check failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`Localization check passed for ${pagePaths.length} pages and ${englishEntries.length} case studies.`);
