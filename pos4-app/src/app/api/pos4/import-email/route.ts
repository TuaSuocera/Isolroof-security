import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { parsePos4EmailText } from "@/server/pos4/emailParser";
import { loadPos4FieldMap } from "@/server/pos4/config";

export const runtime = "nodejs";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export async function POST() {
  try {
    const host = requiredEnv("IMAP_HOST");
    const port = Number(process.env.IMAP_PORT ?? "993");
    const secure = (process.env.IMAP_SECURE ?? "true") === "true";
    const user = requiredEnv("IMAP_USER");
    const pass = requiredEnv("IMAP_PASS");
    const mailbox = process.env.IMAP_MAILBOX ?? "INBOX";

    const client = new ImapFlow({
      host,
      port,
      secure,
      auth: { user, pass },
      logger: false,
    });

    await client.connect();
    try {
      const fieldMap = await loadPos4FieldMap();
      const allowedKeys = new Set(fieldMap.fields.map((f) => f.key));

      const lock = await client.getMailboxLock(mailbox);
      try {
        // Fetch newest message in mailbox
        const message = await client.fetchOne("*", { source: true, envelope: true });
        if (!message?.source) {
          return NextResponse.json(
            { error: "Nessun messaggio trovato nella casella" },
            { status: 404 },
          );
        }

        const parsed = await simpleParser(message.source);
        const text = parsed.text ?? parsed.html ?? "";
        const parsedPos = parsePos4EmailText(text);

        const filtered: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsedPos.variableData)) {
          if (!allowedKeys.has(k)) continue;
          filtered[k] = v;
        }

        return NextResponse.json({
          subject: parsed.subject,
          from: parsed.from?.text,
          date: parsed.date?.toISOString(),
          variableData: filtered,
        });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => undefined);
    }
  } catch (err) {
    return NextResponse.json(
      { error: String((err as Error)?.message ?? err) },
      { status: 400 },
    );
  }
}

