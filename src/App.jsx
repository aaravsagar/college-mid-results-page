import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import Dashboard from "./pages/Dashboard";
import ClassDetails from "./pages/ClassDetails";
import EnterMarks from "./pages/EnterMarks";
import PublicResultsList from "./pages/PublicResultsList";
import PublicResultView from "./pages/PublicResultView";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/class/:classId"
            element={
              <ProtectedRoute>
                <ClassDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/class/:classId/enter-marks/:testId"
            element={
              <ProtectedRoute>
                <EnterMarks />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/results" element={<PublicResultsList />} />
          <Route path="/results/:classId/:testId" element={<PublicResultView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
