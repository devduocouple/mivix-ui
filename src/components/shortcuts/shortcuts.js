import { baseStyles, MvxElement, parseData } from '../../core.js';

const modifierOrder = ['ctrl', 'meta', 'mod', 'alt', 'shift'];
const keyAliases = new Map([
  ['cmd', 'meta'],
  ['command', 'meta'],
  ['control', 'ctrl'],
  ['ctl', 'ctrl'],
  ['option', 'alt'],
  ['esc', 'escape'],
  ['return', 'enter'],
  ['del', 'delete'],
  ['spacebar', 'space'],
  [' ', 'space']
]);

function normalizeKey(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const key = raw.length === 1 ? raw.toLowerCase() : raw.toLowerCase();
  return keyAliases.get(key) || key;
}

function normalizeChord(value) {
  const parts = String(value || '')
    .trim()
    .replace(/\s*\+\s*/g, '+')
    .split('+')
    .map(normalizeKey)
    .filter(Boolean);
  if (!parts.length) return '';
  const modifiers = new Set();
  let key = '';
  parts.forEach(part => {
    if (modifierOrder.includes(part)) {
      modifiers.add(part);
    } else {
      key = part;
    }
  });
  return [...modifierOrder.filter(modifier => modifiers.has(modifier)), key].filter(Boolean).join('+');
}

function expandModChord(chord) {
  if (!chord.includes('mod')) return [chord];
  return [
    chord.replace(/\bmod\b/g, 'ctrl'),
    chord.replace(/\bmod\b/g, 'meta')
  ];
}

function parseShortcut(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/\s*,\s*/);
  return source
    .flatMap(shortcut => String(shortcut || '').trim() ? [String(shortcut).trim()] : [])
    .map(shortcut => shortcut
      .replace(/\s*\+\s*/g, '+')
      .split(/\s+/)
      .map(normalizeChord)
      .filter(Boolean))
    .filter(sequence => sequence.length);
}

function eventChord(event) {
  const key = normalizeKey(event.key);
  if (!key || ['ctrl', 'meta', 'mod', 'alt', 'shift'].includes(key)) return '';
  const modifiers = [];
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.metaKey) modifiers.push('meta');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  return [...modifiers, key].join('+');
}

function sequenceMatches(expected, actual) {
  if (actual.length > expected.length) return false;
  return actual.every((chord, index) => expandModChord(expected[index]).includes(chord));
}

function sequenceExact(expected, actual) {
  return expected.length === actual.length && sequenceMatches(expected, actual);
}

function itemShortcut(item) {
  return item?.shortcut ?? item?.keys ?? item?.key ?? item?.hotkey ?? '';
}

function itemAllowsInput(item) {
  return Boolean(item?.allowInput ?? item?.['allow-input']);
}

function itemPreventDefault(item) {
  return item?.preventDefault !== false && item?.['prevent-default'] !== false;
}

function isEditableTarget(event) {
  const path = event.composedPath?.() || [event.target];
  return path.some(node => {
    if (!(node instanceof Element)) return false;
    const tag = node.localName;
    return tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable;
  });
}

export class MvxShortcuts extends MvxElement {
  static observedAttributes = ['items', 'disabled', 'capture'];

  constructor() {
    super();
    this._sequence = [];
    this._timer = null;
    this._onKeydown = event => this.handleKeydown(event);
  }

  set items(value) {
    this._items = value;
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  connectedCallback() {
    super.connectedCallback();
    this.installListener();
  }

  disconnectedCallback() {
    this.removeListener();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'capture' && oldValue !== newValue && this.isConnected) {
      this.removeListener();
      this.installListener();
    }
  }

  installListener() {
    if (this._listening || !this.ownerDocument) return;
    this._listenerCapture = this.hasAttribute('capture');
    this.ownerDocument.addEventListener('keydown', this._onKeydown, this._listenerCapture);
    this._listening = true;
  }

  removeListener() {
    if (!this._listening || !this.ownerDocument) return;
    this.ownerDocument.removeEventListener('keydown', this._onKeydown, this._listenerCapture);
    this._listening = false;
    this.resetSequence();
  }

  resetSequence() {
    this._sequence = [];
    if (this._timer) globalThis.clearTimeout(this._timer);
    this._timer = null;
  }

  shortcutEntries(event) {
    const editable = isEditableTarget(event);
    return this.items
      .filter(item => item && !item.disabled && item.disabled !== '')
      .filter(item => !editable || itemAllowsInput(item))
      .flatMap(item => parseShortcut(itemShortcut(item)).map(sequence => ({ item, sequence })));
  }

  handleKeydown(event) {
    if (this.hasAttribute('disabled') || event.defaultPrevented || event.repeat) return;
    const chord = eventChord(event);
    if (!chord) return;
    const entries = this.shortcutEntries(event);
    if (!entries.length) return;

    this._sequence = [...this._sequence, chord];
    let exactEntry = entries.find(entry => sequenceExact(entry.sequence, this._sequence));
    let hasPrefix = entries.some(entry => sequenceMatches(entry.sequence, this._sequence));

    if (!exactEntry && !hasPrefix && this._sequence.length > 1) {
      this._sequence = [chord];
      exactEntry = entries.find(entry => sequenceExact(entry.sequence, this._sequence));
      hasPrefix = entries.some(entry => sequenceMatches(entry.sequence, this._sequence));
    }

    if (exactEntry) {
      if (itemPreventDefault(exactEntry.item)) event.preventDefault();
      this.runShortcut(exactEntry.item, event, exactEntry.sequence);
      this.resetSequence();
      return;
    }

    if (hasPrefix) {
      event.preventDefault();
      if (this._timer) globalThis.clearTimeout(this._timer);
      this._timer = globalThis.setTimeout(() => this.resetSequence(), Number(this.getAttribute('timeout') || 900));
      return;
    }

    this.resetSequence();
  }

  runShortcut(item, sourceEvent, sequence = []) {
    const detail = {
      item,
      command: item.command || item.action || '',
      shortcut: itemShortcut(item),
      sequence,
      sourceEvent
    };
    const event = new CustomEvent('mvx-shortcut', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true
    });
    if (!this.dispatchEvent(event)) return false;

    const handled = this.runDefaultAction(item);
    if (item.command) {
      this.emit('mvx-command', {
        ...detail,
        handled
      });
    }
    return true;
  }

  findTarget(item) {
    const selector = item.selector || item.target || item.click || item.focus || item.scroll;
    if (!selector) return null;
    try {
      return this.ownerDocument.querySelector(selector);
    } catch {
      return null;
    }
  }

  runDefaultAction(item) {
    const action = item.action || (item.href || item.to || item.url ? 'navigate' : item.focus ? 'focus' : item.scroll ? 'scroll' : item.selector || item.target || item.click ? 'click' : 'dispatch');
    const target = this.findTarget(item);

    if (action === 'focus') {
      target?.focus?.();
      return Boolean(target);
    }
    if (action === 'scroll') {
      target?.scrollIntoView?.({ behavior: item.behavior || 'smooth', block: item.block || 'center' });
      return Boolean(target);
    }
    if (action === 'click') {
      target?.click?.();
      return Boolean(target);
    }
    if (action === 'navigate') {
      const href = item.href || item.to || item.url;
      if (!href) return false;
      if (String(href).startsWith('#')) {
        globalThis.location.hash = href;
      } else {
        globalThis.location.assign(href);
      }
      return true;
    }
    return false;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: none; }
      </style>
      <slot></slot>
    `;
  }
}
