// project imports
import AdminLayout from '../../layout/AdminLayout';
import TaxConfigForm from '../../components/tax-compliance/TaxConfigForm';
import Breadcrumb from '../../ui/Breadcrumb';

// ==============================|| TAX CONFIGURATION PAGE ||============================== //

export default function TaxConfig() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Tax Configuration"
          items={[
            { label: 'Tax Compliance', path: '/tax/config' },
            { label: 'Configuration' },
          ]}
        />

        {/* === TAX CONFIG FORM === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <TaxConfigForm />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
