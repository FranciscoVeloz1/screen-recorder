# Grabadora de Pantalla

Aplicación web para grabar la pantalla desde el navegador. Captura video (y audio opcional del sistema y micrófono), muestra una vista previa en vivo y permite descargar las grabaciones de la sesión.

## Requisitos

- Node.js 20+
- Navegador moderno con soporte para `getDisplayMedia` y `MediaRecorder`
- **HTTPS o localhost** — los permisos de captura de pantalla requieren un contexto seguro

## Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173/screen-recorder/`).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit + component tests) |

## Despliegue

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) despliega automáticamente a GitHub Pages en cada push a `main`.

**Configuración única en GitHub:** Settings → Pages → Source: **GitHub Actions**.

URL en vivo: [https://franciscoveloz1.github.io/screen-recorder/](https://franciscoveloz1.github.io/screen-recorder/)

## Stack

- React 19 + TypeScript
- Vite 8
- CSS Modules

## Funcionalidades

- Captura de pantalla con `getDisplayMedia`
- Audio del sistema y micrófono opcionales (controles independientes)
- Selector de FPS (30, 60, máximo del navegador) y resolución (nativa, 1080p, 1440p)
- Bitrate de video escalado según FPS para mantener fluidez
- Formatos detectados en runtime (WebM VP9/VP8, MP4)
- Vista previa en vivo y temporizador
- Lista de grabaciones de la sesión con descarga y eliminación
