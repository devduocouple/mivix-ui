import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

const mivixMark = `
  <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="miter">
      <line x1="10" y1="8" x2="30" y2="8" stroke-width="3" />
      <line x1="10" y1="8" x2="10" y2="32" stroke-width="3" />
      <line x1="30" y1="8" x2="30" y2="32" stroke-width="3" />
    </g>
    <g opacity="0.94" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <line x1="20" y1="9" x2="20" y2="31" stroke-width="3" transform="translate(20 20) skewX(-16) translate(-20 -20)" />
    </g>
  </svg>
`;

export class MvxAssistantPanel extends MvxElement {
  static observedAttributes = ['name', 'status'];

  render() {
    const name = this.getAttribute('name') || 'Mivix';
    const status = this.getAttribute('status') || 'Ready';
    const composerPlaceholder = this.t('composerPlaceholder', 'Type your task here...');
    const sendLabel = this.t('send', 'Send');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .panel {
          display: grid;
          grid-template-rows: auto minmax(180px, 1fr) auto;
          overflow: hidden;
          border-radius: var(--mvx-radius-lg);
          min-block-size: 420px;
        }
        header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: center;
          border-block-end: 1px solid var(--mvx-border);
          padding: 14px;
        }
        .bot {
          position: relative;
          display: grid;
          place-items: center;
          inline-size: 42px;
          block-size: 42px;
          border-radius: var(--mvx-radius-sm);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 14%, transparent), transparent),
            color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-inset));
          color: var(--mvx-accent-2);
          border: 1px solid color-mix(in srgb, var(--mvx-accent) 42%, var(--mvx-border));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 10px 22px color-mix(in srgb, var(--mvx-accent) 12%, transparent);
        }
        .bot::after {
          content: "";
          position: absolute;
          inset-inline-end: 5px;
          inset-block-end: 5px;
          inline-size: 6px;
          block-size: 6px;
          border-radius: 999px;
          background: var(--mvx-success);
          box-shadow: 0 0 0 2px var(--mvx-bg-panel);
        }
        .bot svg {
          inline-size: 28px;
          block-size: 28px;
          stroke-width: 1;
        }
        h3, p { margin: 0; }
        h3 { font-size: 15px; }
        p { color: var(--mvx-muted); font-size: 13px; }
        .messages {
          display: flex;
          flex-direction: column;
          align-content: start;
          gap: 10px;
          overflow: auto;
          padding: 14px;
        }
        .composer {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          border-block-start: 1px solid var(--mvx-border);
          padding: 12px;
        }
        input {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 10px 12px;
          outline: none;
        }
        input:focus { border-color: var(--mvx-accent); box-shadow: var(--mvx-focus); }
        button {
          border: 1px solid color-mix(in srgb, var(--mvx-accent) 65%, white);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-accent);
          color: white;
          padding: 0 14px;
          cursor: pointer;
        }
        ::slotted([slot="message"]) {
          display: block;
          margin: 0;
          max-width: min(86%, 680px);
          border-radius: var(--mvx-radius-md);
          padding: 10px 12px;
          border: 1px solid var(--mvx-border);
          background: var(--mvx-bg-inset);
          color: var(--mvx-muted);
          line-height: 1.45;
          font-size: 13px;
          animation: mvx-ai-message-in 140ms ease-out;
        }
        ::slotted([slot="message"]:not([data-source])) {
          align-self: flex-start;
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          border-color: var(--mvx-border);
        }
        ::slotted([slot="message"][data-source="assistant"]) {
          align-self: flex-start;
          background: color-mix(in srgb, var(--mvx-bg-inset) 84%, var(--mvx-bg-panel));
          color: var(--mvx-muted);
          border-left: 3px solid color-mix(in srgb, var(--mvx-accent) 72%, var(--mvx-border));
        }
        ::slotted([slot="message"][data-source="user"]) {
          align-self: flex-end;
          color: var(--mvx-fg);
          background: color-mix(in srgb, var(--mvx-accent) 20%, var(--mvx-bg-panel));
          border-color: color-mix(in srgb, var(--mvx-accent) 58%, transparent);
        }
        ::slotted([slot="message"][data-source="system"]) {
          align-self: center;
          background: color-mix(in srgb, var(--mvx-fg) 8%, var(--mvx-bg-panel));
          color: var(--mvx-muted);
          border-left-style: dashed;
          border-color: color-mix(in srgb, var(--mvx-muted) 56%, transparent);
          max-width: 100%;
        }
        @keyframes mvx-ai-message-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <section class="panel edge" part="panel">
        <header>
          <div class="bot" aria-hidden="true">${mivixMark}</div>
          <div>
            <h3>${htmlEscape(name)}</h3>
            <p>${htmlEscape(status)}</p>
          </div>
          <slot name="actions"></slot>
        </header>
        <div class="messages" part="messages">
          <slot name="message"></slot>
        </div>
        <form class="composer" part="composer">
          <input placeholder="${htmlEscape(composerPlaceholder)}" aria-label="${htmlEscape(composerPlaceholder)}" />
          <button>${htmlEscape(sendLabel)}</button>
        </form>
      </section>
    `;
    this.shadowRoot.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      const input = this.shadowRoot.querySelector('input');
      if (!input.value.trim()) return;
      this.emit('mvx-submit', { value: input.value.trim() });
      input.value = '';
    });
  }
}
