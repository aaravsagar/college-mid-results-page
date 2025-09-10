import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Handle hardcoded admin login first
    if (email === 'admin@sids.in' && password === 'Admin@123') {
      const adminUser = {
        id: 'admin-hardcoded',
        email: 'admin@sids.in',
        name: 'Admin',
        role: 'admin',
        assignedClasses: [],
        assignedSubjects: []
      };
      setCurrentUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return adminUser;
    }

    // Otherwise, normal Firestore login
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid email or password');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const user = {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        assignedClasses: userData.assignedClasses || [],
        assignedSubjects: userData.assignedSubjects || []
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAdmin = () => currentUser?.role === 'admin';

  const isCC = (classId = null) => {
    if (!currentUser || currentUser.role !== 'teacher') return false;
    if (!classId) return currentUser.assignedClasses?.length > 0;
    return currentUser.assignedClasses?.includes(classId);
  };

  const canAccessClass = (classId) => {
    if (isAdmin()) return true;
    if (isCC(classId)) return true;
    return currentUser?.assignedSubjects?.some(a => a.classId === classId);
  };

  const canAccessSubject = (classId, subjectId) => {
    if (isAdmin()) return true;
    if (isCC(classId)) return true;
    return currentUser?.assignedSubjects?.some(a => a.classId === classId && a.subjectId === subjectId);
  };

  const getAccessibleClasses = () => {
    if (isAdmin()) return 'all';
    const classIds = new Set();
    currentUser?.assignedClasses?.forEach(id => classIds.add(id));
    currentUser?.assignedSubjects?.forEach(a => classIds.add(a.classId));
    return Array.from(classIds);
  };

  const getAccessibleSubjects = (classId) => {
    if (isAdmin()) return 'all';
    if (isCC(classId)) return 'all';
    return currentUser?.assignedSubjects?.filter(a => a.classId === classId)?.map(a => a.subjectId) || [];
  };

  const value = {
    currentUser,
    setCurrentUser, // <-- exposed for direct use if needed
    login,
    logout,
    isAdmin,
    isCC,
    canAccessClass,
    canAccessSubject,
    getAccessibleClasses,
    getAccessibleSubjects
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
