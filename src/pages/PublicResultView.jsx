// src/pages/PublicResultView.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { useFormValidation, validationRules } from "../hooks/useFormValidation";
import FormInput from "../components/FormInput";

function PublicResultView() {
  const { classId, testId } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [classInfo, setClassInfo] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const [result, setResult] = useState(null);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset
  } = useFormValidation(
    {
      enrollmentNumber: "",
      captcha: ""
    },
    {
      enrollmentNumber: [validationRules.required],
      captcha: [validationRules.required]
    }
  );

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
    setLoading(true);
    setError("");
    try {
      const classSnap = await getDoc(doc(db, "classes", classId));
      const testSnap = await getDoc(doc(db, "classes", classId, "tests", testId));

      if (classSnap.exists()) setClassInfo(classSnap.data());
      if (testSnap.exists()) {
        const testData = testSnap.data();
        if (!testData.published) {
          setError("This test has not been published yet.");
          return;
        }
        setTestInfo(testData);
      } else {
        setError("Test not found.");
        return;
      }

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
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load test data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(text);
    handleChange("captcha", "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    if (values.captcha.toUpperCase() !== generatedCaptcha) {
      setError("Incorrect CAPTCHA! Please try again.");
      refreshCaptcha();
      return;
    }

    setSubmitting(true);
    setError("");
    
    const student = students.find(s => s.enrollmentNumber === values.enrollmentNumber);
    if (!student) {
      setError("Enrollment Number not found! Please check and try again.");
      setSubmitting(false);
      return;
    }

    const studentMarks = marksData[student.id]?.marks || {};
    setResult({ student, marks: studentMarks });
    setSubmitting(false);
  };

  const calculateTotal = () => {
    if (!result) return 0;
    return subjects.reduce((sum, sub) => sum + (result.marks[sub.id] || 0), 0);
  };

  const hasFailed = () => {
    if (!result) return false;
    return subjects.some(sub => (result.marks[sub.id] || 0) < 12);
  };

  if (loading) {
    return <LoadingSpinner text="Loading test results..." />;
  }

  return (
    <>
      {/* SAL Institute Header */}
      <div className="portal-header">
        <div className="container">
          <h1 className="institute-name">SAL INSTITUTE OF DIPLOMA STUDIES</h1>
          <p className="project-name">MID-SEMESTER RESULTS PORTAL</p>
        </div>
      </div>

      <div className="page-header">
        <div className="container">
          <h1>View Test Results</h1>
          {classInfo && testInfo && (
            <p style={{ margin: 0, opacity: 0.9 }}>
              {testInfo.name} - {classInfo.className}
            </p>
          )}
        </div>
      </div>
      
      <div className="container">
        <ErrorMessage message={error} onRetry={fetchData} />

        {!result && !error && (
          <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <h2 className="text-center mb-3">Enter Your Details</h2>
            
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Enrollment Number"
                name="enrollmentNumber"
                value={values.enrollmentNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.enrollmentNumber ? errors.enrollmentNumber : ""}
                placeholder="Enter your enrollment number"
                required
              />
              
              <div className="form-group">
                <label className="form-label">
                  CAPTCHA <span className="text-danger">*</span>
                </label>
                <div className="captcha-container">
                  <input
                    type="text"
                    name="captcha"
                    value={values.captcha}
                    onChange={(e) => handleChange("captcha", e.target.value.toUpperCase())}
                    onBlur={() => handleBlur("captcha")}
                    placeholder="Enter CAPTCHA"
                    className={`form-input ${touched.captcha && errors.captcha ? 'error' : ''}`}
                    style={{ textTransform: "uppercase" }}
                    maxLength="6"
                    required
                  />
                  <div className="captcha-text">{generatedCaptcha}</div>
                  <button 
                    type="button" 
                    onClick={refreshCaptcha}
                    className="btn btn-secondary btn-small"
                  >
                    Refresh
                  </button>
                </div>
                {touched.captcha && errors.captcha && (
                  <div className="form-error">{errors.captcha}</div>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Loading Result...
                  </>
                ) : (
                  "View My Result"
                )}
              </button>
            </form>
          </div>
        )}

        {result && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Result Header */}
            <div className={`result-header ${hasFailed() ? 'failed' : ''}`}>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                {hasFailed() ? "Result: FAILED" : "Result: PASSED"}
              </h2>
              <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
                {hasFailed() 
                  ? "Unfortunately, you have failed the exam." 
                  : "Congratulations! You have passed the exam."
                }
              </p>
            </div>
            
            {/* Student Info */}
            <div className="result-summary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="mb-1">{result.student.name}</h3>
                  <p className="mb-0 text-primary">Enrollment: {result.student.enrollmentNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-primary" style={{ fontSize: "1.2rem", fontWeight: "600" }}>
                    Total: {calculateTotal()}/{subjects.length * 30}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Percentage: {((calculateTotal() / (subjects.length * 30)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Marks Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th className="text-center">Marks Obtained</th>
                      <th className="text-center">Total Marks</th>
                      <th className="text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(sub => {
                      const obtained = result.marks[sub.id] || 0;
                      const isPassed = obtained >= 12;
                      return (
                        <tr key={sub.id}>
                          <td style={{ fontWeight: "500" }}>{sub.code}</td>
                          <td>{sub.name}</td>
                          <td className={`text-center ${!isPassed ? 'text-danger' : ''}`} style={{ fontWeight: "600" }}>
                            {obtained}
                          </td>
                          <td className="text-center">30</td>
                          <td className={`text-center ${isPassed ? 'text-success' : 'text-danger'}`} style={{ fontWeight: "600" }}>
                            {isPassed ? "PASS" : "FAIL"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="text-center mt-3">
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PublicResultView;
