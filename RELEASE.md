# Release workflow (token-based publish)

This repo uses npm automation tokens so publish can run without interactive OTP prompts.
Recent npm security policy changes are deprecating direct publishing with some 2FA-bypass token types.
If `npm publish` starts requiring OTP, pass a one-time code through `--otp` or `NPM_OTP`.

## 1) Configure token locally

Create `.env.npm` in the repo root (gitignored) and add your npm token:

```bash
NPM_TOKEN=<your npm automation token>
```

The helper script reads this file automatically. Example:

```bash
cat > .env.npm <<'EOF'
NPM_TOKEN=<your npm automation token>
EOF
```

You can also set `NPM_TOKEN` directly in the shell.
To include OTP for interactive publish, set `NPM_OTP` (or pass `--otp=<code>`):

```bash
NPM_OTP=123456 npm run publish:alpha-latest
# or:
npm run publish:alpha-latest -- --otp=123456
```

## 2) Publish alpha

```bash
npm run publish:alpha
# same as: npm run release:alpha
```

That runs:
`npm publish --tag alpha --access public`.

## 3) Publish alpha and point latest at it

```bash
npm run publish:alpha-latest
# same as: npm run release:alpha:latest
```

This publishes with `alpha` tag and then moves the `latest` dist-tag to the current package version.
If your account policy requires 2FA for publish, include OTP as shown in step 1.

## 4) Move latest tag only (no republish)

```bash
npm run publish:set-latest
# same as: npm run release:set-latest
```

## 5) Verify tags on registry

```bash
npm view mivix-ui dist-tags --json
```

## 6) Long-term publish path (recommended)

For future npm policy changes, plan for one of:

- **Trusted publishing (OIDC)** from CI
- **Staged publishing** with a human approval step

These avoid long-lived publish tokens and align with npm’s 2026+ 2FA enforcement roadmap.
