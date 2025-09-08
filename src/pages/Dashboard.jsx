import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import CreateClassDialog from "../components/CreateClassDialog";

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all classes from Firestore
  const fetchClasses = async () => {
    const snapshot = await getDocs(collection(db, "classes"));
    setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Add new class
  const addClass = async (data) => {
    await addDoc(collection(db, "classes"), data);
    setCreateDialogOpen(false);
    fetchClasses();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px" }}>Admin Dashboard</h1>

      <button
        onClick={() => setCreateDialogOpen(true)}
        style={{
          padding: "8px 16px",
          marginBottom: "20px",
          cursor: "pointer",
          borderRadius: "4px",
          border: "1px solid #ccc",
          backgroundColor: "#f5f5f5"
        }}
      >
        Create Class
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {classes.length === 0 && <div>No classes added yet.</div>}
        {classes.map(cls => (
          <div
            key={cls.id}
            style={{
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              minWidth: "150px",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
              boxShadow: "1px 1px 4px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{cls.className}</div>
            <div style={{ fontSize: "14px", color: "#555" }}>
              {cls.branch}-{cls.semester}-{cls.division}
            </div>
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => navigate(`/class/${cls.id}`)}
                style={{ padding: "6px 10px", marginRight: "5px", cursor: "pointer", borderRadius: "3px", border: "1px solid #ccc" }}
              >
                Details
              </button>
              <button
                onClick={() => navigate(`/class/${cls.id}/enter-marks`)}
                style={{ padding: "6px 10px", cursor: "pointer", borderRadius: "3px", border: "1px solid #ccc" }}
              >
                Enter Marks
              </button>
            </div>
          </div>
        ))}
      </div>

      <CreateClassDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={addClass}
      />
    </div>
  );
}

export default Dashboard;
