import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";

function AddSubjectDialog({ open, onClose, onCreate, classId }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [totalMarks, setTotalMarks] = useState(30);
  const [assignedTeacher, setAssignedTeacher] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const teachersList = usersSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'teacher');
      setTeachers(teachersList);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert("Subject name and code are required.");
      return;
    }

    const subjectData = {
      name: name.trim(),
      code: code.trim(),
      totalMarks: Number(totalMarks),
      assignedTeacher: assignedTeacher || null
    };

    try {
      // Create the subject and get its ID
      const createdSubjectId = await onCreate(subjectData);

      // If a teacher is assigned, update their document
      if (assignedTeacher && createdSubjectId) {
        const teacherRef = doc(db, "users", assignedTeacher);
        await updateDoc(teacherRef, {
          assignedSubjects: arrayUnion({
            classId: classId,
            subjectId: createdSubjectId
          })
        });
      }

      // Reset form fields
      setName("");
      setCode("");
      setTotalMarks(30);
      setAssignedTeacher("");
      onClose(); // Close the dialog after successful submission
    } catch (err) {
      console.error("Error adding subject or updating teacher:", err);
      alert("Something went wrong while adding the subject.");
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Subject</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Subject Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Enter subject name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Subject Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="form-input"
              placeholder="Enter subject code"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              className="form-input"
              min="1"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Teacher</label>
            <select
              value={assignedTeacher}
              onChange={(e) => setAssignedTeacher(e.target.value)}
              className="form-input"
            >
              <option value="">Select a teacher (optional)</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
            {loading && (
              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}>
                Loading teachers...
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSubjectDialog;
