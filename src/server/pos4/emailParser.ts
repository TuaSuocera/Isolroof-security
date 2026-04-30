export type ParsedPos4Email = {
  subject?: string;
  from?: string;
  date?: string;
  variableData: Record<string, string>;
};

// Minimal, rule-based parser: looks for "key: value" lines.
// Example in email body:
// siteName: Cantiere XYZ
// clientName: Rossi SRL
export function parsePos4EmailText(text: string): ParsedPos4Email {
  const variableData: Record<string, string> = {};

  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const m = /^([a-zA-Z0-9_.-]+)\s*:\s*(.+)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim();
    if (!value) continue;
    variableData[key] = value;
  }

  return { variableData };
}

