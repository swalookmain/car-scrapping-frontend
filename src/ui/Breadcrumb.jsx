import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// Icons hum MUI ke hi use kar rahe hain kyunki woh already installed hain
import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const Breadcrumb = ({ title, items = [] }) => {
  const navigate = useNavigate();

  const handleClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.08)] mb-6">
      {/* Page Title (Left) */}
      <h2 className="text-xl font-medium text-gray-900">
        {title}
      </h2>

      {/* Breadcrumb Navigation (Right) */}
      <nav aria-label="breadcrumb">
        <ol className="flex items-center space-x-1">
          
          {/* 1. Home Icon (Always First) - Purple Color */}
          <li className="flex items-center">
            <div
              onClick={() => handleClick('/dashboard')}
              className="flex items-center cursor-pointer text-[var(--color-secondary-main)] hover:opacity-80 transition-opacity"
            >
              <HomeIcon style={{ fontSize: '20px' }} />
            </div>
          </li>

          {/* 2. Loop through Items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.path || item.label} className="flex items-center">
                {/* Separator Icon (> arrow) */}
                <NavigateNextIcon 
                  className="text-gray-400 mx-1" 
                  style={{ fontSize: '16px' }} 
                />

                {/* Breadcrumb Text */}
                <span
                  onClick={() => !isLast && handleClick(item.path)}
                  className={`text-sm cursor-pointer transition-colors ${
                    isLast
                      ? 'text-gray-500 cursor-default font-normal' // Last item (Inactive): Grey
                      : 'text-gray-600 hover:text-[var(--color-secondary-main)]' // Links: Darker Grey, Purple on Hover
                  }`}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

Breadcrumb.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  )
};

export default Breadcrumb;