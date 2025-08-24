import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

//basically to get the current path for the history protect route
//can be used for other things too, just I didn't yet
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