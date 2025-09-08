import { useState } from "react";

function CreateClassDialog({ open, onClose, onCreate }) {
  const [className, setClassName] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!className.trim() || !branch.trim() || !semester.trim() || !division.trim()) {
      alert("All fields are required.");
      return;
    }
    onCreate({ className, branch, semester, division });
    setClassName(""); setBranch(""); setSemester(""); setDivision("");
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        padding: "20px",
        width: "320px",
        borderRadius: "6px",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "5px", marginBottom: "15px" }}>Create Class</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Class Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
          <input
            type="text"
            placeholder="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
          <input
            type="text"
            placeholder="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
          <input
            type="text"
            placeholder="Division"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px" }}
            required
          />
          <div style={{ textAlign: "right" }}>
            <button type="button" onClick={onClose} style={{
              padding: "6px 12px",
              marginRight: "10px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}>Cancel</button>
            <button type="submit" style={{
              padding: "6px 12px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClassDialog;
