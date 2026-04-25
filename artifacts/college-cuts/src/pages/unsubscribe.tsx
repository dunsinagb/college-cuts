import { useEffect, useState } from "react";

export default function Unsubscribe() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "missing">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
      setStatus("missing");
      return;
    }

    const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
    fetch(`${BASE}/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then((r) => {
        if (r.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "48px 40px", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
        <div style={{ color: "#1e3a5f", fontWeight: 800, fontSize: 22, marginBottom: 12 }}>CollegeCuts</div>

        {status === "loading" && (
          <p style={{ color: "#6b7280", fontSize: 15 }}>Unsubscribing...</p>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <h2 style={{ color: "#1e3a5f", margin: "0 0 10px", fontSize: 20 }}>You've been unsubscribed</h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              You won't receive any more emails from CollegeCuts. You can resubscribe at any time.
            </p>
            <a href="/" style={{ color: "#d97706", fontSize: 14, textDecoration: "underline" }}>Back to CollegeCuts</a>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ color: "#1e3a5f", margin: "0 0 10px", fontSize: 20 }}>Something went wrong</h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              We couldn't process your unsubscribe request. Please try again or reply to any CollegeCuts email to be removed.
            </p>
            <a href="/" style={{ color: "#d97706", fontSize: 14, textDecoration: "underline" }}>Back to CollegeCuts</a>
          </>
        )}

        {status === "missing" && (
          <>
            <h2 style={{ color: "#1e3a5f", margin: "0 0 10px", fontSize: 20 }}>Invalid link</h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              This unsubscribe link is missing the email address. Please use the link from your email.
            </p>
            <a href="/" style={{ color: "#d97706", fontSize: 14, textDecoration: "underline" }}>Back to CollegeCuts</a>
          </>
        )}
      </div>
    </div>
  );
}
