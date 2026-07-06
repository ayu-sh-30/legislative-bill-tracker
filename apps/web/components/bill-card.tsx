
import Link from "next/link";
import { CalendarDays, ExternalLink, Landmark } from "lucide-react";

import type { BillListItem } from "../lib/api-client";

type BillCardProps = {
  bill: BillListItem;
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

export function BillCard({ bill }: BillCardProps) {
  return (
    <article className="bill-card">
      <div className="bill-card__main">
        <div className="bill-card__title-row">
          <Link href={`/bills/${bill.id}`} className="bill-card__title">
            {bill.title}
          </Link>
          {bill.status ? <span className="status-pill">{bill.status}</span> : null}
        </div>

        <div className="bill-card__meta">
          <span>
            <Landmark size={16} aria-hidden="true" />
            {bill.house ?? "House not available"}
          </span>
          <span>
            <CalendarDays size={16} aria-hidden="true" />
            {formatDate(bill.introducedDate)}
          </span>
        </div>

        <p className="bill-card__summary">
          {bill.ministry ?? "Ministry not available"}
          {bill.billNumber ? ` • Bill ${bill.billNumber}` : ""}
        </p>
      </div>

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
    </article>
  );
}