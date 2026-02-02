import React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { BsArrowDownRight } from 'react-icons/bs';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

// Dynamic data for different time periods
const orderData = {
  month: {
    total: 108,
    chartData: [35, 44, 9, 54, 45, 66, 41, 69]
  },
  year: {
    total: 961,
    chartData: [45, 66, 41, 89, 25, 44, 9, 54]
  }
};

const TotalOrderLineChartCard = React.memo(({ isLoading }) => {
  const [timeValue, setTimeValue] = useState('year');
  const chartRef = useRef(null);

  const currentData = useMemo(() => orderData[timeValue], [timeValue]);
  const animatedTotal = useAnimatedNumber(currentData.total, 800, '$', '', 0);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 320);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => ({
    type: 'line',
    height: 80,
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
      colors: ['#fff'],
      fill: { type: 'solid', opacity: 1 },
      stroke: { curve: 'smooth', width: 3 },
      yaxis: { min: 0, max: 100 },
      tooltip: { theme: 'dark', fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
    },
    series: [{ name: 'series1', data: currentData.chartData }]
  }), [currentData]);

  if (isLoading) {
    return <div className="h-45 bg-grey-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div ref={chartRef} className="relative overflow-hidden rounded-xl p-5 h-45 bg-linear-to-br from-primary-dark to-primary-main">
      {/* Decorative circles */}
      <div className="absolute w-52.5 h-52.5 bg-primary-800 rounded-full -top-21.25 -right-23.75 opacity-80"></div>
      <div className="absolute w-52.5 h-52.5 bg-primary-800 rounded-full -top-31.25 -right-3.75 opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Row - Icon and Toggle */}
        <div className="flex justify-between items-start">
          <div className="w-11 h-11 rounded-lg bg-primary-800 flex items-center justify-center">
            <HiOutlineShoppingBag className="text-white text-2xl" />
          </div>
          <div className="flex rounded-lg overflow-hidden z-10">
            <button 
              className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                timeValue === 'month' 
                  ? 'bg-primary-800 text-white' 
                  : 'bg-transparent text-white/80 hover:text-white'
              }`}
              onClick={() => setTimeValue('month')}
            >
              Month
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                timeValue === 'year' 
                  ? 'bg-primary-800 text-white' 
                  : 'bg-transparent text-white/80 hover:text-white'
              }`}
              onClick={() => setTimeValue('year')}
            >
              Year
            </button>
          </div>
        </div>
        
        {/* Bottom Row - Amount and Chart */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-[2.5rem] font-medium leading-none">
                {animatedTotal}
              </span>
              <div className="w-7 h-7 rounded-full bg-primary-800 flex items-center justify-center">
                <BsArrowDownRight className="text-white text-sm" />
              </div>
            </div>
            <span className="text-primary-200 text-base font-medium">Total Order</span>
          </div>
          <div className="w-35">
            <Chart {...chartData} />
          </div>
        </div>
      </div>
    </div>
  );
});

TotalOrderLineChartCard.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalOrderLineChartCard;