// apps/web/components/auth-panel.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";

import { getMe, loginUser, type AuthUser } from "../lib/api-client";

const TOKEN_STORAGE_KEY = "legislative_bill_tracker_token";

type AuthPanelProps = {
  onAuthChange?: (token: string | null, user: AuthUser | null) => void;
};

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function AuthPanel({ onAuthChange }: AuthPanelProps) {
  const [email, setEmail] = useState("ayush@example.com");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      onAuthChange?.(null, null);
      return;
    }

    setToken(storedToken);

    getMe(storedToken)
      .then((currentUser) => {
        setUser(currentUser);
        onAuthChange?.(storedToken, currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        onAuthChange?.(null, null);
      });
  }, [onAuthChange]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const result = await loginUser({
        email,
        password,
      });

      window.localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      onAuthChange?.(result.token, result.user);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    onAuthChange?.(null, null);
  }

  if (token && user) {
    return (
      <section className="auth-panel card">
        <div>
          <p className="eyebrow">Signed in</p>
          <h3>{user.name ?? user.email}</h3>
          <p className="muted">{user.email}</p>
        </div>
        <button className="button button--ghost" type="button" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel card">
      <div>
        <p className="eyebrow">Sign in to follow bills</p>
        <h3>Demo Login</h3>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        <label>
          <span>Email</span>
          <input
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          <span>Password</span>
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="button" type="submit" disabled={isLoading}>
          <LogIn size={16} aria-hidden="true" />
          {isLoading ? "Signing in..." : "Log in"}
        </button>
      </form>
    </section>
  );
}