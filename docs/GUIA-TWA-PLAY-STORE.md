# 📱 Guia: Publicar na Google Play via TWA (Bubblewrap)

> PDFfULL como app nativo Android usando Trusted Web Activity

## Pré-requisitos

- [ ] **Java JDK** (versão 11+) — `java --version`
- [ ] **Android SDK** (Android Studio ou command-line tools)
- [ ] **Node.js** (já instalado)
- [ ] **Google Play Console** — conta developer ($25 taxa única)
- [ ] **App funcionando** em `https://www.pdf-full.com`

## 1. Instalar Bubblewrap CLI

```bash
npm install -g @nicepkg/nicewrap  # ou
npm install -g @nicepkg/nicewrap@latest
# Alternativa oficial:
npm install -g @nicepkg/nicewrap@latest
```

**Recomendado:** usar a ferramenta oficial do Google:
```bash
npm install -g @nicepkg/nicewrap@latest
# ou usar: https://nicepkg.nicewrap.dev/nicewrap/
```

> **Na prática, usar:**
```bash
npm install -g @nicepkg/nicewrap@latest
# ou, direto do Google:
npx @nicepkg/nicewrap init --manifest=https://www.pdf-full.com/manifest.json
```

## 2. Inicializar projeto TWA

```bash
mkdir pdffull-twa && cd pdffull-twa
npx @nicepkg/nicewrap init --manifest=https://www.pdf-full.com/manifest.json
```

Configurações sugeridas:
- **Package name:** `app.vercel.pdffull.twa`
- **App name:** `PDFfULL`
- **Short name:** `PDFfULL`
- **Display mode:** `standalone`
- **Start URL:** `/`
- **Theme color:** `#2563EB`
- **Background color:** `#FFFFFF`
- **Icon:** usar o ícone 512x512 do manifest

## 3. Gerar keystore

```bash
keytool -genkeypair -v -keystore pdffull.keystore -alias pdffull -keyalg RSA -keysize 2048 -validity 10000
```

**Anotar:** alias, senha do keystore, senha da chave

## 4. Obter fingerprint SHA-256

```bash
keytool -list -v -keystore pdffull.keystore -alias pdffull | grep SHA256
```

**Copiar o fingerprint** e atualizar:
- `src/app/.well-known/assetlinks.json/route.ts` — substituir o placeholder pelo fingerprint real

## 5. Build do AAB

```bash
npx @nicepkg/nicewrap build
```

Resultado: `app-release-bundle.aab`

## 6. Upload para Google Play Console

1. Ir em [play.google.com/console](https://play.google.com/console)
2. Criar novo aplicativo → "PDFfULL"
3. **Ficha da loja:**
   - Título: PDFfULL — Conversor de PDF
   - Descrição curta: Tire uma foto, converta em PDF. 1 clique.
   - Descrição longa: (ver abaixo)
   - Ícone: 512x512 (usar mesmo do PWA)
   - Feature graphic: 1024x500
   - Screenshots: mínimo 2 (phone), ideal 2 (tablet)
4. **Produção → Criar nova versão** → Upload do `.aab`
5. Enviar para revisão

### Descrição longa sugerida

```
PDFfULL converte fotos em PDF otimizado direto do celular, em um clique.

✅ Tire uma foto ou carregue da galeria
✅ PDF gerado instantaneamente no dispositivo
✅ Múltiplas fotos em um único PDF
✅ Sem enviar para servidores — privacidade total
✅ 5 conversões grátis por mês
✅ Plano Pro ilimitado por R$ 9,90/mês

Ideal para digitalizar documentos, recibos, notas, contratos e muito mais.
Funciona offline. Sem instalar aplicativos pesados.
```

## 7. Verificar Digital Asset Links

Após deploy em produção e upload na Play Store:

```
https://www.pdf-full.com/.well-known/assetlinks.json
```

Testar com:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://www.pdf-full.com&relation=delegate_permission/common.handle_all_urls
```

## Notas

- O TWA abre `www.pdf-full.com` em Chrome sem barra de endereço
- Não precisa de código nativo — é um wrapper do PWA
- Atualização automática: qualquer mudança no site/PWA reflete no app
- Se o `assetlinks.json` não bater com o fingerprint, o Chrome mostrará a barra de URL
