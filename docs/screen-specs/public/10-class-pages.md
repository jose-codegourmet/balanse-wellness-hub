# Public class catalogue and detail

`/classes` lists active database classes when catalogue mode is enabled (MockDataAdapter remains the preview fallback). `/classes/[slug]` renders the class hero, optional marketing roster, rich-text about content, full-width gallery with fullscreen navigation and zoom, customer pricing, and available class sessions.

Descriptions use the shared safe Markdown subset renderer, not raw HTML. Image paths are local assets or HTTPS URLs. Generated imagery is conceptual; provenance is retained alongside the optimized 2K WebP assets.

Marketing coach assignment is separate from session staffing. No coach compensation, rate type, or snapshot is part of the public class/coach shapes. Session names are optional; empty names fall back to the class name.

Admin previews are explicitly unpublished snapshots carried in a validated public-only fragment. They do not modify canonical pages or persist to a backend. Class content and public coach assignments are database-backed in the confirmed project. Scheduling and booking data remain mocked. Custom class URLs redirect to their configured destination; default slugs use the generic detail layout. See [catalogue integration](../../backend/class-catalogue.md).
