#!/usr/bin/env node
/**
 * Enforces ASSET-002 rules that JSON Schema alone does not:
 * - identity-bound generate portraits require source_asset_id
 * - source_free entries must not carry a source_asset_id
 * - approved requires non-empty alt_text
 * - only listed approval statuses
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "docs/assets/manifest.json"), "utf8"));

const errors = [];
const statuses = new Set(["draft", "client-review", "approved", "rejected"]);

function hasSource(id) {
  if (id == null) return false;
  if (Array.isArray(id)) return id.length > 0 && id.every((x) => x && x.intake_item_id);
  return Boolean(id.intake_item_id);
}

for (const a of manifest.assets) {
  const loc = a.id;
  if (!statuses.has(a.approval_status)) {
    errors.push(`${loc}: invalid approval_status`);
  }
  if (a.approval_status === "approved" && !String(a.alt_text || "").trim()) {
    errors.push(`${loc}: approved assets require alt_text`);
  }
  if (a.source_free && hasSource(a.source_asset_id)) {
    errors.push(`${loc}: source_free but source_asset_id is set`);
  }
  if (a.source_free && a.source_asset_id != null) {
    errors.push(`${loc}: source_free requires source_asset_id null`);
  }
  const needsSource =
    a.identity_bound &&
    (a.generation_policy === "generate" ||
      (a.generation_policy === "per_coach" && a.slot === "portrait-template"));
  if (a.identity_bound && a.generation_policy === "generate" && !hasSource(a.source_asset_id)) {
    errors.push(`${loc}: identity-bound generate portrait rejected without source_asset_id`);
  }
  if (needsSource && a.generation_policy === "generate" && a.source_free) {
    errors.push(`${loc}: generate identity-bound cannot be source_free`);
  }
}

if (errors.length) {
  console.error("Asset manifest validation failed:\n" + errors.map((e) => ` - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`Asset manifest OK (${manifest.assets.length} entries, schema ${manifest.schema_version}).`);
