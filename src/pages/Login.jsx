import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, login, setCurrentUser } = useAuth(); // optional: directly set admin
  const navigate = useNavigate();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll
  } = useFormValidation(
    {
      email: '',
      password: ''
    },
    {
      email: [validationRules.required],
      password: [validationRules.required]
    }
  );

  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    setLoading(true);
    setError('');

    try {
      // Hardcoded admin credentials
      if (
        values.email === 'admin@sids.in' &&
        values.password === 'Admin@123'
      ) {
        // Create a mock admin user object
        const adminUser = {
          id: 'admin-id',
          email: 'admin@sids.in',
          name: 'Administrator',
          role: 'admin',
          assignedClasses: [],
          assignedSubjects: []
        };

        setCurrentUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));

        navigate('/dashboard', { replace: true });
        return;
      }

      // Otherwise, use normal login (Firestore)
      await login(values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Mid-Semester Results</h1>
          <p>Sign in to access the system</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="login-form">
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            required
          />

          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
