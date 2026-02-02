import React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { HiOutlineWallet } from 'react-icons/hi2';
import { BsThreeDots, BsArrowUpRight } from 'react-icons/bs';
import { useDropdown } from '../../context/DropdownContext';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

const DROPDOWN_ID = 'earning-card-dropdown';

const EarningCard = React.memo(({ isLoading }) => {
  const { isDropdownOpen, toggleDropdown, closeDropdown } = useDropdown();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const isOpen = isDropdownOpen(DROPDOWN_ID);
  const animatedTotal = useAnimatedNumber(500.00, 800, '$', '', 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeDropdown]);

  const handleClick = () => {
    toggleDropdown(DROPDOWN_ID);
  };

  const handleMenuItemClick = () => {
    closeDropdown();
  };

  if (isLoading) {
    return <div className="h-45 bg-grey-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl p-5 h-45 bg-linear-to-br from-secondary-dark to-secondary-main">
      {/* Decorative circles */}
      <div className="absolute w-52.5 h-52.5 bg-secondary-800 rounded-full -top-21.25 -right-23.75 opacity-80"></div>
      <div className="absolute w-52.5 h-52.5 bg-secondary-800 rounded-full -top-31.25 -right-3.75 opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Row - Icon and Menu */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 rounded-lg bg-secondary-800 flex items-center justify-center">
            <HiOutlineWallet className="text-white text-2xl" />
          </div>
          <div className="relative">
            <button 
              ref={buttonRef}
              className="w-9 h-9 rounded-lg bg-secondary-800 flex items-center justify-center cursor-pointer hover:opacity-80 transition-colors"
              onClick={handleClick}
            >
              <BsThreeDots className="text-white text-lg" />
            </button>
            {isOpen && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-full mt-1 bg-paper border border-grey-200 rounded-lg shadow-lg z-50 min-w-35"
              >
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-grey-50 rounded-t-lg cursor-pointer"
                  onClick={handleMenuItemClick}
                >
                  Import Card
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-grey-50 rounded-b-lg cursor-pointer"
                  onClick={handleMenuItemClick}
                >
                  Copy Data
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Amount Row */}
        <div className="flex items-center gap-2 mt-auto mb-1">
          <span className="text-white text-[2.5rem] font-medium leading-none">{animatedTotal}</span>
          <div className="w-7 h-7 rounded-full bg-secondary-800 flex items-center justify-center">
            <BsArrowUpRight className="text-white text-sm" />
          </div>
        </div>
        
        {/* Label */}
        <span className="text-secondary-200 text-base font-medium">Total Earning</span>
      </div>
    </div>
  );
});

EarningCard.propTypes = {
  isLoading: PropTypes.bool
};

export default EarningCard;