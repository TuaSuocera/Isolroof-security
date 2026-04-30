 "use client";

import React from "react";
import styles from "./page.module.css";

export default function Home() {
  return <Pos4Page />;
}

type Pos4Config = {
  isolroof: Record<string, string>;
  fields: { key: string; label: string }[];
};

function groupBy<T extends { key: string; label: string }>(items: T[]) {
  const out: Record<string, T> = {};
  for (const i of items) out[i.key] = i;
  return out;
}

function Pos4Page() {
  const [config, setConfig] = React.useState<Pos4Config | null>(null);
  const [variableData, setVariableData] = React.useState<Record<string, string>>(
    {},
  );
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/pos4/config", { cache: "no-store" });
      if (!res.ok) throw new Error("Impossibile caricare configurazione POS 4");
      const data = (await res.json()) as Pos4Config;
      if (cancelled) return;
      setConfig(data);

      // init variable fields with empty strings
      const init: Record<string, string> = {};
      for (const f of data.fields) init[f.key] = "";
      setVariableData(init);
    })().catch((err) => setMessage(String(err?.message ?? err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const fieldIndex = React.useMemo(
    () => (config ? groupBy(config.fields) : {}),
    [config],
  );

  async function onImportEmail() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pos4/import-email", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Import email fallito");

      setVariableData((prev) => ({ ...prev, ...(data?.variableData ?? {}) }));
      setMessage("Dati importati da email (bozza). Controlla e genera il PDF.");
    } finally {
      setBusy(false);
    }
  }

  async function onGeneratePdf() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pos4/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variableData }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Generazione PDF fallita");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "POS4-compilato.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("PDF generato.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.title}>ISOLROOF · POS 4</div>
            <div className={styles.subtitle}>
              Compila i dati variabili manualmente o importa da email Aruba, poi
              genera il PDF sul template.
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.button}
              type="button"
              onClick={onImportEmail}
              disabled={busy}
            >
              Importa da email
            </button>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              type="button"
              onClick={onGeneratePdf}
              disabled={busy || !config}
            >
              Genera PDF
            </button>
          </div>
        </div>

        {message ? (
          <div className={styles.subtitle} role="status">
            {message}
          </div>
        ) : null}

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}>Dati aziendali (ISOLROOF)</div>
            {!config ? (
              <div className={styles.subtitle}>Caricamento…</div>
            ) : (
              <div className={styles.kv}>
                {Object.entries(config.isolroof).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <div className={styles.kvKey}>{k}</div>
                    <div className={styles.kvValue}>{v || "—"}</div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}>Dati variabili (compilazione)</div>
            {!config ? (
              <div className={styles.subtitle}>Caricamento…</div>
            ) : (
              <form className={styles.formGrid}>
                {config.fields.map((f) => (
                  <div className={styles.field} key={f.key}>
                    <label className={styles.label} htmlFor={f.key}>
                      {f.label} <span className={styles.subtitle}>({f.key})</span>
                    </label>
                    {f.key === "notes" ? (
                      <textarea
                        id={f.key}
                        className={styles.textarea}
                        value={variableData[f.key] ?? ""}
                        onChange={(e) =>
                          setVariableData((prev) => ({
                            ...prev,
                            [f.key]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <input
                        id={f.key}
                        className={styles.input}
                        value={variableData[f.key] ?? ""}
                        onChange={(e) =>
                          setVariableData((prev) => ({
                            ...prev,
                            [f.key]: e.target.value,
                          }))
                        }
                        placeholder={fieldIndex[f.key]?.label ?? f.key}
                      />
                    )}
                  </div>
                ))}
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
