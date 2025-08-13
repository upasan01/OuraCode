import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

function ProtectedRoute() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("roomId");
  const username = searchParams.get("username");

  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    if (!roomCode || !username) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [roomCode, username]);

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
    return <Navigate to="/error" state={{ message: "Missing roomId or username" }} replace />;
  }
  return <Outlet />;

}


export default ProtectedRoute;
