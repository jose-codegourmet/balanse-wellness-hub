import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SERVICE_ROLE_JWT = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const SB_SECRET = /sb_secret_[A-Za-z0-9_-]{16,}/g;

function trackedFiles() {
  const out = execSync("git ls-files -c -o --exclude-standard", { encoding: "utf8" });
  return out.split("\n").filter(Boolean);
}

function isProbablyJwt(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return payload?.role === "service_role" || payload?.role === "supabase_admin";
  } catch {
    return false;
  }
}

const failures = [];

for (const file of trackedFiles()) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const jwtMatches = text.match(SERVICE_ROLE_JWT) ?? [];
  for (const token of jwtMatches) {
    if (isProbablyJwt(token)) {
      failures.push(`${file}: committed JWT with privileged role`);
    }
  }

  if (SB_SECRET.test(text)) {
    failures.push(`${file}: committed sb_secret_* token`);
  }
  SB_SECRET.lastIndex = 0;

  const nextPublicLines = text
    .split("\n")
    .filter((line) => /^\s*(?:export\s+)?NEXT_PUBLIC_/.test(line));
  for (const line of nextPublicLines) {
    const jwt = (line.match(SERVICE_ROLE_JWT) ?? [])[0];
    if (
      line.includes("sb_secret_") ||
      line.includes("SERVICE_ROLE") ||
      (jwt && isProbablyJwt(jwt))
    ) {
      failures.push(`${file}: privileged key assigned on a NEXT_PUBLIC_* variable`);
    }
  }
}

if (failures.length > 0) {
  console.error(`secrets-scan failed:\n${failures.map((item) => ` - ${item}`).join("\n")}`);
  process.exit(1);
}

console.log("secrets-scan: no privileged keys in tracked files");
