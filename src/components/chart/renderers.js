import { htmlEscape, safeUrl } from '../../core.js';
import { arcPath, clamp, defaultSeriesForType, niceMax, normalizePoint, palette, polar } from './shared.js';

function plotPad(chart, regular, compact) {
  return chart.hasAxes ? regular : compact;
}

function plotRadius(chart, width, height, regular = 0.34, compact = 0.43) {
  return Math.min(width, height) * (chart.hasAxes ? regular : compact);
}

export function markWrap(chart, content, detail = {}) {
  return `<g class="chart-mark" tabindex="0" role="button" data-label="${htmlEscape(detail.label || '')}" data-value="${htmlEscape(detail.value ?? '')}" data-series="${htmlEscape(detail.series || '')}" data-series-index="${detail.seriesIndex ?? 0}" data-index="${detail.index ?? 0}">${content}<title>${htmlEscape(`${detail.series ? `${detail.series}: ` : ''}${detail.label || ''} ${detail.value ?? ''}`.trim())}</title></g>`;
}

export function renderFrame(chart, width, height, body, extra = '') {
    const watermark = chart.hasWatermark
      ? `<g class="watermark" aria-hidden="true"><text class="watermark-shadow" x="${width - 14}" y="${height - 10}" text-anchor="end">${htmlEscape(chart.watermarkLabel)}</text><text class="watermark-text" x="${width - 14}" y="${height - 10}" text-anchor="end">${htmlEscape(chart.watermarkLabel)}</text></g>`
      : '';
    return `<svg viewBox="0 0 ${width} ${height}" role="img">${extra}${body}${watermark}</svg>`;
  }

export function pathForPoints(chart, points, style = 'linear') {
    if (!points.length) return '';
    if (style === 'step') {
      return points.map((point, index) => {
        if (!index) return `M ${point[0]} ${point[1]}`;
        const previous = points[index - 1];
        const mid = (previous[0] + point[0]) / 2;
        return `L ${mid} ${previous[1]} L ${mid} ${point[1]} L ${point[0]} ${point[1]}`;
      }).join(' ');
    }
    if (style === 'smooth') {
      return points.map((point, index) => {
        if (!index) return `M ${point[0]} ${point[1]}`;
        const previous = points[index - 1];
        const cx = (previous[0] + point[0]) / 2;
        return `Q ${cx} ${previous[1]} ${point[0]} ${point[1]}`;
      }).join(' ');
    }
    return points.map((point, index) => `${index ? 'L' : 'M'} ${point[0]} ${point[1]}`).join(' ');
  }

export function pointMarker(chart, point, color, index, detail = {}) {
    const style = chart.getAttribute('point-style') || 'circle';
    const image = safeUrl(chart.getAttribute('point-image'), '', { allowDataImages: true });
    const customClass = chart.getAttribute('point-class') || '';
    const size = Number(chart.getAttribute('point-size') || 18);
    if (style === 'none') return '';
    if (image) return chart.markWrap(`<image class="custom-point ${htmlEscape(customClass)}" href="${htmlEscape(image)}" x="${point[0] - size / 2}" y="${point[1] - size / 2}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" />`, detail);
    if (style === 'square') return chart.markWrap(`<rect class="${htmlEscape(customClass)}" x="${point[0] - 3.5}" y="${point[1] - 3.5}" width="7" height="7" rx="1.5" fill="${color}" />`, detail);
    if (style === 'diamond') return chart.markWrap(`<path class="${htmlEscape(customClass)}" d="M ${point[0]} ${point[1] - 5} L ${point[0] + 5} ${point[1]} L ${point[0]} ${point[1] + 5} L ${point[0] - 5} ${point[1]} Z" fill="${color}" />`, detail);
    if (style === 'hollow') return chart.markWrap(`<circle class="${htmlEscape(customClass)}" cx="${point[0]}" cy="${point[1]}" r="4" fill="var(--mvx-bg-inset)" stroke="${color}" stroke-width="1.1" />`, detail);
    return chart.markWrap(`<circle class="${htmlEscape(customClass)}" cx="${point[0]}" cy="${point[1]}" r="${index === 0 ? 4 : 3.25}" fill="${color}" />`, detail);
  }

export function barShape(chart, { x, y, width, height, color, value, label, series, seriesIndex, index }) {
    const style = chart.getAttribute('bar-style') || 'rounded';
    const detail = { label, value, series, seriesIndex, index };
    if (style === 'square') return chart.markWrap(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}" opacity="0.9" />`, detail);
    if (style === 'thin') {
      const thinWidth = Math.max(5, width * 0.34);
      return chart.markWrap(`<rect x="${x + (width - thinWidth) / 2}" y="${y}" width="${thinWidth}" height="${height}" rx="${thinWidth / 2}" fill="${color}" opacity="0.92" />`, detail);
    }
    if (style === 'lollipop') {
      const cx = x + width / 2;
      return chart.markWrap(`<line x1="${cx}" x2="${cx}" y1="${y + height}" y2="${y + 9}" stroke="${color}" stroke-width="1.6" stroke-linecap="round" opacity="0.7" /><circle cx="${cx}" cy="${y + 7}" r="${Math.max(5, width * 0.26)}" fill="${color}" />`, detail);
    }
    if (style === 'glass') return chart.markWrap(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="${color}" opacity="0.38" /><rect x="${x + 3}" y="${y + 3}" width="${Math.max(0, width - 6)}" height="${Math.max(0, height * 0.45)}" rx="6" fill="rgba(255,255,255,0.28)" />`, detail);
    if (style === 'stripe') {
      const stripes = Array.from({ length: Math.max(1, Math.floor(height / 12)) }, (_, index) => `<line x1="${x + 3}" x2="${x + width - 3}" y1="${y + 6 + index * 12}" y2="${y + index * 12}" stroke="rgba(255,255,255,0.28)" stroke-width="1" />`).join('');
      return chart.markWrap(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="${color}" opacity="0.88" />${stripes}`, detail);
    }
    return chart.markWrap(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="7" fill="${color}" opacity="0.9" />`, detail);
  }

export function renderCartesian(chart, type, width, height) {
    const pad = plotPad(chart, { l: 56, r: 26, t: 24, b: 54 }, { l: 16, r: 16, t: 10, b: 14 });
    const chartW = width - pad.l - pad.r;
    const chartH = height - pad.t - pad.b;
    const categories = chart.categories;
    const values = chart.series.flatMap(series => (series.data || []).map((point, index) => normalizePoint(point, index).y));
    const zeroBaseline = type.includes('bar') || type === 'column' || type === 'histogram' || type === 'waterfall' || type === 'area' || type === 'stacked-area' || type === 'combo';
    const rawMin = values.length ? Math.min(...values) : 0;
    const rawMax = values.length ? Math.max(...values) : 1;
    const min = zeroBaseline || chart.hasAxes ? Math.min(0, rawMin) : rawMin;
    const max = chart.hasAxes ? niceMax(Math.max(rawMax, 1)) : (rawMax === min ? rawMax + 1 : rawMax);
    const scaleY = value => pad.t + chartH - ((value - min) / (max - min || 1)) * chartH;
    const step = chartW / Math.max(categories.length - 1, 1);
    const barStep = chartW / Math.max(categories.length, 1);
    const showAxes = chart.hasAxes;
    const grid = showAxes && chart.hasAttribute('grid') ? [0, 0.25, 0.5, 0.75, 1].map(mark => {
      const y = pad.t + chartH * mark;
      return `<line class="grid" x1="${pad.l}" x2="${width - pad.r}" y1="${y}" y2="${y}" /><text class="tick" x="10" y="${y + 4}">${Math.round(max - (max - min) * mark)}</text>`;
    }).join('') : '';
    const thresholds = showAxes ? chart.thresholds.map((threshold, index) => {
      const color = threshold.color || 'var(--mvx-warning)';
      if (threshold.x !== undefined) {
        const categoryIndex = categories.findIndex(category => String(category) === String(threshold.x));
        const x = pad.l + (categoryIndex >= 0 ? categoryIndex : Number(threshold.x || 0)) * step;
        return `<g style="--threshold-color:${htmlEscape(color)}"><line class="threshold-line" x1="${x}" x2="${x}" y1="${pad.t}" y2="${pad.t + chartH}" /><text class="threshold-label" x="${x + 6}" y="${pad.t + 14}">${htmlEscape(threshold.label || threshold.name || `Threshold ${index + 1}`)}</text></g>`;
      }
      const y = scaleY(Number(threshold.value ?? threshold.y ?? 0));
      return `<g style="--threshold-color:${htmlEscape(color)}"><line class="threshold-line" x1="${pad.l}" x2="${width - pad.r}" y1="${y}" y2="${y}" /><text class="threshold-label" x="${pad.l + 8}" y="${y - 6}">${htmlEscape(threshold.label || threshold.name || `Threshold ${index + 1}`)}</text></g>`;
    }).join('') : '';
    const labels = showAxes ? categories.map((label, index) => `<text class="tick" x="${pad.l + (type.includes('bar') || type === 'column' || type === 'histogram' ? index * barStep + barStep / 2 : index * step)}" y="${height - 18}" text-anchor="middle">${htmlEscape(String(label).slice(0, 10))}</text>`).join('') : '';
    const body = chart.series.map((series, seriesIndex) => {
      const color = series.color || palette[seriesIndex % palette.length];
      const points = (series.data || []).map((point, index) => {
        const item = normalizePoint(point, index);
        return [pad.l + index * step, scaleY(item.y), item.y];
      });
      if (type.includes('bar') || type === 'column' || type === 'histogram' || type === 'waterfall') {
        const count = chart.hasAttribute('stacked') || type.includes('stacked') ? 1 : chart.series.length;
        const barW = Math.max(10, barStep * 0.68 / count);
        return (series.data || []).map((point, index) => {
          const item = normalizePoint(point, index);
          const x = pad.l + index * barStep + barStep * 0.16 + (seriesIndex % count) * barW;
          const y = scaleY(Math.max(item.y, 0));
          const h = Math.abs(scaleY(0) - scaleY(item.y));
          const fill = type === 'waterfall' && item.y < 0 ? 'var(--mvx-danger)' : chart.chartOnly ? palette[(seriesIndex + index) % palette.length] : color;
          return chart.barShape({ x, y, width: barW, height: h, color: fill, value: item.y, label: item.label || categories[index], series: series.name || `Series ${seriesIndex + 1}`, seriesIndex, index });
        }).join('');
      }
      const lineStyle = chart.getAttribute('line-style') || 'linear';
      const path = chart.pathForPoints(points, lineStyle);
      const area = `${path} L ${pad.l + (points.length - 1) * step} ${scaleY(0)} L ${pad.l} ${scaleY(0)} Z`;
      const fillArea = type === 'area' || type === 'stacked-area' || type === 'combo' || lineStyle === 'area' ? `<path d="${area}" fill="${color}" opacity="0.18" />` : '';
      const dash = lineStyle === 'dashed' ? 'stroke-dasharray="9 7"' : lineStyle === 'dotted' ? 'stroke-dasharray="2 7"' : '';
      const strokeWidth = chart.chartOnly ? 1.25 : 1.5;
      const lineStroke = chart.chartOnly && type === 'line' && !dash && lineStyle === 'linear' && points.length > 1
        ? points.slice(1).map((point, index) => {
          const previous = points[index];
          return `<path d="M ${previous[0]} ${previous[1]} L ${point[0]} ${point[1]}" fill="none" stroke="${palette[(seriesIndex + index) % palette.length]}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
        }).join('')
        : `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" ${dash} />`;
      const markers = lineStyle === 'plain' ? '' : points.map((point, index) => chart.pointMarker(point, chart.chartOnly ? palette[(seriesIndex + index) % palette.length] : color, index, { label: categories[index], value: point[2], series: series.name || `Series ${seriesIndex + 1}`, seriesIndex, index })).join('');
      return `${fillArea}${lineStroke}${markers}`;
    }).join('');
    const axis = showAxes ? `<line class="axis" x1="${pad.l}" x2="${width - pad.r}" y1="${pad.t + chartH}" y2="${pad.t + chartH}" />` : '';
    return chart.renderFrame(width, height, `${grid}${thresholds}${axis}${labels}${body}`);
  }

export function renderRadial(chart, type, width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = plotRadius(chart, width, height, 0.32, 0.44);
    const points = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const total = points.reduce((sum, point) => sum + Math.max(0, point.value), 0) || 1;
    let angle = 0;
    const body = points.map((point, index) => {
      const slice = point.value / total * 360;
      const r = type === 'rose' || type === 'polar-area' ? radius * (0.45 + point.value / Math.max(...points.map(item => item.value), 1) * 0.55) : radius;
      const path = arcPath(cx, cy, r, angle, angle + slice, type === 'donut' || type === 'radial-bar' ? radius * 0.54 : 0);
      const mid = angle + slice / 2;
      const [lx, ly] = polar(cx, cy, r + 24, mid);
      angle += slice;
      return `${chart.markWrap(`<path d="${path}" fill="${palette[index % palette.length]}" opacity="0.92" />`, { label: point.label, value: point.value, series: chart.series[0]?.name || 'Share', seriesIndex: 0, index })}${chart.hasAttribute('labels') ? `<text class="muted-label" x="${lx}" y="${ly}" text-anchor="middle">${htmlEscape(point.label || '')}</text>` : ''}`;
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderScatter(chart, type, width, height) {
    const pad = plotPad(chart, { l: 54, r: 28, t: 24, b: 44 }, { l: 18, r: 18, t: 14, b: 18 });
    const points = (chart.series[0]?.data || chart.data).map((point, index) => ({ x: Number(point.x ?? index), y: Number(point.y ?? point.value ?? 0), size: Number(point.size ?? point.value ?? 8), label: point.label }));
    const maxX = Math.max(...points.map(point => point.x), 1);
    const maxY = Math.max(...points.map(point => point.y), 1);
    const maxSize = Math.max(...points.map(point => point.size), 1);
    const body = points.map((point, index) => {
      const x = pad.l + point.x / maxX * (width - pad.l - pad.r);
      const y = height - pad.b - point.y / maxY * (height - pad.t - pad.b);
      const r = type === 'bubble' ? 5 + point.size / maxSize * 18 : 6;
      if (chart.getAttribute('point-image')) return chart.pointMarker([x, y, point.y], palette[index % palette.length], index, { label: point.label, value: point.y, series: chart.series[0]?.name || 'Signals', seriesIndex: 0, index });
      return chart.markWrap(`<circle cx="${x}" cy="${y}" r="${r}" fill="${palette[index % palette.length]}" opacity="0.72" />`, { label: point.label, value: point.y, series: chart.series[0]?.name || 'Signals', seriesIndex: 0, index });
    }).join('');
    const axes = chart.hasAxes ? `<line class="axis" x1="${pad.l}" x2="${width - pad.r}" y1="${height - pad.b}" y2="${height - pad.b}" /><line class="axis" x1="${pad.l}" x2="${pad.l}" y1="${pad.t}" y2="${height - pad.b}" />` : '';
    return chart.renderFrame(width, height, `${axes}${body}`);
  }

export function renderRadar(chart, width, height) {
    const points = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const cx = width / 2;
    const cy = height / 2;
    const radius = plotRadius(chart, width, height, 0.34, 0.43);
    const max = Math.max(...points.map(point => point.value), 1);
    const axes = chart.hasAxes ? points.map((point, index) => {
      const angle = index / points.length * 360;
      const [x, y] = polar(cx, cy, radius, angle);
      const [lx, ly] = polar(cx, cy, radius + 22, angle);
      return `<line class="grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" /><text class="muted-label" x="${lx}" y="${ly}" text-anchor="middle">${htmlEscape(point.label || '')}</text>`;
    }).join('') : '';
    const shape = points.map((point, index) => {
      const [x, y] = polar(cx, cy, radius * point.value / max, index / points.length * 360);
      return `${index ? 'L' : 'M'} ${x} ${y}`;
    }).join(' ') + ' Z';
    const rings = chart.hasAxes ? [0.25, 0.5, 0.75, 1].map(mark => `<circle class="grid" cx="${cx}" cy="${cy}" r="${radius * mark}" fill="none" />`).join('') : '';
    return chart.renderFrame(width, height, `${rings}${axes}<path d="${shape}" fill="var(--mvx-accent)" opacity="0.18" stroke="var(--mvx-accent)" stroke-width="1.25" />`);
  }

export function renderHeatmap(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const cols = Math.ceil(Math.sqrt(data.length || 1));
    const cell = Math.min((width - 80) / cols, 42);
    const max = Math.max(...data.map(point => point.value), 1);
    const body = data.map((point, index) => {
      const x = 42 + index % cols * (cell + 6);
      const y = 28 + Math.floor(index / cols) * (cell + 6);
      return chart.markWrap(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="7" fill="var(--mvx-accent)" opacity="${0.18 + point.value / max * 0.78}" />`, { label: point.label, value: point.value, series: chart.series[0]?.name || 'Activity', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderTreemap(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const total = data.reduce((sum, point) => sum + Math.max(point.value, 0), 0) || 1;
    let x = 20;
    const y = 24;
    const body = data.map((point, index) => {
      const w = Math.max(48, (width - 40) * point.value / total);
      const h = height - 48;
      const rect = `${chart.markWrap(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${palette[index % palette.length]}" opacity="0.78" />`, { label: point.label, value: point.value, series: chart.series[0]?.name || 'Portfolio', seriesIndex: 0, index })}<text class="label" x="${x + 12}" y="${y + 24}">${htmlEscape(point.label || '')}</text>`;
      x += w;
      return rect;
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderFunnel(chart, type, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const max = Math.max(...data.map(point => point.value), 1);
    const step = (height - 48) / Math.max(data.length, 1);
    const body = data.map((point, index) => {
      const topW = (width - 120) * (type === 'pyramid' ? (index + 1) / data.length : point.value / max);
      const bottomValue = data[index + 1]?.value ?? (type === 'pyramid' ? point.value : point.value * 0.72);
      const bottomW = (width - 120) * (type === 'pyramid' ? (index + 2) / data.length : bottomValue / max);
      const y = 24 + index * step;
      const x1 = width / 2 - topW / 2;
      const x2 = width / 2 + topW / 2;
      const x3 = width / 2 + bottomW / 2;
      const x4 = width / 2 - bottomW / 2;
      return `${chart.markWrap(`<polygon points="${x1},${y} ${x2},${y} ${x3},${y + step - 4} ${x4},${y + step - 4}" fill="${palette[index % palette.length]}" opacity="0.86" />`, { label: point.label, value: point.value, series: chart.series[0]?.name || 'Conversion', seriesIndex: 0, index })}<text class="label" x="${width / 2}" y="${y + step / 2 + 4}" text-anchor="middle">${htmlEscape(point.label || '')} ${point.value}</text>`;
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderGauge(chart, type, width, height) {
    const min = Number(chart.getAttribute('min') || 0);
    const max = Number(chart.getAttribute('max') || 100);
    const value = Number(chart.getAttribute('value') || chart.data[0]?.value || 68);
    const pct = clamp((value - min) / (max - min || 1));
    const cx = width / 2;
    const cy = height * 0.72;
    const radius = Math.min(width, height) * 0.36;
    const bg = arcPath(cx, cy, radius, -100, 100, radius - 24);
    const fg = arcPath(cx, cy, radius, -100, -100 + pct * 200, radius - 24);
    return chart.renderFrame(width, height, `<path d="${bg}" fill="var(--mvx-border)" />${chart.markWrap(`<path d="${fg}" fill="var(--mvx-accent)" />`, { label: type === 'kpi' ? 'KPI' : 'Target', value, series: 'Gauge', seriesIndex: 0, index: 0 })}<text class="label" x="${cx}" y="${cy - 8}" text-anchor="middle" style="font-size:34px;font-weight:500">${value}</text><text class="muted-label" x="${cx}" y="${cy + 18}" text-anchor="middle">${htmlEscape(type === 'kpi' ? 'KPI' : 'Target')}</text>`);
  }

export function renderCandlestick(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data);
    const pad = plotPad(chart, { l: 48, r: 28, t: 24, b: 40 }, { l: 18, r: 18, t: 12, b: 18 });
    const values = data.flatMap(item => [Number(item.high ?? item.value ?? 0), Number(item.low ?? item.value ?? 0)]);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const scaleY = value => height - pad.b - (value - min) / (max - min || 1) * (height - pad.t - pad.b);
    const step = (width - pad.l - pad.r) / Math.max(data.length, 1);
    const body = data.map((item, index) => {
      const open = Number(item.open ?? item.value ?? 0);
      const close = Number(item.close ?? item.value ?? 0);
      const high = Number(item.high ?? Math.max(open, close));
      const low = Number(item.low ?? Math.min(open, close));
      const x = pad.l + index * step + step / 2;
      const color = close >= open ? 'var(--mvx-success)' : 'var(--mvx-danger)';
      return chart.markWrap(`<line x1="${x}" x2="${x}" y1="${scaleY(high)}" y2="${scaleY(low)}" stroke="${color}" /><rect x="${x - 8}" y="${Math.min(scaleY(open), scaleY(close))}" width="16" height="${Math.max(3, Math.abs(scaleY(open) - scaleY(close)))}" fill="${color}" />`, { label: item.label || `Point ${index + 1}`, value: `O:${open} H:${high} L:${low} C:${close}`, series: chart.series[0]?.name || 'OHLC', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderBoxplot(chart, type, width, height) {
    const data = (chart.series[0]?.data || chart.data);
    const pad = plotPad(chart, { l: 50, r: 30, t: 30, b: 42 }, { l: 20, r: 20, t: 14, b: 18 });
    const values = data.flatMap(item => [item.low, item.q1, item.median, item.q3, item.high].map(Number));
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const scaleY = value => height - pad.b - (value - min) / (max - min || 1) * (height - pad.t - pad.b);
    const step = (width - pad.l - pad.r) / Math.max(data.length, 1);
    const body = data.map((item, index) => {
      const x = pad.l + index * step + step / 2;
      const q1 = scaleY(Number(item.q1 ?? item.low ?? 0));
      const q3 = scaleY(Number(item.q3 ?? item.high ?? 0));
      const median = scaleY(Number(item.median ?? item.value ?? 0));
      const value = `Median ${Number(item.median ?? item.value ?? 0)}`;
      if (type === 'violin') return chart.markWrap(`<ellipse cx="${x}" cy="${(q1 + q3) / 2}" rx="24" ry="${Math.abs(q3 - q1) / 2}" fill="var(--mvx-accent)" opacity="0.28" /><line x1="${x - 24}" x2="${x + 24}" y1="${median}" y2="${median}" stroke="var(--mvx-accent-2)" />`, { label: item.label || `Distribution ${index + 1}`, value, series: chart.series[0]?.name || 'Distribution', seriesIndex: 0, index });
      return chart.markWrap(`<line x1="${x}" x2="${x}" y1="${scaleY(Number(item.high ?? 0))}" y2="${scaleY(Number(item.low ?? 0))}" stroke="var(--mvx-muted)" /><rect x="${x - 20}" y="${Math.min(q1, q3)}" width="40" height="${Math.abs(q3 - q1)}" fill="var(--mvx-accent)" opacity="0.28" stroke="var(--mvx-accent)" /><line x1="${x - 22}" x2="${x + 22}" y1="${median}" y2="${median}" stroke="var(--mvx-accent-2)" />`, { label: item.label || `Distribution ${index + 1}`, value, series: chart.series[0]?.name || 'Distribution', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderGantt(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data);
    const max = Math.max(...data.map(item => Number(item.end ?? item.value ?? 10)), 10);
    const rowH = 34;
    const body = data.map((item, index) => {
      const start = Number(item.start ?? item.x ?? 0);
      const end = Number(item.end ?? item.value ?? start + 1);
      const x = 150 + start / max * (width - 190);
      const w = Math.max(10, (end - start) / max * (width - 190));
      const y = 28 + index * rowH;
      return `<text class="muted-label" x="18" y="${y + 18}">${htmlEscape(item.label || `Task ${index + 1}`)}</text>${chart.markWrap(`<rect x="${x}" y="${y}" width="${w}" height="22" rx="6" fill="${palette[index % palette.length]}" opacity="0.86" />`, { label: item.label || `Task ${index + 1}`, value: `${start}-${end}`, series: chart.series[0]?.name || 'Schedule', seriesIndex: 0, index })}`;
    }).join('');
    return chart.renderFrame(width, Math.max(height, data.length * rowH + 56), body);
  }

export function renderSankey(chart, type, width, height) {
    const links = (chart.series[0]?.data || chart.data);
    const nodes = [...new Set(links.flatMap(link => [link.from, link.to]).filter(Boolean))];
    const split = Math.ceil(nodes.length / 2);
    const columns = [nodes.slice(0, split), nodes.slice(split)];
    const positions = new Map();
    columns.forEach((column, columnIndex) => {
      column.forEach((node, index) => {
        positions.set(node, {
          x: columnIndex ? width - 180 : 72,
          y: 42 + index * ((height - 92) / Math.max(column.length - 1, 1))
        });
      });
    });
    const max = Math.max(...links.map(link => Number(link.value || 1)), 1);
    const bands = links.map((link, index) => {
      const from = positions.get(link.from);
      const to = positions.get(link.to);
      if (!from || !to) return '';
      const stroke = Math.max(4, Number(link.value || 1) / max * 18);
      const mid = type === 'alluvial' ? (from.x + to.x) / 2 + (index % 2 ? -18 : 18) : (from.x + to.x) / 2;
      const path = `M ${from.x + 116} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}`;
      return chart.markWrap(`<path d="${path}" fill="none" stroke="${palette[index % palette.length]}" stroke-width="${stroke}" stroke-linecap="round" opacity="0.48" />`, { label: `${link.from} to ${link.to}`, value: link.value, series: 'Flow', seriesIndex: 0, index });
    }).join('');
    const nodeMarks = nodes.map((node, index) => {
      const pos = positions.get(node);
      return `<rect x="${pos.x}" y="${pos.y - 15}" width="116" height="30" rx="8" fill="${palette[index % palette.length]}" opacity="0.86" /><text class="label" x="${pos.x + 12}" y="${pos.y + 4}">${htmlEscape(node)}</text>`;
    }).join('');
    return chart.renderFrame(width, height, `${bands}${nodeMarks}`);
  }

export function renderNetwork(chart, type, width, height) {
    const nodes = (chart.series[0]?.data || chart.data);
    const cx = width / 2;
    const cy = height / 2;
    const radius = plotRadius(chart, width, height, 0.34, 0.42);
    const positions = new Map(nodes.map((node, index) => {
      const angle = index / Math.max(nodes.length, 1) * 360;
      const spread = type === 'dependency-graph' ? 0.72 : 1;
      const [x, y] = polar(cx, cy, radius * spread, angle);
      return [node.id || node.label, { x, y, node }];
    }));
    const links = nodes.flatMap((node, sourceIndex) => (node.links || []).map(link => ({ source: node.id || node.label, target: link, sourceIndex })));
    const edges = links.map((link, index) => {
      const from = positions.get(link.source);
      const to = positions.get(link.target);
      if (!from || !to) return '';
      const dash = type === 'dependency-graph' ? 'stroke-dasharray="8 7"' : '';
      return `<line class="grid" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" ${dash} />`;
    }).join('');
    const marks = nodes.map((node, index) => {
      const pos = positions.get(node.id || node.label);
      const r = type === 'force-directed' ? 14 + Number(node.value || 1) / 5 : 18;
      return chart.markWrap(`<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${palette[index % palette.length]}" opacity="0.9" /><text class="label" x="${pos.x}" y="${pos.y + r + 16}" text-anchor="middle">${htmlEscape(node.label || node.id || `Node ${index + 1}`)}</text>`, { label: node.label || node.id, value: node.value, series: 'Network', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, `${edges}${marks}`);
  }

export function renderChord(chart, width, height) {
    const nodes = (chart.series[0]?.data || chart.data);
    const cx = width / 2;
    const cy = height / 2;
    const radius = plotRadius(chart, width, height, 0.34, 0.42);
    const positions = nodes.map((node, index) => {
      const angle = index / Math.max(nodes.length, 1) * 360;
      const [x, y] = polar(cx, cy, radius, angle);
      return { node, x, y, angle };
    });
    const ribbons = positions.flatMap((from, sourceIndex) => (from.node.links || []).map((link, index) => {
      const target = positions.find(item => (item.node.id || item.node.label) === link);
      if (!target) return '';
      return chart.markWrap(`<path d="M ${from.x} ${from.y} Q ${cx} ${cy} ${target.x} ${target.y}" fill="none" stroke="${palette[(sourceIndex + index) % palette.length]}" stroke-width="2" opacity="0.34" />`, { label: `${from.node.label || from.node.id} to ${target.node.label || target.node.id}`, value: from.node.value, series: 'Chord', seriesIndex: 0, index: sourceIndex });
    })).join('');
    const ring = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--mvx-border)" stroke-width="2" opacity="0.36" />`;
    const labels = positions.map((item, index) => `<text class="muted-label" x="${item.x}" y="${item.y}" text-anchor="middle">${htmlEscape(item.node.label || item.node.id || `N${index + 1}`)}</text>`).join('');
    return chart.renderFrame(width, height, `${ring}${ribbons}${labels}`);
  }

export function renderTree(chart, type, width, height) {
    const data = (chart.series[0]?.data || chart.data);
    if (type === 'icicle') {
      const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
      let x = 24;
      const body = data.map((item, index) => {
        const w = Math.max(54, (width - 48) * Number(item.value || 1) / total);
        const y = 30 + (item.parent ? 72 : 0);
        const rect = chart.markWrap(`<rect x="${x}" y="${y}" width="${w}" height="54" rx="2" fill="${palette[index % palette.length]}" opacity="0.76" /><text class="label" x="${x + 10}" y="${y + 30}">${htmlEscape(item.label || '')}</text>`, { label: item.label, value: item.value, series: 'Hierarchy', seriesIndex: 0, index });
        x += w;
        return rect;
      }).join('');
      return chart.renderFrame(width, height, body);
    }
    const root = data.find(item => !item.parent) || data[0] || {};
    const children = data.filter(item => item.parent && item.parent !== root.label);
    const direct = data.filter(item => item.parent === root.label);
    const rootX = type === 'mind-map' ? width / 2 : 120;
    const rootY = type === 'mind-map' ? height / 2 : 56;
    const directMarks = direct.map((item, index) => {
      const x = type === 'mind-map' ? width / 2 + Math.cos(index / Math.max(direct.length, 1) * Math.PI * 2) * 210 : width / 2 + (index - (direct.length - 1) / 2) * 150;
      const y = type === 'mind-map' ? height / 2 + Math.sin(index / Math.max(direct.length, 1) * Math.PI * 2) * 110 : 160;
      return `<line class="grid" x1="${rootX}" y1="${rootY}" x2="${x}" y2="${y}" />${chart.markWrap(`<rect x="${x - 55}" y="${y - 18}" width="110" height="36" rx="10" fill="${palette[index % palette.length]}" opacity="0.88" /><text class="label" x="${x}" y="${y + 4}" text-anchor="middle">${htmlEscape(item.label || '')}</text>`, { label: item.label, value: item.value, series: 'Hierarchy', seriesIndex: 0, index })}`;
    }).join('');
    const leafMarks = children.map((item, index) => {
      const parentIndex = Math.max(0, direct.findIndex(parent => parent.label === item.parent));
      const x = width / 2 + (parentIndex - (direct.length - 1) / 2) * 150 + (index % 2 ? 42 : -42);
      const y = 250 + Math.floor(index / 2) * 38;
      return chart.markWrap(`<rect x="${x - 42}" y="${y - 14}" width="84" height="28" rx="8" fill="var(--mvx-bg-inset)" stroke="var(--mvx-border)" /><text class="muted-label" x="${x}" y="${y + 4}" text-anchor="middle">${htmlEscape(item.label || '')}</text>`, { label: item.label, value: item.value, series: 'Hierarchy', seriesIndex: 0, index });
    }).join('');
    const rootMark = `<rect x="${rootX - 62}" y="${rootY - 22}" width="124" height="44" rx="12" fill="var(--mvx-accent)" /><text class="label" x="${rootX}" y="${rootY + 5}" text-anchor="middle">${htmlEscape(root.label || 'Root')}</text>`;
    return chart.renderFrame(width, height, `${directMarks}${leafMarks}${rootMark}`);
  }

export function renderSlope(chart, type, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const max = Math.max(...data.map(item => Number(item.end ?? item.y ?? item.value ?? 1)), 1);
    const body = data.map((item, index) => {
      const start = Number(item.start ?? item.x ?? item.value * 0.7 ?? 0);
      const end = Number(item.end ?? item.y ?? item.value ?? 0);
      const x1 = 96;
      const x2 = width - 96;
      const y1 = height - 52 - start / max * (height - 104);
      const y2 = height - 52 - end / max * (height - 104);
      const bumpY = type === 'bump' ? 46 + index * 42 : y2;
      return chart.markWrap(`<path d="M ${x1} ${y1} L ${x2} ${bumpY}" fill="none" stroke="${palette[index % palette.length]}" stroke-width="1.25" /><circle cx="${x1}" cy="${y1}" r="3.5" fill="${palette[index % palette.length]}" /><circle cx="${x2}" cy="${bumpY}" r="3.5" fill="${palette[index % palette.length]}" /><text class="muted-label" x="${x2 + 10}" y="${bumpY + 4}">${htmlEscape(item.label || `Item ${index + 1}`)}</text>`, { label: item.label, value: `${start} to ${end}`, series: type, seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderStreamgraph(chart, width, height) {
    const series = chart.series.length > 1 ? chart.series : defaultSeriesForType('line');
    const pad = plotPad(chart, { l: 44, r: 30, t: 38, b: 42 }, { l: 16, r: 16, t: 14, b: 16 });
    const count = Math.max(...series.map(item => item.data.length), 1);
    const max = Math.max(...series.flatMap(item => item.data.map(point => normalizePoint(point).value)), 1);
    const step = (width - pad.l - pad.r) / Math.max(count - 1, 1);
    const body = series.map((item, seriesIndex) => {
      const base = height / 2 + (seriesIndex - (series.length - 1) / 2) * 18;
      const points = item.data.map((point, index) => [pad.l + index * step, base - normalizePoint(point).value / max * 80]);
      const lower = item.data.map((point, index) => [pad.l + index * step, base + normalizePoint(point).value / max * 38]).reverse();
      return `<path d="${chart.pathForPoints(points, 'smooth')} L ${lower.map(point => `${point[0]} ${point[1]}`).join(' L ')} Z" fill="${palette[seriesIndex % palette.length]}" opacity="0.42" />`;
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderMarimekko(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const total = data.reduce((sum, item) => sum + Math.max(item.value, 0), 0) || 1;
    let x = 36;
    const body = data.map((item, index) => {
      const w = Math.max(48, (width - 72) * item.value / total);
      const h = height - 72 - (index % 3) * 22;
      const y = 36 + (height - 72 - h);
      const mark = chart.markWrap(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${palette[index % palette.length]}" opacity="0.78" /><text class="label" x="${x + 10}" y="${y + 24}">${htmlEscape(item.label || '')}</text>`, { label: item.label, value: item.value, series: 'Marimekko', seriesIndex: 0, index });
      x += w;
      return mark;
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderWaffle(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const total = data.reduce((sum, item) => sum + Math.max(item.value, 0), 0) || 1;
    const cells = 100;
    let filled = 0;
    const colorForCell = index => {
      let cursor = 0;
      for (const item of data) {
        cursor += Math.round(item.value / total * cells);
        if (index < cursor) return palette[data.indexOf(item) % palette.length];
      }
      return 'var(--mvx-border)';
    };
    const size = Math.min((width - 120) / 10, (height - 70) / 10);
    const body = Array.from({ length: cells }, (_, index) => {
      const x = 60 + index % 10 * (size + 4);
      const y = 34 + Math.floor(index / 10) * (size + 4);
      filled += 1;
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="${colorForCell(index)}" opacity="${filled <= cells ? 0.85 : 0.2}" />`;
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderBullet(chart, width, height) {
    const point = normalizePoint((chart.series[0]?.data || chart.data)[0] || { value: 68 });
    const max = Number(chart.getAttribute('max') || 100);
    const valueW = (width - 120) * point.value / max;
    const target = Number(point.target ?? 82);
    const targetX = 60 + (width - 120) * target / max;
    const body = `<rect x="60" y="${height / 2 - 22}" width="${width - 120}" height="44" rx="8" fill="var(--mvx-border)" opacity="0.42" /><rect x="60" y="${height / 2 - 14}" width="${valueW}" height="28" rx="7" fill="var(--mvx-accent)" />${chart.markWrap(`<line x1="${targetX}" x2="${targetX}" y1="${height / 2 - 28}" y2="${height / 2 + 28}" stroke="var(--mvx-warning)" stroke-width="1.5" />`, { label: point.label || 'Target', value: target, series: 'Bullet', seriesIndex: 0, index: 0 })}<text class="label" x="60" y="${height / 2 + 54}">${htmlEscape(point.label || 'Progress')} ${point.value}/${max}</text>`;
    return chart.renderFrame(width, height, body);
  }

export function renderSparkline(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const max = Math.max(...data.map(item => item.value), 1);
    const min = Math.min(...data.map(item => item.value), 0);
    const points = data.map((item, index) => [30 + index * ((width - 60) / Math.max(data.length - 1, 1)), height - 28 - (item.value - min) / (max - min || 1) * (height - 56), item]);
    const markers = points.map((point, index) => chart.pointMarker(point, palette[index % palette.length], index, { label: point[2].label, value: point[2].value, series: 'Sparkline', seriesIndex: 0, index })).join('');
    return chart.renderFrame(width, height, `<path d="${chart.pathForPoints(points, 'smooth')}" fill="none" stroke="var(--mvx-accent)" stroke-width="1.25" stroke-linecap="round" />${markers}`);
  }

export function renderMap(chart, type, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const max = Math.max(...data.map(item => item.value), 1);
    const land = `<path d="M 90 120 C 150 50 260 80 300 132 C 372 78 520 80 602 150 C 690 222 610 306 494 286 C 410 340 284 308 238 254 C 160 272 72 214 90 120 Z" fill="var(--mvx-bg-inset)" stroke="var(--mvx-border)" stroke-width="1" />`;
    const flows = type === 'flow-map' ? data.slice(1).map((item, index) => {
      const from = data[0];
      return chart.markWrap(`<path d="M ${from.x} ${from.y} Q ${(from.x + item.x) / 2} ${Math.min(from.y, item.y) - 70} ${item.x} ${item.y}" fill="none" stroke="${palette[index % palette.length]}" stroke-width="${2 + item.value / max * 6}" opacity="0.38" />`, { label: `${from.label} to ${item.label}`, value: item.value, series: 'Map flow', seriesIndex: 0, index });
    }).join('') : '';
    const marks = data.map((item, index) => {
      const opacity = 0.2 + item.value / max * 0.72;
      const r = type === 'symbol-map' || type === 'flow-map' ? 9 + item.value / max * 18 : 24;
      const shape = type === 'choropleth' ? `<rect x="${item.x - 34}" y="${item.y - 22}" width="68" height="44" rx="12" fill="${palette[index % palette.length]}" opacity="${opacity}" />` : `<circle cx="${item.x}" cy="${item.y}" r="${r}" fill="${type === 'geo-heatmap' ? 'var(--mvx-danger)' : palette[index % palette.length]}" opacity="${opacity}" />`;
      return chart.markWrap(`${shape}<text class="muted-label" x="${item.x}" y="${item.y + r + 16}" text-anchor="middle">${htmlEscape(item.label || '')}</text>`, { label: item.label, value: item.value, series: 'Geo', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, `${land}${flows}${marks}`);
  }

export function renderContour(chart, type, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const body = data.map((item, index) => {
      const x = 90 + index * ((width - 180) / Math.max(data.length - 1, 1));
      const y = height / 2 + Math.sin(index * 1.2) * 58;
      const r = 28 + item.value / Math.max(...data.map(point => point.value), 1) * 44;
      return chart.markWrap(`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="none" stroke="${palette[index % palette.length]}" stroke-width="1.1" opacity="${type === 'density' ? 0.24 + index * 0.07 : 0.52}" />`, { label: item.label, value: item.value, series: type, seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderHexbin(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const max = Math.max(...data.map(item => item.value), 1);
    const body = data.map((item, index) => {
      const x = 90 + (index % 6) * 86;
      const y = 70 + Math.floor(index / 6) * 74 + (index % 2 ? 36 : 0);
      const r = 22 + item.value / max * 18;
      const points = Array.from({ length: 6 }, (_, side) => {
        const [px, py] = polar(x, y, r, side * 60 + 30);
        return `${px},${py}`;
      }).join(' ');
      return chart.markWrap(`<polygon points="${points}" fill="${palette[index % palette.length]}" opacity="${0.28 + item.value / max * 0.62}" />`, { label: item.label, value: item.value, series: 'Hexbin', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }

export function renderParallelCoordinates(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(point => typeof point === 'number' ? { a: point, b: point * 0.7, c: point * 1.2, label: String(point), value: point } : point);
    const axes = ['a', 'b', 'c', 'value'];
    const max = Math.max(...data.flatMap(item => axes.map(axis => Number(item[axis] ?? item.value ?? 0))), 1);
    const axisMarks = axes.map((axis, index) => {
      const x = 70 + index * ((width - 140) / Math.max(axes.length - 1, 1));
      return `<line class="axis" x1="${x}" x2="${x}" y1="42" y2="${height - 52}" /><text class="muted-label" x="${x}" y="${height - 24}" text-anchor="middle">${axis}</text>`;
    }).join('');
    const lines = data.map((item, index) => {
      const points = axes.map((axis, axisIndex) => {
        const x = 70 + axisIndex * ((width - 140) / Math.max(axes.length - 1, 1));
        const y = height - 52 - Number(item[axis] ?? item.value ?? 0) / max * (height - 94);
        return `${x} ${y}`;
      }).join(' L ');
      return chart.markWrap(`<path d="M ${points}" fill="none" stroke="${palette[index % palette.length]}" stroke-width="1.1" opacity="0.64" />`, { label: item.label || `Row ${index + 1}`, value: item.value, series: 'Parallel', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, `${axisMarks}${lines}`);
  }

export function renderControlChart(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const values = data.map(item => item.value);
    const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
    const upper = Number(chart.getAttribute('max') || mean * 1.28);
    const lower = Number(chart.getAttribute('min') || mean * 0.72);
    const max = Math.max(upper, ...values, 1);
    const pad = plotPad(chart, { l: 54, r: 28, t: 26, b: 44 }, { l: 18, r: 18, t: 14, b: 18 });
    const scaleY = value => height - pad.b - value / max * (height - pad.t - pad.b);
    const points = data.map((item, index) => [pad.l + index * ((width - pad.l - pad.r) / Math.max(data.length - 1, 1)), scaleY(item.value), item]);
    const bands = [upper, mean, lower].map((value, index) => `<line x1="${pad.l}" x2="${width - pad.r}" y1="${scaleY(value)}" y2="${scaleY(value)}" stroke="${index === 1 ? 'var(--mvx-accent)' : 'var(--mvx-warning)'}" stroke-dasharray="${index === 1 ? '0' : '8 7'}" />`).join('');
    const markers = points.map((point, index) => chart.pointMarker(point, palette[index % palette.length], index, { label: point[2].label, value: point[2].value, series: 'Control', seriesIndex: 0, index })).join('');
    return chart.renderFrame(width, height, `${bands}<path d="${chart.pathForPoints(points, 'linear')}" fill="none" stroke="var(--mvx-accent)" stroke-width="1.25" />${markers}`);
  }

export function renderTimelineEvents(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const y = height / 2;
    const line = `<line class="axis" x1="56" x2="${width - 56}" y1="${y}" y2="${y}" />`;
    const marks = data.map((item, index) => {
      const x = 70 + index * ((width - 140) / Math.max(data.length - 1, 1));
      const up = index % 2 === 0;
      return chart.markWrap(`<line class="grid" x1="${x}" x2="${x}" y1="${y}" y2="${y + (up ? -54 : 54)}" /><circle cx="${x}" cy="${y}" r="5" fill="${palette[index % palette.length]}" /><text class="muted-label" x="${x}" y="${y + (up ? -66 : 74)}" text-anchor="middle">${htmlEscape(item.label || `Event ${index + 1}`)}</text>`, { label: item.label, value: item.value, series: 'Timeline', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, `${line}${marks}`);
  }

export function renderCalendarEvents(chart, width, height) {
    const data = (chart.series[0]?.data || chart.data).map(normalizePoint);
    const cell = Math.min((width - 100) / 7, (height - 78) / 5);
    const max = Math.max(...data.map(item => item.value), 1);
    const body = Array.from({ length: 35 }, (_, index) => {
      const item = data[index % data.length] || { value: 0, label: '' };
      const x = 50 + index % 7 * (cell + 5);
      const y = 36 + Math.floor(index / 7) * (cell + 5);
      return chart.markWrap(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="7" fill="${palette[index % palette.length]}" opacity="${0.12 + item.value / max * 0.72}" /><text class="muted-label" x="${x + cell / 2}" y="${y + cell / 2 + 4}" text-anchor="middle">${index + 1}</text>`, { label: item.label || `Day ${index + 1}`, value: item.value, series: 'Calendar', seriesIndex: 0, index });
    }).join('');
    return chart.renderFrame(width, height, body);
  }
