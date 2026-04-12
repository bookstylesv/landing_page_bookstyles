# BookStyles — Landing Page

Sitio web estático de marketing para BookStyles, sistema de gestión para barberías y salones.

## Stack

- HTML5 + CSS3 + JavaScript vanilla
- Sin dependencias ni build step — se sirve directamente
- Deploy en Vercel / GitHub Pages

## Estructura

```
├── index.html        → Página principal
├── style.css         → Estilos (tema naranja / negro)
├── script.js         → Carrusel, FAQ, scroll animations
└── assets/           → Imágenes y logos
```

## Desarrollo local

Abrir `index.html` directamente en el navegador, o usar un servidor local:

```bash
npx serve .
```

## Deploy en Vercel

```bash
vercel deploy --prod
```

No requiere variables de entorno.

## Personalización

- Colores principales en `style.css` → variables `:root`
- Logo: reemplazar `assets/logo_bookstyles.png` y `assets/logo_bookstyles_transparent.png`
- URL de login: buscar `barber-pro-swart.vercel.app` en `index.html`
- Email de contacto: buscar `info@bookstyles.com` en `index.html`
