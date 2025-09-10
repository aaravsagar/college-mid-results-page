import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";

import AddStudentDialog from "../components/AddStudentDialog";
import EditStudentDialog from "../components/EditStudentDialog";
import AddSubjectDialog from "../components/AddSubjectDialog";
import EditSubjectDialog from "../components/EditSubjectDialog";
import AddTestDialog from "../components/AddTestDialog";
import EditTestDialog from "../components/EditTestDialog";

function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isCC, canAccessSubject, getAccessibleSubjects } = useAuth();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("students");

  // Dialog states
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState(null);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editSubjectData, setEditSubjectData] = useState(null);
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [editTestData, setEditTestData] = useState(null);

  // Fetch class info
  const fetchClass = async () => {
    try {
      const snapshot = await getDocs(collection(db, "classes"));
      const docSnap = snapshot.docs.find(doc => doc.id === classId);
      if (docSnap) setClassInfo({ id: docSnap.id, ...docSnap.data() });
    } catch (err) {
      console.error("Error fetching class:", err);
      setError("Failed to load class information.");
    }
  };

  // Fetch students, subjects, tests
  const fetchStudents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "classes", classId, "students"));
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students.");
    }
  };

  const fetchSubjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, "classes", classId, "subjects"));
      const allSubjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter subjects based on user permissions
      const accessibleSubjectIds = getAccessibleSubjects(classId);
      if (accessibleSubjectIds === 'all') {
        setSubjects(allSubjects);
      } else {
        setSubjects(allSubjects.filter(sub => accessibleSubjectIds.includes(sub.id)));
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to load subjects.");
    }
  };

  const fetchTests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "classes", classId, "tests"));
      setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load tests.");
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    await Promise.all([fetchClass(), fetchStudents(), fetchSubjects(), fetchTests()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Students CRUD
  const addStudent = async (data) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to add students.");
      return;
    }
    
    try {
      await addDoc(collection(db, "classes", classId, "students"), data);
      setAddStudentOpen(false);
      setSuccess("Student added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchStudents();
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student.");
    }
  };

  const updateStudent = async (id, data) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to update students.");
      return;
    }
    
    try {
      await updateDoc(doc(db, "classes", classId, "students", id), data);
      setEditStudentData(null);
      setSuccess("Student updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchStudents();
    } catch (err) {
      console.error("Error updating student:", err);
      setError("Failed to update student.");
    }
  };

  const deleteStudent = async (id) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to delete students.");
      return;
    }
    
    if (window.confirm("Delete this student?")) {
      try {
        await deleteDoc(doc(db, "classes", classId, "students", id));
        setSuccess("Student deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchStudents();
      } catch (err) {
        console.error("Error deleting student:", err);
        setError("Failed to delete student.");
      }
    }
  };

  // Subjects CRUD
  const addSubject = async (data) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to add subjects.");
      return;
    }
    
    try {
      await addDoc(collection(db, "classes", classId, "subjects"), data);
      setAddSubjectOpen(false);
      setSuccess("Subject added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchSubjects();
    } catch (err) {
      console.error("Error adding subject:", err);
      setError("Failed to add subject.");
    }
  };

  const updateSubject = async (id, data) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to update subjects.");
      return;
    }
    
    try {
      await updateDoc(doc(db, "classes", classId, "subjects", id), data);
      setEditSubjectData(null);
      setSuccess("Subject updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchSubjects();
    } catch (err) {
      console.error("Error updating subject:", err);
      setError("Failed to update subject.");
    }
  };

  const deleteSubject = async (id) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to delete subjects.");
      return;
    }
    
    if (window.confirm("Delete this subject?")) {
      try {
        await deleteDoc(doc(db, "classes", classId, "subjects", id));
        setSuccess("Subject deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchSubjects();
      } catch (err) {
        console.error("Error deleting subject:", err);
        setError("Failed to delete subject.");
      }
    }
  };

  // Tests CRUD
  const addTest = async (data) => {
    if (!isAdmin() && !isCC(classId)) {
      setError("You don't have permission to create tests.");
      return;
    }
    
    try {
      await addDoc(collection(db, "classes", classId, "tests"), data);
      setAddTestOpen(false);
      setSuccess("Test created successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchTests();
    } catch (err) {
      console.error("Error creating test:", err);
      setError("Failed to create test.");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading class details..." />;
  }

  if (!classInfo) {
    return (
      <div className="container">
        <ErrorMessage message="Class not found" />
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>
            {classInfo.className}
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {classInfo.branch} - Semester {classInfo.semester} - Division {classInfo.division}
          </p>
        </div>
      </div>
      
      <div className="container">
        <ErrorMessage message={error} onRetry={fetchAllData} />
        <SuccessMessage message={success} />

        {/* Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            onClick={() => navigate("/")} 
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab("students")}
            className={`tab ${activeTab === "students" ? "active" : ""}`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`tab ${activeTab === "subjects" ? "active" : ""}`}
          >
            Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`tab ${activeTab === "tests" ? "active" : ""}`}
          >
            Tests ({tests.length})
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Students</h3>
              {(isAdmin() || isCC(classId)) && (
                <button
                  onClick={() => setAddStudentOpen(true)}
                  className="btn btn-primary"
                >
                  Add Student
                </button>
              )}
            </div>
            
            {students.length === 0 ? (
              <div className="text-center" style={{ padding: "40px 0", color: "#666" }}>
                <p>No students added yet.</p>
                <p>Click "Add Student" to get started.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Enrollment Number</th>
                      <th className="hide-mobile">Phone Number</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.enrollmentNumber}</td>
                        <td className="hide-mobile">{s.phoneNumber}</td>
                        <td className="text-center">
                          {(isAdmin() || isCC(classId)) && (
                            <div className="d-flex gap-1 justify-content-center">
                              <button 
                                onClick={() => setEditStudentData(s)} 
                                className="btn btn-secondary btn-small"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteStudent(s.id)}
                                className="btn btn-danger btn-small"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Subjects</h3>
              {(isAdmin() || isCC(classId)) && (
                <button
                  onClick={() => setAddSubjectOpen(true)}
                  className="btn btn-primary"
                >
                  Add Subject
                </button>
              )}
            </div>
            
            {subjects.length === 0 ? (
              <div className="text-center" style={{ padding: "40px 0", color: "#666" }}>
                <p>No subjects added yet.</p>
                <p>Click "Add Subject" to get started.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Subject Code</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(sub => (
                      <tr key={sub.id}>
                        <td>{sub.name}</td>
                        <td>{sub.code}</td>
                        <td className="text-center">
                          {(isAdmin() || isCC(classId)) && (
                            <div className="d-flex gap-1 justify-content-center">
                              <button 
                                onClick={() => setEditSubjectData(sub)} 
                                className="btn btn-secondary btn-small"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => deleteSubject(sub.id)}
                                className="btn btn-danger btn-small"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === "tests" && (
          <div className="card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="mb-0">Tests</h3>
              {(isAdmin() || isCC(classId)) && (
                <button
                  onClick={() => setAddTestOpen(true)}
                  className="btn btn-primary"
                >
                  Create Test
                </button>
              )}
            </div>
            
            {tests.length === 0 ? (
              <div className="text-center" style={{ padding: "40px 0", color: "#666" }}>
                <p>No tests created yet.</p>
                <p>Click "Create Test" to get started.</p>
              </div>
            ) : (
              <div className="grid">
                {tests.map(test => (
                  <div key={test.id} className="test-card">
                    {(isAdmin() || isCC(classId)) && (
                      <div className="card-actions">
                        <button 
                          onClick={() => setEditTestData(test)} 
                          className="btn btn-secondary btn-small"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm("Delete this test?")) {
                              try {
                                await deleteDoc(doc(db, "classes", classId, "tests", test.id));
                                setSuccess("Test deleted successfully!");
                                setTimeout(() => setSuccess(""), 3000);
                                fetchTests();
                              } catch (err) {
                                console.error("Error deleting test:", err);
                                setError("Failed to delete test.");
                              }
                            }
                          }}
                          className="btn btn-danger btn-small"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    
                    <div onClick={() => navigate(`/class/${classId}/enter-marks/${test.id}`)}>
                      <h3>{test.name}</h3>
                      <p>Total Marks: {test.totalMarks || 100}</p>
                      <div className={`status-badge ${test.published ? 'published' : 'draft'}`}>
                        {test.published ? "Published" : "Draft"}
                      </div>
                      <div className="mt-2">
                        <button className="btn btn-primary btn-small">
                          Enter Marks
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dialogs */}
        {(isAdmin() || isCC(classId)) && (
          <AddStudentDialog open={addStudentOpen} onClose={() => setAddStudentOpen(false)} onCreate={addStudent} />
        )}
        {editStudentData && (
          <EditStudentDialog open={true} onClose={() => setEditStudentData(null)} studentData={editStudentData} onUpdate={updateStudent} />
        )}

        {(isAdmin() || isCC(classId)) && (
          <AddSubjectDialog open={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} onCreate={addSubject} />
        )}
        {editSubjectData && (
          <EditSubjectDialog open={true} onClose={() => setEditSubjectData(null)} subjectData={editSubjectData} onUpdate={updateSubject} />
        )}

        {(isAdmin() || isCC(classId)) && (
          <AddTestDialog open={addTestOpen} onClose={() => setAddTestOpen(false)} onCreate={addTest} />
        )}
        {editTestData && (
          <EditTestDialog open={true} onClose={() => setEditTestData(null)} testData={editTestData} onUpdate={async (data) => {
            try {
              await updateDoc(doc(db, "classes", classId, "tests", editTestData.id), data);
              setEditTestData(null);
              setSuccess("Test updated successfully!");
              setTimeout(() => setSuccess(""), 3000);
              fetchTests();
            } catch (err) {
              console.error("Error updating test:", err);
              setError("Failed to update test.");
            }
          }} />
        )}
      </div>
    </>
  );
}

export default ClassDetails;