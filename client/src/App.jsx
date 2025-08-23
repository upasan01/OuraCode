import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Room from "./pages/Room";
import ErrorPage from "./pages/ErrorPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import History from "./pages/History";
import { Toaster } from "react-hot-toast";

// Import the new components
import PathTracker from "./components/common/PathTracker";
import HistoryProtectedRoute from "./components/common/HistoryProtectedRoute";

function App() {
  return (
    <Router>
      <PathTracker />
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/room" element={<Room />} />
        </Route>
        <Route path="/error" element={<ErrorPage />} />
        <Route element={<HistoryProtectedRoute />}>
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;