// project imports
import AdminLayout from '../../layout/AdminLayout';
import LedgerViewer from '../../components/accounting/LedgerViewer';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| LEDGER PAGE ||============================== //

export default function Ledger() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="General Ledger"
          items={[
            { label: 'Accounting', path: '/accounting' },
            { label: 'General Ledger' },
          ]}
        />
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <LedgerViewer />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
