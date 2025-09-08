import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

import AddStudentDialog from "../components/AddStudentDialog";
import EditStudentDialog from "../components/EditStudentDialog";
import AddSubjectDialog from "../components/AddSubjectDialog";
import EditSubjectDialog from "../components/EditSubjectDialog";
import AddTestDialog from "../components/AddTestDialog";
import EditTestDialog from "../components/EditTestDialog";

function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);

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
    const snapshot = await getDocs(collection(db, "classes"));
    const docSnap = snapshot.docs.find(doc => doc.id === classId);
    if (docSnap) setClassInfo({ id: docSnap.id, ...docSnap.data() });
  };

  // Fetch students, subjects, tests
  const fetchStudents = async () => {
    const snapshot = await getDocs(collection(db, "classes", classId, "students"));
    setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchSubjects = async () => {
    const snapshot = await getDocs(collection(db, "classes", classId, "subjects"));
    setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTests = async () => {
    const snapshot = await getDocs(collection(db, "classes", classId, "tests"));
    setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchClass();
    fetchStudents();
    fetchSubjects();
    fetchTests();
  }, []);

  // Students CRUD
  const addStudent = async (data) => {
    await addDoc(collection(db, "classes", classId, "students"), data);
    setAddStudentOpen(false);
    fetchStudents();
  };

  const updateStudent = async (id, data) => {
    await updateDoc(doc(db, "classes", classId, "students", id), data);
    setEditStudentData(null);
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Delete this student?")) {
      await deleteDoc(doc(db, "classes", classId, "students", id));
      fetchStudents();
    }
  };

  // Subjects CRUD
  const addSubject = async (data) => {
    await addDoc(collection(db, "classes", classId, "subjects"), data);
    setAddSubjectOpen(false);
    fetchSubjects();
  };

  const updateSubject = async (id, data) => {
    await updateDoc(doc(db, "classes", classId, "subjects", id), data);
    setEditSubjectData(null);
    fetchSubjects();
  };

  const deleteSubject = async (id) => {
    if (window.confirm("Delete this subject?")) {
      await deleteDoc(doc(db, "classes", classId, "subjects", id));
      fetchSubjects();
    }
  };

  // Tests CRUD
  const addTest = async (data) => {
    await addDoc(collection(db, "classes", classId, "tests"), data);
    setAddTestOpen(false);
    fetchTests();
  };

  if (!classInfo) return <div style={{ padding: "20px" }}>Loading class...</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial, sans-serif", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px" }}>
        Class: {classInfo.className} ({classInfo.branch}-{classInfo.semester}-{classInfo.division})
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", marginTop: "20px", borderBottom: "1px solid #ccc" }}>
        <button
          onClick={() => setActiveTab("students")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "students" ? "3px solid #000" : "none",
            background: "none",
            cursor: "pointer",
            fontWeight: activeTab === "students" ? "bold" : "normal"
          }}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "subjects" ? "3px solid #000" : "none",
            background: "none",
            cursor: "pointer",
            fontWeight: activeTab === "subjects" ? "bold" : "normal"
          }}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "tests" ? "3px solid #000" : "none",
            background: "none",
            cursor: "pointer",
            fontWeight: activeTab === "tests" ? "bold" : "normal"
          }}
        >
          Tests
        </button>
      </div>

      {/* Students Tab */}
      {activeTab === "students" && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setAddStudentOpen(true)}
            style={{ padding: "8px 16px", marginBottom: "10px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            Add Student
          </button>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Enrollment Number</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Phone Number</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>No students added.</td>
                </tr>
              )}
              {students.map(s => (
                <tr key={s.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{s.name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{s.enrollmentNumber}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{s.phoneNumber}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <button onClick={() => setEditStudentData(s)} style={{ marginRight: "5px" }}>Edit</button>
                    <button onClick={() => deleteStudent(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setAddSubjectOpen(true)}
            style={{ padding: "8px 16px", marginBottom: "10px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            Add Subject
          </button>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Subject Name</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Subject Code</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>No subjects added.</td>
                </tr>
              )}
              {subjects.map(sub => (
                <tr key={sub.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.name}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.code}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <button onClick={() => setEditSubjectData(sub)} style={{ marginRight: "5px" }}>Edit</button>
                    <button onClick={() => deleteSubject(sub.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tests Tab */}
      {activeTab === "tests" && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setAddTestOpen(true)}
            style={{ padding: "8px 16px", marginBottom: "10px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            Create Test
          </button>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {tests.length === 0 && <div>No tests created yet.</div>}
            {tests.map(test => (
              <div key={test.id} style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "4px", minWidth: "150px", textAlign: "center", backgroundColor: "#f9f9f9", position: "relative" }}>
                <div onClick={() => navigate(`/class/${classId}/enter-marks/${test.id}`)} style={{ cursor: "pointer" }}>
                  <div style={{ fontWeight: "bold" }}>{test.name}</div>
                  <div>Total Marks: {test.totalMarks || 100}</div>
                  <div>Status: {test.published ? "Published" : "Draft"}</div>
                </div>
                <div style={{ position: "absolute", top: "5px", right: "5px", display: "flex", gap: "5px" }}>
                  <button onClick={() => setEditTestData(test)} style={{ cursor: "pointer" }}>Edit</button>
                  <button onClick={async () => {
                    if (window.confirm("Delete this test?")) {
                      await deleteDoc(doc(db, "classes", classId, "tests", test.id));
                      fetchTests();
                    }
                  }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddStudentDialog open={addStudentOpen} onClose={() => setAddStudentOpen(false)} onCreate={addStudent} />
      {editStudentData && (
        <EditStudentDialog open={true} onClose={() => setEditStudentData(null)} studentData={editStudentData} onUpdate={updateStudent} />
      )}

      <AddSubjectDialog open={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} onCreate={addSubject} />
      {editSubjectData && (
        <EditSubjectDialog open={true} onClose={() => setEditSubjectData(null)} subjectData={editSubjectData} onUpdate={updateSubject} />
      )}

      <AddTestDialog open={addTestOpen} onClose={() => setAddTestOpen(false)} onCreate={addTest} />
      {editTestData && (
        <EditTestDialog open={true} onClose={() => setEditTestData(null)} testData={editTestData} onUpdate={async (data) => {
          await updateDoc(doc(db, "classes", classId, "tests", editTestData.id), data);
          setEditTestData(null);
          fetchTests();
        }} />
      )}
    </div>
  );
}

export default ClassDetails;
