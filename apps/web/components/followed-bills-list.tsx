// apps/web/components/followed-bills-list.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getAiReadyBills,
  getMyFollows,
  type AiReadyBill,
  type FollowRecord,
} from "../lib/api-client";
import { AuthPanel, getStoredToken } from "./auth-panel";
import { BillCard } from "./bill-card";

export function FollowedBillsList() {
  const [token, setToken] = useState<string | null>(null);
  const [follows, setFollows] = useState<FollowRecord[]>([]);
  const [aiReadyBills, setAiReadyBills] = useState<AiReadyBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAiReadyBills = useCallback(async () => {
    const result = await getAiReadyBills();
    setAiReadyBills(result);
  }, []);

  const loadFollows = useCallback(async (activeToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMyFollows(activeToken);
      setFollows(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load followed bills.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAiReadyBills();

    const storedToken = getStoredToken();
    setToken(storedToken);

    if (storedToken) {
      void loadFollows(storedToken);
    } else {
      setIsLoading(false);
    }
  }, [loadAiReadyBills, loadFollows]);

  const handleAuthChange = useCallback(
    async (nextToken: string | null) => {
      setToken(nextToken);

      if (nextToken) {
        await loadFollows(nextToken);
      } else {
        setFollows([]);
      }
    },
    [loadFollows]
  );

  return (
    <section className="followed-page">
      <section className="card followed-page__header">
        <div>
          <p className="eyebrow">Personal tracking</p>
          <h2>My follows</h2>
          <p className="muted">Bills you follow appear here after login.</p>
        </div>
        <span className="status-pill">{follows.length} followed</span>
      </section>

      <AuthPanel onAuthChange={handleAuthChange} />

      <section className="ai-ready-section card">
        <div className="ai-ready-section__header">
          <div>
            <p className="eyebrow">AI-ready comparisons</p>
            <h2>Test AI generation</h2>
            <p className="muted">Open a comparable bill to generate an AI-assisted summary.</p>
          </div>
          <span className="status-pill">{aiReadyBills.length} ready</span>
        </div>

        {aiReadyBills.length > 0 ? (
          <div className="ai-ready-grid">
            {aiReadyBills.slice(0, 3).map((bill) => (
              <Link className="ai-ready-card" href={`/bills/${bill.id}`} key={bill.id}>
                <span className="ai-ready-card__source">{bill.source}</span>
                <h3>{bill.title}</h3>
                <p className="muted">{bill.aiReadyVersionCount} comparable versions</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">No AI-ready bills yet.</p>
        )}
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      {token && isLoading ? (
        <div className="card loading-state">
          <div className="loading-spinner" />
          <div>
            <h2>Loading followed bills</h2>
            <p className="muted">Checking your saved list.</p>
          </div>
        </div>
      ) : token && follows.length > 0 ? (
        <div className="bill-grid">
          {follows.map((follow) => (
            <BillCard key={follow.id} bill={follow.bill} />
          ))}
        </div>
      ) : token ? (
        <div className="card empty-state">
          <h2>No followed bills yet</h2>
          <p className="muted">Open a bill detail page and click Follow.</p>
        </div>
      ) : null}
    </section>
  );
}