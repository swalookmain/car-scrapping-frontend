// project imports
import AdminLayout from '../../layout/AdminLayout';
import ProfitAndLoss from '../../components/accounting/ProfitAndLoss';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| P&L REPORT PAGE ||============================== //

export default function PnlReport() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Profit & Loss"
          items={[
            { label: 'Accounting', path: '/accounting' },
            { label: 'Profit & Loss' },
          ]}
        />
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <ProfitAndLoss />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
