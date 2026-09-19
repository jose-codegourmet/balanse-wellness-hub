#!/usr/bin/env bash
set -euo pipefail
PACK="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$PACK/../../../.." && pwd)"
cd "$ROOT"
cat "$PACK"/part-* | base64 -d | tar xzf -
echo "Expanded CTA marketing assets under docs/assets/marketing/"
