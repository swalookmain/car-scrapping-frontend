import React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useMemo } from 'react';
import SafeChart from './SafeChart';
import { HiChevronDown } from 'react-icons/hi2';
import { useDropdown } from '../../context/DropdownContext';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

// Chart colors - using CSS variable values for ApexCharts
const chartColors = {
  secondaryMain: '#673ab7',
  primaryMain: '#2196f3',
  primary200: '#90caf9',
  secondaryLight: '#ede7f6'
};

const DROPDOWN_ID = 'total-growth-dropdown';

const status = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

// Dynamic data for different time periods
const chartDataByPeriod = {
  today: {
    total: 524.00,
    series: [
      { name: 'Investment', data: [15, 25, 20, 30, 35, 25, 30, 20, 25, 30, 20, 35] },
      { name: 'Loss', data: [10, 15, 10, 20, 15, 10, 15, 10, 15, 20, 10, 15] },
      { name: 'Profit', data: [20, 35, 25, 40, 30, 35, 45, 30, 35, 40, 25, 40] },
      { name: 'Maintenance', data: [0, 0, 15, 0, 0, 20, 0, 0, 0, 0, 25, 0] }
    ]
  },
  month: {
    total: 2324.00,
    series: [
      { name: 'Investment', data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75] },
      { name: 'Loss', data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75] },
      { name: 'Profit', data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10] },
      { name: 'Maintenance', data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0] }
    ]
  },
  year: {
    total: 18520.00,
    series: [
      { name: 'Investment', data: [85, 225, 135, 185, 135, 180, 135, 120, 135, 145, 115, 175] },
      { name: 'Loss', data: [55, 45, 65, 85, 95, 70, 110, 55, 45, 115, 55, 95] },
      { name: 'Profit', data: [135, 245, 135, 185, 120, 205, 200, 110, 165, 145, 130, 110] },
      { name: 'Maintenance', data: [20, 30, 125, 40, 30, 165, 50, 20, 30, 40, 200, 30] }
    ]
  }
};

const TotalGrowthBarChart = React.memo(({ isLoading }) => {
  const { isDropdownOpen, toggleDropdown, closeDropdown } = useDropdown();
  const [value, setValue] = useState('month');
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);



  const isOpen = isDropdownOpen(DROPDOWN_ID);
  const currentData = useMemo(() => chartDataByPeriod[value], [value]);
  const animatedTotal = useAnimatedNumber(currentData.total, 800, '$', '', 2);

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
    const resizeTimer = { current: null };
    const handleResize = () => {
      if (!(chartRef.current && window.ApexCharts)) return;
      // Debounce dispatch to avoid many forced reflows during resize
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        resizeTimer.current = null;
      }, 320);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, []);

  const handleDropdownClick = () => {
    toggleDropdown(DROPDOWN_ID);
  };

  const handleMenuItemClick = (optionValue) => {
    setValue(optionValue);
    closeDropdown();
  };

  const chartData = useMemo(() => ({
    height: 320,
    type: 'bar',
      options: {
      chart: {
        stacked: true,
        toolbar: { show: true },
        zoom: { enabled: true },
        // Turn off animations for better performance during development
        animations: { enabled: false, dynamicAnimation: { enabled: false }, animateGradually: { enabled: false } },
        redrawOnParentResize: false,
      },
      plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
      xaxis: { type: 'category', categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
      legend: { show: true, fontSize: '12px', position: 'bottom', offsetX: 12, labels: { useSeriesColors: false }, markers: { width: 14, height: 14, radius: 4 }, itemMargin: { horizontal: 12, vertical: 6 } },
      fill: { type: 'solid' },
      dataLabels: { enabled: false },
      grid: { show: true },
      colors: [chartColors.secondaryMain, chartColors.primaryMain, chartColors.primary200, chartColors.secondaryLight]
    },
    series: currentData.series
  }), [currentData]);

  if (isLoading) {
    return <div className="h-125 bg-grey-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div ref={chartRef} className="bg-paper rounded-2xl p-5" style={{ overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-grey-500 text-xs font-medium uppercase tracking-wide">Total Growth</p>
          <h3 className="text-2xl font-semibold text-grey-900 mt-1">{animatedTotal}</h3>
        </div>
        <div className="relative">
          <button 
            ref={buttonRef}
            className="flex items-center gap-2 px-3 py-1.5 border border-grey-200 rounded-xl text-xs font-medium hover:bg-grey-50 transition-colors cursor-pointer"
            onClick={handleDropdownClick}
          >
            {status.find(s => s.value === value)?.label}
            <HiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div 
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 bg-paper border border-grey-100 rounded-xl z-50 min-w-35 py-1 overflow-hidden animate-fade-in"
              style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.05)' }}
            >
              {status.map((option) => (
                <button
                  key={option.value}
                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-grey-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                    value === option.value ? 'bg-grey-100 text-primary-main' : ''
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
      
      {/* Chart */}
      <SafeChart key={value} {...chartData} />
    </div>
  );
});

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalGrowthBarChart;