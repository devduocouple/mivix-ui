# Release workflow (token-based publish)

This repo uses npm automation tokens so publish can run without interactive OTP prompts.

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

## 4) Move latest tag only (no republish)

```bash
npm run publish:set-latest
# same as: npm run release:set-latest
```

## 5) Verify tags on registry

```bash
npm view mivix-ui dist-tags --json
```
