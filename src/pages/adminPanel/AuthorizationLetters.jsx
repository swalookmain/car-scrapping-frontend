import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import AuthorizationLetterWizard from '../../components/authorization-letters/AuthorizationLetterWizard';
import { authorizationLettersApi } from '../../services/api';
import tokenStorage from '../../services/tokenStorage';

const statusColor = (status) => {
  if (status === 'GENERATED') return 'success';
  if (status === 'DRAFT') return 'warning';
  return 'default';
};

export default function AuthorizationLetters() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['authorization-letters'],
    queryFn: () => authorizationLettersApi.list(),
  });

  const letters = useMemo(() => {
    const items = data?.data ?? data ?? [];
    return items.map((row) => ({ ...row, id: row._id || row.id }));
  }, [data]);

  const openPreview = async (id) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(authorizationLettersApi.getPreviewUrl(id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      setPreviewHtml(await response.text());
    } catch {
      toast.error('Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const columns = [
    { field: 'letterNumber', headerName: 'Letter No.', width: '18%' },
    { field: 'auctionNumber', headerName: 'Auction', width: '16%' },
    {
      field: 'status',
      headerName: 'Status',
      width: '12%',
      render: (row) => (
        <Chip size="small" label={row.status || '—'} color={statusColor(row.status)} />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: '16%',
      render: (row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '20%',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => openPreview(row.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton
              size="small"
              onClick={async () => {
                try {
                  await authorizationLettersApi.downloadPdf(
                    row.id,
                    `${row.letterNumber || 'authorization-letter'}.pdf`,
                  );
                  refetch();
                } catch {
                  toast.error('Download failed');
                }
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb title="Authorization Letters" items={[{ label: 'Authorization Letters' }]} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setWizardOpen(true)}>
            Create letter
          </Button>
        </Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : (
          <NormalTable columns={columns} data={letters} />
        )}
      </div>

      <AuthorizationLetterWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          refetch();
        }}
      />

      <NormalModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Letter preview"
        maxWidth="lg"
      >
        {previewLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box
            sx={{ border: '1px solid #ddd', borderRadius: 2, maxHeight: 520, overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </NormalModal>
    </AdminLayout>
  );
}
