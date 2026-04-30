import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";

async function main() {
  const pdfPath =
    process.argv[2] ??
    path.resolve(process.cwd(), "..", "documenti", "POS 4.pdf");

  const bytes = await fs.readFile(pdfPath);
  const pdf = await PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: false,
  });

  const pageCount = pdf.getPageCount();
  console.log(JSON.stringify({ pdfPath, pageCount }, null, 2));

  try {
    const form = pdf.getForm();
    const fields = form.getFields();
    console.log(`\nAcroForm fields: ${fields.length}`);
    for (const field of fields) {
      const type = field.constructor?.name ?? "UnknownField";
      console.log(`- ${field.getName()} (${type})`);
    }
  } catch (err) {
    console.log("\nNo AcroForm (or cannot read form).");
    console.log(String(err?.message ?? err));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

