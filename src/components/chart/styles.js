import { baseStyles } from '../../core.js';

export function chartStyles({ chartOnly, hasLegend }) {
  return `<style>
  ${baseStyles}
  :host {
    display: block;
    inline-size: 100%;
  }
  .chart {
    display: grid;
    gap: 10px;
    inline-size: 100%;
    overflow: hidden;
    border-radius: var(--mvx-radius-md);
    padding: 10px;
  }
  :host([component-style="minimal"]) .chart {
    gap: 8px;
    border-color: transparent;
    background: transparent;
    box-shadow: none;
    padding: 0;
  }
  :host([component-style="glass"]) .chart {
    gap: 14px;
    border-color: color-mix(in srgb, var(--mvx-accent) 28%, var(--mvx-border));
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--mvx-accent) 13%, transparent), transparent 42%),
      color-mix(in srgb, var(--mvx-bg-panel) 78%, transparent);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.16);
    padding: 14px;
  }
  :host([component-style="dashboard"]) .chart {
    gap: 0;
    padding: 0;
  }
  :host([component-style="group"]) .chart {
    gap: 6px;
    block-size: 100%;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding: 12px;
  }
  :host([chart-only]) .chart {
    block-size: var(--mvx-chart-height, 100%);
    gap: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding: 0;
  }
  header {
    display: ${chartOnly ? 'none' : 'flex'};
    flex-wrap: wrap;
    gap: 8px 14px;
    align-items: end;
    justify-content: space-between;
  }
  :host([component-style="minimal"]) header {
    align-items: center;
  }
  :host([component-style="minimal"]) .type {
    display: none;
  }
  :host([component-style="glass"]) header {
    align-items: center;
  }
  :host([component-style="dashboard"]) header {
    align-items: center;
    border-block-end: 1px solid var(--mvx-border);
    background: color-mix(in srgb, var(--mvx-bg-inset) 62%, transparent);
    padding: 10px 12px;
  }
  :host([component-style="group"]) header {
    align-items: center;
    min-block-size: 24px;
  }
  :host([component-style="group"]) header p,
  :host([component-style="group"]) .type {
    display: none;
  }
  h3, p { margin: 0; }
  h3 { font-size: 15px; font-weight: 600; }
  p { color: var(--mvx-muted); font-size: 12px; }
  .type {
    border: 1px solid var(--mvx-border);
    border-radius: var(--mvx-radius-sm);
    background: var(--mvx-bg-inset);
    color: var(--mvx-muted);
    font-size: 11px;
    font-weight: 600;
    padding: 4px 7px;
    text-transform: uppercase;
  }
  .canvas {
    position: relative;
    block-size: var(--mvx-chart-height, 340px);
    inline-size: 100%;
    overflow: auto;
    border: 1px solid var(--mvx-border);
    border-radius: var(--mvx-radius-sm);
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 50%), var(--mvx-chart-cursor-active-color, transparent) 0, transparent var(--mvx-chart-cursor-size, 64px)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent),
      var(--mvx-bg-inset);
  }
  :host([component-style="minimal"]) .canvas {
    border: 0;
    background: transparent;
  }
  :host([component-style="glass"]) .canvas {
    border-color: color-mix(in srgb, var(--mvx-accent) 24%, var(--mvx-border));
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 50%), var(--mvx-chart-cursor-active-color, transparent) 0, transparent var(--mvx-chart-cursor-size, 64px)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent),
      color-mix(in srgb, var(--mvx-bg-inset) 74%, transparent);
  }
  :host([component-style="dashboard"]) .canvas {
    border: 0;
    border-radius: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent),
      var(--mvx-bg-inset);
  }
  :host([component-style="group"]) .canvas {
    overflow: hidden;
    border: 0;
    border-radius: 0;
    background:
      radial-gradient(circle at var(--mx, 50%) var(--my, 50%), var(--mvx-chart-cursor-active-color, transparent) 0, transparent var(--mvx-chart-cursor-size, 64px)),
      transparent;
  }
  :host([chart-only]) .canvas {
    block-size: 100%;
    overflow: hidden;
    border: 0;
    border-radius: 0;
    background: transparent;
  }
  svg {
    display: block;
    inline-size: 100%;
    min-inline-size: 100%;
    block-size: 100%;
    color: var(--mvx-muted);
    font-weight: 400;
    text-rendering: geometricPrecision;
  }
  :host([chart-only]) svg {
    min-inline-size: 100%;
  }
  svg * {
    vector-effect: non-scaling-stroke;
  }
  .axis {
    stroke: color-mix(in srgb, var(--mvx-muted) 34%, transparent);
    stroke-width: 0.75;
    opacity: 0.72;
  }
  .grid {
    stroke: color-mix(in srgb, var(--mvx-muted) 18%, transparent);
    stroke-width: 0.55;
    opacity: 0.72;
  }
  .threshold-line {
    stroke: var(--threshold-color, var(--mvx-warning));
    stroke-width: 0.9;
    stroke-dasharray: 7 6;
    opacity: 0.8;
  }
  .threshold-label {
    fill: var(--threshold-color, var(--mvx-warning));
    font-size: 10.5px;
    font-weight: 500;
  }
  .tick {
    fill: color-mix(in srgb, var(--mvx-muted) 86%, transparent);
    font-size: 10.5px;
    font-weight: 400;
  }
  .label {
    fill: var(--mvx-fg);
    font-size: 11.5px;
    font-weight: 500;
  }
  .muted-label {
    fill: color-mix(in srgb, var(--mvx-muted) 88%, transparent);
    font-size: 10.5px;
    font-weight: 400;
  }
  .chart-mark {
    cursor: pointer;
    outline: none;
    transform-box: fill-box;
    transform-origin: center;
    transition: transform 170ms ease, filter 170ms ease, opacity 170ms ease;
  }
  :host([hover-animation="none"]) .chart-mark {
    transition: none;
  }
  .chart-mark:hover,
  .chart-mark:focus-visible {
    filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.34));
    opacity: 1;
    transform: scale(var(--mvx-chart-hover-scale, 1.08));
  }
  :host([hover-animation="lift"]) .chart-mark:hover,
  :host([hover-animation="lift"]) .chart-mark:focus-visible {
    transform: translateY(-4px) scale(var(--mvx-chart-hover-scale, 1.04));
  }
  :host([hover-animation="pulse"]) .chart-mark:hover,
  :host([hover-animation="pulse"]) .chart-mark:focus-visible {
    animation: markPulse 850ms ease-in-out infinite;
  }
  :host([component-style="minimal"]) .chart-mark:hover,
  :host([component-style="minimal"]) .chart-mark:focus-visible {
    filter: none;
    transform: scale(var(--mvx-chart-hover-scale, 1.04));
  }
  :host([component-style="glass"]) .chart-mark:hover,
  :host([component-style="glass"]) .chart-mark:focus-visible {
    filter: drop-shadow(0 12px 20px color-mix(in srgb, var(--mvx-accent) 32%, transparent));
    transform: translateY(-3px) scale(var(--mvx-chart-hover-scale, 1.06));
  }
  :host([component-style="dashboard"]) .chart-mark:hover,
  :host([component-style="dashboard"]) .chart-mark:focus-visible {
    transform: scale(var(--mvx-chart-hover-scale, 1.03));
  }
  .custom-point {
    filter: var(--mvx-chart-point-filter, none);
  }
  .tooltip {
    position: fixed;
    z-index: 20;
    display: none;
    max-inline-size: 240px;
    border: 1px solid var(--mvx-border);
    border-radius: var(--mvx-radius-sm);
    background: color-mix(in srgb, var(--mvx-bg-panel) 94%, black);
    color: var(--mvx-fg);
    box-shadow: var(--mvx-shadow-raised);
    font-size: 11.5px;
    font-weight: 400;
    line-height: 1.35;
    padding: 8px 10px;
    pointer-events: none;
  }
  .tooltip strong {
    display: block;
    margin-block-end: 3px;
  }
  @keyframes markPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(var(--mvx-chart-hover-scale, 1.12)); }
  }
  .legend {
    display: ${hasLegend ? 'flex' : 'none'};
    flex-wrap: wrap;
    gap: 8px 14px;
    color: var(--mvx-muted);
    font-size: 12px;
  }
  :host([component-style="dashboard"]) .legend {
    border-block-start: 1px solid var(--mvx-border);
    padding: 9px 12px;
  }
  :host([component-style="group"]) .legend {
    gap: 6px 10px;
    font-size: 11.5px;
    margin-block-start: -2px;
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .swatch {
    inline-size: 10px;
    block-size: 10px;
    border-radius: 3px;
    background: var(--swatch);
  }
  .watermark {
    pointer-events: none;
    user-select: none;
  }
  .watermark-text {
    fill: color-mix(in srgb, var(--mvx-muted) 34%, transparent);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.08em;
    opacity: 0.34;
    text-transform: uppercase;
  }
  .watermark-shadow {
    fill: color-mix(in srgb, black 58%, transparent);
    font-size: 8.5px;
    font-weight: 500;
    letter-spacing: 0.08em;
    opacity: 0.18;
    transform: translate(0.7px, 0.8px);
    text-transform: uppercase;
  }
</style>`;
}
