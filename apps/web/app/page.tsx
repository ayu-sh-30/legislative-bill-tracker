import Link from "next/link";
import { Search, Sparkles, TrendingUp } from "lucide-react";

import { AuthPanel } from "../components/auth-panel";
import { BillCard } from "../components/bill-card";
import { getAiReadyBills, getBills } from "../lib/api-client";

export default async function HomePage() {
  const [bills, aiReadyBills] = await Promise.all([
    getBills(),
    getAiReadyBills(),
  ]);

  const passedCount = bills.filter((bill) =>
    bill.status?.toLowerCase().includes("passed")
  ).length;
  const houses = new Set(bills.map((bill) => bill.house).filter(Boolean));

  return (
    <section className="home-page">
      <div className="dashboard-hero">
        <div className="dashboard-hero__content">
          <p className="eyebrow">Legislative intelligence</p>
          <h2>Track bills from introduction to passage.</h2>
          <p>
            Browse legislative records, inspect timelines, compare bill versions,
            and follow bills that matter to you.
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card"><span>{bills.length}</span><p>Tracked bills</p></div>
          <div className="stat-card"><span>{passedCount}</span><p>Passed records</p></div>
          <div className="stat-card"><span>{houses.size}</span><p>Houses covered</p></div>
        </div>
      </div>

      <div className="home-auth-grid">
        <AuthPanel />
        <section className="card home-follows-card">
          <div>
            <p className="eyebrow">Personal tracking</p>
            <h3>Review bills you follow</h3>
            <p className="muted">Sign in, follow bills, and return to your saved list anytime.</p>
          </div>
          <Link className="button" href="/me/follows">My follows</Link>
        </section>
      </div>

      <div className="insight-strip">
        <div><TrendingUp size={18} />Status timelines</div>
        <div><Sparkles size={18} />AI-assisted summaries</div>
        <div><Search size={18} />Source-backed records</div>
      </div>

      <section className="ai-ready-section card">
        <div className="ai-ready-section__header">
          <div>
            <p className="eyebrow">AI-ready comparisons</p>
            <h2>Test AI generation</h2>
            <p className="muted">
              Open one of these bills to generate an AI-assisted summary from two text versions.
            </p>
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
          <div className="ai-ready-empty">
            <p className="muted">Run the demo diff seed or PDF extraction job to enable AI summaries.</p>
          </div>
        )}
      </section>

      <div className="filter-panel card">
        <div className="filter-panel__search">
          <Search size={18} />
          <span>Search and filters will appear here as the dataset grows.</span>
        </div>
        <span className="status-pill">{bills.length} bills</span>
      </div>

      <div className="bill-list-header">
        <div>
          <h2>Tracked Bills</h2>
          <p className="muted">Browse bills and open a detail page to view timelines and follow actions.</p>
        </div>
      </div>

      <div className="bill-grid">
        {bills.map((bill) => <BillCard key={bill.id} bill={bill} />)}
      </div>
    </section>
  );
}