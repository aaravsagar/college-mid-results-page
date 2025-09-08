// src/pages/EnterMarks.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";

function EnterMarks() {
  const { classId, testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [marks, setMarks] = useState({}); // { studentId: { subjectId: marks } }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const classSnap = await getDocs(collection(db, "classes"));
        const classDoc = classSnap.docs.find(d => d.id === classId);
        if (classDoc) setClassInfo({ id: classDoc.id, ...classDoc.data() });

        const studentsSnap = await getDocs(collection(db, "classes", classId, "students"));
        setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const subjectsSnap = await getDocs(collection(db, "classes", classId, "subjects"));
        setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const testDocSnap = await getDoc(doc(db, "classes", classId, "tests", testId));
        if (testDocSnap.exists()) setTestInfo({ id: testDocSnap.id, ...testDocSnap.data() });

        const marksSnap = await getDocs(collection(db, "classes", classId, "tests", testId, "marks"));
        let marksData = {};
        marksSnap.docs.forEach(d => {
          marksData[d.data().studentId] = d.data().marks;
        });
        setMarks(marksData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, testId]);

  const handleMarkChange = (studentId, subjectId, value) => {
    const numValue = value === "" ? "" : Number(value);
    const maxMarks = subjects.find(s => s.id === subjectId)?.totalMarks || 30;
    
    if (numValue !== "" && (numValue < 0 || numValue > maxMarks)) {
      return; // Don't allow invalid values
    }
    
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: numValue }
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setError("");
    try {
    for (let studentId in marks) {
      await setDoc(
        doc(db, "classes", classId, "tests", testId, "marks", studentId),
        {
          studentId,
          marks: marks[studentId],
          subjectsTotal: subjects.reduce((acc, sub) => {
              acc[sub.id] = sub.totalMarks || 30;
            return acc;
          }, {})
        }
      );
    }
      setSuccess("Marks saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving marks:", err);
      setError("Failed to save marks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (window.confirm("Are you sure you want to publish this test? Students will be able to view their results.")) {
      setPublishing(true);
      setError("");
      try {
        // Save marks first
        for (let studentId in marks) {
          await setDoc(
            doc(db, "classes", classId, "tests", testId, "marks", studentId),
            {
              studentId,
              marks: marks[studentId],
              subjectsTotal: subjects.reduce((acc, sub) => {
                acc[sub.id] = sub.totalMarks || 30;
                return acc;
              }, {})
            }
          );
        }
        
        // Then publish
        await updateDoc(doc(db, "classes", classId, "tests", testId), { published: true });
        setTestInfo(prev => ({ ...prev, published: true }));
        setSuccess("Test published successfully! Students can now view their results.");
        setTimeout(() => setSuccess(""), 5000);
      } catch (err) {
        console.error("Error publishing test:", err);
        setError("Failed to publish test. Please try again.");
      } finally {
        setPublishing(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading test data..." />;
  }
  
  if (!classInfo || !testInfo) {
    return (
      <div className="container">
        <ErrorMessage message="Class or Test not found" />
        <button onClick={() => navigate(`/class/${classId}`)} className="btn btn-primary">
          Back to Class
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Enter Marks: {testInfo.name}</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {classInfo.className} - {classInfo.branch}-{classInfo.semester}-{classInfo.division}
          </p>
        </div>
      </div>
      
      <div className="container">
        <ErrorMessage message={error} />
        <SuccessMessage message={success} />
        
        {/* Navigation */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            onClick={() => navigate(`/class/${classId}`)} 
            className="btn btn-secondary"
          >
            ← Back to Class
          </button>
          
          <div className="d-flex gap-2">
            <button 
              onClick={handleSaveMarks} 
              className="btn btn-secondary"
              disabled={saving || publishing}
            >
              {saving ? (
                <>
                  <div className="loading-spinner"></div>
                  Saving...
                </>
              ) : (
                "Save Marks"
              )}
            </button>
            <button 
              onClick={handlePublish} 
              className="btn btn-success"
              disabled={testInfo.published || saving || publishing}
            >
              {publishing ? (
                <>
                  <div className="loading-spinner"></div>
                  Publishing...
                </>
              ) : testInfo.published ? (
                "Published"
              ) : (
                "Publish Test"
              )}
            </button>
          </div>
        </div>

        <div className="card">
          {students.length === 0 || subjects.length === 0 ? (
            <div className="text-center" style={{ padding: "40px 0", color: "#666" }}>
              <p>
                {students.length === 0 && "No students found. "}
                {subjects.length === 0 && "No subjects found. "}
              </p>
              <p>Please add students and subjects before entering marks.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "150px" }}>Student</th>
                    {subjects.map(sub => (
                      <th key={sub.id} className="text-center" style={{ minWidth: "120px" }}>
                        <div>{sub.name}</div>
                        <div style={{ fontSize: "12px", fontWeight: "normal", opacity: 0.7 }}>
                          ({sub.code}) / {sub.totalMarks || 30}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div style={{ fontWeight: "500" }}>{student.name}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {student.enrollmentNumber}
                        </div>
                      </td>
                      {subjects.map(sub => (
                        <td key={sub.id} className="text-center">
                          <input
                            type="number"
                            min="0"
                            max={sub.totalMarks || 30}
                            value={marks[student.id]?.[sub.id] ?? ""}
                            onChange={e => handleMarkChange(student.id, sub.id, e.target.value)}
                            className="form-input"
                            style={{ 
                              width: "80px", 
                              textAlign: "center",
                              fontSize: "14px"
                            }}
                            placeholder="0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {testInfo.published && (
          <div className="card" style={{ backgroundColor: "#e8f5e8", borderColor: "#4caf50" }}>
            <div className="text-center">
              <h3 className="text-success mb-1">✓ Test Published</h3>
              <p className="mb-0">Students can now view their results using the public results page.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EnterMarks;
