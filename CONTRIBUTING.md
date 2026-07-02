# Contributing To Mivix UI

Every current and future component must keep the same compatibility contract.

## Product Model

Mivix UI uses a free core plus paid Pro approach.

- The `mivix-ui` package is the MIT-licensed free core.
- The core should remain genuinely useful for real apps, not just a teaser.
- Advanced enterprise features, large template packs, premium themes, managed integrations, and high-support components can be reserved for a future Pro package or paid service.
- Do not add a feature to the free core only because it exists in a peer library. Decide whether it belongs to Core or Pro first.

Core features should be broadly reusable, dependency-light, and important to adoption. Pro features can be deeper, more opinionated, implementation-heavy, or tied to business workflows that companies are likely to pay for.

## Component Compatibility Standard

- Ship as standards-based Web Components with no framework runtime dependency.
- Work from plain JavaScript through ESM imports.
- Include TypeScript declarations for public classes, data models, properties, and events.
- Support JSX/TSX usage through `src/index.d.ts` intrinsic element declarations.
- Be safe for Next.js by documenting client-side registration when a component touches browser APIs.
- Export through `src/components/<component>/index.js` and `index.d.ts`.
- Keep universal attributes working: `theme`, `radius`, `lang`, `dir`, `locale`, and `i18n`.
- Use bubbling composed DOM events so React, Next.js, Angular, Vue, Blazor, and plain JavaScript can listen consistently.

## New Component Checklist

1. Add `src/components/<component>/<component>.js`.
2. Add `src/components/<component>/index.js`.
3. Add `src/components/<component>/<component>.d.ts`.
4. Add `src/components/<component>/index.d.ts`.
5. Export the class from `src/index.js` and `src/index.d.ts`.
6. Add the custom element to `JSX.IntrinsicElements` in `src/index.d.ts`.
7. Add a docs demo and playground API rows in `docs/index.html`.
8. Verify JavaScript import, TypeScript import, and Next.js client usage.
