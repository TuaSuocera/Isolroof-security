import fs from "node:fs/promises";
import path from "node:path";
import { generatePos4PdfBytes } from "../src/server/pos4/generate";

async function main() {
  const outPath =
    process.argv[2] ??
    path.resolve(process.cwd(), "tmp", `POS4-compilato-${Date.now()}.pdf`);

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const pdfBytes = await generatePos4PdfBytes({
    documentDate: new Date().toISOString().slice(0, 10),
    siteName: "Cantiere demo",
    siteAddress: "Via Esempio 1, 20100 Milano (MI)",
    clientName: "Cliente demo SRL",
    clientAddress: "Via Cliente 2, 20100 Milano (MI)",
    notes:
      "Questo è un PDF di test generato automaticamente.\nServe per verificare la pipeline template+overlay.",
  });

  await fs.writeFile(outPath, pdfBytes);
  console.log(`Wrote ${pdfBytes.length} bytes to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

