// project imports
import AdminLayout from '../../layout/AdminLayout';
import GstSummaryDashboard from '../../components/tax-compliance/GstSummaryDashboard';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| GST SUMMARY PAGE ||============================== //

export default function GstSummary() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="GST Summary"
          items={[
            { label: 'Tax Compliance', path: '/tax/summary' },
            { label: 'GST Summary' },
          ]}
        />

        {/* === GST SUMMARY DASHBOARD === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <GstSummaryDashboard />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
