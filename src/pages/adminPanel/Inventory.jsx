// project imports
import AdminLayout from '../../layout/AdminLayout';
import InventoryTable from '../../components/inventory-management/InventoryTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| INVENTORY MANAGEMENT PAGE ||============================== //

export default function Inventory() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Inventory Management"
          items={[
            { label: 'Inventory', path: '/inventory' },
            { label: 'Parts Inventory' },
          ]}
        />

        {/* === INVENTORY TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <InventoryTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
