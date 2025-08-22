import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

const ErrorPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Check if user accessed error page through ProtectedRoute
  useEffect(() => {
    if (!location.state || !location.state.isProtectedRoute) {
      console.warn('Unauthorized access to error page detected, redirecting to home');
      navigate('/', { replace: true });
      return;
    }
  }, [location.state, navigate]);

  // If no valid state, show nothing while redirecting
  if (!location.state || !location.state.isProtectedRoute) {
    return null;
  }

  const message = location.state.message || "Something went wrong"
  const statusCode = location.state.statusCode || 404

  const getErrorTitle = (code) => {
    switch(code) {
      case 404: return "Room Not Found"
      case 500: return "Server Error"
      case 403: return "Access Denied"
      default: return "Error"
    }
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="flex flex-col items-center justify-center text-center max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
        <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 text-[#f38ba8] mb-4 sm:mb-6 animate-pulse" />
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#f38ba8] font-mono tracking-wider mb-3 sm:mb-4">
          {statusCode}
        </h1>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-[#cdd6f4] mb-3 sm:mb-4 font-mono px-2">
          {"// " + getErrorTitle(statusCode)}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[#9399b2] mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-md font-mono leading-relaxed px-2">
          <span className="text-[#f38ba8]">error</span>
          <span className="text-[#89b4fa]">:</span> {message}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold rounded-lg transition-all duration-300 font-mono shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base md:text-lg min-h-[44px]"
        >
          {"return home()"}
        </button>
      </div>
    </div>
  )
}

export default ErrorPage
