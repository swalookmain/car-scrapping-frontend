import PropTypes from 'prop-types';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';
import useAnimatedNumber from '../../hooks/useAnimatedNumber';

const TotalIncomeLightCard = ({ isLoading, total, label }) => {
  const animatedTotal = useAnimatedNumber(total, 800, '$', 'k', 0);

  if (isLoading) {
    return <div className="h-20 bg-grey-200 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl py-4 px-4 bg-paper" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
      {/* Decorative circles */}
      <div className="absolute w-45 h-45 bg-warning-light rounded-full -top-17.5 -right-20"></div>
      <div className="absolute w-45 h-45 bg-warning-light rounded-full -top-25 -right-2.5 opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-warning-light flex items-center justify-center shrink-0">
          <HiOutlineBuildingStorefront className="text-warning-dark text-2xl" />
        </div>
        <div>
          <span className="text-grey-900 text-xl font-semibold block">{animatedTotal}</span>
          <span className="text-grey-500 text-sm">{label}</span>
        </div>
      </div>
    </div>
  );
};

TotalIncomeLightCard.propTypes = {
  isLoading: PropTypes.bool,
  total: PropTypes.number,
  label: PropTypes.string
};

export default TotalIncomeLightCard;