import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PathTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/history') {
      sessionStorage.setItem('lastValidPath', location.pathname);
    }
  }, [location]);

  return null; 
}

export default PathTracker;