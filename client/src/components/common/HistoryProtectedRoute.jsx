import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function HistoryProtectedRoute() {
  const accessKeyString = sessionStorage.getItem('historyAccessKey');
  const lastPath = sessionStorage.getItem('lastValidPath') || '/';

  let hasValidAccess = false;

  if (accessKeyString) {
    sessionStorage.removeItem('historyAccessKey');
    
    try {
      const { token, timestamp } = JSON.parse(accessKeyString);
      const now = Date.now();

      if (token && (now - timestamp < 5000)) {
        hasValidAccess = true;
      }
    } catch (error) {
      console.error("Invalid history access key format.");
      hasValidAccess = false;
    }
  }

  return hasValidAccess ? <Outlet /> : <Navigate to={lastPath} replace />;
}

export default HistoryProtectedRoute;