import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import LetterSettingsForm from '../../components/authorization-letters/LetterSettingsForm';

export default function LetterSettings() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Letter Settings"
          items={[
            { label: 'Settings', path: '/settings/letter' },
            { label: 'Letterhead' },
          ]}
        />
        <LetterSettingsForm />
      </div>
    </AdminLayout>
  );
}
