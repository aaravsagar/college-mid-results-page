import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import FormInput from './FormInput';

function EditUserDialog({ open, onClose, userData, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState({});
  
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
      name: '',
      email: '',
      password: '',
      role: 'teacher',
      assignedClasses: [],
      assignedSubjects: []
    },
    {
      name: [validationRules.required],
      email: [validationRules.required],
      password: [], // Password is optional for updates
      role: [validationRules.required]
    }
  );

  // Fetch classes and their subjects when dialog opens
  useEffect(() => {
    if (open) {
      fetchClassesAndSubjects();
    }
  }, [open]);

  const fetchClassesAndSubjects = async () => {
    try {
      const classesSnap = await getDocs(collection(db, 'classes'));
      const classesData = classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(classesData);

      // Fetch subjects for each class
      const subjectsData = {};
      for (const cls of classesData) {
        const subjectsSnap = await getDocs(collection(db, 'classes', cls.id, 'subjects'));
        subjectsData[cls.id] = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching classes and subjects:', error);
    }
  };

  useEffect(() => {
    if (userData && open) {
      handleChange('name', userData.name || '');
      handleChange('email', userData.email || '');
      handleChange('password', '');
      handleChange('role', userData.role || 'teacher');
      handleChange('assignedClasses', userData.assignedClasses || []);
      handleChange('assignedSubjects', userData.assignedSubjects || []);
    }
  }, [userData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    setLoading(true);
    try {
      const updateData = { ...values };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      await onUpdate(userData.id, updateData);
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleClassAssignment = (classId, isChecked) => {
    const newAssignedClasses = isChecked
      ? [...values.assignedClasses, classId]
      : values.assignedClasses.filter(id => id !== classId);
    
    handleChange('assignedClasses', newAssignedClasses);
  };

  const handleSubjectAssignment = (classId, subjectId, isChecked) => {
    const newAssignedSubjects = isChecked
      ? [...values.assignedSubjects, { classId, subjectId }]
      : values.assignedSubjects.filter(a => !(a.classId === classId && a.subjectId === subjectId));
    
    handleChange('assignedSubjects', newAssignedSubjects);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <h3>Edit User</h3>
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name ? errors.name : ''}
            placeholder="Enter full name"
            required
          />
          
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
            placeholder="Enter email address"
            required
          />
          
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            placeholder="Leave empty to keep current password"
          />
          
          <div className="form-group">
            <label className="form-label">
              Role <span className="text-danger">*</span>
            </label>
            <select
              name="role"
              value={values.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="form-input"
              required
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {values.role === 'teacher' && classes.length > 0 && (
            <div className="form-group">
              <label className="form-label">Assign as Class Coordinator</label>
              <div className="checkbox-group">
                {classes.map(cls => (
                  <label key={cls.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={values.assignedClasses.includes(cls.id)}
                      onChange={(e) => handleClassAssignment(cls.id, e.target.checked)}
                    />
                    <span>{cls.className} ({cls.branch}-{cls.semester}-{cls.division})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {values.role === 'teacher' && classes.length > 0 && (
            <div className="form-group">
              <label className="form-label">Assign Subjects</label>
              <div className="checkbox-group" style={{ maxHeight: '300px' }}>
                {classes.map(cls => (
                  <div key={cls.id} style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#1e3c72', marginBottom: '8px', borderBottom: '1px solid #ecf0f1', paddingBottom: '4px' }}>
                      {cls.className} ({cls.branch}-{cls.semester}-{cls.division})
                    </div>
                    {subjects[cls.id]?.length > 0 ? subjects[cls.id].map(subject => (
                      <label key={`${cls.id}-${subject.id}`} className="checkbox-item" style={{ marginLeft: '15px' }}>
                        <input
                          type="checkbox"
                          checked={values.assignedSubjects.some(a => a.classId === cls.id && a.subjectId === subject.id)}
                          onChange={(e) => handleSubjectAssignment(cls.id, subject.id, e.target.checked)}
                        />
                        <span>{subject.name} ({subject.code})</span>
                      </label>
                    )) : (
                      <div style={{ marginLeft: '15px', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                        No subjects available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose} 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserDialog;
