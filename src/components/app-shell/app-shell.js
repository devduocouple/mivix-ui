import { baseStyles, MvxElement } from '../../core.js';

export class MvxAppShell extends MvxElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: grid;
          block-size: 100dvh;
          min-block-size: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--mvx-accent) 16%, transparent), transparent 30%),
            linear-gradient(145deg, var(--mvx-bg), color-mix(in srgb, var(--mvx-bg) 72%, #000));
        }
        .shell {
          display: grid;
          block-size: inherit;
          min-block-size: inherit;
          min-inline-size: 0;
          overflow: hidden;
        }
        .body {
          display: grid;
          grid-template-columns: var(--mvx-rail-width, minmax(68px, 92px)) minmax(0, 1fr);
          block-size: inherit;
          min-block-size: 0;
          min-inline-size: 0;
          overflow: hidden;
        }
        nav {
          border-inline-end: 1px solid var(--mvx-border);
          background: color-mix(in srgb, var(--mvx-bg-panel) 72%, transparent);
          padding: 14px;
          min-block-size: 0;
          overflow: auto;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
        }
        main {
          min-block-size: 0;
          min-inline-size: 0;
          overflow: auto;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
        }
        .content {
          padding: 20px;
          min-block-size: 100%;
          min-inline-size: 0;
        }
        @media (max-width: 720px) {
          .body { grid-template-columns: 1fr; }
          nav {
            border-inline-end: 0;
            border-block-end: 1px solid var(--mvx-border);
            max-block-size: 42dvh;
          }
          .content { padding: 14px; }
        }
      </style>
      <div class="shell">
        <div class="body">
          <nav part="rail"><slot name="rail"></slot></nav>
          <main>
          <section class="content" part="content"><slot></slot></section>
          </main>
        </div>
      </div>
    `;
  }
}
