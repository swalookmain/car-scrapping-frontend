import { useEffect, useState } from 'react';

// project imports
import AdminLayout from '../../layout/AdminLayout';
import StaffTable from '../../components/staff-management/StaffTable';
import Breadcrumb from '../../ui/Breadcrumb';
import { useAuth } from '../../context/AuthContext';

// ==============================|| STAFF MANAGEMENT PAGE ||============================== //

export default function Staff() {
  const [isLoading, setLoading] = useState(true);
  const { user } = useAuth();
  // try common fields that may contain organization id (server responses vary)
  const organizationId = user?.organizationId ?? user?.organization?._id ?? user?.organization ?? user?.orgId ?? user?.org?.id ?? null;

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumb */}
        <Breadcrumb
          title="Staff List"
          items={[
            { label: 'Staff Management', path: '/staff' },
            { label: 'Staff List' }
          ]}
        />

        {/* === STAFF TABLE SECTION === */}
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          {/* Staff Table */}
          <div className="col-span-1 overflow-hidden">
            <StaffTable isLoading={isLoading} organizationId={organizationId} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
