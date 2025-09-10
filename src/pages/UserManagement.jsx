// src/pages/UserManagement.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import bcrypt from 'bcryptjs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import CreateUserDialog from '../components/CreateUserDialog';
import EditUserDialog from '../components/EditUserDialog';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin()) return;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersSnap, classesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'classes')),
      ]);

      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setClasses(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      setError('');

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = {
        ...userData,
        password: hashedPassword,
        assignedClasses: userData.assignedClasses || [],
        assignedSubjects: userData.assignedSubjects || [],
      };

      await addDoc(collection(db, 'users'), newUser);
      setCreateDialogOpen(false);
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setError('');

      const updateData = { ...userData };

      // Hash password if it's being updated
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      await updateDoc(doc(db, 'users', userId), updateData);
      setEditUserData(null);
      setSuccess('User updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError('');
        await deleteDoc(doc(db, 'users', userId));
        setSuccess('User deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        fetchData();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const getClassNames = (classIds) => {
    if (!classIds || classIds.length === 0) return 'None';
    return classIds.map(id => {
      const cls = classes.find(c => c.id === id);
      return cls ? `${cls.className} (${cls.branch}-${cls.semester}-${cls.division})` : 'Unknown';
    }).join(', ');
  };

  const getSubjectAssignments = (assignments) => {
    if (!assignments || assignments.length === 0) return 'None';
    return assignments.map(assignment => {
      const cls = classes.find(c => c.id === assignment.classId);
      return cls ? `${cls.className} - Subject ${assignment.subjectId}` : 'Unknown';
    }).join(', ');
  };

  if (!isAdmin()) {
    return (
      <div className="container">
        <ErrorMessage message="Access denied. Admin privileges required." />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>User Management</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Manage teachers and their assignments
          </p>
        </div>
      </div>

      <div className="container">
        <ErrorMessage message={error} onRetry={fetchData} />
        <SuccessMessage message={success} />

        <div className="card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Users</h2>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="btn btn-primary"
            >
              Create User
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center" style={{ padding: '40px 0', color: '#666' }}>
              <p>No users found.</p>
              <p>Click "Create User" to add teachers.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="hide-mobile">CC Classes</th>
                    <th className="hide-mobile">Subject Assignments</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: '500' }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-badge ${user.role === 'admin' ? 'published' : 'draft'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="hide-mobile" style={{ fontSize: '0.9rem' }}>
                        {getClassNames(user.assignedClasses)}
                      </td>
                      <td className="hide-mobile" style={{ fontSize: '0.9rem' }}>
                        {getSubjectAssignments(user.assignedSubjects)}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            onClick={() => setEditUserData(user)}
                            className="btn btn-secondary btn-small"
                          >
                            Edit
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="btn btn-danger btn-small"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <CreateUserDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreate={createUser}
          classes={classes}
        />

        {editUserData && (
          <EditUserDialog
            open={true}
            onClose={() => setEditUserData(null)}
            userData={editUserData}
            onUpdate={updateUser}
            classes={classes}
          />
        )}
      </div>
    </>
  );
}

export default UserManagement;
