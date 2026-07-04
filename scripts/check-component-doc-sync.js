import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
}

const checks = [];

function inlineDocsScript(html) {
  const scripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  const script = scripts.find(candidate => candidate.includes('const docs =') && candidate.includes('const componentExamples ='));
  if (!script) throw new Error('Could not find docs inline script in docs/index.html.');
  return script;
}

function findBalancedEnd(source, openIndex, openChar, closeChar) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = '';
      continue;
    }

    if (char === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  throw new Error(`Could not find balanced ${openChar}${closeChar} block.`);
}

function extractObject(script, name) {
  const marker = `const ${name} =`;
  const start = script.indexOf(marker);
  if (start < 0) return null;
  const objectStart = script.indexOf('{', start);
  if (objectStart < 0) return null;
  const objectEnd = findBalancedEnd(script, objectStart, '{', '}');
  return script.slice(start, objectEnd + 1);
}

function extractArray(script, name) {
  const marker = `const ${name} =`;
  const start = script.indexOf(marker);
  if (start < 0) return null;
  const arrayStart = script.indexOf('[', start);
  if (arrayStart < 0) return null;
  const arrayEnd = findBalancedEnd(script, arrayStart, '[', ']');
  return script.slice(start, arrayEnd + 1);
}

function evaluateDocsScript(html) {
  const script = inlineDocsScript(html);
  const docsText = extractObject(script, 'docs');
  const examplesText = extractObject(script, 'componentExamples');
  const codeExamplesText = extractObject(script, 'componentCodeExamples');
  const peerText = extractArray(script, 'peerParityComponents');

  if (!docsText || !examplesText) {
    throw new Error('Could not extract docs/componentExamples payload.');
  }

  const payload = `${docsText}\n${examplesText}\n${codeExamplesText ? `${codeExamplesText}\n` : ''}${peerText ? `${peerText}\n` : ''};\n({ docs, componentExamples, componentCodeExamples, peerParityComponents });`;
  return vm.runInNewContext(payload, {}, { timeout: 1000 });
}

function getChangedComponentNames() {
  const changed = execSync('git diff --name-only -- src/components', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => /^src\/components\//.test(line));

  const untracked = execSync('git status --porcelain src/components', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(line => line.trim())
    .map(line => line.slice(3))
    .filter(line => line)
    .filter(line => /^src\/components\//.test(line));

  return [...new Set([...changed, ...untracked]
    .map(file => file.split('/')[2])
    .filter(Boolean)
    .filter(name => /^[a-z0-9-]+$/.test(name))
    .map(name => `mvx-${name}`)
  )];
}

function extractCatalogComponents(html) {
  return new Set([...html.matchAll(/data-component="(mvx-[^"]+)"/g)].map(match => match[1]));
}

const docsHtml = readFileSync('docs/index.html', 'utf8');
const docsData = evaluateDocsScript(docsHtml);
const docsByName = docsData.docs || {};
const examples = docsData.componentExamples || {};
const codeExamples = docsData.componentCodeExamples || {};
const peerParity = Array.isArray(docsData.peerParityComponents) ? docsData.peerParityComponents : [];
const peerParityNames = new Set(peerParity.map(item => item?.name).filter(Boolean));

const changed = getChangedComponentNames();
const catalogComponents = extractCatalogComponents(docsHtml);

check('docs page exists', Boolean(docsByName));

if (!changed.length) {
  console.log('No component source file changes detected in src/components.');
  check('changed components have docs sync', true, 'No source changes to validate.');
} else {
  changed.forEach(name => {
    const entry = docsByName[name] || {};
    const example = examples[name];
    const codeExample = codeExamples[name];
    const catalogHit = catalogComponents.has(name);
    const hasPeerData = peerParityNames.has(name);

    const hasDocsEntry = Boolean(entry && typeof entry === 'object');
    const hasUsage = hasDocsEntry && typeof entry.usage === 'string' && entry.usage.trim().length > 0;
    const hasApi = hasDocsEntry && Array.isArray(entry.api) && entry.api.length > 0;
    const hasDemo = hasDocsEntry && typeof entry.demo === 'string' && entry.demo.trim().length > 0;
    const hasDescription = hasDocsEntry && typeof entry.description === 'string' && entry.description.trim().length > 0;
    const hasCode = Boolean(entry.code || example || codeExample);

    const playgroundSource = [entry.demo, example, entry.code, codeExample?.markup]
      .map(item => typeof item === 'string' ? item : '')
      .join('\n');
    const hasPlaygroundHook = /data-playground-target/.test(playgroundSource);

    check(`component docs entry: ${name}`, hasDocsEntry || hasPeerData, hasDocsEntry ? '' : 'No docs data exists for this component.');
    check(`component catalog card: ${name}`, catalogHit || hasPeerData, catalogHit ? '' : 'Missing catalog card (data-component).');
    check(`component usage text: ${name}`, hasUsage, hasUsage ? '' : 'Missing usage description.');
    check(`component API rows: ${name}`, hasApi, hasApi ? '' : 'Missing API metadata.');
    check(`component demo: ${name}`, hasDemo || Boolean(example), hasDemo || example ? '' : 'Missing demo snippet.');
    check(`component playground hook: ${name}`, hasPlaygroundHook, 'Demo/code missing data-playground-target for live preview.');
    check(`component description: ${name}`, hasDescription, hasDescription ? '' : 'Missing documentation description.');
    check(`component code example: ${name}`, hasCode, hasCode ? '' : 'No code/example payload for copy panel.');
  });

  const missing = checks.filter(item => !item.pass && item.name.startsWith('component'));
  if (missing.length) {
    check('changed components have docs sync', false, `Detected ${missing.length} missing docs/playground updates for changed components: ${changed.join(', ')}.`);
  } else {
    check('changed components have docs sync', true);
  }
}

const failed = checks.filter(item => !item.pass);
for (const item of checks) {
  const status = item.pass ? 'PASS' : 'FAIL';
  console.log(`${status} ${item.name}${item.detail ? ` - ${item.detail}` : ''}`);
}

if (failed.length) {
  process.exitCode = 1;
}
