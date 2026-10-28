"use client";

import { useState, type FormEvent } from "react";
import styles from "./login.module.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || status === "loading") return;
    setStatus("loading");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (!response?.ok) {
      setStatus("error");
      return;
    }
    window.location.reload();
  }

  return (
    <main className={styles.gate}>
      <a className={styles.back} href="/">← Back to portfolio</a>
      <div className={styles.panel}>
        <span className="eyebrow">PRIVATE STUDIO</span>
        <h1>Studio access</h1>
        <p>Enter the owner password to manage artwork and site details.</p>
        <form className={styles.form} onSubmit={submit}>
          <label htmlFor="admin-password">Password</label>
          <div className={styles.row}>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Enter studio password"
              autoFocus
              required
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Checking…" : "Enter studio"}
            </button>
          </div>
          <p className={styles.status} role="status" aria-live="polite">
            {status === "error" ? "That password is not correct." : ""}
          </p>
        </form>
      </div>
    </main>
  );
}
