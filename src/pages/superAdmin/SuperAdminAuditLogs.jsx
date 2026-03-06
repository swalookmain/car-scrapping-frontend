import SuperAdminLayout from '../../layout/SuperAdminLayout';
import AuditLogsTable from '../../components/audit-logs/AuditLogsTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| SUPER ADMIN AUDIT LOGS PAGE ||============================== //

export default function SuperAdminAuditLogs() {
  const isLoading = false;

  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Audit Logs"
          items={[
            { label: 'Audit Logs', path: '/super-admin/audit-logs' },
            { label: 'All Activity' }
          ]}
        />

        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <AuditLogsTable isLoading={isLoading} variant="superadmin" />
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
