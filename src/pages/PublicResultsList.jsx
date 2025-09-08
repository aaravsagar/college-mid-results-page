// src/pages/PublicResultsList.jsx
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

function PublicResultsList() {
  const [publishedTests, setPublishedTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedTests = async () => {
      try {
        const classesSnapshot = await getDocs(collection(db, "classes"));
        const testsList = [];

        for (let cls of classesSnapshot.docs) {
          const clsData = cls.data();
          const testsSnapshot = await getDocs(collection(db, "classes", cls.id, "tests"));
          testsSnapshot.docs.forEach(testDoc => {
            const test = testDoc.data();
            if (test.published) {
              testsList.push({
                testId: testDoc.id,
                classId: cls.id,
                className: clsData.className,
                branch: clsData.branch,
                semester: clsData.semester,
                division: clsData.division,
                name: test.name,
              });
            }
          });
        }

        setPublishedTests(testsList);
      } catch (err) {
        console.error("Error fetching published tests:", err);
      }
    };

    fetchPublishedTests();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", fontFamily: "Arial, sans-serif", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #ccc", paddingBottom: "8px" }}>Published Results</h1>
      {publishedTests.length === 0 && <p>No results published yet.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {publishedTests.map((test, idx) => (
          <li
            key={idx}
            onClick={() => navigate(`/results/${test.classId}/${test.testId}`)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              marginBottom: "8px",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "#f9f9f9"
            }}
          >
            <strong>{test.name}</strong> — {test.className} ({test.branch}-{test.semester}-{test.division})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PublicResultsList;
