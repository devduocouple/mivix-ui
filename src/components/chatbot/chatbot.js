import { baseStyles, MvxElement, htmlEscape, parseData } from '../../core.js';

const defaultModels = [
  { provider: 'OpenAI', value: 'gpt-4.1', label: 'GPT-4.1' },
  { provider: 'OpenAI', value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { provider: 'Anthropic', value: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet' },
  { provider: 'Google', value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { provider: 'Local', value: 'local-agent', label: 'Local agent' }
];

const defaultMessages = [
  {
    role: 'assistant',
    content: 'Choose a model, connect your app endpoint, and send a prompt. I emit events or call your gateway API.'
  }
];

const defaultSuggestions = [
  'Summarize selected component APIs',
  'Generate an accessible form',
  'Create a workflow dashboard'
];

export class MvxChatbot extends MvxElement {
  static observedAttributes = [
    'name',
    'status',
    'provider',
    'model',
    'models',
    'messages',
    'suggestions',
    'endpoint',
    'method',
    'headers',
    'stream',
    'loading',
    'temperature',
    'max-tokens',
    'placeholder'
  ];

  get models() {
    return this._models ?? parseData(this.getAttribute('models'), defaultModels);
  }

  set models(value) {
    this._models = parseData(value, defaultModels);
    if (this.isConnected) this.render();
  }

  get messages() {
    return this._messages ?? parseData(this.getAttribute('messages'), defaultMessages);
  }

  set messages(value) {
    this._messages = parseData(value, defaultMessages);
    if (this.isConnected) this.render();
  }

  get suggestions() {
    return this._suggestions ?? parseData(this.getAttribute('suggestions'), defaultSuggestions);
  }

  set suggestions(value) {
    this._suggestions = parseData(value, defaultSuggestions);
    if (this.isConnected) this.render();
  }

  get headers() {
    return this._headers ?? parseData(this.getAttribute('headers'), {});
  }

  set headers(value) {
    this._headers = value && typeof value === 'object' && !Array.isArray(value) ? value : parseData(value, {});
  }

  addMessage(message) {
    this._messages = [...this.messages, message];
    this.setAttribute('messages', JSON.stringify(this._messages));
  }

  clear() {
    this._messages = [];
    this.setAttribute('messages', '[]');
    this.emit('mvx-clear', {});
  }

  render() {
    const name = this.getAttribute('name') || 'Mivix Chatbot';
    const status = this.getAttribute('status') || 'Ready';
    const selectedProvider = this.getAttribute('provider') || this.models[0]?.provider || 'OpenAI';
    const selectedModel = this.getAttribute('model') || this.models.find(item => item.provider === selectedProvider)?.value || this.models[0]?.value || '';
    const endpoint = this.getAttribute('endpoint') || '';
    const method = this.getAttribute('method') || 'POST';
    const temperature = this.getAttribute('temperature') || '0.4';
    const maxTokens = this.getAttribute('max-tokens') || '1200';
    const placeholder = this.getAttribute('placeholder') || this.t('chatPlaceholder', 'Ask the agent to build, inspect, or explain UI...');
    const sendLabel = this.t('send', 'Send');
    const clearLabel = this.t('clear', 'Clear');
    const modelLabel = this.t('model', 'Model');
    const providerLabel = this.t('provider', 'Provider');
    const statusText = this.hasAttribute('loading') ? this.t('thinking', 'Thinking') : status;
    const providerOptions = [...new Set(this.models.map(item => item.provider || 'Custom'))];
    const visibleModels = this.models.filter(item => (item.provider || 'Custom') === selectedProvider);
    const connectionText = endpoint ? this.t('connected', 'Gateway connected') : this.t('eventMode', 'Event mode');

    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .chat {
          display: grid;
          grid-template-rows: auto auto minmax(220px, 1fr) auto;
          overflow: hidden;
          min-block-size: 560px;
          background: var(--mvx-bg-panel);
        }
        header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-block-end: 1px solid var(--mvx-border);
        }
        .mark {
          display: grid;
          place-items: center;
          inline-size: 44px;
          block-size: 44px;
          border-radius: var(--mvx-radius-sm);
          background:
            radial-gradient(circle at 35% 20%, color-mix(in srgb, var(--mvx-accent-2) 42%, transparent), transparent 50%),
            color-mix(in srgb, var(--mvx-accent) 24%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          font-weight: 900;
        }
        h3, p { margin: 0; }
        h3 { font-size: 15px; }
        p { color: var(--mvx-muted); font-size: 13px; }
        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--mvx-muted);
          font-size: 12px;
        }
        .dot {
          inline-size: 8px;
          block-size: 8px;
          border-radius: 50%;
          background: ${endpoint ? 'var(--mvx-success)' : 'var(--mvx-warning)'};
          box-shadow: 0 0 0 4px color-mix(in srgb, ${endpoint ? 'var(--mvx-success)' : 'var(--mvx-warning)'} 16%, transparent);
        }
        .toolbar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          padding: 12px 14px;
          border-block-end: 1px solid var(--mvx-border);
          background: color-mix(in srgb, var(--mvx-bg-inset) 52%, transparent);
        }
        label {
          display: grid;
          gap: 6px;
          min-inline-size: 0;
          color: var(--mvx-muted);
          font-size: 12px;
        }
        select, input, textarea {
          min-inline-size: 0;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          outline: none;
          padding: 9px 10px;
        }
        select:focus, input:focus, textarea:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        .messages {
          display: grid;
          align-content: start;
          gap: 12px;
          overflow: auto;
          padding: 14px;
        }
        .message {
          display: grid;
          gap: 6px;
          max-inline-size: min(78%, 680px);
          padding: 11px 12px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: var(--mvx-bg-inset);
          animation: rise 180ms ease-out;
        }
        .message.user {
          justify-self: end;
          border-color: color-mix(in srgb, var(--mvx-accent) 42%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 16%, var(--mvx-bg-inset));
        }
        .message.system {
          max-inline-size: 100%;
          border-style: dashed;
        }
        .role {
          color: var(--mvx-subtle);
          font-size: 11px;
          text-transform: uppercase;
        }
        .content {
          color: var(--mvx-fg);
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .suggestions button, .header-actions button, .composer button {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        .suggestions button {
          padding: 7px 9px;
          font-size: 12px;
        }
        .suggestions button:hover, .header-actions button:hover, .composer button:hover {
          transform: translateY(-1px);
          border-color: var(--mvx-accent);
        }
        .composer {
          display: grid;
          gap: 10px;
          padding: 12px;
          border-block-start: 1px solid var(--mvx-border);
          background: var(--mvx-bg-panel);
        }
        .composer-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: end;
        }
        textarea {
          min-block-size: 72px;
          resize: vertical;
        }
        .composer button[type="submit"] {
          align-self: stretch;
          min-inline-size: 82px;
          border-color: color-mix(in srgb, var(--mvx-accent) 72%, white);
          background: var(--mvx-accent);
          color: white;
          font-weight: 800;
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
          color: var(--mvx-muted);
          font-size: 12px;
        }
        .header-actions {
          display: flex;
          gap: 8px;
        }
        .header-actions button {
          inline-size: 34px;
          block-size: 34px;
        }
        ::slotted([slot="attachments"]) {
          display: block;
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 760px) {
          .toolbar { grid-template-columns: 1fr 1fr; }
          header { grid-template-columns: auto 1fr; }
          .header-actions { grid-column: 1 / -1; }
          .message { max-inline-size: 100%; }
        }
      </style>
      <section class="chat edge" part="chat" aria-label="${htmlEscape(name)}">
        <header part="header">
          <div class="mark" aria-hidden="true">AI</div>
          <div>
            <h3>${htmlEscape(name)}</h3>
            <p class="status"><span class="dot" aria-hidden="true"></span>${htmlEscape(statusText)} · ${htmlEscape(connectionText)}</p>
          </div>
          <div class="header-actions">
            <button type="button" data-action="export" aria-label="${htmlEscape(this.t('export', 'Export chat'))}">⇩</button>
            <button type="button" data-action="clear" aria-label="${htmlEscape(clearLabel)}">×</button>
          </div>
        </header>
        <div class="toolbar" part="toolbar">
          <label>
            <span>${htmlEscape(providerLabel)}</span>
            <select data-field="provider">
              ${providerOptions.map(provider => `<option value="${htmlEscape(provider)}" ${provider === selectedProvider ? 'selected' : ''}>${htmlEscape(provider)}</option>`).join('')}
            </select>
          </label>
          <label>
            <span>${htmlEscape(modelLabel)}</span>
            <select data-field="model">
              ${visibleModels.map(model => `<option value="${htmlEscape(model.value)}" ${model.value === selectedModel ? 'selected' : ''}>${htmlEscape(model.label || model.value)}</option>`).join('')}
            </select>
          </label>
          <label>
            <span>${htmlEscape(this.t('temperature', 'Temperature'))}</span>
            <input data-field="temperature" type="number" min="0" max="2" step="0.1" value="${htmlEscape(temperature)}" />
          </label>
          <label>
            <span>${htmlEscape(this.t('maxTokens', 'Max tokens'))}</span>
            <input data-field="max-tokens" type="number" min="1" step="1" value="${htmlEscape(maxTokens)}" />
          </label>
        </div>
        <div class="messages" part="messages" aria-live="polite">
          ${this.messages.map(message => `
            <article class="message ${htmlEscape(message.role || 'assistant')}" part="message">
              <span class="role">${htmlEscape(message.name || message.role || 'assistant')}</span>
              <div class="content">${htmlEscape(message.content || '')}</div>
            </article>
          `).join('')}
        </div>
        <form class="composer" part="composer">
          <div class="suggestions" aria-label="${htmlEscape(this.t('suggestions', 'Suggestions'))}">
            ${this.suggestions.map(item => `<button type="button" data-suggestion="${htmlEscape(item)}">${htmlEscape(item)}</button>`).join('')}
          </div>
          <slot name="attachments"></slot>
          <div class="composer-row">
            <label>
              <span class="sr-only">${htmlEscape(placeholder)}</span>
              <textarea placeholder="${htmlEscape(placeholder)}" aria-label="${htmlEscape(placeholder)}"></textarea>
            </label>
            <button type="submit" ${this.hasAttribute('loading') ? 'disabled' : ''}>${htmlEscape(sendLabel)}</button>
          </div>
          <div class="meta">
            <span>${htmlEscape(method)} ${endpoint ? htmlEscape(endpoint) : 'mvx-submit event'}</span>
            <span>${htmlEscape(selectedModel)}</span>
          </div>
        </form>
      </section>
    `;

    this.shadowRoot.querySelector('[data-field="provider"]').addEventListener('change', event => {
      const provider = event.target.value;
      const model = this.models.find(item => (item.provider || 'Custom') === provider)?.value || '';
      this.setAttribute('provider', provider);
      if (model) this.setAttribute('model', model);
      this.emit('mvx-model-change', { provider, model });
    });

    this.shadowRoot.querySelector('[data-field="model"]').addEventListener('change', event => {
      this.setAttribute('model', event.target.value);
      this.emit('mvx-model-change', { provider: this.getAttribute('provider'), model: event.target.value });
    });

    this.shadowRoot.querySelectorAll('[data-field="temperature"], [data-field="max-tokens"]').forEach(input => {
      input.addEventListener('change', event => {
        this.setAttribute(event.target.dataset.field, event.target.value);
      });
    });

    this.shadowRoot.querySelectorAll('[data-suggestion]').forEach(button => {
      button.addEventListener('click', () => {
        const textarea = this.shadowRoot.querySelector('textarea');
        textarea.value = button.dataset.suggestion;
        textarea.focus();
        this.emit('mvx-suggestion', { value: button.dataset.suggestion });
      });
    });

    this.shadowRoot.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    this.shadowRoot.querySelector('[data-action="export"]').addEventListener('click', () => {
      this.emit('mvx-export', { messages: this.messages });
    });
    this.shadowRoot.querySelector('form').addEventListener('submit', event => this.handleSubmit(event));
    this.shadowRoot.querySelectorAll('button').forEach(button => this.wirePointerMotion(button));
  }

  async handleSubmit(event) {
    event.preventDefault();
    const input = this.shadowRoot.querySelector('textarea');
    const prompt = input.value.trim();
    if (!prompt) return;

    const provider = this.getAttribute('provider') || this.models[0]?.provider || 'OpenAI';
    const model = this.getAttribute('model') || this.models[0]?.value || '';
    const payload = {
      prompt,
      provider,
      model,
      temperature: Number(this.getAttribute('temperature') || 0.4),
      maxTokens: Number(this.getAttribute('max-tokens') || 1200),
      messages: this.messages
    };

    this.addMessage({ role: 'user', content: prompt });
    input.value = '';
    this.emit('mvx-submit', payload);

    const endpoint = this.getAttribute('endpoint');
    if (!endpoint) return;

    this.setAttribute('loading', '');
    try {
      const response = await fetch(endpoint, {
        method: this.getAttribute('method') || 'POST',
        headers: {
          'content-type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(payload)
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : { content: await response.text() };
      if (!response.ok) throw new Error(data.error || data.message || response.statusText);
      const content = data.content || data.message || data.text || data.output || '';
      this.addMessage({ role: 'assistant', content: content || 'Done.' });
      this.emit('mvx-response', { response: data, content });
    } catch (error) {
      this.addMessage({ role: 'system', content: error.message || 'Unable to reach the configured endpoint.' });
      this.emit('mvx-error', { error: error.message || String(error) });
    } finally {
      this.removeAttribute('loading');
    }
  }
}
