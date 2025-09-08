import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import CreateClassDialog from "../components/CreateClassDialog";
import EditClassDialog from "../components/EditClassDialog";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editClassData, setEditClassData] = useState(null);
  const navigate = useNavigate();

  // Fetch all classes from Firestore
  const fetchClasses = async () => {
    const snapshot = await getDocs(collection(db, "classes"));
    setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Add a new class
  const addClass = async (classData) => {
    await addDoc(collection(db, "classes"), classData);
    setCreateOpen(false);
    fetchClasses();
  };

  // Update class
  const updateClass = async (id, classData) => {
    await updateDoc(doc(db, "classes", id), classData);
    setEditClassData(null);
    fetchClasses();
  };

  // Delete class
  const deleteClass = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      await deleteDoc(doc(db, "classes", id));
      fetchClasses();
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial, sans-serif", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px" }}>Admin Dashboard</h1>

      <button
        onClick={() => setCreateOpen(true)}
        style={{
          padding: "8px 16px",
          marginTop: "10px",
          marginBottom: "20px",
          borderRadius: "4px",
          cursor: "pointer",
          border: "1px solid #ccc",
          backgroundColor: "#f0f0f0"
        }}
      >
        Create Class
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {classes.length === 0 && <p>No classes found.</p>}
        {classes.map(c => (
          <div key={c.id} style={{
            border: "1px solid #ccc",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "4px",
            minWidth: "150px",
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div onClick={() => navigate(`/class/${c.id}`)} style={{ fontWeight: "bold", marginBottom: "5px" }}>
              {c.className} ({c.branch}-{c.semester}-{c.division})
            </div>
            <div>
              <button
                onClick={() => setEditClassData(c)}
                style={{
                  padding: "4px 8px",
                  marginRight: "5px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f0f0f0"
                }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteClass(c.id)}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor: "#f0f0f0"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <CreateClassDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addClass} />
      {editClassData && (
        <EditClassDialog
          open={true}
          onClose={() => setEditClassData(null)}
          classData={editClassData}
          onUpdate={updateClass}
        />
      )}
    </div>
  );
}

export default Dashboard;
