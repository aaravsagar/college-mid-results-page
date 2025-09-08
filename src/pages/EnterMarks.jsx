// src/pages/EnterMarks.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function EnterMarks() {
  const { classId, testId } = useParams();

  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [marks, setMarks] = useState({}); // { studentId: { subjectId: marks } }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, testId]);

  const handleMarkChange = (studentId, subjectId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: Number(value) }
    }));
  };

  const handleSaveMarks = async () => {
    for (let studentId in marks) {
      await setDoc(
        doc(db, "classes", classId, "tests", testId, "marks", studentId),
        {
          studentId,
          marks: marks[studentId],
          subjectsTotal: subjects.reduce((acc, sub) => {
            acc[sub.id] = sub.totalMarks || 100;
            return acc;
          }, {})
        }
      );
    }
    alert("Marks saved successfully!");
  };

  const handlePublish = async () => {
    await handleSaveMarks();
    await updateDoc(doc(db, "classes", classId, "tests", testId), { published: true });
    setTestInfo(prev => ({ ...prev, published: true }));
    alert("Test published! Students can now view results.");
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading data...</div>;
  if (!classInfo || !testInfo) return <div style={{ padding: "20px" }}>Class or Test not found.</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "Arial, sans-serif", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px" }}>
        Enter Marks: {testInfo.name} ({classInfo.className} - {classInfo.branch}-{classInfo.semester}-{classInfo.division})
      </h1>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Student</th>
            {subjects.map(sub => (
              <th key={sub.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                {sub.name} ({sub.code})<br />Total: {sub.totalMarks || 100}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{student.name}</td>
              {subjects.map(sub => (
                <td key={sub.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <input
                    type="number"
                    min="0"
                    max={sub.totalMarks || 100}
                    value={marks[student.id]?.[sub.id] ?? ""}
                    onChange={e => handleMarkChange(student.id, sub.id, e.target.value)}
                    style={{ width: "60px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <button onClick={handleSaveMarks} style={{ padding: "8px 12px", marginRight: "10px", cursor: "pointer" }}>Save</button>
        <button onClick={handlePublish} style={{ padding: "8px 12px", cursor: "pointer" }} disabled={testInfo.published}>
          {testInfo.published ? "Published" : "Publish"}
        </button>
      </div>
    </div>
  );
}

export default EnterMarks;
