export const palette = ['var(--mvx-accent)', 'var(--mvx-accent-2)', 'var(--mvx-success)', 'var(--mvx-warning)', 'var(--mvx-danger)', 'var(--mvx-info)', '#b48cff', '#ff8fc7'];
export const cartesianTypes = new Set(['line', 'area', 'bar', 'column', 'grouped-bar', 'grouped-column', 'stacked-bar', 'stacked-column', '100%-stacked-bar', '100%-stacked-column', 'stacked-area', 'stacked-100-area', 'combo', 'histogram', 'waterfall', 'pareto', 'multi-line', 'step-line', 'range-area', 'confidence-band', 'error-band', 'range-bar', 'range-column', 'floating-bar', 'error-bar', 'lollipop', 'dumbbell', 'burndown', 'burnup', 'cumulative-flow', 'forecast-fan', 'slo-error-budget-burn', 'aging-bucket', 'variance-budget-actual']);
export const radialTypes = new Set(['pie', 'donut', 'nested-donut', 'semi-donut', 'rose', 'polar-area', 'radial-bar', 'progress-ring']);
export const flowTypes = new Set(['sankey', 'alluvial', 'process-flow']);
export const networkTypes = new Set(['network', 'network-graph', 'force-directed', 'dependency-graph', 'arc-diagram', 'matrix-network', 'edge-bundling']);
export const treeTypes = new Set(['org-chart', 'mind-map', 'tree-diagram', 'icicle', 'word-tree']);
export const mapTypes = new Set(['choropleth', 'symbol-map', 'flow-map', 'geo-heatmap', 'bubble-map', 'tile-map', 'cartogram', 'route-map', 'map-with-markers', 'map-with-clusters']);
export const enterpriseTypes = new Set(['cohort-retention', 'cumulative-flow', 'burndown', 'burnup', 'risk-matrix', 'correlation-matrix', 'tornado', 'decomposition-tree', 'forecast-fan', 'slo-error-budget-burn', 'resource-utilization', 'aging-bucket', 'boxen-plot', 'cohort-funnel', 'variance-budget-actual', 'small-multiples']);

const comparisonSample = [
  { label: 'Jan', value: 18, y: 18, x: 1, size: 12, start: 0, end: 2 },
  { label: 'Feb', value: 28, y: 28, x: 2, size: 18, start: 1, end: 4 },
  { label: 'Mar', value: 44, y: 44, x: 3, size: 28, start: 3, end: 6 },
  { label: 'Apr', value: 37, y: 37, x: 4, size: 22, start: 5, end: 7 },
  { label: 'May', value: 62, y: 62, x: 5, size: 36, start: 6, end: 10 }
];

const rangeAreaSample = [
  { label: '00:00', low: 18, value: 22, y: 22, high: 26 },
  { label: '04:00', low: 17, value: 21, y: 21, high: 25 },
  { label: '08:00', low: 21, value: 28, y: 28, high: 34 },
  { label: '12:00', low: 28, value: 35, y: 35, high: 42 },
  { label: '16:00', low: 31, value: 39, y: 39, high: 46 },
  { label: '20:00', low: 24, value: 30, y: 30, high: 35 }
];

const confidenceBandSample = [
  { label: 'Q1', low: 37, value: 42, y: 42, high: 47 },
  { label: 'Q2', low: 41, value: 48, y: 48, high: 55 },
  { label: 'Q3', low: 48, value: 57, y: 57, high: 66 },
  { label: 'Q4', low: 51, value: 63, y: 63, high: 75 },
  { label: 'Q5', low: 56, value: 71, y: 71, high: 86 },
  { label: 'Q6', low: 60, value: 78, y: 78, high: 96 }
];

const errorBandSample = [
  { label: 'Run A', low: 27, value: 31, y: 31, high: 35 },
  { label: 'Run B', low: 30, value: 36, y: 36, high: 42 },
  { label: 'Run C', low: 31, value: 34, y: 34, high: 37 },
  { label: 'Run D', low: 36, value: 43, y: 43, high: 50 },
  { label: 'Run E', low: 42, value: 47, y: 47, high: 52 },
  { label: 'Run F', low: 37, value: 45, y: 45, high: 53 }
];

const stackedAreaSample = [
  { name: 'Organic', data: [
    { label: 'Jan', value: 18 }, { label: 'Feb', value: 22 }, { label: 'Mar', value: 27 },
    { label: 'Apr', value: 31 }, { label: 'May', value: 38 }, { label: 'Jun', value: 44 }
  ] },
  { name: 'Product', data: [
    { label: 'Jan', value: 12 }, { label: 'Feb', value: 18 }, { label: 'Mar', value: 21 },
    { label: 'Apr', value: 29 }, { label: 'May', value: 33 }, { label: 'Jun', value: 41 }
  ] },
  { name: 'Partner', data: [
    { label: 'Jan', value: 8 }, { label: 'Feb', value: 12 }, { label: 'Mar', value: 19 },
    { label: 'Apr', value: 20 }, { label: 'May', value: 27 }, { label: 'Jun', value: 34 }
  ] }
];

const stacked100AreaSample = [
  { name: 'Core', data: [
    { label: 'Jan', value: 58 }, { label: 'Feb', value: 52 }, { label: 'Mar', value: 47 },
    { label: 'Apr', value: 43 }, { label: 'May', value: 39 }, { label: 'Jun', value: 34 }
  ] },
  { name: 'Growth', data: [
    { label: 'Jan', value: 29 }, { label: 'Feb', value: 32 }, { label: 'Mar', value: 35 },
    { label: 'Apr', value: 37 }, { label: 'May', value: 40 }, { label: 'Jun', value: 42 }
  ] },
  { name: 'Experimental', data: [
    { label: 'Jan', value: 13 }, { label: 'Feb', value: 16 }, { label: 'Mar', value: 18 },
    { label: 'Apr', value: 20 }, { label: 'May', value: 21 }, { label: 'Jun', value: 24 }
  ] }
];

const financialSample = [
  { label: 'Mon', open: 42, high: 55, low: 38, close: 50, value: 50 },
  { label: 'Tue', open: 50, high: 58, low: 44, close: 47, value: 47 },
  { label: 'Wed', open: 47, high: 62, low: 45, close: 59, value: 59 },
  { label: 'Thu', open: 59, high: 64, low: 52, close: 55, value: 55 },
  { label: 'Fri', open: 55, high: 71, low: 54, close: 68, value: 68 }
];

const distributionSample = [
  { label: 'A', low: 12, q1: 18, median: 26, q3: 34, high: 48, value: 26 },
  { label: 'B', low: 18, q1: 28, median: 36, q3: 46, high: 61, value: 36 },
  { label: 'C', low: 8, q1: 16, median: 22, q3: 31, high: 42, value: 22 },
  { label: 'D', low: 24, q1: 34, median: 43, q3: 56, high: 70, value: 43 }
];

const flowSample = [
  { from: 'Visitors', to: 'Trials', value: 42 },
  { from: 'Visitors', to: 'Docs', value: 24 },
  { from: 'Trials', to: 'Qualified', value: 28 },
  { from: 'Docs', to: 'Qualified', value: 14 },
  { from: 'Qualified', to: 'Customers', value: 18 }
];

const networkSample = [
  { id: 'API', label: 'API', value: 34, links: ['Data', 'Agent'] },
  { id: 'Data', label: 'Data', value: 28, links: ['Charts', 'Table'] },
  { id: 'Agent', label: 'Agent', value: 24, links: ['Chat', 'Workflow'] },
  { id: 'Charts', label: 'Charts', value: 20, links: [] },
  { id: 'Table', label: 'Table', value: 18, links: [] },
  { id: 'Chat', label: 'Chat', value: 22, links: [] },
  { id: 'Workflow', label: 'Workflow', value: 16, links: [] }
];

const hierarchySample = [
  { label: 'Platform', value: 100, parent: '' },
  { label: 'Components', value: 42, parent: 'Platform' },
  { label: 'Charts', value: 28, parent: 'Platform' },
  { label: 'AI', value: 18, parent: 'Platform' },
  { label: 'Forms', value: 16, parent: 'Components' },
  { label: 'Data', value: 14, parent: 'Components' },
  { label: 'AI assistant', value: 12, parent: 'AI' }
];

const geoSample = [
  { label: 'North', value: 72, x: 140, y: 92 },
  { label: 'West', value: 48, x: 235, y: 190 },
  { label: 'Central', value: 86, x: 360, y: 150 },
  { label: 'East', value: 56, x: 510, y: 122 },
  { label: 'South', value: 64, x: 430, y: 260 }
];

export function defaultSeriesForType(type = 'line') {
  if (type === 'cohort-retention') return [{ name: 'Retention cohort', data: [
    { xLabel: 'W1', yLabel: 'Jan', value: 82 }, { xLabel: 'W2', yLabel: 'Jan', value: 64 }, { xLabel: 'W3', yLabel: 'Jan', value: 51 }, { xLabel: 'W4', yLabel: 'Jan', value: 44 },
    { xLabel: 'W1', yLabel: 'Feb', value: 78 }, { xLabel: 'W2', yLabel: 'Feb', value: 59 }, { xLabel: 'W3', yLabel: 'Feb', value: 48 }, { xLabel: 'W4', yLabel: 'Feb', value: 39 },
    { xLabel: 'W1', yLabel: 'Mar', value: 86 }, { xLabel: 'W2', yLabel: 'Mar', value: 68 }, { xLabel: 'W3', yLabel: 'Mar', value: 57 }, { xLabel: 'W4', yLabel: 'Mar', value: 49 }
  ] }];
  if (type === 'risk-matrix') return [{ name: 'Risk matrix', data: [
    { xLabel: 'Low', yLabel: 'Low', value: 2 }, { xLabel: 'Med', yLabel: 'Low', value: 5 }, { xLabel: 'High', yLabel: 'Low', value: 8 },
    { xLabel: 'Low', yLabel: 'Med', value: 6 }, { xLabel: 'Med', yLabel: 'Med', value: 12 }, { xLabel: 'High', yLabel: 'Med', value: 18 },
    { xLabel: 'Low', yLabel: 'High', value: 9 }, { xLabel: 'Med', yLabel: 'High', value: 18 }, { xLabel: 'High', yLabel: 'High', value: 25 }
  ] }];
  if (type === 'correlation-matrix') return [{ name: 'Correlation matrix', data: [
    { xLabel: 'MRR', yLabel: 'MRR', value: 1 }, { xLabel: 'MRR', yLabel: 'Churn', value: -0.7 }, { xLabel: 'MRR', yLabel: 'NPS', value: 0.6 },
    { xLabel: 'Churn', yLabel: 'MRR', value: -0.7 }, { xLabel: 'Churn', yLabel: 'Churn', value: 1 }, { xLabel: 'Churn', yLabel: 'NPS', value: -0.5 },
    { xLabel: 'NPS', yLabel: 'MRR', value: 0.6 }, { xLabel: 'NPS', yLabel: 'Churn', value: -0.5 }, { xLabel: 'NPS', yLabel: 'NPS', value: 1 }
  ] }];
  if (type === 'tornado') return [{ name: 'Sensitivity', data: [
    { label: 'Price', value: 42 }, { label: 'Churn', value: -31 }, { label: 'CAC', value: -24 }, { label: 'Expansion', value: 21 }, { label: 'Support', value: -13 }
  ] }];
  if (type === 'forecast-fan') return [{ name: 'Revenue forecast', data: [
    { label: 'Q1', value: 42, p50Low: 38, p50High: 46, p80Low: 34, p80High: 51, p95Low: 29, p95High: 57 },
    { label: 'Q2', value: 49, p50Low: 44, p50High: 55, p80Low: 39, p80High: 62, p95Low: 32, p95High: 69 },
    { label: 'Q3', value: 58, p50Low: 51, p50High: 66, p80Low: 44, p80High: 75, p95Low: 36, p95High: 86 },
    { label: 'Q4', value: 68, p50Low: 59, p50High: 78, p80Low: 49, p80High: 91, p95Low: 38, p95High: 105 }
  ] }];
  if (type === 'cumulative-flow') return stackedAreaSample;
  if (type === 'burndown') return [{ name: 'Work remaining', data: [
    { label: 'D1', value: 80 }, { label: 'D2', value: 68 }, { label: 'D3', value: 55 }, { label: 'D4', value: 42 }, { label: 'D5', value: 25 }, { label: 'D6', value: 8 }
  ] }];
  if (type === 'burnup') return [{ name: 'Work completed', data: [
    { label: 'D1', value: 8 }, { label: 'D2', value: 22 }, { label: 'D3', value: 36 }, { label: 'D4', value: 53 }, { label: 'D5', value: 68 }, { label: 'D6', value: 80 }
  ] }];
  if (type === 'slo-error-budget-burn') return [{ name: 'Error budget remaining', data: [
    { label: 'Mon', value: 100 }, { label: 'Tue', value: 86 }, { label: 'Wed', value: 72 }, { label: 'Thu', value: 49 }, { label: 'Fri', value: 31 }, { label: 'Sat', value: 18 }
  ] }];
  if (type === 'resource-utilization') return [{ name: 'Team capacity', data: [
    { label: 'Design', start: 0, end: 4, value: 4 }, { label: 'Frontend', start: 2, end: 8, value: 8 }, { label: 'Backend', start: 1, end: 7, value: 7 }, { label: 'QA', start: 6, end: 10, value: 10 }
  ] }];
  if (type === 'aging-bucket') return [{ name: 'Invoice aging', data: [
    { label: '0-30', value: 58 }, { label: '31-60', value: 31 }, { label: '61-90', value: 17 }, { label: '90+', value: 9 }
  ] }];
  if (type === 'boxen-plot') return [{ name: 'Large distribution', data: distributionSample }];
  if (type === 'cohort-funnel') return [{ name: 'Cohort funnel', data: flowSample }];
  if (type === 'variance-budget-actual') return [
    { name: 'Budget', data: [{ label: 'Sales', value: 42 }, { label: 'R&D', value: 36 }, { label: 'Ops', value: 24 }] },
    { name: 'Actual', data: [{ label: 'Sales', value: 47 }, { label: 'R&D', value: 31 }, { label: 'Ops', value: 29 }] }
  ];
  if (type === 'small-multiples') return [
    { name: 'NA', data: [{ label: 'Jan', value: 18 }, { label: 'Feb', value: 23 }, { label: 'Mar', value: 31 }, { label: 'Apr', value: 36 }] },
    { name: 'EU', data: [{ label: 'Jan', value: 14 }, { label: 'Feb', value: 21 }, { label: 'Mar', value: 24 }, { label: 'Apr', value: 33 }] },
    { name: 'IN', data: [{ label: 'Jan', value: 9 }, { label: 'Feb', value: 16 }, { label: 'Mar', value: 29 }, { label: 'Apr', value: 41 }] },
    { name: 'APAC', data: [{ label: 'Jan', value: 12 }, { label: 'Feb', value: 19 }, { label: 'Mar', value: 22 }, { label: 'Apr', value: 28 }] }
  ];
  if (type === 'decomposition-tree') return [{ name: 'Revenue breakdown', data: hierarchySample }];
  if (type === 'range-area') return [{ name: 'Daily temperature range', data: rangeAreaSample }];
  if (type === 'confidence-band') return [{ name: 'Forecast with 95% confidence', data: confidenceBandSample }];
  if (type === 'error-band') return [{ name: 'Experiment mean +/- error', data: errorBandSample }];
  if (type === 'stacked-area') return stackedAreaSample;
  if (type === 'stacked-100-area') return stacked100AreaSample;
  if (flowTypes.has(type)) return [{ name: 'Flow', data: flowSample }];
  if (networkTypes.has(type) || type === 'chord') return [{ name: 'Network', data: networkSample }];
  if (treeTypes.has(type)) return [{ name: 'Hierarchy', data: hierarchySample }];
  if (mapTypes.has(type)) return [{ name: 'Geo', data: geoSample }];
  if (type === 'waffle' || type === 'unit-chart' || type === 'pictogram' || type === 'bullet' || type === 'sparkline' || type === 'slope' || type === 'dumbbell' || type === 'bump' || type === 'streamgraph' || type === 'marimekko' || type === 'mosaic' || type === 'contour' || type === 'density' || type === 'ridgeline' || type === 'hexbin' || type === 'parallel-coordinates' || type === 'control-chart' || type === 'timeline-event' || type === 'status-timeline' || type === 'milestone' || type === 'calendar-event' || type === 'qq-plot' || type === 'probability-plot' || type === 'beeswarm' || type === 'dot-plot' || type === 'strip-plot' || type === 'ternary' || type === 'vector-field' || type === '3d-surface' || type === 'surface' || type === 'mesh' || type === 'spectrogram' || type === 'barcode-chart') return [{ name: 'Signal', data: comparisonSample }];
  if (type === 'candlestick' || type === 'ohlc' || type === 'volume-candlestick' || type === 'heikin-ashi' || type === 'renko' || type === 'kagi' || type === 'point-and-figure') return [{ name: 'OHLC', data: financialSample }];
  if (type === 'boxplot' || type === 'violin') return [{ name: 'Distribution', data: distributionSample }];
  if (type === 'gantt' || type === 'timeline-range' || type === 'journey-map') return [{ name: 'Schedule', data: [
    { label: 'Research', start: 0, end: 3, value: 3 },
    { label: 'Design', start: 2, end: 6, value: 6 },
    { label: 'Build', start: 5, end: 10, value: 10 },
    { label: 'Ship', start: 9, end: 12, value: 12 }
  ] }];
  if (type === 'funnel' || type === 'pyramid') return [{ name: 'Conversion', data: [
    { label: 'Visitors', value: 1200 },
    { label: 'Trials', value: 640 },
    { label: 'Qualified', value: 310 },
    { label: 'Customers', value: 128 }
  ] }];
  if (type === 'treemap' || type === 'sunburst' || type === 'word-cloud') return [{ name: 'Portfolio', data: [
    { label: 'Core', value: 42 },
    { label: 'Charts', value: 24 },
    { label: 'AI', value: 18 },
    { label: 'Workflow', value: 16 }
  ] }];
  if (type === 'heatmap' || type === 'calendar-heatmap' || type === 'tile-map') return [{ name: 'Activity', data: [
    { label: 'Mon AM', value: 12 }, { label: 'Mon PM', value: 28 }, { label: 'Tue AM', value: 44 },
    { label: 'Tue PM', value: 31 }, { label: 'Wed AM', value: 52 }, { label: 'Wed PM', value: 19 },
    { label: 'Thu AM', value: 36 }, { label: 'Thu PM', value: 64 }, { label: 'Fri AM', value: 48 }
  ] }];
  if (type === 'radar' || type === 'spider') return [{ name: 'Capability', data: [
    { label: 'A11y', value: 92 },
    { label: 'Theme', value: 84 },
    { label: 'i18n', value: 78 },
    { label: 'AI', value: 88 },
    { label: 'DX', value: 82 }
  ] }];
  if (type === 'scatter' || type === 'bubble' || type === 'qq-plot' || type === 'probability-plot' || type === 'beeswarm' || type === 'dot-plot' || type === 'strip-plot' || type === 'ternary' || type === 'vector-field') return [{ name: 'Signals', data: [
    { label: 'A', x: 1, y: 18, size: 12, value: 18 },
    { label: 'B', x: 2, y: 32, size: 24, value: 32 },
    { label: 'C', x: 3.5, y: 26, size: 18, value: 26 },
    { label: 'D', x: 4.2, y: 54, size: 36, value: 54 },
    { label: 'E', x: 5, y: 42, size: 28, value: 42 }
  ] }];
  if (type === 'pie' || type === 'donut' || type === 'nested-donut' || type === 'semi-donut' || type === 'rose' || type === 'polar-area' || type === 'radial-bar' || type === 'progress-ring') return [{ name: 'Share', data: [
    { label: 'Actions', value: 32 },
    { label: 'Forms', value: 24 },
    { label: 'Data', value: 21 },
    { label: 'AI', value: 14 },
    { label: 'Charts', value: 9 }
  ] }];
  if (type === 'gauge' || type === 'meter' || type === 'kpi' || type === 'liquid-fill') return [{ name: 'Target', data: [{ label: 'Score', value: 68 }] }];
  return [
    { name: 'Adoption', data: comparisonSample },
    { name: 'Usage', data: [12, 22, 31, 48, 58] }
  ];
}

export function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function polar(cx, cy, radius, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

export function arcPath(cx, cy, radius, start, end, inner = 0) {
  const [sx, sy] = polar(cx, cy, radius, end);
  const [ex, ey] = polar(cx, cy, radius, start);
  const large = end - start <= 180 ? 0 : 1;
  if (!inner) return `M ${cx} ${cy} L ${ex} ${ey} A ${radius} ${radius} 0 ${large} 1 ${sx} ${sy} Z`;
  const [isx, isy] = polar(cx, cy, inner, end);
  const [iex, iey] = polar(cx, cy, inner, start);
  return `M ${ex} ${ey} A ${radius} ${radius} 0 ${large} 1 ${sx} ${sy} L ${isx} ${isy} A ${inner} ${inner} 0 ${large} 0 ${iex} ${iey} Z`;
}

export function normalizePoint(point, index) {
  if (typeof point === 'number') return { label: `Item ${index + 1}`, value: point, y: point };
  return { ...point, value: Number(point.value ?? point.y ?? point.close ?? 0), y: Number(point.y ?? point.value ?? point.close ?? 0) };
}

export function niceMax(value) {
  if (!value) return 10;
  const pow = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / pow) * pow;
}

export function chartSubtitle(type) {
  const labels = {
    line: 'Trends over time',
    area: 'Volume over time',
    bar: 'Ranked comparison',
    column: 'Categorical comparison',
    pie: 'Part-to-whole',
    donut: 'Part-to-whole with center space',
    scatter: 'Correlation',
    bubble: 'Correlation with magnitude',
    radar: 'Multivariate profile',
    heatmap: 'Matrix intensity',
    treemap: 'Hierarchical proportion',
    funnel: 'Stage conversion',
    gauge: 'Progress against target',
    candlestick: 'Financial OHLC',
    boxplot: 'Distribution summary',
    waterfall: 'Sequential contribution',
    gantt: 'Timeline schedule'
  };
  return labels[type] || 'Data visualization';
}
