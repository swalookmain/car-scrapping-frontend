
import React from 'react';
import OrganizationManagement from './OrganizationManagement';
import AdminManagement from './AdminManagement';
import SuperAdminLayout from '../../layout/SuperAdminLayout';

const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4">Super Admin Panel</h1>
        <OrganizationManagement />
        <AdminManagement />
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
