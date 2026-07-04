class FakeElement {
  constructor() {
    this._attrs = new Map();
    this._listeners = new Map();
    this.style = {
      values: new Map(),
      setProperty: (name, value) => this.style.values.set(name, value),
      removeProperty: name => this.style.values.delete(name),
      getPropertyValue: name => this.style.values.get(name) || ''
    };
  }

  attachShadow() {
    this.shadowRoot = {
      innerHTML: '',
      querySelector: selector => this._shadow?.[selector] || null
    };
    return this.shadowRoot;
  }

  setAttribute(name, value = '') {
    const oldValue = this.getAttribute(name);
    this._attrs.set(name, String(value));
    if (name.startsWith('data-')) {
      this.dataset ||= {};
      this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
    }
    this.attributeChangedCallback?.(name, oldValue, String(value));
  }

  getAttribute(name) {
    return this._attrs.has(name) ? this._attrs.get(name) : null;
  }

  removeAttribute(name) {
    const oldValue = this.getAttribute(name);
    this._attrs.delete(name);
    if (name.startsWith('data-') && this.dataset) {
      delete this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())];
    }
    this.attributeChangedCallback?.(name, oldValue, null);
  }

  hasAttribute(name) {
    return this._attrs.has(name);
  }

  addEventListener(name, handler) {
    this._listeners.set(name, handler);
  }

  removeEventListener(name) {
    this._listeners.delete(name);
  }

  matches() {
    return false;
  }
}

globalThis.HTMLElement = FakeElement;
globalThis.MutationObserver = class {
  observe() {}
  disconnect() {}
};
globalThis.CustomEvent = class {
  constructor(name, options) {
    this.type = name;
    this.detail = options?.detail;
  }
};
globalThis.document = {
  documentElement: {
    clientWidth: 1024,
    clientHeight: 768,
    lang: 'en'
  }
};
globalThis.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener() {},
  removeEventListener() {}
};

const { MvxTooltip } = await import('../src/components/tooltip/tooltip.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function rect(left, top, width, height) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
  };
}

function makeTooltip(attrs = {}, triggerRect = rect(400, 300, 80, 36), tipRect = rect(0, 0, 160, 48)) {
  const tooltip = new MvxTooltip();
  Object.entries(attrs).forEach(([name, value]) => tooltip.setAttribute(name, value));
  const trigger = new FakeElement();
  const tip = new FakeElement();
  trigger.getBoundingClientRect = () => triggerRect;
  tip.getBoundingClientRect = () => tipRect;
  tip.dataset = {};
  tooltip._shadow = {
    '.trigger': trigger,
    '.tip': tip
  };
  tooltip.isConnected = true;
  return { tooltip, trigger, tip };
}

{
  const { tooltip } = makeTooltip({ placement: 'auto' }, rect(400, 300, 80, 36));
  const placement = tooltip.resolvePlacement(rect(400, 300, 80, 36), rect(0, 0, 160, 48), { width: 1024, height: 768 }, 10);
  assert(placement === 'top', `expected centered auto placement to choose top, got ${placement}`);
}

{
  const { tooltip } = makeTooltip({ placement: 'auto' }, rect(400, 4, 80, 36));
  const placement = tooltip.resolvePlacement(rect(400, 4, 80, 36), rect(0, 0, 160, 48), { width: 1024, height: 768 }, 10);
  assert(placement === 'bottom', `expected top-edge auto placement to choose bottom, got ${placement}`);
}

{
  const { tooltip } = makeTooltip({ placement: 'auto' }, rect(4, 300, 80, 36), rect(0, 0, 220, 48));
  const placement = tooltip.resolvePlacement(rect(4, 300, 80, 36), rect(0, 0, 220, 48), { width: 320, height: 768 }, 10);
  assert(['top', 'bottom', 'right'].includes(placement), `expected auto placement to avoid unavailable left space, got ${placement}`);
}

{
  const { tooltip } = makeTooltip({ 'default-placement': 'left' }, rect(400, 300, 80, 36));
  assert(tooltip.requestedPlacement() === 'left', `expected placement to use default-placement when not explicitly set, got ${tooltip.requestedPlacement()}`);
}

{
  const { tooltip } = makeTooltip({}, rect(400, 300, 80, 36));
  assert(tooltip.requestedPlacement() === 'top', `expected default-placement fallback to be top, got ${tooltip.requestedPlacement()}`);
}

{
  const tooltip = new MvxTooltip();
  tooltip.setAttribute('content', '<strong>HTML</strong> tooltip');
  tooltip.isConnected = true;
  tooltip.renderCurrentState?.();
  const hasRawHtml = String(tooltip.shadowRoot.innerHTML || '').includes('<strong>HTML</strong> tooltip');
  assert(hasRawHtml, 'expected render to preserve raw html when using content attribute');
}

{
  const { tooltip } = makeTooltip({ placement: 'left' }, rect(8, 300, 80, 36), rect(0, 0, 160, 48));
  const position = tooltip.positionForPlacement('left', rect(8, 300, 80, 36), rect(0, 0, 160, 48), { width: 320, height: 768 }, 10);
  assert(position.x >= 8, `expected clamped x to stay in viewport, got ${position.x}`);
}

{
  const { tooltip, tip } = makeTooltip({ placement: 'auto' }, rect(400, 300, 80, 36));
  tooltip.setAttribute('open', '');
  tooltip.updatePosition();
  assert(tip.dataset.open === 'true', 'expected open tooltip to set data-open');
  assert(['top', 'right', 'bottom', 'left'].includes(tip.dataset.placement), `unexpected placement ${tip.dataset.placement}`);
  assert(tip.style.getPropertyValue('--mvx-tip-x'), 'expected x coordinate style');
  assert(tip.style.getPropertyValue('--mvx-tip-y'), 'expected y coordinate style');
  tooltip.hide();
  assert(!tip.dataset.open, 'expected hide() to remove data-open');
}

console.log('Tooltip placement tests passed.');
