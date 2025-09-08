// src/pages/PublicResultView.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function PublicResultView() {
  const { classId, testId } = useParams();

  const [classInfo, setClassInfo] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const [result, setResult] = useState(null);

  // Generate a random 6-char alphanumeric CAPTCHA
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(text);
  }, []);

  const fetchData = async () => {
    const classSnap = await getDoc(doc(db, "classes", classId));
    const testSnap = await getDoc(doc(db, "classes", classId, "tests", testId));

    if (classSnap.exists()) setClassInfo(classSnap.data());
    if (testSnap.exists()) setTestInfo(testSnap.data());

    const studentsSnap = await getDocs(collection(db, "classes", classId, "students"));
    setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const subjectsSnap = await getDocs(collection(db, "classes", classId, "subjects"));
    setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const marksSnap = await getDocs(collection(db, "classes", classId, "tests", testId, "marks"));
    let allMarks = {};
    marksSnap.docs.forEach(d => {
      allMarks[d.id] = d.data();
    });
    setMarksData(allMarks);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = () => {
    if (captcha !== generatedCaptcha) {
      alert("Incorrect CAPTCHA!");
      return;
    }

    const student = students.find(s => s.enrollmentNumber === enrollmentNumber);
    if (!student) {
      alert("Enrollment Number not found!");
      return;
    }

    const studentMarks = marksData[student.id]?.marks || {};
    setResult({ student, marks: studentMarks });
  };

  const calculateTotal = () => {
    if (!result) return 0;
    return subjects.reduce((sum, sub) => sum + (result.marks[sub.id] || 0), 0);
  };

  const hasFailed = () => {
    if (!result) return false;
    return subjects.some(sub => (result.marks[sub.id] || 0) < 12);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "Arial, sans-serif", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px" }}>View Result</h1>

      {!result && (
        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Enter Enrollment Number"
            value={enrollmentNumber}
            onChange={e => setEnrollmentNumber(e.target.value)}
            style={{ padding: "8px", marginBottom: "10px", width: "100%" }}
          />
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Enter CAPTCHA"
              value={captcha}
              onChange={e => setCaptcha(e.target.value)}
              style={{ padding: "8px", marginRight: "10px", width: "200px" }}
            />
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>{generatedCaptcha}</span>
          </div>
          <button onClick={handleSubmit} style={{ padding: "10px 20px", cursor: "pointer" }}>
            View Result
          </button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Result for {result.student.name}</h2>
          <p>Enrollment Number: {result.student.enrollmentNumber}</p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Sub Code</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Sub Name</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Marks Obtained</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Total Marks</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(sub => {
                const obtained = result.marks[sub.id] || 0;
                return (
                  <tr key={sub.id}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.code}</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.name}</td>
                    <td style={{
                      border: "1px solid #ccc",
                      padding: "8px",
                      color: obtained < 12 ? "red" : "inherit"
                    }}>
                      {obtained}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>30</td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>{obtained >= 12 ? "PASS" : "FAIL"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: "20px", fontSize: "18px", fontWeight: "bold" }}>
            {hasFailed() ? "Unfortunately, You have Failed the Exam." : "Congratulations! You have Passed the Exam."}
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicResultView;
