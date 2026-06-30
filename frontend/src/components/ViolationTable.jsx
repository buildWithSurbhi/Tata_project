function ViolationTable({ violations, onDelete }) {
  return (
    <div
      style={{
        marginTop: "30px",
        background: "#13263a",
        padding: "20px",
        borderRadius: "10px"
      }}
    >
      <h2>Violation History</h2>

      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
  <th style={{ padding: "10px" }}>Worker</th>
  <th style={{ padding: "10px" }}>Violation</th>
  <th style={{ padding: "10px" }}>Severity</th>
  <th style={{ padding: "10px" }}>Action</th>
</tr>
        </thead>

        <tbody>
          {violations.map((item) => (
            <tr key={item._id}>
              <td style={{ padding: "10px" }}>
                {item.workerId}
              </td>

              <td style={{ padding: "10px" }}>
                {item.violationType}
              </td>

              <td style={{ padding: "10px" }}>
                {item.severity}
              </td>
              <td style={{ padding: "10px" }}>
  <button
    onClick={() => onDelete(item._id)}
    style={{
      background: "red",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViolationTable;