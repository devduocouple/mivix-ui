import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

const placements = ['top', 'right', 'bottom', 'left'];
const defaultPlacement = 'top';
const arrowOffsetPx = 6;

export class MvxTooltip extends MvxElement {
  static observedAttributes = ['text', 'content', 'placement', 'default-placement', 'offset', 'max-width', 'open'];

  connectedCallback() {
    super.connectedCallback();
    this._onEnter = () => this.show();
    this._onLeave = () => this.hide();
    this._onFocusIn = () => this.show();
    this._onFocusOut = () => this.hide();
    this._onViewportChange = () => this.updatePosition();
    this._bindInteraction();
  }

  disconnectedCallback() {
    this._unbindInteraction();
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      if (!this.isConnected) return;
      if (this.hasAttribute('open')) {
        this.updatePosition();
        this._watchViewport();
      } else {
        this._tip()?.removeAttribute('data-open');
        this._unwatchViewport();
      }
      return;
    }
    super.attributeChangedCallback(name, oldValue, newValue);
    if (this.isConnected && ['placement', 'default-placement', 'offset', 'max-width', 'content', 'text'].includes(name)) {
      queueMicrotask(() => this.updatePosition());
    }
  }

  render() {
    const text = this.getAttribute('text') || '';
    const content = this.getAttribute('content');
    const maxWidth = this.getAttribute('max-width') || '260px';
    const tooltipContent = content !== null ? content : htmlEscape(text);
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: inline-flex;
          position: relative;
          vertical-align: middle;
        }

        .trigger {
          display: inline-flex;
          inline-size: fit-content;
        }

        .tip {
          position: fixed;
          inset-block-start: 0;
          inset-inline-start: 0;
          z-index: 1000;
          inline-size: max-content;
          max-inline-size: ${maxWidth};
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-bg-panel) 96%, transparent), var(--mvx-bg-inset)),
            var(--mvx-bg-inset);
          color: var(--mvx-fg);
          box-shadow: var(--mvx-shadow-soft);
          font-size: 12px;
          font-weight: 650;
          line-height: 1.35;
          opacity: 0;
          padding: 8px 10px;
          pointer-events: none;
          transform: translate3d(var(--mvx-tip-x, -9999px), var(--mvx-tip-y, -9999px), 0) scale(0.98);
          transform-origin: var(--mvx-tip-origin, center bottom);
          transition:
            opacity var(--mvx-duration-fast),
            transform var(--mvx-duration-fast);
          white-space: normal;
          --mvx-tooltip-arrow-offset: ${arrowOffsetPx}px;
          --mvx-tooltip-arrow-size: 10px;
        }

        .tip::after {
          position: absolute;
          inline-size: var(--mvx-tooltip-arrow-size);
          block-size: var(--mvx-tooltip-arrow-size);
          border: inherit;
          background: var(--mvx-bg-inset);
          content: "";
          transform: rotate(45deg);
          pointer-events: none;
        }

        .tip[data-placement="top"]::after {
          inset-inline-start: calc(50% - calc(var(--mvx-tooltip-arrow-size) / 2));
          inset-block-end: calc(-1 * var(--mvx-tooltip-arrow-offset));
          border-block-start: 0;
          border-inline-start: 0;
        }

        .tip[data-placement="bottom"]::after {
          inset-inline-start: calc(50% - calc(var(--mvx-tooltip-arrow-size) / 2));
          inset-block-start: calc(-1 * var(--mvx-tooltip-arrow-offset));
          border-block-end: 0;
          border-inline-end: 0;
        }

        .tip[data-placement="left"]::after {
          inset-block-start: calc(50% - calc(var(--mvx-tooltip-arrow-size) / 2));
          inset-inline-end: calc(-1 * var(--mvx-tooltip-arrow-offset));
          border-block-end: 0;
          border-inline-start: 0;
        }

        .tip[data-placement="right"]::after {
          inset-block-start: calc(50% - calc(var(--mvx-tooltip-arrow-size) / 2));
          inset-inline-start: calc(-1 * var(--mvx-tooltip-arrow-offset));
          border-block-start: 0;
          border-inline-end: 0;
        }

        .tip[data-open="true"] {
          opacity: 1;
          transform: translate3d(var(--mvx-tip-x), var(--mvx-tip-y), 0) scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .tip { transition: none; }
        }
      </style>
      <span class="trigger" part="trigger" aria-describedby="mvx-tooltip"><slot></slot></span>
      <span id="mvx-tooltip" class="tip" role="tooltip" part="tooltip" data-placement="top">${tooltipContent}</span>
    `;
    this._bindInteraction();
    queueMicrotask(() => this.updatePosition());
  }

  show() {
    this.setAttribute('open', '');
    this.updatePosition();
    this._watchViewport();
  }

  hide() {
    this.removeAttribute('open');
    this._tip()?.removeAttribute('data-open');
    this._unwatchViewport();
  }

  _bindInteraction() {
    const trigger = this._trigger();
    if (!trigger || trigger === this._boundTrigger) return;
    this._unbindInteraction();
    this._boundTrigger = trigger;
    trigger.addEventListener('pointerenter', this._onEnter);
    trigger.addEventListener('pointerleave', this._onLeave);
    trigger.addEventListener('focusin', this._onFocusIn);
    trigger.addEventListener('focusout', this._onFocusOut);
  }

  _unbindInteraction() {
    if (!this._boundTrigger) return;
    this._boundTrigger.removeEventListener('pointerenter', this._onEnter);
    this._boundTrigger.removeEventListener('pointerleave', this._onLeave);
    this._boundTrigger.removeEventListener('focusin', this._onFocusIn);
    this._boundTrigger.removeEventListener('focusout', this._onFocusOut);
    this._boundTrigger = null;
    this._unwatchViewport();
  }

  _watchViewport() {
    if (this._watchingViewport || typeof window === 'undefined') return;
    this._watchingViewport = true;
    window.addEventListener('resize', this._onViewportChange, { passive: true });
    window.addEventListener('scroll', this._onViewportChange, { passive: true, capture: true });
  }

  _unwatchViewport() {
    if (!this._watchingViewport || typeof window === 'undefined') return;
    this._watchingViewport = false;
    window.removeEventListener('resize', this._onViewportChange);
    window.removeEventListener('scroll', this._onViewportChange, true);
  }

  _trigger() {
    return this.shadowRoot?.querySelector('.trigger');
  }

  _tip() {
    return this.shadowRoot?.querySelector('.tip');
  }

  defaultPlacement() {
    const requested = (this.getAttribute('default-placement') || defaultPlacement).toLowerCase();
    return placements.includes(requested) ? requested : defaultPlacement;
  }

  requestedPlacement() {
    const placement = (this.getAttribute('placement') || '').toLowerCase();
    if (placement === 'auto') return 'auto';
    return placements.includes(placement) ? placement : this.defaultPlacement();
  }

  _offsetPx() {
    const value = Number(this.getAttribute('offset'));
    return Number.isFinite(value) ? Math.max(4, value) : 10;
  }

  updatePosition() {
    const tip = this._tip();
    const trigger = this._trigger();
    if (!tip || !trigger) return;
    const shouldOpen = this.hasAttribute('open') || trigger.matches(':hover') || this.matches(':focus-within');
    if (!shouldOpen) {
      tip.removeAttribute('data-open');
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const offset = this._offsetPx();
    const viewport = {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
    const placement = this.resolvePlacement(triggerRect, tipRect, viewport, offset);
    const position = this.positionForPlacement(placement, triggerRect, tipRect, viewport, offset);

    tip.dataset.placement = placement;
    tip.dataset.open = 'true';
    tip.style.setProperty('--mvx-tip-x', `${position.x}px`);
    tip.style.setProperty('--mvx-tip-y', `${position.y}px`);
    tip.style.setProperty('--mvx-tip-origin', position.origin);
  }

  resolvePlacement(triggerRect, tipRect, viewport, offset) {
    const requested = this.requestedPlacement();
    if (requested !== 'auto') return requested;
    const spaces = {
      top: triggerRect.top,
      right: viewport.width - triggerRect.right,
      bottom: viewport.height - triggerRect.bottom,
      left: triggerRect.left
    };
    const required = {
      top: tipRect.height + offset,
      right: tipRect.width + offset,
      bottom: tipRect.height + offset,
      left: tipRect.width + offset
    };
    const firstFit = ['top', 'bottom', 'right', 'left'].find(placement => spaces[placement] >= required[placement]);
    if (firstFit) return firstFit;
    return Object.entries(spaces).sort((a, b) => b[1] - a[1])[0]?.[0] || 'top';
  }

  positionForPlacement(placement, triggerRect, tipRect, viewport, offset) {
    let x = triggerRect.left + (triggerRect.width - tipRect.width) / 2;
    let y = triggerRect.top - tipRect.height - offset;
    let origin = 'center bottom';

    if (placement === 'bottom') {
      y = triggerRect.bottom + offset;
      origin = 'center top';
    } else if (placement === 'left') {
      x = triggerRect.left - tipRect.width - offset;
      y = triggerRect.top + (triggerRect.height - tipRect.height) / 2;
      origin = 'right center';
    } else if (placement === 'right') {
      x = triggerRect.right + offset;
      y = triggerRect.top + (triggerRect.height - tipRect.height) / 2;
      origin = 'left center';
    }

    const margin = 8;
    x = Math.max(margin, Math.min(x, viewport.width - tipRect.width - margin));
    y = Math.max(margin, Math.min(y, viewport.height - tipRect.height - margin));
    return { x, y, origin };
  }
}
