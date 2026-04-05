# /scripts — Automação e Utilitários

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `assets/` | Geração de ícones PWA, screenshots e assets da Play Store |
| `setup/` | Scripts de configuração inicial (reservado) |

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `assets/generate-icons.js` | `node scripts/assets/generate-icons.js` | Gera ícones PWA (192, 512, maskable) |
| `assets/generate-store-assets.ts` | `npx tsx scripts/assets/generate-store-assets.ts` | Gera feature graphic da Play Store |
| `assets/take-screenshots.ts` | `npx tsx scripts/assets/take-screenshots.ts` | Captura screenshots automatizadas |
