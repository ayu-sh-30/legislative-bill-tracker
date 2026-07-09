// apps/web/app/me/follows/loading.tsx
export default function MyFollowsLoading() {
  return (
    <section className="loading-state card">
      <div className="loading-spinner" aria-hidden="true" />
      <div>
        <h2>Loading followed bills</h2>
        <p className="muted">Checking your saved bill list.</p>
      </div>
    </section>
  );
}