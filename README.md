## POS 4 Autocompilazione (ISOLROOF)

Web app interna (Next.js) per compilare i campi variabili e generare un PDF con **stesso layout** del template in `documenti/POS 4.pdf`.

### Prerequisiti
- Node.js
- pnpm (su Windows puoi usare lo script ufficiale di pnpm)

### Setup
- Installa dipendenze:
  - `pnpm install`
- Configura IMAP Aruba (opzionale):
  - copia `.env.example` in `.env.local`
  - valorizza `IMAP_HOST`, `IMAP_USER`, `IMAP_PASS`, ecc.

### Avvio
- `pnpm dev`
- Apri `http://localhost:3000`

### Generazione PDF (smoke test)
- `pnpm exec tsx scripts/generate-sample.ts`
- Verifica pagine:
  - `pnpm exec tsx scripts/verify-pagecount.ts tmp/<file>.pdf`

### Personalizzazione campi / posizioni
- `pos4/field-map.json`: definisce le coordinate overlay (pagina, x, y, dimensioni, wrapping).
- `pos4/isolroof.json`: dati fissi ISOLROOF (mostrati in UI e non modificabili).
