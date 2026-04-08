import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, Button, Divider, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { leadsApi } from '../../services/api';
import NormalModal from '../../ui/NormalModal';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import LeadForm from './LeadForm';
import LeadDocumentForm from './LeadDocumentForm';
import getLeadColumns from './leadColumns';

const SectionLabel = ({ children }) => (
  <Typography
    variant="subtitle2"
    sx={{ fontWeight: 600, color: 'var(--color-grey-700)', textTransform: 'uppercase', letterSpacing: 0.5, mt: 1 }}
  >
    {children}
  </Typography>
);

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const LeadsTable = ({ isLoading }) => {
  const queryClient = useQueryClient();
  const tableRef = useRef(null);
  const leadFormRef = useRef(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewItem, setViewItem] = useState(null);
  const [documentLead, setDocumentLead] = useState(null);

  const { data, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['leads', page, rowsPerPage, query],
    queryFn: async () => {
      const res = await leadsApi.getAll({
        page: page + 1,
        limit: rowsPerPage,
        q: query || undefined,
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      return {
        data: items.map((item) => ({
          ...item,
          id: item._id || item.id,
          assignedToName: item.assignedTo?.name || '',
        })),
        total: res?.meta?.total ?? items.length,
      };
    },
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo(
    () =>
      getLeadColumns({
        onView: async (row) => {
          try {
            const details = await leadsApi.getById(row.id);
            setViewItem(details?.data || details);
          } catch {
            setViewItem(row);
          }
        },
        onEdit: (row) => {
          leadFormRef.current?.open(row);
        },
      }),
    [],
  );

  const handleSubmit = async (payload, editingId) => {
    try {
      if (editingId) {
        await leadsApi.update(editingId, payload);
        if (payload.assignedTo) {
          await leadsApi.assign(editingId, payload.assignedTo);
        }
        toast.success('Lead updated successfully');
      } else {
        await leadsApi.create(payload);
        toast.success('Lead created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      console.error(error);
      toast.error('Failed to save lead');
    }
  };

  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search leads..."
      searchValue={query}
      onSearchChange={(value) => {
        setQuery(value);
        setPage(0);
      }}
      onCopy={() => {}}
      onPrint={() => window.print()}
      showFilter={false}
      showRefresh
      onRefresh={refetch}
      onAdd={() => leadFormRef.current?.open()}
      showExportCsv
      onExportCsv={() => tableRef.current?.exportCsv()}
      showColumnToggle
      onToggleColumns={(event) => tableRef.current?.openColumnToggle(event)}
    />
  );

  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="leads"
        columns={columns}
        data={rows}
        isLoading={isLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={false}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={(nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(nextRows) => {
          setRowsPerPage(nextRows);
          setPage(0);
        }}
      />

      <LeadForm ref={leadFormRef} onSubmit={handleSubmit} />

      <LeadDocumentForm
        open={Boolean(documentLead)}
        leadName={documentLead?.name}
        onClose={() => setDocumentLead(null)}
        onSubmit={async (formData) => {
          if (!documentLead?.id) return;
          await leadsApi.uploadDocuments(documentLead.id, formData);
          toast.success('Lead documents uploaded');
        }}
      />

      <NormalModal
        open={Boolean(viewItem)}
        onClose={() => setViewItem(null)}
        title={viewItem ? `Lead Details - ${viewItem.name}` : 'Lead Details'}
        maxWidth="md"
        actions={
          <>
            {viewItem?.status !== 'CLOSED' && (
              <Button onClick={() => setDocumentLead(viewItem)}>
                Upload Documents
              </Button>
            )}
            <Button variant="contained" onClick={() => setViewItem(null)}>
              Close
            </Button>
          </>
        }
      >
        {viewItem && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <SectionLabel>Lead Information</SectionLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1.5 }}>
                {[
                  ['Lead Name', viewItem.name],
                  ['Mobile', viewItem.mobileNumber],
                  ['Email', viewItem.email || '—'],
                  ['Location', viewItem.location || '—'],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <FieldLabel>{label}</FieldLabel>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: label === 'Lead Name' ? 600 : 400 }}>
                      {value}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <SectionLabel>Vehicle Details</SectionLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1.5 }}>
                {[
                  ['Vehicle', viewItem.vehicleName],
                  ['Variant', viewItem.variant?.replaceAll('_', ' ')],
                  ['Registration', viewItem.registrationNumber || '—'],
                  ['Last 5 Chassis', viewItem.last5ChassisNumber || '—'],
                  ['Year of Mfg', viewItem.yearOfManufacture || '—'],
                  ['RTO / District', viewItem.rtoDistrictBranch || '—'],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <FieldLabel>{label}</FieldLabel>
                    <Typography variant="body2" sx={{ mt: 0.5, fontFamily: label.includes('Chassis') || label.includes('Registration') ? 'monospace' : 'inherit' }}>
                      {value}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box>
              <SectionLabel>Owner & Source Information</SectionLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1.5 }}>
                {[
                  ['Owner Type', viewItem.isOwnerSelf ? 'Self' : 'Other'],
                  ['Lead Source', viewItem.leadSource?.replaceAll('_', ' ') || 'WEBSITE'],
                  ['Assigned Staff', viewItem.assignedTo?.name || 'Unassigned'],
                  ['Purchase Date', viewItem.purchaseDate ? new Date(viewItem.purchaseDate).toLocaleDateString() : '—'],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <FieldLabel>{label}</FieldLabel>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {value}
                    </Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {viewItem.remarks && (
              <Box>
                <SectionLabel>Remarks</SectionLabel>
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', mt: 1.5 }}>
                  <Typography variant="body2" sx={{ color: 'var(--color-grey-800)', lineHeight: 1.6 }}>
                    {viewItem.remarks}
                  </Typography>
                </Box>
              </Box>
            )}

            {Array.isArray(viewItem.documents) && viewItem.documents.length > 0 && (
              <Box>
                <SectionLabel>Documents</SectionLabel>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  {viewItem.documents.map((document) => (
                    <Button
                      key={document._id || document.id || document.url}
                      variant="outlined"
                      size="small"
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                      {document.documentType?.replaceAll('_', ' ')} {document.pageSide ? `(${document.pageSide})` : ''}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </NormalModal>
    </>
  );
};

LeadsTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default LeadsTable;
