import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';

const ModalLockContext = createContext(null);

export const ModalLockProvider = ({ children }) => {
  const countRef = useRef(0);

  const lock = useCallback(() => {
    countRef.current += 1;
    if (countRef.current === 1) {
      // first modal opened
      // save current overflow to restore later if needed
      // hide scroll on body and html so page scrollbar disappears
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // add padding-right equal to scrollbar width to avoid layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    }
  }, []);

  const unlock = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      countRef.current = 0;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  return (
    <ModalLockContext.Provider value={{ lock, unlock }}>
      {children}
    </ModalLockContext.Provider>
  );
};

export const useModalLock = () => {
  const ctx = useContext(ModalLockContext);
  if (!ctx) {
    return { lock: () => {}, unlock: () => {} };
  }
  return ctx;
};

export default ModalLockContext;
