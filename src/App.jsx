import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClassDetails from './pages/ClassDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/class/:classId" element={<ClassDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
