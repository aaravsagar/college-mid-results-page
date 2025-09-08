// src/pages/PublicResultsList.jsx
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function PublicResultsList() {
  const [publishedTests, setPublishedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedTests = async () => {
      setLoading(true);
      setError("");
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
                date: test.date || "01 Jan 2025",
                totalMarks: test.totalMarks || 100
              });
            }
          });
        }

        // Sort by date descending
        testsList.sort((a, b) => new Date(b.date) - new Date(a.date));

        setPublishedTests(testsList);
      } catch (err) {
        console.error("Error fetching published tests:", err);
        setError("Failed to load published results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedTests();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading published results..." />;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Published Test Results</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Select a test to view your results
          </p>
        </div>
      </div>

      <div className="container">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />

        {publishedTests.length === 0 ? (
          <div className="card text-center" style={{ padding: "60px 20px" }}>
            <h3 style={{ color: "#666", marginBottom: "16px" }}>No Results Published Yet</h3>
            <p style={{ color: "#888" }}>
              Test results will appear here once they are published by the admin.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {publishedTests.map((test, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                    onClick={() => navigate(`/results/${test.classId}/${test.testId}`)}
                  >
                    <td style={{ padding: "12px 8px", fontSize: "0.9rem", color: "#666" }}>
                      {test.date}
                    </td>
                    <td style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#1976d2", fontSize: "1.2rem" }}>•</span>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#d32f2f" }}>{test.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                          {test.className} ({test.branch}), Semester {test.semester}, Division {test.division}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default PublicResultsList;
