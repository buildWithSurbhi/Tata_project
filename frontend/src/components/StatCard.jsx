function StatCard({ title, value }) {
  return (
    <div className="stat-card">

      <h4>{title}</h4>

      <h2>{value}</h2>

    </div>
  );
}

export default StatCard;