import fs from "node:fs/promises";
import path from "node:path";

export type IsolroofFixedData = {
  companyName: string;
  legalName: string;
  vatNumber: string;
  taxCode: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
  email: string;
  pec: string;
};

export type Pos4FieldMapDefaults = {
  font: "Helvetica";
  fontSize: number;
  colorRgb: [number, number, number];
  lineHeight: number;
};

export type Pos4FieldMapField = {
  key: string;
  label: string;
  page: number;
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
  lineHeight?: number;
  maxLines?: number;
};

export type Pos4FieldMap = {
  template: { relativePath: string };
  defaults: Pos4FieldMapDefaults;
  fields: Pos4FieldMapField[];
};

const pos4Dir = () => path.resolve(process.cwd(), "pos4");

export async function loadIsolroofFixedData(): Promise<IsolroofFixedData> {
  const p = path.join(pos4Dir(), "isolroof.json");
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as IsolroofFixedData;
}

export async function loadPos4FieldMap(): Promise<Pos4FieldMap> {
  const p = path.join(pos4Dir(), "field-map.json");
  const raw = await fs.readFile(p, "utf8");
  const map = JSON.parse(raw) as Pos4FieldMap;

  // Hardening: prevent accidental override of fixed ISOLROOF keys by mapping a field with same key.
  const fixed = await loadIsolroofFixedData();
  const fixedKeys = new Set(Object.keys(fixed));
  const overlaps = map.fields
    .map((f) => f.key)
    .filter((k, idx, arr) => arr.indexOf(k) === idx)
    .filter((k) => fixedKeys.has(k));

  if (overlaps.length > 0) {
    throw new Error(
      `Invalid field-map.json: keys overlap fixed ISOLROOF data: ${overlaps.join(", ")}`,
    );
  }

  return map;
}

