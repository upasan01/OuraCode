import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function ProtectedRoute() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("roomId");
  
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");

  const validateRoom = async (roomId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/room/verify?roomId=${roomId}`);
      
      if (response.status === 200) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Room validation failed:", error);
      
      if (error.response?.status === 404) {
        setError("Room not found");
      } else if (error.response?.status === 500) {
        setError("Server error occurred");
      } else {
        setError("Failed to validate room");
      }
      
      return false;
    }
  };

  useEffect(() => {
    const checkRoomAndUser = async () => {
      if (!roomCode) {
        setError("Missing roomId ");
        setIsValid(false);
        return;
      }

      const roomIsValid = await validateRoom(roomCode);
      setIsValid(roomIsValid);
    };

    checkRoomAndUser();
  }, [roomCode]);

  if (isValid === null) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p className="animate-pulse text-lg text-gray-700">Loading ...</p>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/error" state={{ message: error || "Access denied" }} replace />;
  }
  
  return <Outlet />;
}


export default ProtectedRoute;
