import { existsSync, readFileSync, statSync } from 'node:fs';

const checks = [];

function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
}

function file(path) {
  return readFileSync(path, 'utf8');
}

function has(value, pattern) {
  return pattern instanceof RegExp ? pattern.test(value) : value.includes(pattern);
}

const packageJson = JSON.parse(file('package.json'));
const docs = file('docs/index.html');
const readme = file('README.md');
const audit = file('PHASE-1-RELEASE-AUDIT.md');
const core = file('src/core.js');
const tokens = file('src/styles/tokens.css');
const types = file('src/index.d.ts');
const tooltip = file('src/components/tooltip/tooltip.js');
const builtDocsPath = 'dist/docs/index.html';

[
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'ROADMAP.md',
  'PRO.md',
  'PHASE-1-RELEASE-AUDIT.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/component_request.md',
  '.github/ISSUE_TEMPLATE/docs_request.md',
  'scripts/check-component-doc-sync.js'
].forEach(path => {
  check(`trust file: ${path}`, existsSync(path));
});

check('package has no runtime dependencies', !packageJson.dependencies, 'dependencies field absent');
check('package has no devDependencies', !packageJson.devDependencies, 'devDependencies field absent');
check('package exports root', Boolean(packageJson.exports?.['.']));
check('package exports auto registration entry', Boolean(packageJson.exports?.['./auto']));
check('package exports component subpaths', Boolean(packageJson.exports?.['./components/*']));
check('package exports styles', Boolean(packageJson.exports?.['./styles']));
check('package script check:docs-sync exists', Boolean(packageJson.scripts?.['check:docs-sync']));
check('auto entry marked as side effect', packageJson.sideEffects?.includes('./src/auto.js'));
check('styles marked as side effect', packageJson.sideEffects?.includes('./src/styles/tokens.css'));

[
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'PHASE-1-RELEASE-AUDIT.md',
  'ROADMAP.md',
  'SECURITY.md'
].forEach(path => {
  check(`package includes ${path}`, packageJson.files?.includes(path));
});

[
  'install',
  'javascript',
  'typescript',
  'vite',
  'nextjs',
  'react',
  'angular',
  'vue',
  'nuxt',
  'svelte',
  'astro',
  'solid',
  'dotnet'
].forEach(key => {
  check(`guide nav: ${key}`, has(docs, `data-guide="${key}"`));
  check(`guide route: ${key}`, has(docs, new RegExp(`${key}: \\{[\\s\\S]*?title: '`, 'm')));
});

[
  'mvx-button',
  'mvx-icon',
  'mvx-icons',
  'mvx-data-table',
  'mvx-chart',
  'mvx-chart-group'
].forEach(name => {
  check(`component nav: ${name}`, has(docs, `data-component="${name}"`));
  check(`component docs: ${name}`, has(docs, `'${name}': {`) || has(docs, `name: '${name}'`));
});

[
  'admin-dashboard',
  'saas-marketing',
  'ai-workspace',
  'analytics-report'
].forEach(key => {
  check(`template route: ${key}`, has(docs, `data-template="${key}"`) || has(docs, `${key}: {`));
});

check('template overview docs exist', has(docs, 'const templateDocs') && has(docs, 'title: \'Template gallery\''));

[
  'overview',
  'agent-apis',
  'i18n-a11y',
  'framework-neutral'
].forEach(key => {
  check(`agent route: ${key}`, has(docs, `data-agent-feature="${key}"`) || has(docs, `${key}: {`));
});

check('README links phase audit', has(readme, './PHASE-1-RELEASE-AUDIT.md'));
check('README links roadmap', has(readme, './ROADMAP.md'));
check('README links changelog', has(readme, './CHANGELOG.md'));
check('README documents font support', has(readme, '`font` changes typography'));
check('audit records peer expectations', has(audit, 'Peer Expectations'));
check('audit records shortcomings', has(audit, 'Mivix Shortcomings'));
check('global API documents font', has(docs, "{ name: 'font'"));
check('playground exposes font options', has(docs, "font: ['system', 'mono', 'serif', 'rounded', 'humanist', 'geometric', 'devanagari']"));
check('core observes font attributes', has(core, "'font', 'font-family'"));
check('core defines font stacks', has(core, 'export const fontStacks'));
check('tokens define global font presets', has(tokens, '[data-mvx-font="rounded"]'));
check('types expose font attribute', has(types, 'font?:'));
check('tooltip supports auto placement', has(tooltip, "placement === 'auto'"));
check('tooltip docs expose placement API', has(docs, "name: 'placement'") && has(docs, "top | right | bottom | left | auto"));
check('built docs artifact exists', existsSync(builtDocsPath));
check('built docs artifact is non-empty', existsSync(builtDocsPath) && statSync(builtDocsPath).size > 100000);

const failed = checks.filter(item => !item.pass);
for (const item of checks) {
  const status = item.pass ? 'PASS' : 'FAIL';
  console.log(`${status} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

console.log(`\n${checks.length - failed.length}/${checks.length} Phase 1 checks passed.`);

if (failed.length) {
  process.exitCode = 1;
}
