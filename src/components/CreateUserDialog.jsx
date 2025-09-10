import { useState } from 'react';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import FormInput from './FormInput';

function CreateUserDialog({ open, onClose, onCreate, classes }) {
  const [loading, setLoading] = useState(false);
  
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
      password: [validationRules.required, validationRules.minLength(6)],
      role: [validationRules.required]
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    setLoading(true);
    try {
      await onCreate(values);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
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

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <h3>Create New User</h3>
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
            placeholder="Enter password (min 6 characters)"
            required
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
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserDialog;// This is the initial content for src/components/CreateUserDialog.jsx
