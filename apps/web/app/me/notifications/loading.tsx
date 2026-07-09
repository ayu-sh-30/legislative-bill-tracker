export default function NotificationsLoading() {
  return (
    <div className="card loading-state">
      <div className="loading-spinner" />
      <div>
        <h2>Loading notifications</h2>
        <p className="muted">Checking followed bill updates.</p>
      </div>
    </div>
  );
}