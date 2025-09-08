import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ClassDetails from "./pages/ClassDetails";
import EnterMarks from "./pages/EnterMarks";
import PublicResultsList from "./pages/PublicResultsList";
import PublicResultView from "./pages/PublicResultView";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/class/:classId" element={<ClassDetails />} />
        <Route path="/class/:classId/enter-marks/:testId" element={<EnterMarks />} />

        {/* Public Routes */}
        <Route path="/results" element={<PublicResultsList />} /> {/* List of published tests */}
        <Route path="/results/:classId/:testId" element={<PublicResultView />} /> {/* Student view */}
      </Routes>
    </Router>
  );
}

export default App;
