function AlertCard({ type, message }) {
  return (
    <div className="alert-card">

      <h4>{type}</h4>

      <p>{message}</p>

    </div>
  );
}

export default AlertCard;