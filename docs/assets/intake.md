# Coach source-image intake

**Ticket:** ASSET-010  
**System of record for raw photography:** Balanse image assets (Jose’s Drive + agent workflow).  
**Do not** treat Facebook research captures as headshot sources.

---

## Where intake lives

| Surface | What it is | Access |
| --- | --- | --- |
| Google Drive folder **“Coaches Photos and Docs”** | Owner uploads: per-coach folders with Sony **ARW** (and similar) plus intro docs | Shared by Jose / Coach Rex. Ask Jose for the current Drive URL if you do not have it. ARWs stay **private** — never commit them to this public repo. |
| This repository `docs/coaches/{slug}/` | **Web-ready derivatives only** (JPEG/WebP, long-edge capped) produced by the Balanse image assets agent from those ARWs. Intro PDFs/DOCX when photos are missing. | Anyone with repo access. Index: `docs/coaches/README.md`. |
| Facebook / `docs/facebook-findings/` | Roster **identity** and class mapping (`findings.md` §4b). `coaches-roster.jpg` and screenshot zips live in Drive per `docs/facebook-findings/README.md`. | **Research only.** Not a generation reference. |

**Balanse image assets dev** in the tickets = this lane: Drive folder → agent derives web previews into `docs/coaches/` → catalog ids in [source-catalog.yaml](source-catalog.yaml) → Higgsfield `media_id` at generate time ([runbook.md](runbook.md)).

There is **no** second sourcing route. Missing photo → request another Drive upload, then re-run the agent workflow. Do not scrape Facebook avatars.

---

## How the team notices new uploads

1. Jose (or Rex) adds/replaces files under **Coaches Photos and Docs**.
2. Image-assets agent (or a human) compares Drive folders to `docs/coaches/README.md` and [coverage-matrix.yaml](coverage-matrix.yaml).
3. New ARWs → develop web derivatives (existing dcraw / JPEG+WebP recipe) into `docs/coaches/{slug}/` **without** committing ARWs.
4. Update the coverage matrix (upload date, quality, decision) and catalog ids.
5. Re-check the matrix **before `ASSET-012`** and **before `ASSET-030`**.

Outstanding requests are dated in the matrix so `ASSET-012` is not silently blocked.

---

## Three things that must stay distinct

1. **Source photos** — real photographs of a named roster coach (Drive ARW → catalogued item). Only valid headshot inputs.
2. **Research captures** — Facebook screenshots and `coaches-roster.jpg`. They answer *who teaches what*. They are **not** references for `generate_image`.
3. **Consent** — written permission to generate and publish an AI-assisted likeness. A photo without consent is treated like **no photo** for generation (`ASSET-014` placeholder). **Jose auto-approved all Assets on 2026-09-19** (standing). `consent_recorded: yes` for every coach with a catalogued source photo (`decision: generate`). Placeholder-only coaches stay `no` until a source lands.

---

## Minimum source quality

Reject (flag back through Drive / Jose — do **not** silently generate) if:

- face not clearly visible (silhouette, heavy crop, back of head only),
- resolution too low for a 4:5 editorial restyle (web long-edge under ~800px after develop is a warning; unusable if face is soft/pixelated),
- heavily filtered / beauty-smoothed / meme overlay,
- not reasonably current (obviously a different life stage if someone who knows them flags it),
- wrong person or mixed-group shot where the coach cannot be isolated.

Quality values in the matrix: `pass` | `fail` | `pending` | `n/a`.

---

## Higgsfield registration

Catalogued sources get a stable `intake_item_id` immediately (`src-coach-…`).  
`higgsfield_media_id` is filled when the operator registers media for `ASSET-011` / `ASSET-012` (see runbook handoff). This foundations PR does **not** upload private sources to Higgsfield.

---

## Roster boundary

Confirmed 11 names: `findings.md` §4b / roadmap §7.4.

**Sella** appears on the Facebook timetable as Mat Pilates but is **not** on the owner-confirmed roster. Sella is **not** in the coverage matrix and must not receive a headshot slot.

**Kate Go** is the 11th roster name. No Drive photo folder has landed → placeholder + outstanding request.

**Alec James Co** and **Sofia Ocampo** have intro docs only → placeholder until ARWs arrive.

---

## Privacy

- Coach **photos** will be public once approved and uploaded.
- Coach **rates** are never part of this intake.
- Raw ARWs: private Drive only.
