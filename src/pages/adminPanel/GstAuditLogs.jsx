// project imports
import AdminLayout from '../../layout/AdminLayout';
import GstAuditTable from '../../components/tax-compliance/GstAuditTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| GST AUDIT LOG PAGE ||============================== //

export default function GstAuditLogs() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="GST Audit Trail"
          items={[
            { label: 'Tax Compliance', path: '/tax/audit' },
            { label: 'GST Audit Trail' },
          ]}
        />

        {/* === GST AUDIT LOG TABLE === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <GstAuditTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
