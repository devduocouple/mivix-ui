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

export function isSafeUrl(value, options = {}) {
  const raw = String(value ?? '').trim().replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (!raw) return false;
  if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return true;
  try {
    const parsed = new URL(raw, 'https://mivix.local/');
    if (options.allowDataImages && parsed.protocol === 'data:') {
      return /^data:image\/(?:avif|gif|jpeg|jpg|png|svg\+xml|webp);/i.test(raw);
    }
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function safeUrl(value, fallback = '#', options = {}) {
  const raw = String(value ?? '').trim();
  return isSafeUrl(raw, options) ? raw : fallback;
}

function normalizeTag(tag = 'div') {
  const raw = String(tag || 'div').trim().toLowerCase();
  if (raw.startsWith('mvx-') || standardTags.has(raw)) return raw;
  if (/^[a-z][a-z0-9-]*$/.test(raw)) return `mvx-${raw}`;
  return 'div';
}

export function renderAttributes(attrs = {}) {
  return Object.entries(attrs)
    .filter(([name, value]) => value !== false && value != null && !/^on/i.test(name) && String(name).toLowerCase() !== 'style')
    .map(([name, value]) => {
      const safeName = String(name).replace(/[^a-zA-Z0-9:._-]/g, '');
      if (!safeName) return '';
      if (value === true) return safeName;
      const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
      const attrName = safeName.toLowerCase();
      const safeValue = ['href', 'src', 'poster', 'xlink:href', 'action', 'formaction'].includes(attrName)
        ? safeUrl(serialized, attrName === 'href' ? '#' : '', { allowDataImages: ['src', 'poster', 'xlink:href'].includes(attrName) })
        : serialized;
      return `${safeName}="${escapeAttribute(safeValue)}"`;
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
