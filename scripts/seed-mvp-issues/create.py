#!/usr/bin/env python3
"""Create remaining MVP roadmap GitHub issues from docs/MVP-ROADMAP.md."""
import json, os, re, time, urllib.request, urllib.error
from pathlib import Path

repo = os.environ["GH_REPO"]
token = os.environ["GH_TOKEN"]

# Epics already filed
EPIC = {"fe": 4, "be": 5, "assets": 6}
LABEL = {"fe": "track:fe", "be": "track:be", "assets": "track:assets"}
NOTES = {
  "fe": "Model: Cursor Grok medium effort. Deliverables: screens/mocks, Storybook, metas, OpenSpec. Assignee agent: Balanse FE dev. Automerge when build+lint pass. No BE wiring this phase.",
  "be": "Model: Cursor Grok medium effort. Deliverables: APIs, metas, OpenSpec, multi-file Prisma schemas. Assignee agent: Balanse BE dev. Automerge when build+lint pass.",
  "assets": "Model: Cursor Grok low effort. Deliverables: Higgsfield CLI gens using nano banana pro only at 1k. Intake via Balanse image assets workflow; hand off to FE when screens need assets. Assignee agent: Balanse image assets dev.",
}

# IDs already created via MCP before this workflow
ALREADY = {
  "INF-001","INF-002","INF-003","INF-004","INF-005","INF-006","INF-007","INF-008",
  "BE-001","BE-002","BE-003","BE-004","BE-005","BE-006","BE-007","BE-008","BE-009","BE-010",
  "BE-011","BE-012","BE-013","BE-014","BE-015",
}

def api(method, path, data=None):
    body = None if data is None else json.dumps(data).encode()
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "balanse-seed",
            **({"Content-Type": "application/json"} if body else {}),
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()}

text = Path("docs/MVP-ROADMAP.md").read_text()
cut = text.find("## 8. Later phase")
body = text[:cut] if cut != -1 else text
pat = re.compile(r"^#### ((?:INF|BE|FE-FND|FE-SHR|FE-PUB|FE-CUS|FE-ADM|ASSET)-\d+) — (.+)$", re.M)
matches = list(pat.finditer(body))

def extract_fields(block):
    block = re.split(r"\n### ", block)[0]
    fields = {}
    field_pat = re.compile(r"^-\s+\*\*([^:*]+):\*\*\s*", re.M)
    starts = [(m.start(), m.end(), m.group(1).strip()) for m in field_pat.finditer(block)]
    for i, (s, e, name) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else len(block)
        val = block[e:end].strip()
        val = re.split(r"\n---\s*$", val)[0].strip()
        fields[name] = val
    return fields

tickets = []
seen = set()
for i, m in enumerate(matches):
    tid, title = m.group(1), m.group(2).strip()
    if tid in seen:
        continue
    seen.add(tid)
    start = m.end()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
    fields = extract_fields(body[start:end].strip())
    if tid.startswith("ASSET"):
        track = "assets"
    elif tid.startswith(("INF", "BE")):
        track = "be"
    else:
        track = "fe"
    tickets.append({"id": tid, "title": title, "track": track, **fields})

# Existing issues for dedupe
existing_titles = set()
existing_ids = set(ALREADY)
page = 1
while True:
    st, batch = api("GET", f"/repos/{repo}/issues?state=all&per_page=100&page={page}")
    if st != 200 or not batch:
        break
    for it in batch:
        if "pull_request" in it:
            continue
        t = it["title"]
        existing_titles.add(t)
        if t.startswith("[") and "]" in t:
            existing_ids.add(t[1:t.index("]")])
    if len(batch) < 100:
        break
    page += 1

parent_nodes = {}
for parent in (4, 5, 6):
    st, data = api("GET", f"/repos/{repo}/issues/{parent}")
    if st == 200:
        parent_nodes[parent] = data.get("node_id")

results = {"created": [], "skipped": [], "failed": []}

for t in tickets:
    tid = t["id"]
    track = t["track"]
    epic = EPIC[track]
    title = f"[{tid}] {t['title']}"
    if tid in existing_ids or title in existing_titles:
        results["skipped"].append({"id": tid, "reason": "exists"})
        print(f"SKIP {tid}")
        continue

    issue_body = "\n".join([
        f"> **Execution notes**\n>\n> {NOTES[track]}",
        "",
        f"**Epic:** #{epic}",
        "",
        f"- **Owner lane:** {t.get('Lane') or track.upper()}",
        f"- **Depends on:** {t.get('Depends on') or 'none'}",
        f"- **Source docs:** {t.get('Source docs') or 'see roadmap'}",
        "",
        "### Scope",
        t.get("Scope notes") or "_See roadmap._",
        "",
        "### Acceptance criteria",
        t.get("Acceptance criteria") or "- [ ] See roadmap",
        "",
        "### Out of scope",
        t.get("Out of scope") or "_None specified._",
        "",
        "### Sequencing",
        f"Phase: **{t.get('Phase') or 'TBD'}** (from `docs/MVP-ROADMAP.md`)",
        "",
        "---",
        f"_Source: `docs/MVP-ROADMAP.md` ticket `{tid}`_",
    ])

    st, data = api(
        "POST",
        f"/repos/{repo}/issues",
        {"title": title, "body": issue_body, "labels": [LABEL[track], "phase:mvp-mocks"]},
    )
    if st not in (200, 201):
        results["failed"].append({"id": tid, "status": st, "error": data})
        print(f"FAIL {tid} {st} {data}")
        time.sleep(1)
        continue

    number = data["number"]
    node_id = data.get("node_id")
    existing_ids.add(tid)
    existing_titles.add(title)
    results["created"].append({"id": tid, "number": number, "track": track})
    print(f"OK {tid} #{number}")

    parent_node = parent_nodes.get(epic)
    if parent_node and node_id:
        gql = {
            "query": "mutation($parent:ID!, $child:ID!) { addSubIssue(input:{issueId:$parent, subIssueId:$child}) { issue { number } } }",
            "variables": {"parent": parent_node, "child": node_id},
        }
        st2, gd = api("POST", "/graphql", gql)
        if st2 != 200 or (isinstance(gd, dict) and gd.get("errors")):
            print(f"WARN sub-issue link {tid}: {gd}")

    time.sleep(0.35)

Path("seed-results.json").write_text(json.dumps(results, indent=2))
print("SUMMARY", {k: len(v) for k, v in results.items()})
print("CREATED_BY_TRACK", {
    tr: [x["number"] for x in results["created"] if x["track"] == tr]
    for tr in ("fe", "be", "assets")
})
