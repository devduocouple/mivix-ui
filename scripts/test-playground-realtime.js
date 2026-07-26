import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { get } from 'node:http';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const outputDir = resolve('chat-history', 'playground-realtime-test');
const chromeExecutable = process.env.MIVIX_CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const report = {
  generatedAt: new Date().toISOString(),
  docsUrl: '',
  components: [],
  standalone: [],
  totals: {
    pages: 0,
    pagesPassed: 0,
    controls: 0,
    controlsPassed: 0,
    liveMutations: 0,
    liveMutationsPassed: 0,
    standalone: 0,
    standalonePassed: 0,
    errors: 0
  }
};

await mkdir(outputDir, { recursive: true });

function wait(ms) {
  return new Promise(resolveWait => setTimeout(resolveWait, ms));
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
    server.on('error', reject);
  });
}

function waitForHttp(url, timeout = 12000) {
  const started = Date.now();
  return new Promise((resolveReady, reject) => {
    const probe = () => {
      const request = get(url, response => {
        response.resume();
        if (response.statusCode >= 200 && response.statusCode < 500) {
          resolveReady();
          return;
        }
        retry();
      });
      request.on('error', retry);
      request.setTimeout(1000, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeout) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(probe, 250);
    };
    probe();
  });
}

function startDocsServer(port) {
  const child = spawn(process.execPath, ['scripts/dev-server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  child.on('exit', code => {
    if (code && !child.killed) {
      console.error(output.trim());
    }
  });
  return child;
}

function launchOptions() {
  const options = {
    headless: true,
    args: ['--no-sandbox']
  };
  if (existsSync(chromeExecutable)) options.executablePath = chromeExecutable;
  return options;
}

function standaloneCases() {
  const defineLines = [...readFileSync('src/auto.js', 'utf8').matchAll(/define\('([^']+)'/g)];
  const names = [...new Set(defineLines.map(([, tag]) => tag))];
  const defaults = {
    'mvx-button': { text: 'Button', attrs: { type: 'solid', tone: 'primary' } },
    'mvx-icon-button': { text: 'x', attrs: { label: 'Close' } },
    'mvx-alert': { text: '', attrs: { title: 'Alert', message: 'Live test', closable: '' } },
    'mvx-input': { attrs: { label: 'Input', value: 'Value' } },
    'mvx-textarea': { attrs: { label: 'Textarea', value: 'Value' } },
    'mvx-select': { attrs: { label: 'Select', options: '[{"label":"One","value":"one"},{"label":"Two","value":"two"}]' } },
    'mvx-checkbox': { attrs: { label: 'Checkbox', checked: '' } },
    'mvx-radio-group': { attrs: { label: 'Choice', items: '[{"label":"One","value":"one"},{"label":"Two","value":"two"}]' } },
    'mvx-slider': { attrs: { label: 'Slider', value: '42', showValue: '' } },
    'mvx-date-picker': { attrs: { label: 'Date', value: '2026-07-10' } },
    'mvx-modal': { text: 'Modal body', attrs: { label: 'Modal', inline: '', open: '' } },
    'mvx-drawer': { text: 'Drawer body', attrs: { label: 'Drawer', inline: '', open: '' } },
    'mvx-toast': { text: 'Saved', attrs: { inline: '', open: '' } },
    'mvx-card': { text: 'Card body', attrs: { title: 'Card' } },
    'mvx-progress': { attrs: { label: 'Progress', value: '56' } },
    'mvx-skeleton': { attrs: { lines: '3', width: '240px', height: '120px' } },
    'mvx-spinner': { attrs: { label: 'Loading' } },
    'mvx-avatar': { attrs: { initials: 'MX', label: 'Mivix' } },
    'mvx-rating': { attrs: { label: 'Rating', value: '3.5' } },
    'mvx-file-input': { attrs: { label: 'File input' } },
    'mvx-radial-progress': { attrs: { value: '42.5', precision: '1' } },
    'mvx-speed-dial': { attrs: { items: '[{"label":"Edit","icon":"E"},{"label":"Share","icon":"S"}]', open: '' } },
    'mvx-chart': { attrs: { type: 'bar', title: 'Chart', labels: '', grid: '' } },
    'mvx-data-table': { attrs: { label: 'Table', columns: '[{"key":"name","label":"Name"}]', data: '[{"name":"Alpha"}]' } }
  };
  return names.map(tag => ({ tag, ...(defaults[tag] || { text: tag, attrs: {} }) }));
}

async function openComponent(page, name) {
  await page.evaluate(componentName => {
    const button = [...document.querySelectorAll('[data-component]')]
      .find(item => item.dataset.component === componentName);
    button?.click();
  }, name);
  await page.waitForFunction(componentName => {
    const tag = document.querySelector('#detail-tag')?.textContent?.trim() || '';
    const title = document.querySelector('#detail-title')?.textContent?.trim() || '';
    return tag.includes(componentName) || title.toLowerCase().includes(componentName.replace(/^mvx-/, '').replace(/-/g, ' '));
  }, name, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(80);
}

async function mutateControl(page, index) {
  return page.evaluate(async controlIndex => {
    const frame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));
    const controls = [...document.querySelectorAll('#detail-controls [data-api]')];
    const control = controls[controlIndex];
    const playground = document.querySelector('#detail-playground');
    const getTarget = () => playground?.querySelector('[data-playground-target]') ||
      playground?.querySelector('mvx-button, mvx-input, mvx-alert, mvx-card, mvx-modal, mvx-date-picker, mvx-slider') ||
      null;
    const target = getTarget();
    if (!control || !target) return { pass: false, reason: 'missing control or target' };

    const name = control.dataset.api;
    const before = target.outerHTML;
    const codeBefore = document.querySelector('#detail-code')?.textContent || '';
    const tag = target.localName || '';
    const eventName = control.tagName === 'TEXTAREA' || (control.tagName === 'INPUT' && control.type !== 'checkbox') ? 'input' : 'change';
    let value = '';
    let mutated = true;

    const sampleText = () => {
      if (name === 'value' && (tag.includes('date') || tag.includes('calendar'))) return '2026-07-10';
      if (name === 'value' && (tag.includes('progress') || tag.includes('rating') || tag.includes('slider'))) return '42.5';
      if (name.includes('date') || name.includes('before') || name.includes('after') || name === 'min' || name === 'max') return '2026-07-10';
      if (name === 'src') return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2280%22 viewBox=%220 0 120 80%22%3E%3Crect width=%22120%22 height=%2280%22 rx=%2212%22 fill=%22%234f46e5%22/%3E%3C/svg%3E';
      if (name.includes('color')) return 'var(--mvx-success)';
      if (name.includes('width')) return '260px';
      if (name.includes('height')) return '180px';
      if (name === 'message') return 'Live API message';
      if (name === 'label') return 'Live API label';
      if (name === 'title') return 'Live API title';
      if (name === 'helper') return 'Live API helper';
      if (name === 'precision') return '1';
      if (name === 'page' || name === 'pages' || name === 'page-size' || name === 'max' || name === 'min') return '2';
      return `live-${name || 'value'}`;
    };

    if (control.tagName === 'SELECT') {
      const options = [...control.options].map(option => option.value);
      const next = options.find(option => option !== control.value);
      if (next === undefined) mutated = false;
      else {
        value = next;
        control.value = next;
      }
    } else if (control.type === 'checkbox') {
      control.checked = !control.checked;
      value = String(control.checked);
    } else if (control.tagName === 'TEXTAREA') {
      value = control.value || '[]';
      control.value = value;
      mutated = false;
    } else if (control.type === 'number') {
      const min = Number(control.min || 0);
      const max = Number(control.max || min + 100);
      const current = Number(control.value || min);
      const next = Number.isFinite(max) ? Math.min(max, current + 1) : current + 1;
      value = String(Number.isFinite(min) ? Math.max(min, next) : next);
      control.value = value;
    } else {
      value = sampleText();
      if (control.value === value) value = `${value}-next`;
      control.value = value;
    }

    control.dispatchEvent(new Event(eventName, { bubbles: true }));
    await frame();
    await frame();

    const currentTarget = getTarget();
    const codeAfter = document.querySelector('#detail-code')?.textContent || '';
    const codeError = document.querySelector('#detail-code')?.dataset.error === 'true';
    const after = currentTarget?.outerHTML || '';
    const changed = before !== after || codeBefore !== codeAfter;
    const pass = Boolean(currentTarget) && !codeError && (!mutated || changed);
    return {
      name,
      tag: control.tagName.toLowerCase(),
      type: control.type || '',
      value,
      mutated,
      changed,
      pass,
      reason: pass ? '' : 'control did not update preview/code or produced an editor error'
    };
  }, index);
}

let server;
let browser;

try {
  const port = Number(process.env.PORT || await freePort());
  const baseUrl = `http://127.0.0.1:${port}`;
  const docsUrl = `${baseUrl}/docs/`;
  report.docsUrl = docsUrl;
  server = startDocsServer(port);
  await waitForHttp(docsUrl);

  browser = await chromium.launch(launchOptions());
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto(docsUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-component]', { timeout: 10000 });

  const componentNames = await page.$$eval('[data-component]', buttons => (
    [...new Set(buttons.map(button => button.dataset.component).filter(Boolean))]
      .filter(name => !name.endsWith('-examples'))
  ));

  for (const name of componentNames) {
    const componentResult = {
      name,
      pagePass: false,
      target: null,
      controls: [],
      errors: []
    };
    const startErrorCount = runtimeErrors.length;
    await openComponent(page, name);
    const state = await page.evaluate(() => {
      const playground = document.querySelector('#detail-playground');
      const target = playground?.querySelector('[data-playground-target]');
      const rect = target?.getBoundingClientRect();
      const controlCount = document.querySelectorAll('#detail-controls [data-api]').length;
      const apiRows = document.querySelectorAll('#detail-api tbody tr').length;
      return {
        hasTarget: Boolean(target),
        targetTag: target?.localName || '',
        width: rect?.width || 0,
        height: rect?.height || 0,
        shadow: Boolean(target?.shadowRoot?.innerHTML?.trim()),
        controlCount,
        apiRows,
        codeError: document.querySelector('#detail-code')?.dataset.error === 'true'
      };
    });
    componentResult.target = state;
    componentResult.pagePass = state.hasTarget && !state.codeError && (state.width > 0 || state.height > 0 || state.shadow || state.targetTag === 'div');

    componentResult.controls = await page.evaluate(() => (
      [...document.querySelectorAll('#detail-controls [data-api]')].map((control, index) => {
        const rect = control.getBoundingClientRect();
        return {
          index,
          name: control.dataset.api || '',
          tag: control.tagName.toLowerCase(),
          type: control.type || '',
          visible: rect.width > 0 && rect.height > 0,
          disabled: Boolean(control.disabled)
        };
      })
    ));
    report.totals.controls += componentResult.controls.length;
    report.totals.controlsPassed += componentResult.controls.filter(control => control.name && control.visible).length;

    const liveIndex = componentResult.controls.find(control => (
      control.name &&
      control.visible &&
      !control.disabled &&
      control.tag !== 'textarea' &&
      !['skeleton', 'disabled', 'readonly', 'loading'].includes(control.name)
    ))?.index ?? componentResult.controls.find(control => control.name && control.visible && !control.disabled)?.index;
    if (liveIndex !== undefined) {
      await openComponent(page, name);
      componentResult.liveControl = await mutateControl(page, liveIndex);
      report.totals.liveMutations += 1;
      if (componentResult.liveControl.pass) report.totals.liveMutationsPassed += 1;
    }

    componentResult.errors = runtimeErrors.slice(startErrorCount);
    if (componentResult.errors.length) report.totals.errors += componentResult.errors.length;
    report.components.push(componentResult);
    report.totals.pages += 1;
    const controlsPass = componentResult.controls.every(control => control.name && control.visible);
    const livePass = !componentResult.liveControl || componentResult.liveControl.pass;
    if (componentResult.pagePass && controlsPass && livePass) {
      report.totals.pagesPassed += 1;
    }
  }

  const standalonePage = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const standaloneErrors = [];
  standalonePage.on('pageerror', error => standaloneErrors.push(error.message));
  standalonePage.on('console', message => {
    if (message.type() === 'error') standaloneErrors.push(message.text());
  });
  await standalonePage.goto(docsUrl, { waitUntil: 'domcontentloaded' });
  await standalonePage.waitForFunction(() => customElements.get('mvx-button'), null, { timeout: 10000 });
  await standalonePage.evaluate(() => {
    document.body.innerHTML = '<div class="stage" id="stage"></div>';
    Object.assign(document.body.style, {
      margin: '24px',
      background: '#111',
      color: '#fff',
      fontFamily: 'system-ui'
    });
    Object.assign(document.querySelector('#stage').style, {
      display: 'grid',
      gap: '12px',
      alignItems: 'start'
    });
  });

  report.standalone = await standalonePage.evaluate(async cases => {
    const stage = document.querySelector('#stage');
    const frame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));
    const results = [];
    for (const item of cases) {
      const element = document.createElement(item.tag);
      element.textContent = item.text || '';
      Object.entries(item.attrs || {}).forEach(([name, value]) => {
        const attr = name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        element.setAttribute(attr, String(value));
      });
      stage.append(element);
      await frame();
      await frame();
      const rect = element.getBoundingClientRect();
      results.push({
        name: item.tag,
        defined: Boolean(customElements.get(item.tag)),
        shadow: Boolean(element.shadowRoot?.innerHTML?.trim()),
        width: rect.width,
        height: rect.height,
        pass: Boolean(customElements.get(item.tag)) && Boolean(element.shadowRoot?.innerHTML?.trim())
      });
      element.remove();
    }
    return results;
  }, standaloneCases());
  report.totals.standalone = report.standalone.length;
  report.totals.standalonePassed = report.standalone.filter(item => item.pass).length;
  report.totals.errors += standaloneErrors.length;
  report.standaloneErrors = standaloneErrors;

  await writeFile(resolve(outputDir, 'report.json'), JSON.stringify(report, null, 2));

  const failedPages = report.components.filter(item => (
    !item.pagePass ||
    item.controls.some(control => !control.name || !control.visible) ||
    (item.liveControl && !item.liveControl.pass)
  ));
  const failedStandalone = report.standalone.filter(item => !item.pass);
  const failed = failedPages.length || failedStandalone.length || report.totals.errors;
  console.log(`Playground pages: ${report.totals.pagesPassed}/${report.totals.pages}`);
  console.log(`API controls rendered: ${report.totals.controlsPassed}/${report.totals.controls}`);
  console.log(`Live API mutations: ${report.totals.liveMutationsPassed}/${report.totals.liveMutations}`);
  console.log(`Standalone components: ${report.totals.standalonePassed}/${report.totals.standalone}`);
  console.log(`Runtime errors: ${report.totals.errors}`);
  console.log(`Report: ${resolve(outputDir, 'report.json')}`);
  if (failed) {
    failedPages.slice(0, 12).forEach(item => {
      const failedControls = item.controls.filter(control => !control.name || !control.visible).map(control => control.name || `#${control.index}`).join(', ');
      const live = item.liveControl && !item.liveControl.pass ? ` live=${item.liveControl.name}` : '';
      console.error(`${item.name}: page=${item.pagePass ? 'pass' : 'fail'} controls=${failedControls || 'pass'}${live}`);
    });
    failedStandalone.slice(0, 12).forEach(item => console.error(`${item.name}: standalone failed`));
    process.exit(1);
  }
} finally {
  if (browser) await browser.close();
  if (server) {
    server.kill();
    await wait(100);
  }
}
