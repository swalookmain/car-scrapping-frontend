// project imports
import AdminLayout from '../../layout/AdminLayout';
import InvoiceTable from '../../components/invoice-management/InvoiceTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| PURCHASE INVOICE MANAGEMENT PAGE ||============================== //

export default function Invoice() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Purchase Invoices"
          items={[
            { label: 'Invoice Management', path: '/invoices' },
            { label: 'Purchase Invoices' },
          ]}
        />

        {/* === INVOICE TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <InvoiceTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
