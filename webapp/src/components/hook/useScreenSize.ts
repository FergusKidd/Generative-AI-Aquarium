import { useState, useEffect } from 'react';


/**
 * Custom React hook that provides the current screen size (width and height).
 * It listens for the window's resize event and updates the screen size state accordingly.
 * @returns {Object} An object containing the current screen width and height.
 */

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });
  
  useEffect(() => {
    setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};

export default useScreenSize;