import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";

async function main() {
  const pdfPath =
    process.argv[2] ??
    path.resolve(process.cwd(), "..", "documenti", "POS 4.pdf");

  const bytes = await fs.readFile(pdfPath);
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
  console.log(`${pdfPath}: ${pdf.getPageCount()} pages`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

