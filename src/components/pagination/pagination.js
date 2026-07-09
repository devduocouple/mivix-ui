import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxPagination extends MvxElement {
  static observedAttributes = ['page', 'pages'];

  get page() {
    return Number(this.getAttribute('page') || 1);
  }

  get pages() {
    return Math.max(1, Number(this.getAttribute('pages') || 1));
  }

  setPage(page) {
    const next = Math.max(1, Math.min(page, this.pages));
    this.setAttribute('page', String(next));
    this.emit('mvx-change', { page: next });
  }

  render() {
    const page = this.page;
    const paginationLabel = this.t('pagination', 'Pagination');
    const previous = this.t('previous', 'Prev');
    const previousPage = this.t('previousPage', 'Previous page');
    const next = this.t('next', 'Next');
    const nextPage = this.t('nextPage', 'Next page');
    const pageLabel = this.t('page', 'Page');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        :host([component-style="clean"]) nav {
          gap: 2px;
        }
        button {
          min-inline-size: 34px;
          min-block-size: 34px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-muted);
          cursor: pointer;
        }
        :host([component-style="clean"]) button {
          border-color: transparent;
          border-radius: var(--mvx-radius-xs);
          background: transparent;
          box-shadow: none;
        }
        button[aria-current="page"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 64%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
        }
        button:disabled {
          cursor: not-allowed;
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          filter: saturate(0.88);
        }
        :host([component-style="clean"]) button:hover:not(:disabled) {
          background: color-mix(in srgb, var(--mvx-accent) 8%, transparent);
          color: var(--mvx-fg);
        }
        :host([component-style="clean"]) button:disabled {
          border-color: transparent;
          background: transparent;
          box-shadow: none;
        }
        :host([component-style="clean"]) button[aria-current="page"] {
          border-color: transparent;
          background: transparent;
          color: var(--mvx-accent-2);
          font-weight: 800;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 7px;
        }
        button:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
      </style>
      <nav aria-label="${htmlEscape(paginationLabel)}" part="pagination">
        <button data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="${htmlEscape(previousPage)}">${htmlEscape(previous)}</button>
        ${Array.from({ length: this.pages }, (_, index) => index + 1).map(number => `
          <button data-page="${number}" aria-label="${htmlEscape(`${pageLabel} ${number}`)}" ${number === page ? 'aria-current="page"' : ''}>${number}</button>
        `).join('')}
        <button data-page="${page + 1}" ${page === this.pages ? 'disabled' : ''} aria-label="${htmlEscape(nextPage)}">${htmlEscape(next)}</button>
      </nav>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => this.setPage(Number(button.dataset.page)));
    });
  }
}
