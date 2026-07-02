import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

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
          display: grid;
          place-items: center;
          inline-size: 42px;
          block-size: 42px;
          border-radius: var(--mvx-radius-sm);
          background: color-mix(in srgb, var(--mvx-accent) 24%, var(--mvx-bg-inset));
          color: var(--mvx-accent-2);
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        h3, p { margin: 0; }
        h3 { font-size: 15px; }
        p { color: var(--mvx-muted); font-size: 13px; }
        .messages {
          display: grid;
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
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          padding: 10px 12px;
          color: var(--mvx-muted);
        }
      </style>
      <section class="panel edge" part="panel">
        <header>
          <div class="bot" aria-hidden="true">M</div>
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
