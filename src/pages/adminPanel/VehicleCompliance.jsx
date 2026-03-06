// project imports
import AdminLayout from '../../layout/AdminLayout';
import ComplianceTable from '../../components/vehicle-compliance/ComplianceTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| VEHICLE COD COMPLIANCE PAGE ||============================== //

export default function VehicleCompliance() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Vehicle COD Compliance"
          items={[
            { label: 'Vehicle Compliance', path: '/vehicle-compliance' },
            { label: 'COD Tracking' },
          ]}
        />

        {/* === COMPLIANCE TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <ComplianceTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
