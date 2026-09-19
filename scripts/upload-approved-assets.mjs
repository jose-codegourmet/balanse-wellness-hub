#!/usr/bin/env node
/**
 * ASSET-030 — Upload approved assets to Supabase Storage.
 *
 * Reads docs/assets/manifest.json. Only `approved` rows are eligible.
 * Buckets: coach-photos, marketing-assets. Never writes payment-proofs.
 *
 *   node scripts/upload-approved-assets.mjs --dry-run
 *   node scripts/upload-approved-assets.mjs --write-manifest
 *   node scripts/upload-approved-assets.mjs --upload          # needs SUPABASE_SERVICE_ROLE_KEY
 *
 * Env: SUPABASE_URL (default project URL) + SUPABASE_SERVICE_ROLE_KEY.
 * Optional: .env / packages/db/.env (never logged).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(root, "docs/assets/manifest.json");
const DEFAULT_URL = "https://xydundrayuusqizssgby.supabase.co";
const ALLOWED_BUCKETS = new Set(["coach-photos", "marketing-assets"]);
const FORBIDDEN_BUCKET = "payment-proofs";

const MIME = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  for (const raw of readFileSync(filePath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadDotEnv(join(root, ".env"));
loadDotEnv(join(root, "packages/db/.env"));

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  return {
    dryRun: flags.has("--dry-run") || (!flags.has("--upload") && !flags.has("--write-manifest")),
    writeManifest: flags.has("--write-manifest") || flags.has("--upload"),
    upload: flags.has("--upload"),
    help: flags.has("--help") || flags.has("-h"),
  };
}

function aspectToken(ratio) {
  return String(ratio).replace(":", "x");
}

function publicUrl(supabaseUrl, bucket, objectKey) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectKey}`;
}

function storageKey(bucket, objectKey) {
  return `${bucket}/${objectKey}`;
}

function hasSource(id) {
  if (id == null) return false;
  if (Array.isArray(id)) return id.length > 0 && id.every((x) => x?.intake_item_id);
  return Boolean(id.intake_item_id);
}

function addIfExists(files, workingRel, bucket, objectKey) {
  const abs = join(root, workingRel);
  if (!existsSync(abs)) return;
  const ext = extname(workingRel).toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) return;
  files.push({
    working_path: workingRel,
    bucket,
    object_key: objectKey,
    storage_key: storageKey(bucket, objectKey),
    content_type: contentType,
  });
}

function planCoachPortrait(asset) {
  const slug = asset.coach_slug;
  const aspect = aspectToken(asset.aspect_ratio);
  const files = [];
  const bucket = "coach-photos";

  if (asset.slot === "placeholder" || asset.slot === "placeholder-avatar") {
    const base = `docs/assets/placeholders/coach-placeholder-${aspect}`;
    for (const ext of ["webp", "png"]) {
      addIfExists(files, `${base}.${ext}`, bucket, `${slug}/headshot-${aspect}.${ext}`);
    }
    return files;
  }

  const dir = `docs/assets/headshots/${slug}`;
  if (asset.slot === "headshot") {
    addIfExists(
      files,
      `${dir}/headshot-card-${aspect}.webp`,
      bucket,
      `${slug}/headshot-${aspect}.webp`,
    );
    addIfExists(
      files,
      `${dir}/headshot-card-${aspect}.jpg`,
      bucket,
      `${slug}/headshot-${aspect}.jpg`,
    );
    addIfExists(
      files,
      `${dir}/headshot-card-${aspect}-w400.webp`,
      bucket,
      `${slug}/headshot-${aspect}-w400.webp`,
    );
    addIfExists(
      files,
      `${dir}/headshot-card-${aspect}-w400.jpg`,
      bucket,
      `${slug}/headshot-${aspect}-w400.jpg`,
    );
    return files;
  }

  if (asset.slot === "headshot-avatar") {
    addIfExists(files, `${dir}/headshot-${aspect}.webp`, bucket, `${slug}/headshot-${aspect}.webp`);
    addIfExists(files, `${dir}/headshot-${aspect}.jpg`, bucket, `${slug}/headshot-${aspect}.jpg`);
    addIfExists(files, `${dir}/headshot-1x1-w400.webp`, bucket, `${slug}/headshot-1x1-w400.webp`);
    addIfExists(files, `${dir}/headshot-1x1-w400.jpg`, bucket, `${slug}/headshot-1x1-w400.jpg`);
    addIfExists(files, `${dir}/headshot-1x1-w200.webp`, bucket, `${slug}/headshot-1x1-w200.webp`);
    addIfExists(files, `${dir}/headshot-1x1-w200.jpg`, bucket, `${slug}/headshot-1x1-w200.jpg`);
    return files;
  }

  return files;
}

function planMarketing(asset) {
  const aspect = aspectToken(asset.aspect_ratio);
  const stem = `${asset.slot}-${aspect}`;
  const files = [];
  const bucket = "marketing-assets";
  for (const ext of ["webp", "jpg", "jpeg", "png", "gif"]) {
    addIfExists(
      files,
      `docs/assets/marketing/${asset.page}/${stem}.${ext}`,
      bucket,
      `${asset.page}/${stem}.${ext}`,
    );
  }
  return files;
}

export function planAsset(asset) {
  if (asset.approval_status !== "approved") {
    return { asset_id: asset.id, skip: "not-approved", files: [] };
  }
  if (asset.identity_bound && !hasSource(asset.source_asset_id)) {
    return { asset_id: asset.id, skip: "identity-bound-without-source", files: [] };
  }

  let files = [];
  if (asset.page === "coaches" && asset.coach_slug) {
    files = planCoachPortrait(asset);
  } else {
    files = planMarketing(asset);
  }

  if (files.length === 0) {
    return { asset_id: asset.id, skip: "no-local-delivery-files", files: [] };
  }

  const forbidden = files.filter(
    (f) => f.bucket === FORBIDDEN_BUCKET || !ALLOWED_BUCKETS.has(f.bucket),
  );
  if (forbidden.length) {
    return { asset_id: asset.id, skip: "forbidden-bucket", files: [] };
  }

  const primary = files.find((f) => f.content_type === "image/webp") ?? files[0];
  return {
    asset_id: asset.id,
    skip: null,
    files,
    primary,
  };
}

function attachPublicUrls(plan, supabaseUrl) {
  for (const file of plan.files) {
    file.public_url = publicUrl(supabaseUrl, file.bucket, file.object_key);
  }
  if (plan.primary) {
    plan.primary.public_url = publicUrl(supabaseUrl, plan.primary.bucket, plan.primary.object_key);
  }
}

function applyManifest(manifest, plans, supabaseUrl) {
  const byId = new Map(plans.map((p) => [p.asset_id, p]));
  for (const asset of manifest.assets) {
    const plan = byId.get(asset.id);
    if (!plan || plan.skip || !plan.primary) {
      if (asset.public_url === undefined) asset.public_url = null;
      continue;
    }
    asset.storage_key = plan.primary.storage_key;
    asset.public_url = publicUrl(supabaseUrl, plan.primary.bucket, plan.primary.object_key);
    asset.storage_objects = plan.files.map((f) => ({
      working_path: f.working_path,
      storage_key: f.storage_key,
      public_url: publicUrl(supabaseUrl, f.bucket, f.object_key),
    }));
  }
  manifest.updated = new Date().toISOString().slice(0, 10);
}

async function uploadPlans(plans, supabaseUrl, serviceKey) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results = [];
  for (const plan of plans) {
    if (plan.skip) continue;
    for (const file of plan.files) {
      const bytes = readFileSync(join(root, file.working_path));
      const { error } = await supabase.storage.from(file.bucket).upload(file.object_key, bytes, {
        contentType: file.content_type,
        upsert: true,
      });
      if (error) {
        results.push({ ok: false, storage_key: file.storage_key, error: error.message });
      } else {
        results.push({ ok: true, storage_key: file.storage_key });
      }
    }
  }
  return results;
}

async function listBucketKeys(supabaseUrl, serviceKey, bucket) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const keys = [];
  async function walk(prefix) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
    if (error) throw new Error(`${bucket} list ${prefix}: ${error.message}`);
    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id == null && !item.metadata) {
        await walk(path);
      } else {
        keys.push(`${bucket}/${path}`);
      }
    }
  }
  await walk("");
  return keys;
}

function printHelp() {
  console.log(`ASSET-030 upload

Usage:
  node scripts/upload-approved-assets.mjs --dry-run
  node scripts/upload-approved-assets.mjs --write-manifest
  node scripts/upload-approved-assets.mjs --upload

--dry-run         Print the plan; do not write or upload (default if no other flag).
--write-manifest  Write intended storage_key + public_url (and storage_objects) onto approved rows.
--upload          Upsert objects with the service role, then write the manifest.

Requires SUPABASE_SERVICE_ROLE_KEY for --upload. Never invent a key.
Does not update coaches.photo columns (BE follow-up after #168).
Does not touch payment-proofs.
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const plans = manifest.assets.map(planAsset);
  for (const plan of plans) attachPublicUrls(plan, supabaseUrl);

  const uploadable = plans.filter((p) => !p.skip);
  const skipped = plans.filter((p) => p.skip);
  const fileCount = uploadable.reduce((n, p) => n + p.files.length, 0);

  console.log(
    `ASSET-030 plan: ${uploadable.length} approved assets, ${fileCount} objects, ${skipped.length} skipped.`,
  );
  for (const plan of uploadable) {
    console.log(
      `  ${plan.asset_id} → ${plan.primary.storage_key} (+${plan.files.length - 1} derivatives)`,
    );
  }
  const skipGroups = new Map();
  for (const plan of skipped) {
    skipGroups.set(plan.skip, (skipGroups.get(plan.skip) ?? 0) + 1);
  }
  for (const [reason, count] of skipGroups) {
    console.log(`  skip ${reason}: ${count}`);
  }

  if (args.upload) {
    if (!serviceKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is not set. Refusing to invent a key. Re-run with --dry-run or --write-manifest.",
      );
      process.exit(2);
    }
    const results = await uploadPlans(uploadable, supabaseUrl, serviceKey);
    const failed = results.filter((r) => !r.ok);
    const ok = results.filter((r) => r.ok);
    console.log(`Uploaded (upsert): ${ok.length} ok, ${failed.length} failed.`);
    for (const row of failed) {
      console.error(`  FAIL ${row.storage_key}: ${row.error}`);
    }
    if (failed.length) process.exit(1);

    const remote = [
      ...(await listBucketKeys(supabaseUrl, serviceKey, "coach-photos")),
      ...(await listBucketKeys(supabaseUrl, serviceKey, "marketing-assets")),
    ];
    const plannedKeys = new Set(uploadable.flatMap((p) => p.files.map((f) => f.storage_key)));
    const remoteSet = new Set(remote);
    const missing = [...plannedKeys].filter((k) => !remoteSet.has(k));
    const extras = remote.filter((k) => !plannedKeys.has(k));
    console.log(`Reconcile: missing=${missing.length} extras=${extras.length}`);
    for (const k of missing) console.error(`  missing object: ${k}`);
    for (const k of extras) console.log(`  extra object (not in this approved plan): ${k}`);
  } else if (args.dryRun) {
    console.log("Dry-run only. No Storage writes.");
    if (!serviceKey) {
      console.log("Service role unavailable in this environment — upload blocked.");
    }
  }

  if (args.writeManifest) {
    applyManifest(manifest, plans, supabaseUrl);
    writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Wrote ${MANIFEST_PATH}`);
  }
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  main().catch((error) => {
    console.error("[fail] upload-approved-assets", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
