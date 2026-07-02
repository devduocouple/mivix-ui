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
        button {
          min-inline-size: 34px;
          min-block-size: 34px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-muted);
          cursor: pointer;
        }
        button[aria-current="page"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 64%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
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
