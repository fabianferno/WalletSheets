// File: src/app/email/page.tsx
"use client";
import { useState } from "react";

// Define proper types for your response data
interface SheetResponse {
  message: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sharedWith: string;
}

export default function EmailPage() {
  const [sheetName, setSheetName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SheetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/create-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetName, recipientEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      // Handle the unknown error type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <main>
        <h1>Google Sheet Creator</h1>
        <p>Create a new Google Sheet and share it with someone.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sheetName">Sheet Name:</label>
            <input
              type="text"
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipientEmail">Recipient Email:</label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create and Share Sheet"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="success">
            <h2>Success!</h2>
            <p>
              Sheet "{result.title}" has been created and shared with{" "}
              {result.sharedWith}.
            </p>
            <p>
              <a
                href={result.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Sheet
              </a>
            </p>
          </div>
        )}
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 800px;
        }

        h1 {
          margin-bottom: 1rem;
        }

        form {
          width: 100%;
          max-width: 500px;
          margin: 2rem 0;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
        }

        input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: #0055b3;
        }

        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .error {
          color: #d32f2f;
          margin-top: 1rem;
          padding: 1rem;
          background-color: #ffebee;
          border-radius: 4px;
          width: 100%;
          max-width: 500px;
        }

        .success {
          color: #2e7d32;
          margin-top: 1rem;
          padding: 1rem;
          background-color: #e8f5e9;
          border-radius: 4px;
          width: 100%;
          max-width: 500px;
          text-align: center;
        }

        .success a {
          color: #0070f3;
          text-decoration: none;
        }

        .success a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
