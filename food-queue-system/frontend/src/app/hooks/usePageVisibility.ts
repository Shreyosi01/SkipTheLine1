import { useEffect, useState } from 'react';

/**
 * Hook that returns true when the page is visible (i.e., not in background or hidden).
 * It listens to the `visibilitychange` event and updates the state accordingly.
 */
export const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
