import AdminLayout from '../../../layout/AdminLayout';
import Breadcrumb from '../../../ui/Breadcrumb';
import LeadsTable from '../../../components/lead-management/LeadsTable';

export default function Leads() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Leads"
          items={[
            { label: 'Lead Management', path: '/leads' },
            { label: 'Leads' },
          ]}
        />
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <LeadsTable isLoading={false} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
