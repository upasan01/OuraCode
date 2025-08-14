import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Room from './pages/Room';
import ErrorPage from './pages/ErrorPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/room" element={<Room />} />
        </Route>
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
