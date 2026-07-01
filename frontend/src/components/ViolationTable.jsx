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
          <tr
            style={{
              borderBottom: "1px solid #2d4963"
            }}
          >
            <th style={{ padding: "12px", textAlign: "left" }}>
              Worker
            </th>

            <th style={{ padding: "12px", textAlign: "left" }}>
              Violation
            </th>

            <th style={{ padding: "12px", textAlign: "left" }}>
              Severity
            </th>

            <th style={{ padding: "12px", textAlign: "center" }}>
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {violations.map((item) => (
            <tr
              key={item._id}
              style={{
                borderBottom: "1px solid #22384f"
              }}
            >
              <td style={{ padding: "12px" }}>
                {item.workerId}
              </td>

              <td style={{ padding: "12px" }}>
                {item.violationType}
              </td>

              <td style={{ padding: "12px" }}>
                {item.severity}
              </td>

              <td
                style={{
                  padding: "12px",
                  textAlign: "center"
                }}
              >
                <button
                  onClick={() => onDelete(item._id)}
                  style={{
                    background: "#ff4d4d",
                    color: "white",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
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

      {violations.length === 0 && (
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#aaa"
          }}
        >
          No violations found
        </p>
      )}
    </div>
  );
}

export default ViolationTable;