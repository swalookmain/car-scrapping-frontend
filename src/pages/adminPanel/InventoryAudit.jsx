import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import InventoryAuditPage from './InventoryAuditPage';

export default function InventoryAudit() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Inventory Audit"
          items={[
            { label: 'Inventory', path: '/inventory' },
            { label: 'Inventory Audit' },
          ]}
        />
        <InventoryAuditPage />
      </div>
    </AdminLayout>
  );
}
