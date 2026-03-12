import PropTypes from 'prop-types';
import { HiOutlineTableCells } from 'react-icons/hi2';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

const TotalIncomeDarkCard = ({ isLoading }) => {
  const animatedTotal = useAnimatedNumber(203, 800, '$', 'k', 0);

  if (isLoading) {
    return <div className="h-20 bg-grey-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl py-4 px-4 bg-linear-to-br from-primary-dark to-primary-main">
      {/* Decorative circles */}
      <div className="absolute w-45 h-45 bg-primary-800 rounded-full -top-17.5 -right-20 opacity-80"></div>
      <div className="absolute w-45 h-45 bg-primary-800 rounded-full -top-25 -right-2.5 opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-primary-800 flex items-center justify-center shrink-0">
          <HiOutlineTableCells className="text-white text-2xl" />
        </div>
        <div>
          <span className="text-white text-xl font-semibold block">{animatedTotal}</span>
          <span className="text-primary-200 text-sm">Total Income</span>
        </div>
      </div>
    </div>
  );
};

TotalIncomeDarkCard.propTypes = {
  isLoading: PropTypes.bool
};

export default TotalIncomeDarkCard;