import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const outputDir = resolve('chat-history/tooltip-screenshot-test');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const docsUrl = process.env.MIVIX_DOCS_URL || 'http://127.0.0.1:4175/docs/';

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox']
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1
});

const report = {
  url: docsUrl,
  screenshots: [],
  checks: []
};

async function screenshot(name, options = {}) {
  const path = `${outputDir}/${name}.png`;
  await page.screenshot({ path, fullPage: false, ...options });
  report.screenshots.push(path);
}

function record(name, pass, detail = {}) {
  report.checks.push({ name, pass: Boolean(pass), detail });
}

async function tooltipState(selector = 'mvx-tooltip[data-playground-target]') {
  return page.evaluate((tooltipSelector) => {
    const tooltip = document.querySelector(tooltipSelector);
    const tip = tooltip?.shadowRoot?.querySelector('.tip');
    if (!tooltip || !tip) return null;
    const tooltipRect = tooltip.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    return {
      open: tip.dataset.open === 'true',
      placement: tip.dataset.placement,
      x: Number(tip.style.getPropertyValue('--mvx-tip-x').replace('px', '')),
      y: Number(tip.style.getPropertyValue('--mvx-tip-y').replace('px', '')),
      tooltipRect: {
        left: tooltipRect.left,
        top: tooltipRect.top,
        right: tooltipRect.right,
        bottom: tooltipRect.bottom,
        width: tooltipRect.width,
        height: tooltipRect.height
      },
      tipRect: {
        left: tipRect.left,
        top: tipRect.top,
        right: tipRect.right,
        bottom: tipRect.bottom,
        width: tipRect.width,
        height: tipRect.height
      }
    };
  }, selector);
}

try {
  await page.goto(docsUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('mvx-button', { timeout: 10000 });
  await screenshot('01-landing');

  await page.goto(`${docsUrl}#component=mvx-tooltip`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('mvx-tooltip[data-playground-target]', { timeout: 10000 });
  await page.locator('mvx-tooltip[data-playground-target]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    document.querySelector('mvx-tooltip[data-playground-target]')?.show();
  });
  await page.waitForTimeout(250);
  const docsTooltip = await tooltipState();
  await screenshot('02-tooltip-docs-auto-open');
  record('docs tooltip opens', docsTooltip?.open, docsTooltip);
  record('docs tooltip has valid placement', ['top', 'right', 'bottom', 'left'].includes(docsTooltip?.placement), docsTooltip);
  record('docs tooltip stays inside viewport', docsTooltip && docsTooltip.tipRect.left >= 0 && docsTooltip.tipRect.top >= 0 && docsTooltip.tipRect.right <= 1440 && docsTooltip.tipRect.bottom <= 1000, docsTooltip);

  await page.setContent(`
    <!doctype html>
    <html data-mvx-theme="graphite">
      <head>
        <link rel="stylesheet" href="${docsUrl.replace(/\/docs\/?$/, '')}/src/styles/tokens.css">
        <style>
          body {
            min-height: 720px;
            margin: 0;
            background: var(--mvx-bg);
            color: var(--mvx-fg);
            font-family: var(--mvx-font-sans);
          }
          .stage {
            position: relative;
            min-height: 720px;
          }
          mvx-tooltip {
            position: absolute;
          }
          #top-edge { left: 610px; top: 12px; }
          #right-edge { right: 12px; top: 310px; }
          #bottom-edge { left: 610px; bottom: 12px; }
          #left-edge { left: 12px; top: 310px; }
        </style>
        <script type="module" src="${docsUrl.replace(/\/docs\/?$/, '')}/src/auto.js"><\/script>
      </head>
      <body>
        <div class="stage">
          <mvx-tooltip id="top-edge" placement="auto" text="Auto should move below near the top edge."><mvx-button>Top edge</mvx-button></mvx-tooltip>
          <mvx-tooltip id="right-edge" placement="auto" text="Auto should avoid the right edge."><mvx-button>Right edge</mvx-button></mvx-tooltip>
          <mvx-tooltip id="bottom-edge" placement="auto" text="Auto should move above near the bottom edge."><mvx-button>Bottom edge</mvx-button></mvx-tooltip>
          <mvx-tooltip id="left-edge" placement="auto" text="Auto should avoid the left edge."><mvx-button>Left edge</mvx-button></mvx-tooltip>
        </div>
      </body>
    </html>
  `, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('mvx-tooltip#top-edge', { timeout: 10000 });
  await page.waitForTimeout(500);

  const edgeSelectors = ['#top-edge', '#right-edge', '#bottom-edge', '#left-edge'];
  for (const selector of edgeSelectors) {
    await page.evaluate((tooltipSelector) => document.querySelector(`mvx-tooltip${tooltipSelector}`)?.show(), selector);
  }
  await page.waitForTimeout(300);
  await screenshot('03-tooltip-auto-edge-cases');

  for (const selector of edgeSelectors) {
    const state = await tooltipState(`mvx-tooltip${selector}`);
    record(`${selector} opens`, state?.open, state);
    record(`${selector} remains in viewport`, state && state.tipRect.left >= 0 && state.tipRect.top >= 0 && state.tipRect.right <= 1440 && state.tipRect.bottom <= 1000, state);
  }
} finally {
  await browser.close();
}

const failed = report.checks.filter(check => !check.pass);
report.passed = failed.length === 0;
report.summary = `${report.checks.length - failed.length}/${report.checks.length} screenshot checks passed`;

await writeFile(`${outputDir}/tooltip-screenshot-report.json`, JSON.stringify(report, null, 2));
console.log(report.summary);
console.log(`Report: ${outputDir}/tooltip-screenshot-report.json`);
for (const path of report.screenshots) console.log(`Screenshot: ${path}`);

if (failed.length) {
  process.exitCode = 1;
}
