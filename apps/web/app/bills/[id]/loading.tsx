// apps/web/app/bills/[id]/loading.tsx
export default function BillDetailLoading() {
  return (
    <section className="loading-state card">
      <div className="loading-spinner" aria-hidden="true" />
      <div>
        <h2>Loading bill details</h2>
        <p className="muted">Fetching timeline, versions, and source metadata.</p>
      </div>
    </section>
  );
}