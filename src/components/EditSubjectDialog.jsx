import { useState, useEffect } from "react";

function EditSubjectDialog({ open, onClose, subjectData, onUpdate }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (subjectData) {
      setName(subjectData.name);
      setCode(subjectData.code);
    }
  }, [subjectData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert("All fields are required.");
      return;
    }
    onUpdate(subjectData.id, { name, code });
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      display: "flex", justifyContent: "center", alignItems: "center"
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
        <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "5px", marginBottom: "15px" }}>Edit Subject</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Subject Name" value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }} required />
          <input type="text" placeholder="Subject Code" value={code} onChange={e => setCode(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }} required />

          <div style={{ textAlign: "right" }}>
            <button type="button" onClick={onClose} style={{ padding: "6px 12px", marginRight: "10px", borderRadius: "4px", border: "1px solid #ccc", background: "#f0f0f0", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ padding: "6px 12px", borderRadius: "4px", border: "none", background: "#000", color: "#fff", cursor: "pointer" }}>Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSubjectDialog;
