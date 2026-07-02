const standardTags = new Set([
  'a',
  'article',
  'aside',
  'button',
  'div',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'input',
  'label',
  'legend',
  'li',
  'main',
  'nav',
  'ol',
  'option',
  'p',
  'section',
  'select',
  'small',
  'span',
  'strong',
  'textarea',
  'ul'
]);

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeAttribute(value = '') {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

function normalizeTag(tag = 'div') {
  const raw = String(tag || 'div').trim().toLowerCase();
  if (raw.startsWith('mvx-') || standardTags.has(raw)) return raw;
  if (/^[a-z][a-z0-9-]*$/.test(raw)) return `mvx-${raw}`;
  return 'div';
}

export function renderAttributes(attrs = {}) {
  return Object.entries(attrs)
    .filter(([name, value]) => value !== false && value != null && !/^on/i.test(name))
    .map(([name, value]) => {
      const safeName = String(name).replace(/[^a-zA-Z0-9:._-]/g, '');
      if (!safeName) return '';
      if (value === true) return safeName;
      const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
      return `${safeName}="${escapeAttribute(serialized)}"`;
    })
    .filter(Boolean)
    .join(' ');
}

export function renderComponentTag(tag, attrs = {}, children = '') {
  const safeTag = normalizeTag(tag);
  const serializedAttrs = renderAttributes(attrs);
  return `<${safeTag}${serializedAttrs ? ` ${serializedAttrs}` : ''}>${children}</${safeTag}>`;
}

export function renderJsonConfig(config) {
  if (config == null || config === false) return '';
  if (typeof config === 'string' || typeof config === 'number') return escapeHtml(config);
  if (Array.isArray(config)) return config.map(renderJsonConfig).join('');

  const tag = normalizeTag(config.tag || config.component || 'div');
  const attrs = config.attrs || config.props || {};
  const children = config.text != null
    ? escapeHtml(config.text)
    : renderJsonConfig(config.children || []);

  return renderComponentTag(tag, attrs, children);
}

export function renderJsonSchemaForm(schema, uiSchema = {}, formData = {}, attrs = {}) {
  return renderComponentTag('mvx-json-schema-form', {
    ...attrs,
    schema,
    'ui-schema': uiSchema,
    'form-data': formData
  });
}
