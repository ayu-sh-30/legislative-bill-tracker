// apps/web/app/loading.tsx
export default function Loading() {
  return (
    <section className="loading-state card">
      <div className="loading-spinner" aria-hidden="true" />
      <div>
        <h2>Loading bills</h2>
        <p className="muted">Fetching the latest legislative records.</p>
      </div>
    </section>
  );
}