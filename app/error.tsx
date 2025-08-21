"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: 24 }}>
          <h2>Une erreur est survenue.</h2>
          <p style={{ color: "#64748b" }}>{error.message}</p>
          <button onClick={() => reset()} style={{ marginTop: 12 }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}


