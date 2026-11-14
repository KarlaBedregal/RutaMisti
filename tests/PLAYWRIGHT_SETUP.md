# Playwright Setup

## Chromium instalado
El browser fue descargado en: `~/.cache/ms-playwright/`

## Dependencias del sistema (Arch Linux)
Si los tests E2E fallan con "missing shared library", instalar:

```bash
sudo pacman -S nss nspr atk at-spi2-atk cups libdrm libxkbcommon libxcomposite libxdamage libxfixes libxrandr mesa pango cairo alsa-lib libxcb libx11 libxext libxtst
```

O usar el modo headless que no requiere display:
```bash
PLAYWRIGHT_SKIP_BROWSER_GC=1 pnpm test:e2e
```

## Correr tests E2E
Los tests requieren que la app esté compilada:
```bash
DATABASE_URL="file:./prisma/dev.db" AUTH_SECRET="tu-secreto" pnpm build
pnpm test:e2e
```

O contra el servidor de dev (más lento):
```bash
# Terminal 1
DATABASE_URL="file:./prisma/dev.db" AUTH_SECRET="tu-secreto" pnpm dev

# Terminal 2
BASE_URL=http://localhost:3001 pnpm test:e2e
```

## Tests unitarios (no requieren browser)
```bash
pnpm test
```
