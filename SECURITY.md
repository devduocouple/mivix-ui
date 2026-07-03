# Security Policy

Mivix UI is an alpha-stage component library. Security fixes are treated as high priority, especially issues that can lead to cross-site scripting, unsafe navigation, credential exposure, or supply-chain risk.

## Supported Versions

| Version | Security support |
| --- | --- |
| `0.x alpha` | Best-effort security fixes while APIs stabilize |

## Reporting a Vulnerability

Please report security issues privately through the repository owner contact channel before opening a public issue. Include:

- affected component or API
- reproduction steps
- browser/runtime version
- expected and actual behavior
- any proof-of-concept payload

Do not include secrets, tokens, production data, or exploit details in public issues.

## Security Baseline

Mivix components should:

- escape user-controlled text before rendering HTML
- reject unsafe URL schemes such as `javascript:` and `vbscript:`
- avoid inline event-handler attributes from JSON/SSR rendering
- sanitize rich text before insertion or emission
- keep provider/API secrets outside browser components
- use same-origin backend gateways for AI and cloud integrations
- support CSP-friendly usage where possible

## Consumer Responsibilities

UI components reduce client-side risk, but they do not replace application security. Applications using Mivix should still enforce authentication, authorization, rate limiting, server-side validation, dependency scanning, CSP headers, and secret management.
