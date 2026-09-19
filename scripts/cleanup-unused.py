#!/usr/bin/env python3
"""
Remove unused component folders from apps/web after copying this template.

Looks for PascalCase *.tsx component folders under modules/ and sections/,
and checks whether they are imported from the current apps/web src trees
(app, modules, sections, hooks, store).

Usage:
  python scripts/cleanup-unused.py           # dry-run (default)
  python scripts/cleanup-unused.py --delete  # delete unused folders
  python scripts/cleanup-unused.py --help
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB_SRC = ROOT / "apps/web/src"

# Folders that may contain unused component units to report/delete.
CANDIDATE_ROOTS = [
    WEB_SRC / "modules",
    WEB_SRC / "sections",
]

# Trees scanned for import references (must exist in the current layout).
SCAN_ROOTS = [
    WEB_SRC / "app",
    WEB_SRC / "modules",
    WEB_SRC / "sections",
    WEB_SRC / "hooks",
    WEB_SRC / "store",
]

# Matches import/export ... from "..." (alias and relative paths)
IMPORT_RE = re.compile(r"""\bfrom\s+["']([^"']+)["']""")

SKIP_DIR_NAMES = {"node_modules", ".git", "dist", ".next"}


def existing_dirs(paths: list[Path]) -> list[Path]:
    return [path for path in paths if path.is_dir()]


def is_under(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def is_under_any(path: Path, roots: list[Path]) -> bool:
    return any(is_under(path, root) for root in roots)


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def is_component_tsx(path: Path) -> bool:
    """True for primary component files (excludes stories)."""
    if path.suffix != ".tsx":
        return False
    if path.name.endswith(".stories.tsx"):
        return False
    # Must look like a PascalCase component file
    stem = path.stem
    return bool(stem) and stem[0].isupper()


def find_component_folders(roots: list[Path]) -> list[Path]:
    """
    Find folders that contain a primary *.tsx component file.

    Examples:
      modules/layout/navigation/header/Header.tsx
      sections/home/hero/HeroSection.tsx
    """
    folders: list[Path] = []
    for root in roots:
        if not root.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_NAMES]
            current = Path(dirpath)
            for name in filenames:
                if is_component_tsx(current / name):
                    folders.append(current)
                    break
    return sorted(set(folders))


def iter_source_files(scan_roots: list[Path]) -> list[Path]:
    files: list[Path] = []
    for scan_root in scan_roots:
        if not scan_root.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(scan_root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_NAMES]
            current = Path(dirpath)
            for name in filenames:
                if name.endswith((".ts", ".tsx")):
                    files.append(current / name)
    return files


def resolve_import(source_file: Path, spec: str, candidate_roots: list[Path]) -> Path | None:
    """
    Resolve an import specifier to a filesystem path under a candidate root.
    Returns a path that may be a file or directory (caller normalizes to folder).
    """
    resolved: Path | None = None

    if spec.startswith("@/"):
        resolved = (WEB_SRC / spec[2:]).resolve()
    elif spec.startswith("./") or spec.startswith("../"):
        resolved = (source_file.parent / spec).resolve()

    if resolved is None:
        return None
    if not is_under_any(resolved, candidate_roots):
        return None
    return resolved


def normalize_to_file_or_dir(path: Path) -> Path | None:
    """If import omits extension, try common TS/TSX/index resolutions."""
    if path.exists():
        return path

    for ext in (".tsx", ".ts", ".jsx", ".js"):
        candidate = Path(str(path) + ext)
        if candidate.exists():
            return candidate

    for index_name in ("index.tsx", "index.ts", "index.jsx", "index.js"):
        candidate = path / index_name
        if candidate.exists():
            return candidate

    return None


def collect_used_folders(scan_roots: list[Path], component_folders: list[Path]) -> set[Path]:
    """
    Return component folders that are imported from outside themselves.

    Self-imports (e.g. HeroSection.stories.tsx → ./HeroSection) do not count
    as usage, but imports from other stories/pages/components do — so
    Storybook-only cross-usage keeps a component alive.
    """
    folder_set = {f.resolve() for f in component_folders}
    used: set[Path] = set()
    source_files = iter_source_files(scan_roots)

    for source in source_files:
        try:
            text = source.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        source_resolved = source.resolve()
        for match in IMPORT_RE.finditer(text):
            spec = match.group(1)
            if not (
                spec.startswith("@/")
                or spec.startswith("./")
                or spec.startswith("../")
            ):
                continue

            target = resolve_import(source, spec, CANDIDATE_ROOTS)
            if target is None:
                continue

            normalized = normalize_to_file_or_dir(target)
            check_path = normalized if normalized is not None else target

            # Map target to owning component folder (longest matching prefix)
            owning: Path | None = None
            for folder in folder_set:
                try:
                    check_path.relative_to(folder)
                except ValueError:
                    continue
                if owning is None or len(folder.parts) > len(owning.parts):
                    owning = folder

            if owning is None:
                continue

            # Ignore self-references from inside the same component folder
            try:
                source_resolved.relative_to(owning)
                continue
            except ValueError:
                pass

            used.add(owning)

    return used


def folder_display(folder: Path) -> str:
    try:
        return str(folder.relative_to(ROOT)) + "/"
    except ValueError:
        return str(folder) + "/"


def print_roots(label: str, paths: list[Path]) -> None:
    print(label)
    for path in paths:
        print(f"  {display_path(path)}/")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Detect (and optionally delete) unused component folders "
            "under apps/web/src/modules and apps/web/src/sections."
        )
    )
    parser.add_argument(
        "--delete",
        action="store_true",
        help="Permanently delete unused folders (default is dry-run)",
    )
    args = parser.parse_args()

    scan_roots = existing_dirs(SCAN_ROOTS)
    candidate_roots = existing_dirs(CANDIDATE_ROOTS)

    missing_scan = [p for p in SCAN_ROOTS if p not in scan_roots]
    missing_candidates = [p for p in CANDIDATE_ROOTS if p not in candidate_roots]

    if missing_scan:
        print("Warning: scan root(s) not found:")
        for path in missing_scan:
            print(f"  {display_path(path)}/")
    if missing_candidates:
        print("Warning: candidate root(s) not found:")
        for path in missing_candidates:
            print(f"  {display_path(path)}/")

    if not candidate_roots:
        print("No candidate directories found under apps/web/src (expected modules/ and/or sections/).")
        return 1
    if not scan_roots:
        print("No scan roots found under apps/web/src.")
        return 1

    print_roots("Scanning import references in:", scan_roots)
    print_roots("Looking for unused component folders under:", candidate_roots)
    print()

    component_folders = find_component_folders(candidate_roots)
    used = collect_used_folders(scan_roots, component_folders)
    unused = sorted(
        (f for f in component_folders if f.resolve() not in used),
        key=lambda p: str(p),
    )

    print(f"Found {len(component_folders)} component folder(s); {len(used)} referenced.")

    if not unused:
        print("No unused component folders found.")
        return 0

    if args.delete:
        print(f"Deleting {len(unused)} unused folder(s):")
        for folder in unused:
            display = folder_display(folder)
            shutil.rmtree(folder)
            print(f"  deleted {display}")
        print(f"\nRemoved {len(unused)} folder(s).")
        return 0

    print("Unused component folders (dry-run):")
    for folder in unused:
        print(f"  {folder_display(folder)}")
    print(f"\n{len(unused)} unused folder(s) found. Run with --delete to remove.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
