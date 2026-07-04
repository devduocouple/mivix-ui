# Mivix UI

> Status: Alpha. Mivix UI is under active development. Components are not yet stable, and APIs, styling details, and behavior may change while the library is hardened toward a stable release.

Mivix UI is an open source library of reactive, AI-ready Web Components inspired by compact developer consoles: graphite glass, beveled panels, thin luminous edges, cobalt blue state, and dense workflows.

It ships as standards-based custom elements, so the same package works in JavaScript, TypeScript, Next.js, React, Angular, Vue, .NET/Blazor, server-rendered apps, and plain HTML.

## Free Core And Pro

`mivix-ui` is the free MIT-licensed core package. The core is intended to stay useful on its own: teams should be able to build real apps with the base components, theme tokens, SSR helpers, docs, and framework examples.

Mivix UI will use an open-core business model as it matures. Advanced commercial work will live in a future Pro layer, such as `@mivix-ui/pro`, template packs, enterprise themes, advanced data components, and paid support. See [PRO.md](./PRO.md) for the current plan.

## Alpha Status

Mivix UI is currently best suited for evaluation, prototypes, internal tools, and early integration testing. The package is published under the `alpha` npm tag until the core components, docs examples, and framework usage paths are stable enough for a default release.

- Components may still have layout, interaction, accessibility, or API bugs.
- Public APIs can change before beta.
- Use `mivix-ui@alpha` for early testing.
- Avoid mission-critical production usage until the package is promoted from alpha.

## Foundation Release Readiness

Phase 1 is the trust layer for the ecosystem: installation, docs, examples, package exports, framework setup, contribution paths, and a clear alpha roadmap.

- [Phase 1 release audit](./PHASE-1-RELEASE-AUDIT.md) tracks strengths, shortcomings, peer expectations, and page-by-page verification.
- [Roadmap](./ROADMAP.md) separates foundation work from later CLI, adapters, templates, and Pro ecosystem work.
- [Changelog](./CHANGELOG.md) records release-level changes and known gaps.
- [Contributing](./CONTRIBUTING.md) describes the component compatibility standard.
- [Security](./SECURITY.md) describes vulnerability reporting and baseline security expectations.

## Design Direction

- **Graphite-first themes:** dark console surfaces, crisp edge highlights, and focused blue interaction states.
- **Versatile components:** actions, forms, feedback, navigation, disclosure, overlays, data/workflow, AI, layout, and theme primitives.
- **Open source ergonomics:** zero runtime dependencies, CSS custom-property tokens, Shadow DOM encapsulation, accessible keyboard behavior, and framework examples.
- **Core plus Pro path:** essential primitives and selected workflow patterns stay in the free core; advanced templates, enterprise features, and high-support components can move into the future Pro layer.
- **Responsive motion:** buttons and icon buttons use cursor-reactive hover light, press ripples, and intent-aware action feedback, with `motion="none"` and reduced-motion support.
- **Responsive range:** layout primitives use fluid spacing, mobile-safe single-column fallbacks, optional auto-fit grids, and wide container targets for dashboards and 4K screens.

## Component Families

Mivix UI groups similar components as families and exposes focused `mvx-*` elements for each version:

- **Actions:** `mvx-button`, `mvx-icon-button`
- **Forms:** `mvx-input`, `mvx-switch`
- **Feedback:** `mvx-alert`, `mvx-badge`, `mvx-toast`, `mvx-progress`, `mvx-skeleton`
- **Navigation:** `mvx-tabs`, `mvx-breadcrumbs`, `mvx-pagination`, `mvx-shortcuts`
- **Disclosure and overlays:** `mvx-accordion`, `mvx-modal`, `mvx-drawer`, `mvx-tooltip`, `mvx-command-palette`
- **Data and workflow:** `mvx-data-table`, `mvx-kanban`, `mvx-timeline`, `mvx-avatar`
- **AI-ready surfaces:** `mvx-ai-panel`
- **Layout and theming:** `mvx-app-shell`, `mvx-card`, `mvx-theme-switcher`

Accessibility and globalization are treated as part of the component contract: components use native buttons where possible, visible focus states, labels, ARIA roles/states for tabs, accordions, progress, dialogs, breadcrumbs, pagination, tooltips, direction-aware logical CSS, localized built-in labels, and bubbled DOM events for framework integration. Mivix UI is AAA-oriented by default; final WCAG AAA conformance still depends on product content, custom themes, and contrast choices made by the consuming app.

Every component also supports a shared `skeleton` loading state. Use `skeleton-lines` to tune the placeholder shape, or pass variants such as `skeleton="card"`, `skeleton="chart"`, `skeleton="table"`, `skeleton="avatar"`, `skeleton="button"`, or `skeleton="input"`.

## Quick Start

Install the current alpha:

```bash
npm install mivix-ui@alpha
```

For the smallest production bundles, import and register only the components your app uses:

```js
import 'mivix-ui/styles';
import { define } from 'mivix-ui/core';
import { MvxButton } from 'mivix-ui/components/button';
import { MvxSwitch } from 'mivix-ui/components/switch';

define('mvx-button', MvxButton);
define('mvx-switch', MvxSwitch);
```

Use the custom elements in your markup:

```html
<mvx-button variant="primary">Create project</mvx-button>
<mvx-switch checked label="Auto-approve"></mvx-switch>
```

Use the auto entry when you intentionally want every custom element registered, such as quick prototypes, docs, and demos:

```js
import 'mivix-ui/auto';
import 'mivix-ui/styles';
```

The root package entry is tree-shakable and has no auto-registration side effects:

```js
import { MvxButton, MvxChart } from 'mivix-ui';
```

Use it from TypeScript with typed component classes and JSX/TSX element declarations:

```ts
import 'mivix-ui/auto';
import 'mivix-ui/styles';
import type { MvxChart } from 'mivix-ui/components/chart';
import type {} from 'mivix-ui';

const chart = document.querySelector<MvxChart>('mvx-chart');
if (chart) {
  chart.series = [{ name: 'Usage', data: [12, 22, 31, 48, 58] }];
}
```

Run the local docs:

```bash
cd mivix-ui
npm run dev
```

Open `http://127.0.0.1:4173/docs/`.

Build the deployable docs artifact:

```bash
npm run build:docs
```

This writes a self-contained static site to `dist/docs`. The GitHub Pages workflow deploys that generated artifact, so the published docs do not depend on parent-directory imports like `../src/auto.js`.

## SSR, SEO, And JSON Config

Mivix components are SSR-compatible when rendered as HTML/custom element tags and hydrated in the browser. Do not import the browser registration bundle from a Node server render path; register it in the client entry or a Next.js client component. For SEO-critical copy, render the text in light DOM or server-generated markup because shadow DOM content is produced after hydration.

Use the DOM-free SSR helper when a backend, CMS, or agent sends UI as JSON:

```js
import { renderJsonConfig, renderJsonSchemaForm } from 'mivix-ui/ssr';

const cardHtml = renderJsonConfig({
  component: 'card',
  attrs: { title: 'Server rendered' },
  children: [{ tag: 'p', text: 'Search engines can see this copy.' }]
});

const formHtml = renderJsonSchemaForm({
  title: 'Profile',
  properties: {
    name: { type: 'string', title: 'Name' },
    email: { type: 'string', format: 'email', title: 'Email' }
  }
});
```

## Themes

Set the theme on the document element:

```html
<html data-mvx-theme="dark" data-mvx-font="system">
```

Included themes:

- `dark` - the plain dark color scheme.
- `light` - the plain light color scheme.
- `graphite` - the default reference theme from the screenshot.
- `aurora` - richer product UI with teal and violet support colors.
- `terminal` - high-contrast operational console.

Every component also accepts the same universal API:

```html
<mvx-data-table
  theme="dark"
  component-style="dashboard"
  font="humanist"
  radius="0"
  lang="ar"
  dir="rtl"
  locale="ar-EG"
  i18n='{"filterRows":"تصفية الصفوف","rows":"صفوف","noRows":"لا توجد نتائج"}'>
</mvx-data-table>
```

- `theme` changes only the color scheme, such as `dark`, `light`, `aurora`, or `terminal`.
- `component-style` changes structure, surface treatment, density, and animation without changing color tokens. Use `clean` for low-chrome navigation, `minimal` for stripped surfaces, `glass` for expressive panels, and `dashboard` for dense operational UI.
- `font` changes typography without changing color, structure, or spacing. Built-in presets are `system`, `mono`, `serif`, `rounded`, `humanist`, `geometric`, and `devanagari`; custom CSS font stacks are also accepted. Load external web fonts in your app before selecting them.
- `radius` accepts `0`, a number in pixels, any CSS length, `square`, or `rounded`.
- `lang`, `dir`, and `locale` support internationalization, bidirectional UI, and locale-aware comparison.
- `i18n` is a JSON dictionary for built-in labels such as close, previous, next, empty states, command palette, and assistant composer text.

## Framework Compatibility

### JavaScript

```html
<link rel="stylesheet" href="/node_modules/mivix-ui/src/styles/tokens.css" />
<script type="module">
  import 'mivix-ui/auto';
</script>

<mvx-button variant="primary">Deploy</mvx-button>
```

### TypeScript

```ts
import 'mivix-ui/auto';
import 'mivix-ui/styles';
import type { MvxDataTable } from 'mivix-ui/components/data-table';
import type {} from 'mivix-ui';

const table = document.querySelector<MvxDataTable>('mvx-data-table');
```

### Next.js

Load styles from `app/layout.tsx`, then register custom elements in a client component so SSR does not import browser-only custom element classes.

```tsx
// app/layout.tsx
import 'mivix-ui/styles';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-mvx-theme="graphite">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
'use client';

import { useEffect } from 'react';
import type {} from 'mivix-ui';

export default function Page() {
  useEffect(() => {
    void import('mivix-ui/auto');
  }, []);

  return <mvx-button variant="primary">Deploy</mvx-button>;
}
```

### React

```jsx
import 'mivix-ui/auto';
import 'mivix-ui/styles';

export function Toolbar() {
  return <mvx-button variant="primary">Deploy</mvx-button>;
}
```

### Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to the module or standalone component schema, then import once:

```ts
import 'mivix-ui/auto';
import 'mivix-ui/styles';
```

```html
<mvx-input label="Repository" placeholder="owner/project"></mvx-input>
```

### Vue

Configure Vue to treat `mvx-*` tags as custom elements:

```ts
app.config.compilerOptions.isCustomElement = tag => tag.startsWith('mvx-');
import 'mivix-ui/auto';
import 'mivix-ui/styles';
```

### .NET / Blazor

Reference the module and stylesheet in your host page:

```html
<link rel="stylesheet" href="_content/MivixUI/tokens.css" />
<script type="module" src="_content/MivixUI/index.js"></script>
```

Then use components directly:

```razor
<mvx-alert tone="success" title="Synced">All pipelines are healthy.</mvx-alert>
```

## Component API

Events are named for plain DOM usage and framework bindings:

- `mvx-change` for value changes.
- `mvx-select` for command/data selections.
- `mvx-shortcut` and `mvx-command` for declarative keyboard shortcuts.
- `mvx-close` for dismissal.

CSS parts expose controlled styling surfaces such as `part="button"`, `part="panel"`, `part="input"`, and `part="cell"`.

## Project Layout

```text
mivix-ui/
  src/
    core.js
    index.js
    index.d.ts
    components/
      button/
        button.js
        index.js
      data-table/
        data-table.js
        index.js
      modal/
        modal.js
        index.js
      ...
    styles/tokens.css
  docs/
    index.html
    styles.css
  dist/
    docs/
      index.html
      src/
        index.js
        styles/tokens.css
  examples/
    javascript/
    typescript/
    nextjs/
    react/
    angular/
    vue/
    blazor/
  scripts/
    build-docs.js
    dev-server.js
```

## License

The `mivix-ui` core package is MIT licensed. Future Pro packages, template packs, enterprise themes, and commercial services may use a separate commercial license.
