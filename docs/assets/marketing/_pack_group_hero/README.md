# group-hero-16x9 binary pack

GitHub MCP cannot land raw binaries through JSON. These `.b64.part*` sidecars
are the text-safe transport for ASSET-015 coaches-b.

```bash
# from repo root
./scripts/decode-coaches-hero-group-b64.sh
```

Writes webready + thumbs under `docs/assets/marketing/coaches/`. After decode,
commit the binaries and optionally remove this pack directory.
