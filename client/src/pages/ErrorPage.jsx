import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const ErrorPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const message = location.state?.message || "Something went wrong. The page you are looking for does not exist."

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e] flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center max-w-md">
        <h1 className="text-8xl md:text-9xl font-bold text-[#f38ba8] font-mono tracking-wider mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#cdd6f4] mb-4 font-mono">
          {"// Page Not Found"}
        </h2>
        <p className="text-lg text-[#9399b2] mb-8 max-w-sm font-mono leading-relaxed">
          <span className="text-[#f38ba8]">error</span>
          <span className="text-[#89b4fa]">:</span> {message}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold rounded-lg transition-all duration-300 font-mono shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {"return home()"}
        </button>
      </div>
    </div>
  )
}

export default ErrorPage
