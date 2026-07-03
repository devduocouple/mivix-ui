import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const docsHtml = readFileSync(resolve(repoRoot, 'docs/index.html'), 'utf8');

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

const RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'textarea', 'title']);

function inlineDocsScript(html) {
  const scripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
  const script = scripts.find(candidate => candidate.includes('const docs =') && candidate.includes('const componentExamples ='));
  if (!script) throw new Error('Could not find docs inline script.');
  return script;
}

function findBalancedEnd(source, openIndex, openChar, closeChar) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
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
      index += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error(`Could not find balanced ${openChar}${closeChar} block.`);
}

function evaluatePreviewData(script) {
  const start = script.indexOf('const chartCategoryByType =');
  const agentStart = script.indexOf('const agentFeatureDocs =');
  if (start === -1 || agentStart === -1) throw new Error('Could not locate docs preview data.');
  const agentObjectStart = script.indexOf('{', agentStart);
  const agentObjectEnd = findBalancedEnd(script, agentObjectStart, '{', '}');
  const dataScript = `${script.slice(start, agentObjectEnd + 1)}
;({ docs, componentExamples, componentCodeExamples, agentFeatureDocs });`;
  return vm.runInNewContext(dataScript, {}, { timeout: 1000 });
}

function inferComponentName(value, fallback = '') {
  if (fallback && fallback.startsWith('mvx-')) return fallback;
  const match = String(value || '').match(/<\s*(mvx-[\w-]+)/i);
  return match ? match[1].toLowerCase() : fallback;
}

function inferComponentNames(value) {
  return [...new Set([...String(value || '').matchAll(/<\s*(mvx-[\w-]+)/gi)].map(match => match[1].toLowerCase()))];
}

function componentImportPath(componentName) {
  if (!componentName || !componentName.startsWith('mvx-')) return 'mivix-ui';
  return `mivix-ui/components/${componentName.replace(/^mvx-/, '')}`;
}

function completeSnippetExample(value, setup = '', componentName = '') {
  const source = String(value || '').trim();
  const inferredComponents = inferComponentNames(source);
  if (componentName && componentName.startsWith('mvx-') && !inferredComponents.includes(componentName)) {
    inferredComponents.unshift(componentName);
  }
  if (!inferredComponents.length) {
    const inferredComponent = inferComponentName(source, componentName);
    if (inferredComponent) inferredComponents.push(inferredComponent);
  }
  const imports = [
    `import 'mivix-ui/styles';`,
    ...inferredComponents.map(component => `import '${componentImportPath(component)}';`)
  ];
  const importBlock = [...new Set(imports)].join('\n');
  return `${importBlock}\n\n${source}${setup ? `\n\n${setup.trim()}` : ''}`;
}

function completeExampleCode(value, setup = '', componentName = '') {
  const source = String(value || '').trim();
  if (!source || !source.startsWith('<')) return source;
  return completeSnippetExample(source, setup, componentName);
}

function lineAndColumn(source, index) {
  const before = source.slice(0, index);
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function findTagEnd(source, start) {
  let quote = '';
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '>') return index;
  }
  return -1;
}

function lintHtmlStructure(source, label) {
  const errors = [];
  const stack = [];
  const lowerSource = source.toLowerCase();
  let index = 0;

  while (index < source.length) {
    const open = source.indexOf('<', index);
    if (open === -1) break;

    if (source.startsWith('<!--', open)) {
      const close = source.indexOf('-->', open + 4);
      if (close === -1) {
        errors.push({ index: open, message: 'Unclosed HTML comment.' });
        break;
      }
      index = close + 3;
      continue;
    }

    if (/^<!doctype\b/i.test(source.slice(open, open + 16))) {
      const close = source.indexOf('>', open + 2);
      if (close === -1) errors.push({ index: open, message: 'Unclosed doctype.' });
      index = close === -1 ? source.length : close + 1;
      continue;
    }

    if (source.startsWith('<!', open) || source.startsWith('<?', open)) {
      const close = source.indexOf('>', open + 2);
      if (close === -1) errors.push({ index: open, message: 'Unclosed declaration.' });
      index = close === -1 ? source.length : close + 1;
      continue;
    }

    const close = findTagEnd(source, open);
    if (close === -1) {
      errors.push({ index: open, message: 'Unclosed tag or unclosed attribute quote.' });
      break;
    }

    const rawTag = source.slice(open + 1, close).trim();
    const closing = rawTag.startsWith('/');
    const tagNameMatch = rawTag.match(/^\/?\s*([A-Za-z][^\s/>]*)/);
    if (!tagNameMatch) {
      index = close + 1;
      continue;
    }

    const tagName = tagNameMatch[1].toLowerCase();

    if (closing) {
      const last = stack.pop();
      if (!last) {
        errors.push({ index: open, message: `Unexpected closing tag </${tagName}>.` });
      } else if (last.tagName !== tagName) {
        errors.push({
          index: open,
          message: `Mismatched closing tag </${tagName}>. Expected </${last.tagName}> opened at line ${last.line}.`
        });
      }
      index = close + 1;
      continue;
    }

    const selfClosing = /\/\s*$/.test(rawTag);
    if (selfClosing && tagName.includes('-')) {
      errors.push({ index: open, message: `Custom element <${tagName}> must use an explicit closing tag.` });
    }

    if (!selfClosing && !VOID_ELEMENTS.has(tagName)) {
      const position = lineAndColumn(source, open);

      if (RAW_TEXT_ELEMENTS.has(tagName)) {
        const closeNeedle = `</${tagName}`;
        const closeStart = lowerSource.indexOf(closeNeedle, close + 1);
        if (closeStart === -1) {
          errors.push({ index: open, message: `Missing closing tag </${tagName}>.` });
          break;
        }
        const rawCloseEnd = findTagEnd(source, closeStart);
        if (rawCloseEnd === -1) {
          errors.push({ index: closeStart, message: `Unclosed closing tag </${tagName}>.` });
          break;
        }
        index = rawCloseEnd + 1;
        continue;
      }

      stack.push({ tagName, line: position.line, column: position.column });
    }

    index = close + 1;
  }

  while (stack.length) {
    const openTag = stack.pop();
    errors.push({
      index: source.length,
      message: `Missing closing tag </${openTag.tagName}> for <${openTag.tagName}> opened at line ${openTag.line}.`
    });
  }

  if (errors.length) {
    return errors.map(error => {
      const position = lineAndColumn(source, error.index);
      return `${label}:${position.line}:${position.column} ${error.message}`;
    });
  }

  return [];
}

function isHtmlLike(value) {
  return String(value || '').trim().startsWith('<');
}

function validatePreview(previews, label, value, setup = '', componentName = '') {
  if (!isHtmlLike(value)) return;
  const source = completeExampleCode(value, setup, componentName);
  previews.push({ label, source });
}

const script = inlineDocsScript(docsHtml);
const { docs, componentExamples, componentCodeExamples, agentFeatureDocs } = evaluatePreviewData(script);
const previews = [];

for (const [name, doc] of Object.entries(docs)) {
  validatePreview(previews, `${name} live demo`, doc.demo, '', name);

  const codeExample = componentCodeExamples[name];
  const source = codeExample?.markup || doc.code;
  validatePreview(previews, `${name} code preview`, source, codeExample?.setup || '', name);
}

for (const [name, code] of Object.entries(componentExamples)) {
  if (!docs[name]) validatePreview(previews, `${name} component example`, code, '', name);
}

for (const [name, codeExample] of Object.entries(componentCodeExamples)) {
  if (!docs[name]) validatePreview(previews, `${name} setup code preview`, codeExample.markup, codeExample.setup || '', name);
}

for (const [key, doc] of Object.entries(agentFeatureDocs)) {
  validatePreview(previews, `agent ${key} live demo`, doc.demo);
  validatePreview(previews, `agent ${key} code preview`, doc.code);
}

validatePreview(previews, 'chart gallery code preview', '<mvx-chart type="combo" title="Chart gallery preview" legend grid labels></mvx-chart>', '', 'mvx-chart');

const errors = previews.flatMap(({ label, source }) => lintHtmlStructure(source, label));

if (errors.length) {
  console.error(`Preview validation failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${previews.length} docs preview HTML snippet${previews.length === 1 ? '' : 's'}.`);
