# Mivix UI

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-4f46e5)](https://devduocouple.github.io/mivix-ui/)
![npm version](https://img.shields.io/npm/v/mivix-ui.svg)
![npm downloads](https://img.shields.io/npm/dm/mivix-ui.svg)

Mivix UI is a dependency-free Web Components library for dashboards, workflow tools, AI surfaces, and framework-neutral product interfaces.

It works with plain HTML, JavaScript, TypeScript, React, Next.js, Angular, Vue, Blazor, and any framework that can render custom elements.

## Install

```bash
npm install mivix-ui@alpha
```

Import the design tokens once:

```ts
import 'mivix-ui/styles';
```

## Pick The Right Import

Use the smallest import style that fits your app.

| Use case | Import | Notes |
| --- | --- | --- |
| Smallest production bundles | `mivix-ui/components/*` | Import only the components you use. |
| Common app primitives | `mivix-ui/auto-lite` | Auto-registers buttons, forms, overlays, feedback, navigation, and layout basics. |
| Full catalog demos/prototypes | `mivix-ui/auto` | Auto-registers the full component set, including charts, data, AI, and peer-parity components. |
| SSR/schema utilities | `mivix-ui/ssr` | Helpers for server-rendered/configured UI. |

### Exact Component Imports

```ts
import 'mivix-ui/styles';
import { define } from 'mivix-ui/core';
import { MvxButton } from 'mivix-ui/components/button';
import { MvxInput } from 'mivix-ui/components/input';

define('mvx-button', MvxButton);
define('mvx-input', MvxInput);
```

```html
<mvx-input label="Project name"></mvx-input>
<mvx-button type="solid" tone="primary">Create</mvx-button>
```

### Lite Auto Registration

```ts
import 'mivix-ui/styles';
import 'mivix-ui/auto-lite';
```

Use `auto-lite` when you want a quick setup without pulling the full catalog into the first import.

### Full Auto Registration

```ts
import 'mivix-ui/styles';
import 'mivix-ui/auto';
```

Use `auto` for docs, internal tools, demos, and prototypes where convenience matters more than the smallest startup bundle.

## Package Footprint

Current local npm pack check:

- Packed tarball: about `174.2 kB`
- Unpacked package: about `834 kB`
- Published file count: `516`
- Runtime dependencies: `0`

The package ships source ESM, TypeScript declarations, changelog, license, and security metadata. The npm package intentionally excludes the docs site, screenshots, release scripts, examples, and other repository-only assets.

Rough local ESM source graph sizes before consumer minification:

| Entry | Raw source | Gzip |
| --- | ---: | ---: |
| `mivix-ui/auto-lite` | about `261 kB` | about `45 kB` |
| `mivix-ui/auto` | about `741 kB` | about `142 kB` |
| Exact component import | varies by component | about `14-19 kB` for common controls checked locally |

For production apps, prefer exact component imports or `auto-lite`. `auto` is intentionally broader because it registers the full library.

## Current Highlights

- Two visual families: Mivix and Material-style variants.
- Token-based themes, direction, locale, radius, density, skeleton states, and component style controls.
- Rich alert API with message, variants, density, accent, icons, close behavior, generated actions, action alignment, and `mvx-action`.
- Modal API with configurable close button, density, separated header/body/footer, generated footer actions, and action events.
- Date picker and calendar with month/year selection, weekend marking, ignored dates/ranges, disable-before/disable-after, disabled hints, and keyboard focus handling.
- JSON Schema Form docs and examples for schema-driven forms.
- Improved playground with editable examples, lock/unlock, reset, copy, validation, and live API controls.
- File input with combined field/button layout, previews, removable file list, clear all, helper text, type filtering, count limits, and size validation.
- Rating shapes and colors with decimal fill support.
- Radial progress with `0-100` values and optional decimal precision.
- Speed dial item labels, icon-only mode, alignment options, Mivix hover parity, and shape-aware skeletons.
- Slider, select, close button, FAB, and related peer-parity components polished for more consistent Mivix styling.

`mvx-toggle` and `mvx-toggle-group` have been removed from the public package. Use `mvx-switch`, `mvx-checkbox`, `mvx-swap`, `mvx-button-group`, or `mvx-filter` depending on the interaction.

## Documentation

- Website: https://www.mivix-ui.io/
- Docs site: https://devduocouple.github.io/mivix-ui/
- Repository: https://github.com/devduocouple/mivix-ui
- Issues: https://github.com/devduocouple/mivix-ui/issues

## Status

Mivix UI is alpha software. APIs, component behavior, and styling details may change before beta while the component contract is refined.

## Versioning

Mivix UI follows Semantic Versioning.

- Current channel: `alpha`
- Recommended install: `npm install mivix-ui@alpha`
- Current package version: `0.1.0-alpha.3`

## License

MIT - see [LICENSE](./LICENSE).
