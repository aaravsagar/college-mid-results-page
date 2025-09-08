import { useState } from "react";
import { useFormValidation, validationRules } from "../hooks/useFormValidation";
import FormInput from "./FormInput";

function CreateClassDialog({ open, onClose, onCreate }) {
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
      className: "",
      branch: "",
      semester: "",
      division: ""
    },
    {
      className: [validationRules.required],
      branch: [validationRules.required],
      semester: [validationRules.required],
      division: [validationRules.required]
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
      console.error("Error creating class:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create New Class</h3>
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Class Name"
            name="className"
            value={values.className}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.className ? errors.className : ""}
            placeholder="e.g., Computer Science"
            required
          />
          
          <FormInput
            label="Branch"
            name="branch"
            value={values.branch}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.branch ? errors.branch : ""}
            placeholder="e.g., CSE"
            required
          />
          
          <FormInput
            label="Semester"
            name="semester"
            value={values.semester}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.semester ? errors.semester : ""}
            placeholder="e.g., 3"
            required
          />
          
          <FormInput
            label="Division"
            name="division"
            value={values.division}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.division ? errors.division : ""}
            placeholder="e.g., A"
            required
          />
          
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
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClassDialog;
