import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxAvatar extends MvxElement {
  static observedAttributes = ['src', 'initials', 'label', 'size'];

  render() {
    const src = this.getAttribute('src');
    const initials = this.getAttribute('initials') || 'MX';
    const label = this.getAttribute('label') || initials;
    const size = Number(this.getAttribute('size') || 38);
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        .avatar {
          display: grid;
          place-items: center;
          inline-size: ${size}px;
          block-size: ${size}px;
          overflow: hidden;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: color-mix(in srgb, var(--mvx-accent) 20%, var(--mvx-bg-inset));
          color: var(--mvx-accent-2);
          font-weight: 800;
        }
        img {
          inline-size: 100%;
          block-size: 100%;
          object-fit: cover;
        }
      </style>
      <span class="avatar" part="avatar" role="img" aria-label="${htmlEscape(label)}">
        ${src ? `<img src="${htmlEscape(src)}" alt="${htmlEscape(label)}" />` : htmlEscape(initials)}
      </span>
    `;
  }
}
