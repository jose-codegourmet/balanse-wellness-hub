import { execSync } from "node:child_process";

const needle = ["paw", "pair"].join("");
const allow = new Set(["docs/MVP-ROADMAP.md", "CHANGELOG.md", "scripts/guard-brand.mjs"]);

let output = "";
try {
  output = execSync(`git grep -i -n ${needle} -- ':!pnpm-lock.yaml'`, { encoding: "utf8" });
} catch {
  output = "";
}

const hits = output
  .trim()
  .split("\n")
  .filter(Boolean)
  .filter((line) => !allow.has(line.split(":")[0]));

if (hits.length) {
  console.error("Forbidden demo-brand remnant detected:\n" + hits.join("\n"));
  process.exit(1);
}

console.log("Brand guard passed.");
