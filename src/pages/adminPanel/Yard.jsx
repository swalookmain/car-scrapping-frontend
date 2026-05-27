import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import YardTable from '../../components/yard-management/YardTable';

export default function Yard() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Yard Management"
          items={[
            { label: 'Operations', path: '/yard' },
            { label: 'Yard' },
          ]}
        />
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <YardTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
