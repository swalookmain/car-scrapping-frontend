// project imports
import AdminLayout from '../../layout/AdminLayout';
import EwayBillTable from '../../components/tax-compliance/EwayBillTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| E-WAY BILLS PAGE ||============================== //

export default function EwayBills() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="E-Way Bills"
          items={[
            { label: 'Tax Compliance', path: '/tax/eway-bills' },
            { label: 'E-Way Bills' },
          ]}
        />

        {/* === E-WAY BILL TABLE === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <EwayBillTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
