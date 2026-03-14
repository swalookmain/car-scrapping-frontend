// project imports
import AdminLayout from '../../layout/AdminLayout';
import AccountsDashboard from '../../components/accounting/AccountsDashboard';
import ChartOfAccounts from '../../components/accounting/ChartOfAccounts';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| ACCOUNTING OVERVIEW PAGE ||============================== //

export default function AccountingOverview() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Accounting"
          items={[
            { label: 'Accounting', path: '/accounting' },
            { label: 'Overview' },
          ]}
        />
        <AccountsDashboard />
        <ChartOfAccounts />
      </div>
    </AdminLayout>
  );
}
