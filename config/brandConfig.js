'use strict';

export const BRAND = {
  name: 'Sweet Trip Club',
  shortName: 'Sweet Trip',
  tagline: 'Un viaje en cada bocado',
  description: 'Dulces artesanales premium',

  logo: 'imagenes_productos_logo/2.png',
  logoSmall: 'imagenes_productos_logo/1.png',
  favicon: 'imagenes_productos_logo/1.png',

  color: '#5C3A21',
  colorDark: '#3D2516',

  currency: 'ARS',
  currencySymbol: '$',

  defaultTicketFooter: 'Gracias por tu visita. ¡Volvé pronto!'
};

export function getBrandLogo(className = '') {
  return `<img src="${BRAND.logo}" alt="${BRAND.name}" class="brand-logo ${className}" loading="eager">`;
}

export function getBrandLogoSvg(size = 36) {
  return `<img src="${BRAND.logoSmall}" alt="${BRAND.name}" width="${size}" height="${size}" class="brand-logo-sm" loading="eager">`;
}
