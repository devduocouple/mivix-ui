import { MvxElement, htmlEscape, parseData } from '../../core.js';
import { getChartDispatch } from './chart-types.js';
import { chartSubtitle, defaultSeriesForType, normalizePoint, palette } from './shared.js';
import { chartStyles } from './styles.js';
import { barShape, markWrap as renderMarkWrap, pathForPoints, pointMarker, renderBoxplot, renderBullet, renderCalendarEvents, renderCandlestick, renderCartesian, renderChord, renderContour, renderControlChart, renderEnterprise, renderFrame, renderFunnel, renderGantt, renderGauge, renderHeatmap, renderHexbin, renderMap, renderMarimekko, renderNetwork, renderParallelCoordinates, renderRadar, renderRadial, renderSankey, renderScatter, renderSlope, renderSparkline, renderStreamgraph, renderTimelineEvents, renderTree, renderTreemap, renderWaffle } from './renderers.js';

export class MvxChart extends MvxElement {
  static observedAttributes = [
    'type',
    'title',
    'subtitle',
    'data',
    'series',
    'categories',
    'legend',
    'grid',
    'labels',
    'stacked',
    'line-style',
    'bar-style',
    'point-style',
    'point-image',
    'point-class',
    'point-size',
    'component-style',
    'hover-animation',
    'thresholds',
    'axes',
    'no-axes',
    'chart-only',
    'watermark',
    'no-watermark',
    'orientation',
    'curve',
    'width',
    'height',
    'view-height',
    'value',
    'min',
    'max',
    'empty'
  ];

  set data(value) {
    this._data = value;
    if (this.isConnected) this.render();
  }

  get data() {
    const hasUserData = this._data !== undefined || this.hasAttribute('data');
    if (hasUserData) return parseData(this._data ?? this.getAttribute('data'), []);
    return defaultSeriesForType(this.getAttribute('type') || 'line')[0]?.data || [];
  }

  set series(value) {
    this._series = value;
    if (this.isConnected) this.render();
  }

  get series() {
    const hasUserSeries = this._series !== undefined || this.hasAttribute('series');
    const hasUserData = this._data !== undefined || this.hasAttribute('data');
    const raw = parseData(this._series ?? this.getAttribute('series'), []);
    if (hasUserSeries) return raw;
    if (hasUserData) return [{ name: this.t('value', 'Value'), data: this.data }];
    return defaultSeriesForType(this.getAttribute('type') || 'line');
  }

  set categories(value) {
    this._categories = value;
    if (this.isConnected) this.render();
  }

  get categories() {
    const categories = parseData(this._categories ?? this.getAttribute('categories'), []);
    if (categories.length) return categories;
    return this.series[0]?.data?.map((point, index) => normalizePoint(point, index).label || `Item ${index + 1}`) || [];
  }

  render() {
    const type = this.getAttribute('type') || 'line';
    const title = this.getAttribute('title') || 'Chart';
    const subtitle = this.getAttribute('subtitle') || this.chartSubtitle(type);
    const requestedHeight = Number(this.getAttribute('height') || 340);
    const height = Number.isFinite(requestedHeight) && requestedHeight > 0 ? requestedHeight : 340;
    const chartOnly = this.chartOnly;
    const svg = this.renderChart(type, this.viewportWidth(), this.viewportHeight(height));
    this.shadowRoot.innerHTML = `
      ${chartStyles({ chartOnly, hasLegend: this.hasLegend })}
      <section class="chart edge" part="chart" aria-label="${htmlEscape(title)}" style="--mvx-chart-height:${height}px">
        <header>
          <div>
            <h3>${htmlEscape(title)}</h3>
            <p>${htmlEscape(subtitle)}</p>
          </div>
          <span class="type">${htmlEscape(type)}</span>
        </header>
        <div class="canvas" part="canvas">${svg}</div>
        <div class="tooltip" part="tooltip" role="tooltip"></div>
        <div class="legend" part="legend">
          ${this.series.map((series, index) => `<span><i class="swatch" style="--swatch:${series.color || palette[index % palette.length]}"></i>${htmlEscape(series.name || `Series ${index + 1}`)}</span>`).join('')}
        </div>
      </section>
    `;
    this.bindInteractions();
  }

  get chartOnly() {
    return this.hasAttribute('chart-only');
  }

  viewportWidth() {
    const requestedWidth = Number(this.getAttribute('width'));
    if (Number.isFinite(requestedWidth) && requestedWidth > 0) return requestedWidth;
    return 760;
  }

  viewportHeight(fallback) {
    const requestedHeight = Number(this.getAttribute('view-height'));
    if (Number.isFinite(requestedHeight) && requestedHeight > 0) return requestedHeight;
    return fallback;
  }

  get hasAxes() {
    return !this.chartOnly && !this.hasAttribute('no-axes') && this.getAttribute('axes') !== 'false';
  }

  get hasLegend() {
    return !this.chartOnly && this.hasAttribute('legend');
  }

  get hasWatermark() {
    return !this.hasAttribute('no-watermark') && this.getAttribute('watermark') !== 'false';
  }

  get watermarkLabel() {
    const label = this.getAttribute('watermark');
    return label && label !== 'true' ? label : 'Mivix';
  }

  get thresholds() {
    return parseData(this.getAttribute('thresholds'), []);
  }

  bindInteractions() {
    const tooltip = this.shadowRoot.querySelector('.tooltip');
    const canvas = this.shadowRoot.querySelector('.canvas');
    if (!canvas || !tooltip) return;
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      canvas.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      canvas.style.setProperty('--my', `${event.clientY - rect.top}px`);
      const mark = event.target.closest?.('.chart-mark');
      if (!mark) return;
      tooltip.style.display = 'block';
      tooltip.style.insetInlineStart = `${event.clientX + 12}px`;
      tooltip.style.insetBlockStart = `${event.clientY + 12}px`;
      tooltip.innerHTML = `<strong>${htmlEscape(mark.dataset.label || 'Value')}</strong><span>${htmlEscape(mark.dataset.value || '')}</span>`;
    });
    canvas.addEventListener('pointerleave', () => {
      tooltip.style.display = 'none';
    });
    canvas.addEventListener('pointerover', event => {
      const mark = event.target.closest?.('.chart-mark');
      if (mark) this.emit('mvx-hover', this.markDetail(mark));
    });
    canvas.addEventListener('click', event => {
      const mark = event.target.closest?.('.chart-mark');
      if (mark) this.emit('mvx-select', this.markDetail(mark));
    });
    canvas.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const mark = event.target.closest?.('.chart-mark');
      if (!mark) return;
      event.preventDefault();
      this.emit('mvx-select', this.markDetail(mark));
    });
  }

  markDetail(mark) {
    return {
      label: mark.dataset.label,
      value: mark.dataset.value,
      series: mark.dataset.series,
      seriesIndex: Number(mark.dataset.seriesIndex),
      index: Number(mark.dataset.index)
    };
  }

  markWrap(content, detail = {}) {
    return renderMarkWrap(this, content, detail);
  }

  chartSubtitle(type) {
    return chartSubtitle(type);
  }

  renderChart(type, width, height) {
    if (!this.series.some(series => (series.data || []).length) && !this.data.length && !['gauge', 'kpi'].includes(type)) {
      return `<div style="padding:32px;color:var(--mvx-muted)">${htmlEscape(this.getAttribute('empty') || 'No chart data.')}</div>`;
    }
    const [method, variant] = getChartDispatch(type);
    if (method === 'renderEnterprise') return this.renderEnterprise(type, width, height);
    return variant ? this[method](variant, width, height) : this[method](width, height);
  }

  renderFrame(width, height, body, extra = '') {
    return renderFrame(this, width, height, body, extra);
  }

  pathForPoints(points, style = 'linear') {
    return pathForPoints(this, points, style);
  }

  pointMarker(point, color, index, detail = {}) {
    return pointMarker(this, point, color, index, detail);
  }

  barShape(options) {
    return barShape(this, options);
  }

  renderCartesian(type, width, height) { return renderCartesian(this, type, width, height); }
  renderRadial(type, width, height) { return renderRadial(this, type, width, height); }
  renderScatter(type, width, height) { return renderScatter(this, type, width, height); }
  renderRadar(width, height) { return renderRadar(this, width, height); }
  renderHeatmap(width, height) { return renderHeatmap(this, width, height); }
  renderTreemap(width, height) { return renderTreemap(this, width, height); }
  renderFunnel(type, width, height) { return renderFunnel(this, type, width, height); }
  renderGauge(type, width, height) { return renderGauge(this, type, width, height); }
  renderCandlestick(width, height) { return renderCandlestick(this, width, height); }
  renderBoxplot(type, width, height) { return renderBoxplot(this, type, width, height); }
  renderGantt(width, height) { return renderGantt(this, width, height); }
  renderSankey(type, width, height) { return renderSankey(this, type, width, height); }
  renderNetwork(type, width, height) { return renderNetwork(this, type, width, height); }
  renderChord(width, height) { return renderChord(this, width, height); }
  renderTree(type, width, height) { return renderTree(this, type, width, height); }
  renderSlope(type, width, height) { return renderSlope(this, type, width, height); }
  renderStreamgraph(width, height) { return renderStreamgraph(this, width, height); }
  renderMarimekko(width, height) { return renderMarimekko(this, width, height); }
  renderWaffle(width, height) { return renderWaffle(this, width, height); }
  renderBullet(width, height) { return renderBullet(this, width, height); }
  renderSparkline(width, height) { return renderSparkline(this, width, height); }
  renderMap(type, width, height) { return renderMap(this, type, width, height); }
  renderContour(type, width, height) { return renderContour(this, type, width, height); }
  renderHexbin(width, height) { return renderHexbin(this, width, height); }
  renderParallelCoordinates(width, height) { return renderParallelCoordinates(this, width, height); }
  renderControlChart(width, height) { return renderControlChart(this, width, height); }
  renderTimelineEvents(width, height) { return renderTimelineEvents(this, width, height); }
  renderCalendarEvents(width, height) { return renderCalendarEvents(this, width, height); }
  renderEnterprise(type, width, height) { return renderEnterprise(this, width, height); }
}
