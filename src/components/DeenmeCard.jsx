import { useState, useEffect } from "react";

const DEENME_EDGE_URL =
  "https://uhpsopminpewirkmloiv.supabase.co/functions/v1/smart-action";
const DEENME_URL = "https://deenme.vercel.app";

export function DeenmeCard() {
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("madad_session") || "{}");
    if (!s?.code) {
      setLoading(false);
      return;
    }

    fetch(DEENME_EDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talqeeh_code: s.code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.found) {
          setPin(data.pin);
          setActive(data.is_active);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyPin = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 12, color: "#666" }}>
          Mengecek akses Deenme...
        </div>
      </div>
    );

  if (!pin) return null;

  if (!active)
    return (
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#f59e0b",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            marginBottom: 8,
          }}
        >
          — HADIAH EKSKLUSIF MEMBER
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Akses Deenme tidak aktif
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          Hubungi admin Talqeeh untuk mengaktifkan kembali.
        </div>
      </div>
    );

  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          color: "#f59e0b",
          textTransform: "uppercase",
          letterSpacing: ".1em",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 20,
            height: 1,
            background: "#f59e0b",
            display: "inline-block",
          }}
        />
        HADIAH EKSKLUSIF MEMBER
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 4,
        }}
      >
        Kamu dapat akses gratis! 🎁
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#888",
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        Sebagai member Talqeeh, kamu dapat akses eksklusif ke platform Deenme.
        Gunakan PIN di bawah untuk masuk.
      </div>

      {/* PIN display */}
      <div
        onClick={copyPin}
        style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: 10,
          padding: "12px 18px",
          fontFamily: "monospace",
          fontSize: 22,
          fontWeight: 800,
          color: "#f0a500",
          letterSpacing: 6,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          userSelect: "all",
        }}
      >
        {pin}
        <span
          style={{
            fontSize: 13,
            color: "#555",
            fontFamily: "sans-serif",
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          {copied ? "✓ Disalin!" : "📋"}
        </span>
      </div>

      {/* CTA */}
      <a
        href={DEENME_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          width: "100%",
          background: "#4ade80",
          color: "#0a1a0a",
          borderRadius: 12,
          padding: "14px 0",
          fontWeight: 800,
          fontSize: 15,
          textAlign: "center",
          textDecoration: "none",
          boxSizing: "border-box",
        }}
      >
        Masuk ke Deenme →
      </a>

      <div
        style={{
          fontSize: 11,
          color: "#444",
          marginTop: 10,
          textAlign: "center",
        }}
      >
        PIN ini unik untukmu · jangan bagikan ke orang lain
      </div>
    </div>
  );
}
