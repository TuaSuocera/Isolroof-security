import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { loadPos4FieldMap } from "./config";
import { drawTextBlock } from "./text";

export type Pos4VariableData = Record<string, string | undefined | null>;

export async function generatePos4PdfBytes(variableData: Pos4VariableData) {
  const map = await loadPos4FieldMap();

  const templatePath = path.resolve(process.cwd(), map.template.relativePath);
  const templateBytes = await fs.readFile(templatePath);

  const pdf = await PDFDocument.load(templateBytes, { updateMetadata: false });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();

  for (const field of map.fields) {
    const valueRaw = variableData[field.key];
    const value =
      typeof valueRaw === "string"
        ? valueRaw
        : valueRaw == null
          ? ""
          : String(valueRaw);

    if (!value) continue;
    const page = pages[field.page];
    if (!page) continue;

    drawTextBlock({
      page,
      text: value,
      x: field.x,
      y: field.y,
      font,
      fontSize: field.fontSize ?? map.defaults.fontSize,
      colorRgb: map.defaults.colorRgb,
      maxWidth: field.maxWidth,
      lineHeight: field.lineHeight ?? map.defaults.lineHeight,
      maxLines: field.maxLines,
    });
  }

  return await pdf.save({ useObjectStreams: true });
}

