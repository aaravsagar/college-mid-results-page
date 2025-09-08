import React, { useState } from "react";

function AddTestDialog({ open, onClose, onCreate }) {
  const [testName, setTestName] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);

  const handleCreate = () => {
    if (!testName.trim()) {
      alert("Test name cannot be empty!");
      return;
    }

    onCreate({
      name: testName.trim(),
      totalMarks: Number(totalMarks),
      published: false
    });

    setTestName("");
    setTotalMarks(100);
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "4px",
        minWidth: "300px",
        fontFamily: "Arial, sans-serif"
      }}>
        <h2 style={{ marginTop: 0, marginBottom: "15px" }}>Create New Test</h2>

        <div style={{ marginBottom: "10px" }}>
          <label>Test Name:</label><br />
          <input
            type="text"
            value={testName}
            onChange={e => setTestName(e.target.value)}
            style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Total Marks:</label><br />
          <input
            type="number"
            value={totalMarks}
            onChange={e => setTotalMarks(e.target.value)}
            style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
            min="1"
          />
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{ padding: "6px 12px", marginRight: "10px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTestDialog;
