# Class editor

Standalone, responsive RHF/Zod page with content, image library, searchable coach multipicker, URL mode, session defaults and publication status. One save action; no wizard or intercepted modal. Name generates the slug until manually edited. Custom URLs redirect the canonical class route; standard layout previews remain unsaved and public-field-only.

The route provider uses server actions and verified Supabase admin access in database mode. Otherwise Storybook and previews use MockDataAdapter. Sessions require their own minimum-one coach assignment; this roster is for marketing. Coach compensation is never a class field.

See [component guide](../../../../../../../../docs/component-guide.md).
