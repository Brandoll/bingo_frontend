# BsPlay Frontend

Aplicación React/Vite de Bingo de 90 bolas para administración, jugadores móviles y pantalla pública sincronizada en tiempo real.

## Desarrollo

Requiere Node.js 24 y pnpm 11.

```bash
pnpm install
pnpm test
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`. Durante el desarrollo, Vite dirige `/api` y `/ws` al backend local.

## Variables

Copia `.env.example` para desarrollo. En producción usa:

```env
VITE_API_URL=https://api.play.bsdev.me/api/v1
VITE_WS_URL=wss://api.play.bsdev.me/ws
```

## Producción en Vercel

El repositorio incluye `vercel.json` con la compilación Vite y el fallback SPA para `/tv`, `/room/:code` y `/room/:code/host`.

- Dominio: `https://play.bsdev.me`
- Build Command: `pnpm build`
- Output Directory: `dist`

## Verificación

```bash
pnpm test
pnpm build
```
