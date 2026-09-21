import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import LiftingTable from '../../components/lifting/LiftingTable';

export default function Lifting() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Lifting Vehicles"
          items={[
            { label: 'Operations', path: '/yard' },
            { label: 'Lifting' },
          ]}
        />
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <LiftingTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
