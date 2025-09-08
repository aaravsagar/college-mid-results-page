import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import CreateClassDialog from "../components/CreateClassDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import "../styles/global.css";

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Fetch all classes from Firestore
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const snapshot = await getDocs(collection(db, "classes"));
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Add new class
  const addClass = async (data) => {
    try {
      setError("");
      await addDoc(collection(db, "classes"), data);
      setCreateDialogOpen(false);
      setSuccess("Class created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchClasses();
    } catch (err) {
      console.error("Error creating class:", err);
      setError("Failed to create class. Please try again.");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading classes..." />;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="container">
        <ErrorMessage message={error} onRetry={fetchClasses} />
        <SuccessMessage message={success} />

        <div className="card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Classes</h2>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="btn btn-primary"
            >
              Create Class
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="text-center" style={{ padding: "40px 0", color: "#666" }}>
              <p>No classes created yet.</p>
              <p>Click "Create Class" to get started.</p>
            </div>
          ) : (
            <div className="grid">
              {classes.map(cls => (
                <div key={cls.id} className="class-card">
                  <h3>{cls.className}</h3>
                  <p>{cls.branch} - Semester {cls.semester}</p>
                  <p>Division: {cls.division}</p>
                  <div className="d-flex gap-1 mt-2">
                    <button
                      onClick={() => navigate(`/class/${cls.id}`)}
                      className="btn btn-primary btn-small"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateClassDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={addClass}
        />
      </div>
    </>
<<<<<<< HEAD
=======
          </div>
>>>>>>> 196fe26d2ab28d908c9ea2e32d6c07a0090c325a
  );
}

export default Dashboard;
