import { type PDFFont, rgb, type PDFPage } from "pdf-lib";

type WrapOpts = {
  font: PDFFont;
  fontSize: number;
  maxWidth: number;
};

export function wrapText(text: string, { font, fontSize, maxWidth }: WrapOpts) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);
      if (width <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) lines.push(current);
      current = word;
    }
    if (current) lines.push(current);
  }

  return lines;
}

type DrawTextBlockOpts = {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  font: PDFFont;
  fontSize: number;
  colorRgb?: [number, number, number];
  maxWidth?: number;
  lineHeight?: number;
  maxLines?: number;
};

export function drawTextBlock(opts: DrawTextBlockOpts) {
  const {
    page,
    text,
    x,
    y,
    font,
    fontSize,
    colorRgb: c = [0, 0, 0],
    maxWidth,
    lineHeight = fontSize * 1.2,
    maxLines,
  } = opts;

  const lines = maxWidth
    ? wrapText(text, { font, fontSize, maxWidth })
    : text.split("\n");

  const clipped = typeof maxLines === "number" ? lines.slice(0, maxLines) : lines;

  let cursorY = y;
  for (const line of clipped) {
    page.drawText(line, {
      x,
      y: cursorY,
      font,
      size: fontSize,
      color: rgb(c[0], c[1], c[2]),
    });
    cursorY -= lineHeight;
  }
}

