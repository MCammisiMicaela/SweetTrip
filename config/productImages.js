'use strict';

const ICON_LIST = ['sweet clasico..png', 'Sweet oreo.png', 'sweet trip club.png'];

const ALIAS_MAP = {
  sweetclasico: 'sweet clasico..png',
  sweetoreo: 'Sweet oreo.png',
  sweetnuez: 'sweet trip club.png'
};

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function getProductImagePath(productName) {
  if (!productName) {
    return null;
  }

  const slug = normalize(productName);

  for (const filename of ICON_LIST) {
    const nameWithoutExt = filename.replace(/\.\w+$/, '');
    const iconSlug = normalize(nameWithoutExt);
    if (iconSlug === slug) {
      return `imagenes_productos_logo/${filename}`;
    }
  }

  if (ALIAS_MAP[slug]) {
    return `imagenes_productos_logo/${ALIAS_MAP[slug]}`;
  }

  for (const filename of ICON_LIST) {
    const nameWithoutExt = filename.replace(/\.\w+$/, '');
    const iconSlug = normalize(nameWithoutExt);
    if (slug.includes(iconSlug)) {
      return `imagenes_productos_logo/${filename}`;
    }
  }

  return null;
}

export { getProductImagePath };
