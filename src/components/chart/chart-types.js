import { render as renderAlluvial } from './alluvial/index.js';
import { render as renderArea } from './area/index.js';
import { render as renderBar } from './bar/index.js';
import { render as renderBoxplot } from './boxplot/index.js';
import { render as renderBubble } from './bubble/index.js';
import { render as renderBullet } from './bullet/index.js';
import { render as renderBump } from './bump/index.js';
import { render as renderCalendarEvent } from './calendar-event/index.js';
import { render as renderCalendarHeatmap } from './calendar-heatmap/index.js';
import { render as renderCandlestick } from './candlestick/index.js';
import { render as renderChord } from './chord/index.js';
import { render as renderChoropleth } from './choropleth/index.js';
import { render as renderColumn } from './column/index.js';
import { render as renderCombo } from './combo/index.js';
import { render as renderContour } from './contour/index.js';
import { render as renderControlChart } from './control-chart/index.js';
import { render as renderDependencyGraph } from './dependency-graph/index.js';
import { render as renderDensity } from './density/index.js';
import { render as renderDonut } from './donut/index.js';
import { render as renderFlowMap } from './flow-map/index.js';
import { render as renderForceDirected } from './force-directed/index.js';
import { render as renderFunnel } from './funnel/index.js';
import { render as renderGantt } from './gantt/index.js';
import { render as renderGauge } from './gauge/index.js';
import { render as renderGeoHeatmap } from './geo-heatmap/index.js';
import { render as renderGroupedBar } from './grouped-bar/index.js';
import { render as renderHeatmap } from './heatmap/index.js';
import { render as renderHexbin } from './hexbin/index.js';
import { render as renderHistogram } from './histogram/index.js';
import { render as renderIcicle } from './icicle/index.js';
import { render as renderKpi } from './kpi/index.js';
import { render as renderLine } from './line/index.js';
import { render as renderMarimekko } from './marimekko/index.js';
import { render as renderMeter } from './meter/index.js';
import { render as renderMindMap } from './mind-map/index.js';
import { render as renderMosaic } from './mosaic/index.js';
import { render as renderNetwork } from './network/index.js';
import { render as renderNetworkGraph } from './network-graph/index.js';
import { render as renderOhlc } from './ohlc/index.js';
import { render as renderOrgChart } from './org-chart/index.js';
import { render as renderParallelCoordinates } from './parallel-coordinates/index.js';
import { render as renderPie } from './pie/index.js';
import { render as renderPolarArea } from './polar-area/index.js';
import { render as renderPyramid } from './pyramid/index.js';
import { render as renderRadar } from './radar/index.js';
import { render as renderRadialBar } from './radial-bar/index.js';
import { render as renderRose } from './rose/index.js';
import { render as renderSankey } from './sankey/index.js';
import { render as renderScatter } from './scatter/index.js';
import { render as renderSlope } from './slope/index.js';
import { render as renderSparkline } from './sparkline/index.js';
import { render as renderSpider } from './spider/index.js';
import { render as renderStackedArea } from './stacked-area/index.js';
import { render as renderStackedBar } from './stacked-bar/index.js';
import { render as renderStreamgraph } from './streamgraph/index.js';
import { render as renderSunburst } from './sunburst/index.js';
import { render as renderSymbolMap } from './symbol-map/index.js';
import { render as renderTimelineEvent } from './timeline-event/index.js';
import { render as renderTimelineRange } from './timeline-range/index.js';
import { render as renderTreemap } from './treemap/index.js';
import { render as renderTreeDiagram } from './tree-diagram/index.js';
import { render as renderViolin } from './violin/index.js';
import { render as renderWaffle } from './waffle/index.js';
import { render as renderWaterfall } from './waterfall/index.js';

export const chartRenderers = {
  '100%-stacked-bar': renderStackedBar,
  '100%-stacked-column': renderStackedBar,
  '3d-surface': renderContour,
  alluvial: renderAlluvial,
  'arc-diagram': renderNetwork,
  area: renderArea,
  bar: renderBar,
  'barcode-chart': renderHeatmap,
  beeswarm: renderScatter,
  boxplot: renderBoxplot,
  bubble: renderBubble,
  'bubble-map': renderSymbolMap,
  bullet: renderBullet,
  bump: renderBump,
  'calendar-event': renderCalendarEvent,
  'calendar-heatmap': renderCalendarHeatmap,
  cartogram: renderChoropleth,
  candlestick: renderCandlestick,
  chord: renderChord,
  choropleth: renderChoropleth,
  column: renderColumn,
  combo: renderCombo,
  'confidence-band': renderArea,
  contour: renderContour,
  'control-chart': renderControlChart,
  'dependency-graph': renderDependencyGraph,
  density: renderDensity,
  'dot-plot': renderScatter,
  donut: renderDonut,
  dumbbell: renderSlope,
  'edge-bundling': renderNetwork,
  'error-band': renderArea,
  'error-bar': renderBar,
  'flow-map': renderFlowMap,
  'floating-bar': renderBar,
  'force-directed': renderForceDirected,
  funnel: renderFunnel,
  gantt: renderGantt,
  gauge: renderGauge,
  'geo-heatmap': renderGeoHeatmap,
  'grouped-bar': renderGroupedBar,
  'grouped-column': renderGroupedBar,
  'heikin-ashi': renderCandlestick,
  heatmap: renderHeatmap,
  hexbin: renderHexbin,
  histogram: renderHistogram,
  icicle: renderIcicle,
  'journey-map': renderTimelineRange,
  kagi: renderOhlc,
  kpi: renderKpi,
  line: renderLine,
  'liquid-fill': renderGauge,
  lollipop: renderBar,
  marimekko: renderMarimekko,
  'map-with-clusters': renderSymbolMap,
  'map-with-markers': renderSymbolMap,
  'market-depth': renderArea,
  meter: renderMeter,
  mesh: renderContour,
  'milestone': renderTimelineEvent,
  'mind-map': renderMindMap,
  'multi-line': renderLine,
  'matrix-network': renderNetwork,
  mosaic: renderMosaic,
  network: renderNetwork,
  'network-graph': renderNetworkGraph,
  'nested-donut': renderDonut,
  ohlc: renderOhlc,
  'org-chart': renderOrgChart,
  'parallel-coordinates': renderParallelCoordinates,
  pareto: renderCombo,
  pie: renderPie,
  pictogram: renderWaffle,
  'point-and-figure': renderOhlc,
  'polar-area': renderPolarArea,
  'probability-plot': renderScatter,
  'process-flow': renderSankey,
  'progress-ring': renderRadialBar,
  pyramid: renderPyramid,
  'qq-plot': renderScatter,
  radar: renderRadar,
  'radial-bar': renderRadialBar,
  'range-area': renderArea,
  'range-bar': renderBar,
  'range-column': renderColumn,
  renko: renderOhlc,
  ridgeline: renderDensity,
  rose: renderRose,
  'route-map': renderFlowMap,
  sankey: renderSankey,
  scatter: renderScatter,
  'semi-donut': renderDonut,
  slope: renderSlope,
  sparkline: renderSparkline,
  spectrogram: renderHeatmap,
  spider: renderSpider,
  'stacked-100-area': renderStackedArea,
  'stacked-area': renderStackedArea,
  'stacked-bar': renderStackedBar,
  'stacked-column': renderStackedBar,
  'status-timeline': renderTimelineEvent,
  'step-line': renderLine,
  'strip-plot': renderScatter,
  streamgraph: renderStreamgraph,
  surface: renderContour,
  sunburst: renderSunburst,
  'symbol-map': renderSymbolMap,
  ternary: renderScatter,
  'tile-map': renderChoropleth,
  'timeline-event': renderTimelineEvent,
  'timeline-range': renderTimelineRange,
  treemap: renderTreemap,
  'tree-diagram': renderTreeDiagram,
  'unit-chart': renderWaffle,
  'vector-field': renderScatter,
  violin: renderViolin,
  waffle: renderWaffle,
  waterfall: renderWaterfall,
  'word-cloud': renderTreemap,
  'word-tree': renderTreeDiagram,
  'volume-candlestick': renderCandlestick
};

export const chartTypes = Object.freeze(Object.keys(chartRenderers));
