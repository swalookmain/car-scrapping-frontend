import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const DropdownContext = createContext();

export const DropdownProvider = ({ children }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const openDropdown = useCallback((dropdownId) => {
    setActiveDropdown(dropdownId);
  }, []);

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const toggleDropdown = useCallback((dropdownId) => {
    setActiveDropdown(prev => prev === dropdownId ? null : dropdownId);
  }, []);

  const isDropdownOpen = useCallback((dropdownId) => {
    return activeDropdown === dropdownId;
  }, [activeDropdown]);

  return (
    <DropdownContext.Provider value={{ 
      activeDropdown, 
      openDropdown, 
      closeDropdown, 
      toggleDropdown,
      isDropdownOpen 
    }}>
      {children}
    </DropdownContext.Provider>
  );
};

DropdownProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
};

export default DropdownContext;
