import { useEffect, useState } from 'react';

// project imports
import AdminLayout from '../../layout/AdminLayout';
import EarningCard from '../../components/dashboard/EarningCard';
import PopularCard from '../../components/dashboard/PopularCard';
import TotalOrderLineChartCard from '../../components/dashboard/TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../components/dashboard/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../components/dashboard/TotalIncomeLightCard';
import TotalGrowthBarChart from '../../components/dashboard/TotalGrowthBarChart';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">

        {/* === TOP SECTION (Cards) === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Purple Card (Earning) */}
          <div className="sm:col-span-1 lg:col-span-4">
            <EarningCard isLoading={isLoading} />
          </div>
          
          {/* Blue Card (Total Order) */}
          <div className="sm:col-span-1 lg:col-span-4">
            <TotalOrderLineChartCard isLoading={isLoading} />
          </div>
          
          {/* Right Column (Stacked Income Cards) */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 h-full">
              {/* Dark Income Card */}
              <TotalIncomeDarkCard isLoading={isLoading} />
              
              {/* Light Income Card */}
              <TotalIncomeLightCard
                isLoading={isLoading}
                total={203}
                label="Total Income"
              />
            </div>
          </div>
        </div>

        {/* === BOTTOM SECTION (Charts) === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          {/* Big Bar Chart (Total Growth) */}
          <div className="lg:col-span-8 overflow-hidden">
            <TotalGrowthBarChart isLoading={isLoading} />
          </div>
          
          {/* Right List (Popular Stocks) */}
          <div className="lg:col-span-4 overflow-hidden">
            <PopularCard isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}