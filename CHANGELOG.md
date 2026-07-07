# Changelog

All notable changes to Mivix UI will be documented in this file.

Mivix UI is currently alpha software. APIs, component behavior, and styling details may change before the first beta.

## 0.1.0-alpha.2 - Foundation Refresh

### Added

- README refresh with compact project overview and showcase screenshots.
- Release publish automation with token-aware workflow (`.env.npm`, `scripts/publish.js`), plus release helper docs.
- npm metadata updates for homepage and repository visibility on npm.

### Changed

- Versioning docs now emphasize current channel (`alpha`) and the active target (`0.1.0-alpha.2`).
- Removed references to historical release docs from active README guidance.
- `.npmrc` usage aligned for local login and automation token flows.

### Fixed

- Clarified distribution docs to keep package publication steps and changelog references aligned.

## 0.1.0-alpha.0 - Foundation Release (Historical)

### Added

- Dependency-free Web Components package with ESM exports.
- Tree-shakable root exports and per-component subpath exports.
- `mivix-ui/auto` entry for full custom element registration in demos and prototypes.
- `mivix-ui/styles` token stylesheet export.
- TypeScript declarations for core components and JSX/TSX intrinsic elements.
- Docs site with component tree, live previews, API tables, playground controls, examples, templates, and framework setup guides.
- Get started guides for JavaScript, TypeScript, Vite, Next.js, React, Angular, Vue, Nuxt, Svelte, Astro, Solid, and .NET / Blazor.
- Theme support for dark, light, graphite, aurora, and terminal schemes.
- Universal component APIs for theme, radius, localization, direction, i18n, skeleton states, and component styles.
- Broad chart catalog with business-oriented data examples and `mvx-chart-group` for grouped reporting cards.
- SSR helpers for JSON-configured UI and schema-driven form rendering.
- Framework examples for JavaScript, TypeScript, Next.js, React, Angular, Vue, and Blazor.
- Open-core project docs including contribution, security, roadmap, and Pro direction.

### Changed

- Root `mivix-ui` exports are kept free of auto-registration side effects.
- Full custom element registration moved to `mivix-ui/auto`.
- Chart demo data now uses distinct business use cases so chart types are visually and semantically easier to compare.
- Navigation components support a cleaner structural style through `component-style="clean"`.

### Known Gaps

- Components are still alpha quality and need wider browser/device verification.
- Examples are integration snippets, not full runnable starter apps yet.
- CLI scaffolding, framework wrapper packages, migration guides, and a theme builder are planned after the foundation release.
- Accessibility is designed into the component contract, but external WCAG audits are not complete yet.
