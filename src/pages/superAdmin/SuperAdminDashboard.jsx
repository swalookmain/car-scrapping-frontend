
import React from 'react';
import OrganizationManagement from './OrganizationManagement';
import AdminManagement from './AdminManagement';
import SuperAdminLayout from '../../layout/SuperAdminLayout';

const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <h1 className="text-base font-semibold mb-2">Super Admin Panel</h1>
        <OrganizationManagement />
        <AdminManagement />
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
