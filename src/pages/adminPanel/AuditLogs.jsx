import AdminLayout from '../../layout/AdminLayout';
import AuditLogsTable from '../../components/audit-logs/AuditLogsTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| ADMIN AUDIT LOGS PAGE ||============================== //

export default function AuditLogs() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Audit Logs"
          items={[
            { label: 'Audit Logs', path: '/audit-logs' },
            { label: 'Staff Activity' }
          ]}
        />

        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <AuditLogsTable isLoading={isLoading} variant="admin" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
