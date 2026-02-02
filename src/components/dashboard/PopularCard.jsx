import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';
import { BsThreeDots, BsChevronUp, BsChevronDown, BsChevronRight } from 'react-icons/bs';
import { useDropdown } from '../../context/DropdownContext';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

// Chart color - using CSS variable value for ApexCharts
const chartColor = '#673ab7'; // secondary-main

const DROPDOWN_ID = 'popular-card-dropdown';

// Data for different time periods
const stockData = {
  today: {
    bajajFinery: { price: 1839, change: 10 },
    stocks: [
      { name: 'Bajaj Finery', price: 1839, change: 10, isProfit: true },
      { name: 'TTML', price: 100, change: 10, isProfit: false },
      { name: 'Reliance', price: 200, change: 10, isProfit: true },
    ],
    chartData: [0, 15, 10, 50, 30, 40, 25]
  },
  month: {
    bajajFinery: { price: 2456, change: 15 },
    stocks: [
      { name: 'Bajaj Finery', price: 2456, change: 15, isProfit: true },
      { name: 'TTML', price: 85, change: 15, isProfit: false },
      { name: 'Reliance', price: 320, change: 18, isProfit: true },
    ],
    chartData: [10, 25, 35, 45, 55, 48, 60]
  },
  year: {
    bajajFinery: { price: 4520, change: 25 },
    stocks: [
      { name: 'Bajaj Finery', price: 4520, change: 25, isProfit: true },
      { name: 'TTML', price: 65, change: 35, isProfit: false },
      { name: 'Reliance', price: 580, change: 45, isProfit: true },
    ],
    chartData: [5, 20, 30, 60, 45, 70, 85]
  }
};

const status = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

// Animated Price Component
const AnimatedPrice = ({ value, prefix = '$' }) => {
  const animatedValue = useAnimatedNumber(value, 800, prefix, '', 2);
  return <span>{animatedValue}</span>;
};

AnimatedPrice.propTypes = {
  value: PropTypes.number.isRequired,
  prefix: PropTypes.string
};

const PopularCard = React.memo(({ isLoading }) => {
  const { isDropdownOpen, toggleDropdown, closeDropdown } = useDropdown();
  const [timeValue, setTimeValue] = useState('today');
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const isOpen = isDropdownOpen(DROPDOWN_ID);
  const currentData = useMemo(() => stockData[timeValue], [timeValue]);

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

  // Force chart to update on window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && window.ApexCharts) {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 320);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = () => {
    toggleDropdown(DROPDOWN_ID);
  };

  const handleMenuItemClick = (value) => {
    setTimeValue(value);
    closeDropdown();
  };

  // Small Chart for Bajaj Finery - dynamic based on selection
  const chartData = useMemo(() => ({
    type: 'area',
    height: 95,
    options: {
      chart: { 
        sparkline: { enabled: true },
        animations: {
          enabled: true,
          dynamicAnimation: {
            enabled: true,
            speed: 180 // Faster animation for snappier feel
          }
        }
      },
      dataLabels: { enabled: false },
      colors: [chartColor],
      fill: { type: 'solid', opacity: 0.3 },
      stroke: { curve: 'smooth', width: 3 },
      tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
    },
    series: [{ name: 'series1', data: currentData.chartData }]
  }), [currentData]);

  if (isLoading) {
    return <div className="h-125 bg-grey-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div ref={chartRef} className="bg-paper rounded-xl shadow-sm p-5 h-full flex flex-col w-full max-w-full" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-grey-900">Popular Stocks</h4>
        <div className="relative">
          <button 
            ref={buttonRef}
            className="text-grey-500 hover:text-grey-700 cursor-pointer p-1"
            onClick={handleClick}
          >
            <BsThreeDots className="text-xl" />
          </button>
          {isOpen && (
            <div 
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 bg-paper border border-grey-200 rounded-lg shadow-lg z-50 min-w-35"
            >
              {status.map((option) => (
                <button
                  key={option.value}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-grey-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                    timeValue === option.value ? 'bg-grey-100 text-primary-main' : ''
                  }`}
                  onClick={() => handleMenuItemClick(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bajaj Finery Highlight Card with Chart */}
      <div className="bg-secondary-light rounded-xl p-4 mb-4 border border-secondary-200">
        <div className="flex justify-between items-start mb-1">
          <span className="text-secondary-main font-medium">Bajaj Finery</span>
          <span className="text-grey-900 font-semibold">
            <AnimatedPrice value={currentData.bajajFinery.price} />
          </span>
        </div>
        <span className="text-secondary-dark text-sm">{currentData.bajajFinery.change}% Profit</span>
        <div className="mt-2 w-full max-w-full overflow-hidden">
          <Chart {...chartData} />
        </div>
      </div>

      {/* Stock List */}
      <div className="flex flex-col gap-4 flex-1">
        {currentData.stocks.map((stock, index) => (
          <div key={stock.name + index}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-grey-900 font-medium block">{stock.name}</span>
                <span className={`text-sm ${stock.isProfit ? 'text-success-dark' : 'text-error-main'}`}>
                  {stock.change}% {stock.isProfit ? 'Profit' : 'loss'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-grey-900 font-medium">
                  <AnimatedPrice value={stock.price} />
                </span>
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center ${
                    stock.isProfit ? ' text-success-dark' : ' text-error-dark'
                  }`}
                  style={{ backgroundColor: stock.isProfit ? '#b9f6ca' : '#ef9a9a' }}
                >
                  {stock.isProfit ? <BsChevronUp className="text-lg" /> : <BsChevronDown className="text-sm" />}
                </div>
              </div>
            </div>
            {index < currentData.stocks.length - 1 && <div className="border-b border-grey-100 mt-3"></div>}
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full py-2 mt-4 text-primary-main hover:bg-primary-light rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer">
        View All
        <BsChevronRight />
      </button>
    </div>
  );
});

PopularCard.propTypes = {
  isLoading: PropTypes.bool
};

export default PopularCard;