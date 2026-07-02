import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'mivix-ui';
import 'mivix-ui/styles';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <mvx-button variant="primary">Deploy</mvx-button>
    <mvx-input label="Project" placeholder="mivix-ui"></mvx-input>
    <mvx-alert tone="success" title="Ready">Web Components work directly in Angular.</mvx-alert>
  `
})
export class AppComponent {}
