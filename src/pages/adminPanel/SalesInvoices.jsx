// project imports
import AdminLayout from '../../layout/AdminLayout';
import SalesInvoiceTable from '../../components/sales-dispatch/SalesInvoiceTable';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| SALES INVOICES PAGE ||============================== //

export default function SalesInvoices() {
  const isLoading = false;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Sales Invoices"
          items={[
            { label: 'Sales & Dispatch', path: '/sales/invoices' },
            { label: 'Sales Invoices' },
          ]}
        />

        {/* === SALES INVOICE TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <SalesInvoiceTable isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
