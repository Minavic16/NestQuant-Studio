"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login-form.module.css";

/** Password form for the dashboard. */
export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setPending(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Could not sign in.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label htmlFor="admin-password" className={styles.label}>
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        className={styles.input}
        value={password}
        autoComplete="current-password"
        required
        onChange={(event) => setPassword(event.target.value)}
      />

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
