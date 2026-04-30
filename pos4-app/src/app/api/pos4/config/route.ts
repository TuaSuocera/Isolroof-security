import { NextResponse } from "next/server";
import { loadIsolroofFixedData, loadPos4FieldMap } from "@/server/pos4/config";

export const runtime = "nodejs";

export async function GET() {
  const [isolroof, fieldMap] = await Promise.all([
    loadIsolroofFixedData(),
    loadPos4FieldMap(),
  ]);

  return NextResponse.json({
    isolroof,
    fields: fieldMap.fields.map((f) => ({ key: f.key, label: f.label })),
  });
}

