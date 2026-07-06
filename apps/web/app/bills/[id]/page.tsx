import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { FollowBillPanel } from "../../../components/follow-bill-panel";
import { BillTimeline } from "../../../components/bill-timeline";
import { getBillById } from "../../../lib/api-client";

type BillDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};
function formatDate(value: string | null) {
  if (!value) {
    return "Date not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  let bill;

  try {
    bill = await getBillById(id);
  } catch {
    notFound();
  }

  return (
    <section className="detail-layout">
      <Link href="/" className="back-link">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to bills
      </Link>

      <div className="detail-header card">
        <div>
          <p className="eyebrow">{bill.house ?? "Legislative bill"}</p>
          <h2>{bill.title}</h2>
          <p className="muted">
            {bill.ministry ?? "Ministry not available"}
            {bill.billNumber ? ` • Bill ${bill.billNumber}` : ""}
          </p>
        </div>

        <div className="detail-header__actions">
          {bill.status ? <span className="status-pill">{bill.status}</span> : null}
          <a
            className="icon-link"
            href={bill.sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open source for ${bill.title}`}
            title="Open source"
          >
            <ExternalLink size={18} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="detail-grid">
        <section className="card detail-panel">
          <h3>Bill Details</h3>
          <dl className="detail-list">
            <div>
              <dt>Introduced</dt>
              <dd>{formatDate(bill.introducedDate)}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{bill.year ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{bill.source}</dd>
            </div>
          </dl>
        </section>

        <section className="card detail-panel">
          <h3>Versions</h3>
          {bill.versions.length > 0 ? (
            <ul className="version-list">
              {bill.versions.map((version) => (
                <li key={version.id}>
                  <span>{version.versionLabel}</span>
                  <span className="muted">{formatDate(version.versionDate)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No versions available.</p>
          )}
        </section>
      </div>
      <FollowBillPanel billId={bill.id} />
      <section>
        <div className="section-heading">
          <h2>Status Timeline</h2>
          <p className="muted">Chronological movement of this bill through Parliament.</p>
        </div>
        <BillTimeline stages={bill.stages} />
      </section>
    </section>
  );
}