import { BillCard } from "../components/bill-card";
import { getBills } from "../lib/api-client";


export default async function HomePage() {
  const bills = await getBills();

  return (
    <section>
      <div className="bill-list-header">
        <div>
          <h2>Tracked Bills</h2>
          <p className="muted">
            Browse legislative bills and open a detail page to view timeline events.
          </p>
        </div>
        <span className="status-pill">{bills.length} bills</span>
      </div>

      {bills.length > 0 ? (
        <div className="grid">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <h2>No bills found</h2>
          <p className="muted">Run the backend seed job to load initial bill data.</p>
        </div>
      )}
    </section>
  );
}