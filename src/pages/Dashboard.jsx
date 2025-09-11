import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import CreateClassDialog from "../components/CreateClassDialog";
import EditClassDialog from "../components/EditClassDialog";

function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editClassData, setEditClassData] = useState(null);
  
  const { currentUser, isAdmin, getAccessibleClasses } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(collection(db, "classes"));
      const allClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter classes based on user permissions
      const accessibleClassIds = getAccessibleClasses();
      if (accessibleClassIds === 'all') {
        setClasses(allClasses);
      } else {
        // For teachers, show classes where they have assigned subjects or are CC
        const filteredClasses = allClasses.filter(cls => accessibleClassIds.includes(cls.id));
        setClasses(filteredClasses);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData) => {
    if (!isAdmin()) {
      setError("Only admins can create classes.");
      return;
    }
    
    try {
      await addDoc(collection(db, "classes"), classData);
      setCreateDialogOpen(false);
      setSuccess("Class created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchClasses();
    } catch (err) {
      console.error("Error creating class:", err);
      setError("Failed to create class. Please try again.");
    }
  };

  const updateClass = async (classId, classData) => {
    if (!isAdmin()) {
      setError("Only admins can update classes.");
      return;
    }
    
    try {
      await updateDoc(doc(db, "classes", classId), classData);
      setEditClassData(null);
      setSuccess("Class updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchClasses();
    } catch (err) {
      console.error("Error updating class:", err);
      setError("Failed to update class. Please try again.");
    }
  };

  const deleteClass = async (classId) => {
    if (!isAdmin()) {
      setError("Only admins can delete classes.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this class? This will also delete all students, subjects, and tests associated with it.")) {
      try {
        await deleteDoc(doc(db, "classes", classId));
        setSuccess("Class deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchClasses();
      } catch (err) {
        console.error("Error deleting class:", err);
        setError("Failed to delete class. Please try again.");
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Welcome back, {currentUser?.name}
          </p>
        </div>
      </div>

      <div className="container">
        <ErrorMessage message={error} onRetry={fetchClasses} />
        <SuccessMessage message={success} />

        <div className="card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">My Classes</h2>
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
              <p>No classes found.</p>
              {isAdmin() && <p>Click "Create Class" to get started.</p>}
            </div>
          ) : (
            <div className="grid">
              {classes.map(cls => (
                <div key={cls.id} className="class-card" onClick={() => navigate(`/class/${cls.id}`)}>
                  {isAdmin() && (
                    <div className="card-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditClassData(cls);
                        }} 
                        className="btn btn-secondary btn-small"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteClass(cls.id);
                        }}
                        className="btn btn-danger btn-small"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  
                  <h3>{cls.className}</h3>
                  <p><strong>Branch:</strong> {cls.branch}</p>
                  <p><strong>Semester:</strong> {cls.semester}</p>
                  <p><strong>Division:</strong> {cls.division}</p>
                  
                  <div className="mt-2">
                    <button className="btn btn-primary btn-small">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid" style={{ marginTop: "30px" }}>
          <div className="card text-center">
            <h3 className="text-primary">{classes.length}</h3>
            <p className="mb-0">Total Classes</p>
          </div>
          
          <div className="card text-center">
            <h3 className="text-success">{currentUser?.role === 'admin' ? 'Admin' : 'Teacher'}</h3>
            <p className="mb-0">Your Role</p>
          </div>
          
          <div className="card text-center">
            <h3 className="text-primary">
              {currentUser?.assignedClasses?.length || 0}
            </h3>
            <p className="mb-0">Classes as CC</p>
          </div>
        </div>

        {/* Dialogs */}
        {isAdmin() && (
          <CreateClassDialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            onCreate={createClass}
          />
        )}

        {editClassData && (
          <EditClassDialog
            open={true}
            onClose={() => setEditClassData(null)}
            classData={editClassData}
            onUpdate={updateClass}
          />
        )}
      </div>
    </>
  );
}

export default Dashboard;