// project imports
import AdminLayout from '../../layout/AdminLayout';
import DamageAdjustmentsTable from '../../components/damage-adjustments/DamageAdjustmentsTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| DAMAGE ADJUSTMENTS PAGE ||============================== //

export default function DamageAdjustments() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Damaged Parts Tracking"
          items={[
            { label: 'Inventory', path: '/inventory' },
            { label: 'Damage Adjustments' },
          ]}
        />

        {/* === DAMAGE ADJUSTMENTS TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <DamageAdjustmentsTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
