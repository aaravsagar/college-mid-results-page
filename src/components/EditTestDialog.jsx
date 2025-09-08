import { useState, useEffect } from "react";

function EditTestDialog({ open, onClose, testData, onUpdate }) {
  const [name, setName] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (testData) {
      setName(testData.name || "");
      setTotalMarks(testData.totalMarks || 100);
      setPublished(testData.published || false);
    }
  }, [testData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      name,
      totalMarks,
      published
    });
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "20px", borderRadius: "4px", width: "300px" }}>
        <h3>Edit Test</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Test Name:</label><br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "6px" }} required />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Total Marks:</label><br />
          <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} style={{ width: "100%", padding: "6px" }} required />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={onClose} style={{ padding: "6px 12px" }}>Cancel</button>
          <button type="submit" style={{ padding: "6px 12px" }}>Save</button>
        </div>
      </form>
    </div>
  );
}

export default EditTestDialog;
