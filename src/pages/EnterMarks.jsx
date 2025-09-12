// src/pages/EnterMarks.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";

function EnterMarks() {
  const { classId, testId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isCC, canAccessSubject, getAccessibleSubjects, canManageTests, currentUser } = useAuth();

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
        const allSubjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSubjects(allSubjects);

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

  const accessibleSubjects = (() => {
    if (isAdmin() || isCC(classId)) {
      return subjects;
    }
    const assigned = currentUser?.assignedSubjects?.filter(a => a.classId === classId) || [];
    if (assigned.length === 1) {
      return subjects.filter(sub => sub.id === assigned[0].subjectId);
    } else {
      return subjects;
    }
  })();

  const handleMarkChange = (studentId, subjectId, value) => {
    if (!isAdmin() && !isCC(classId)) {
      const hasSubjectAssigned = currentUser?.assignedSubjects?.some(
        a => a.classId === classId && a.subjectId === subjectId
      );
      if (!hasSubjectAssigned) {
        return;
      }
    }

    const numValue = value === "" ? "" : Number(value);
    const maxMarks = subjects.find(s => s.id === subjectId)?.totalMarks || 30;

    if (numValue !== "" && (numValue < 0 || numValue > maxMarks)) {
      return;
    }

    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: numValue }
    }));
  };

  const handleSaveMarks = async () => {
    const accessibleSubjectIds = getAccessibleSubjects(classId);
    if (accessibleSubjectIds !== 'all' && accessibleSubjectIds.length === 0) {
      setError("You don't have permission to save marks.");
      return;
    }

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
    if (!canManageTests(classId)) {
      setError("Only admins and class coordinators can publish tests.");
      return;
    }

    if (window.confirm("Are you sure you want to publish this test? Students will be able to view their results.")) {
      setPublishing(true);
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
            {canManageTests(classId) && <button
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
            </button>}
          </div>
        </div>
      </div>

      <div className="container">
        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="card">
          {students.length === 0 || accessibleSubjects.length === 0 ? (
            <div className="text-center" style={{ padding: "40px 0", color: "#666" }}>
              <p>
                {students.length === 0 && "No students found. "}
                {accessibleSubjects.length === 0 && "No subjects found or accessible. "}
              </p>
              <p>Please add students and subjects before entering marks.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "150px" }}>Student</th>
                    {accessibleSubjects.map(sub => (
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
                      {accessibleSubjects.map(sub => (
                        <td key={sub.id} className="text-center">
                          {(() => {
                            const canEdit = isAdmin() || isCC(classId) ||
                              currentUser?.assignedSubjects?.some(
                                a => a.classId === classId && a.subjectId === sub.id
                              );

                            return (
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
                                  fontSize: "14px",
                                  backgroundColor: canEdit ? "white" : "#f5f5f5"
                                }}
                                placeholder="0"
                                disabled={!canEdit}
                              />
                            );
                          })()}
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
