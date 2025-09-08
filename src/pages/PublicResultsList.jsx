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
                totalMarks: test.totalMarks || 100
              });
            }
          });
        }

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
          <div className="card">
            <h2 className="mb-3">Available Test Results</h2>
            <div className="grid">
              {publishedTests.map((test, idx) => (
                <div
                  key={idx}
                  className="test-card"
                  onClick={() => navigate(`/results/${test.classId}/${test.testId}`)}
                >
                  <h3>{test.name}</h3>
                  <p>{test.className}</p>
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    {test.branch} - Semester {test.semester} - Division {test.division}
                  </p>
                  <div className="status-badge published">
                    Published
                  </div>
                  <div className="mt-2">
                    <button className="btn btn-primary btn-small">
                      View Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PublicResultsList;
