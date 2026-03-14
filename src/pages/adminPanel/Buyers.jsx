// project imports
import AdminLayout from '../../layout/AdminLayout';
import BuyerTable from '../../components/sales-dispatch/BuyerTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| BUYER MASTER PAGE ||============================== //

export default function Buyers() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Buyer Master"
          items={[
            { label: 'Sales & Dispatch', path: '/sales/invoices' },
            { label: 'Buyers' },
          ]}
        />

        {/* === BUYER TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <BuyerTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
