import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import AuctionTable from '../../components/auction-management/AuctionTable';

export default function Auctions() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="MSTC Auctions"
          items={[
            { label: 'Auction Management', path: '/auctions' },
            { label: 'MSTC Auctions' },
          ]}
        />
        <div className="grid grid-cols-1 gap-6 overflow-hidden">
          <div className="col-span-1 overflow-hidden">
            <AuctionTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
