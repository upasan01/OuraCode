import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function ProtectedRoute() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("roomId");

  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState(null);

  const validateRoom = async (roomId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/room/verify?roomId=${roomId}`);
      if (response.status === 200) {
        return { isValid: true };
      }
      return { isValid: false, statusCode: response.status, message: "Invalid room" };
    } catch (error) {
      let statusCode = error.response?.status || 500;
      let message = "";

      if (statusCode === 404) {
        message = "Room not found";
      } else if (statusCode === 500) {
        message = "Server error occurred";
      } else {
        message = "Failed to validate room";
      }

      return { isValid: false, statusCode, message };
    }
  };

  useEffect(() => {
    const checkRoomAndUser = async () => {
      if (!roomCode) {
        setError("Missing roomId");
        setStatusCode(400);
        setIsValid(false);
        return;
      }

      const result = await validateRoom(roomCode);
      setIsValid(result.isValid);
      
      if (!result.isValid) {
        setStatusCode(result.statusCode);
        setError(result.message || "Access denied");
      }
    };

    checkRoomAndUser();
  }, [roomCode]);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e] flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center max-w-md">
          <svg className="animate-spin h-12 w-12 text-[#f38ba8] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p className="animate-pulse text-lg text-[#cdd6f4] font-mono">{"// Loading ..."}</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <Navigate 
        to="/error" 
        state={{ 
          message: error || "Access denied",
          statusCode: statusCode || 500,
          isProtectedRoute: true
        }} 
        replace 
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
