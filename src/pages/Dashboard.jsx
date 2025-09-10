// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Import only once
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
  const { isAdmin, getAccessibleClasses, currentUser } = useAuth();

  // Fetch all classes from Firestore
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const snapshot = await getDocs(collection(db, "classes"));
      const allClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const accessibleClassIds = getAccessibleClasses();
      if (accessibleClassIds === 'all') {
        setClasses(allClasses);
      } else {
        setClasses(allClasses.filter(cls => accessibleClassIds.includes(cls.id)));
      }
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
    if (!isAdmin()) {
      setError("Only admins can create classes.");
      return;
    }

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
      {currentUser && (
        <div className="page-header">
          <div className="container">
            <h1>
              {isAdmin()
                ? "Admin Dashboard"
                : currentUser.assignedClasses?.length > 0
                ? "Class Coordinator Dashboard"
                : "Teacher Dashboard"}
            </h1>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Welcome back, {currentUser.name}
            </p>
          </div>
        </div>
      )}

      <div className="container">
        <ErrorMessage message={error} onRetry={fetchClasses} />
        <SuccessMessage message={success} />

        <div className="card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Classes</h2>
            {isAdmin() && (
              <button
                onClick={() => setCreateDialogOpen(true)}
                className="btn btn-primary"
              >
                Create Class
              </button>
            )}
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
                  {currentUser && (
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                      {currentUser.assignedClasses?.includes(cls.id) && (
                        <span className="status-badge published" style={{ fontSize: '0.75rem' }}>
                          Class Coordinator
                        </span>
                      )}
                      {currentUser.assignedSubjects?.some(s => s.classId === cls.id) && (
                        <span className="status-badge draft" style={{ fontSize: '0.75rem', marginLeft: '4px' }}>
                          Subject Teacher
                        </span>
                      )}
                    </div>
                  )}
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
      </div>

      {isAdmin() && (
        <CreateClassDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={addClass}
        />
      )}
    </>
  );
}

export default Dashboard;
