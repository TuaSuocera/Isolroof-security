import { NextResponse } from "next/server";
import { generatePos4PdfBytes } from "@/server/pos4/generate";
import { loadPos4FieldMap } from "@/server/pos4/config";
import { z } from "zod";

export const runtime = "nodejs";

const generateRequestSchema = z.object({
  variableData: z.record(z.string(), z.string().max(10_000)).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const fieldMap = await loadPos4FieldMap();
  const allowedKeys = new Set(fieldMap.fields.map((f) => f.key));
  const variableData = parsed.data.variableData ?? {};
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(variableData)) {
    if (!allowedKeys.has(k)) continue;
    filtered[k] = v;
  }

  const pdfBytes = await generatePos4PdfBytes(filtered);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"POS4-compilato.pdf\"",
      "Cache-Control": "no-store",
    },
  });
}

