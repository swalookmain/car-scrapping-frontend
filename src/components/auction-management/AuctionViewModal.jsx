import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import NormalModal from '../../ui/NormalModal';
import DocumentPreview from '../../ui/DocumentPreview';
import { auctionsApi, authorizationLettersApi } from '../../services/api';
import AuthorizationLetterStatus from '../authorization-letters/AuthorizationLetterStatus';
import tokenStorage from '../../services/tokenStorage';

const VIEW_STEPS = ['Auction details', 'Lots & vehicles', 'Documents'];

const VEHICLE_PHOTO_LABELS = {
  vehicleFront: 'Front',
  vehicleRight: 'Right side',
  vehicleEngine: 'Engine',
  vehicleLeft: 'Left side',
  vehicleBack: 'Back / rear',
  vehicleInterior: 'Interior',
};

const DetailGrid = ({ rows }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
    {rows.map(([label, value]) => (
      <Box key={label}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2">{value || '—'}</Typography>
      </Box>
    ))}
  </Box>
);

DetailGrid.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.array).isRequired,
};

const PhotoThumbs = ({ docs, onPreview }) => {
  if (!docs?.length) {
    return (
      <Typography variant="caption" color="text.secondary">
        No photos uploaded
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {docs.map((doc, dIdx) => {
        const src = doc.url || doc.dataUrl || null;
        const name =
          doc.fileName ||
          VEHICLE_PHOTO_LABELS[doc.documentType] ||
          doc.documentType ||
          `Photo ${dIdx + 1}`;
        const mime = doc.mimeType || doc.type || '';
        const isImg =
          mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name || '');
        return (
          <Box
            key={doc._id || doc.storageKey || dIdx}
            onClick={() => src && onPreview({ src, name, mime })}
            sx={{
              width: 72,
              cursor: src ? 'pointer' : 'default',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {isImg && src ? (
              <Box
                component="img"
                src={src}
                alt={name}
                sx={{ width: 72, height: 56, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Box sx={{ p: 0.75 }}>
                <Typography variant="caption" noWrap>
                  {name}
                </Typography>
              </Box>
            )}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 0.5,
                py: 0.25,
                fontSize: '0.65rem',
                bgcolor: 'grey.50',
              }}
              noWrap
            >
              {VEHICLE_PHOTO_LABELS[doc.documentType] || name}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

PhotoThumbs.propTypes = {
  docs: PropTypes.array,
  onPreview: PropTypes.func.isRequired,
};

const AuctionViewModal = ({
  open,
  auction,
  onClose,
  onCreateAuthLetter,
  onViewAuthLetterHtml,
}) => {
  const [step, setStep] = useState(0);
  const [vehicleImages, setVehicleImages] = useState({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [expandedLotId, setExpandedLotId] = useState(null);
  const [lifecycle, setLifecycle] = useState(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);
  const [lifecycleLoaded, setLifecycleLoaded] = useState(false);
  const [preview, setPreview] = useState({
    open: false,
    src: null,
    name: null,
    mime: null,
  });

  const auctionId = auction?._id || auction?.id;

  const resetState = useCallback(() => {
    setStep(0);
    setVehicleImages({});
    setImagesLoaded(false);
    setExpandedLotId(null);
    setLifecycle(null);
    setLifecycleLoaded(false);
    setPreview({ open: false, src: null, name: null, mime: null });
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
      return;
    }
    setStep(0);
    setExpandedLotId(null);
    setLifecycle(null);
    setLifecycleLoaded(false);
    setVehicleImages({});
    setImagesLoaded(false);
  }, [open, auctionId, resetState]);

  const lots = useMemo(
    () => (Array.isArray(auction?.lots) ? auction.lots : []),
    [auction],
  );
  const vehicles = useMemo(
    () => (Array.isArray(auction?.vehicles) ? auction.vehicles : []),
    [auction],
  );

  const vehiclesForLot = useCallback(
    (lotId) =>
      vehicles.filter((v) => String(v.lotId?._id || v.lotId || '') === String(lotId)),
    [vehicles],
  );

  const loadVehicleImages = useCallback(async () => {
    if (!vehicles.length) {
      setVehicleImages({});
      setImagesLoaded(true);
      return;
    }
    setImagesLoading(true);
    const imageMap = {};
    await Promise.all(
      vehicles.map(async (v) => {
        const vid = v._id || v.id;
        if (!vid) return;
        try {
          const imgRes = await auctionsApi.getVehicleImages(vid);
          const docs = Array.isArray(imgRes?.data)
            ? imgRes.data
            : Array.isArray(imgRes?.documents)
              ? imgRes.documents
              : Array.isArray(imgRes)
                ? imgRes
                : [];
          imageMap[vid] = docs;
        } catch {
          imageMap[vid] = [];
        }
      }),
    );
    setVehicleImages(imageMap);
    setImagesLoading(false);
    setImagesLoaded(true);
  }, [vehicles]);

  const loadLifecycle = useCallback(async () => {
    if (!auctionId) return;
    setLifecycleLoading(true);
    try {
      const res = await auctionsApi.getLifecycle(auctionId);
      setLifecycle(res?.data || res);
    } catch {
      setLifecycle(null);
      toast.error('Failed to load lot documents');
    } finally {
      setLifecycleLoading(false);
      setLifecycleLoaded(true);
    }
  }, [auctionId]);

  useEffect(() => {
    if (!open || !auction) return;
    if (step === 1 && !imagesLoaded) {
      loadVehicleImages();
    }
    if (step === 2 && !lifecycleLoaded) {
      loadLifecycle();
    }
  }, [open, auction, step, imagesLoaded, lifecycleLoaded, loadVehicleImages, loadLifecycle]);

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const handlePreview = ({ src, name, mime }) => {
    setPreview({ open: true, src, name, mime });
  };

  const handleViewAuthLetter = async (letterId) => {
    if (onViewAuthLetterHtml) {
      onViewAuthLetterHtml(letterId);
      return;
    }
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(authorizationLettersApi.getPreviewUrl(letterId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const html = await response.text();
      setPreview({
        open: true,
        src: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
        name: 'Authorization letter',
        mime: 'text/html',
      });
    } catch {
      toast.error('Failed to load preview');
    }
  };

  const lifecycleLots = Array.isArray(lifecycle?.lots) ? lifecycle.lots : [];

  const stepTitles = [
    'Auction details',
    'Lots & vehicles',
    'Documents',
  ];

  return (
    <>
      <NormalModal
        open={open}
        onClose={handleClose}
        title={
          auction?.auctionNumber
            ? `Auction — ${auction.auctionNumber}`
            : stepTitles[step] || 'Auction'
        }
        maxWidth="lg"
        actions={(
          <>
            {step > 0 && (
              <Button onClick={() => setStep((s) => s - 1)} sx={{ color: 'var(--color-grey-600)' }}>
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button
                variant="contained"
                onClick={() => setStep((s) => s + 1)}
                sx={{
                  backgroundColor: 'var(--color-secondary-main)',
                  '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  backgroundColor: 'var(--color-secondary-main)',
                  '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
                }}
              >
                Close
              </Button>
            )}
          </>
        )}
      >
        {!auction ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 1 }}>
              {VIEW_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {step === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <AuthorizationLetterStatus
                  auctionId={auctionId}
                  onCreate={(id) => onCreateAuthLetter?.(id || auctionId)}
                  onView={handleViewAuthLetter}
                  onDownload={async (letterId, letterNumber) => {
                    try {
                      await authorizationLettersApi.downloadPdf(
                        letterId,
                        `${letterNumber || 'authorization-letter'}.pdf`,
                      );
                    } catch {
                      toast.error('Download failed');
                    }
                  }}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Auction
                  </Typography>
                  <DetailGrid
                    rows={[
                      ['Auction number', auction.auctionNumber],
                      ['Buyer ref', auction.buyerReferenceNumber],
                      ['Auctioneer', auction.auctionerName],
                      ['Status', auction.status],
                      [
                        'Auction date',
                        auction.auctionDate
                          ? new Date(auction.auctionDate).toLocaleDateString()
                          : null,
                      ],
                      [
                        'Start',
                        auction.startDateTime
                          ? new Date(auction.startDateTime).toLocaleString()
                          : null,
                      ],
                      [
                        'End',
                        auction.endDateTime
                          ? new Date(auction.endDateTime).toLocaleString()
                          : null,
                      ],
                      [
                        'Inspection from',
                        auction.inspectionFromDate
                          ? new Date(auction.inspectionFromDate).toLocaleDateString()
                          : null,
                      ],
                      [
                        'Inspection to',
                        auction.inspectionToDate
                          ? new Date(auction.inspectionToDate).toLocaleDateString()
                          : null,
                      ],
                      [
                        'Vehicle location',
                        auction.vehicleLocation || auction.auctionLocation,
                      ],
                      [
                        'Auction location',
                        auction.auctionLocation || auction.yardLocation,
                      ],
                    ]}
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Seller
                  </Typography>
                  <DetailGrid
                    rows={[
                      ['Name', auction.sellerName],
                      ['Mobile', auction.sellerMobileNumber],
                      ['Email', auction.sellerEmail],
                      ['Account number', auction.sellerAccountNumber],
                      ['Tax mode', auction.sellerTaxMode],
                    ]}
                  />
                </Box>

                {Array.isArray(auction.officers) && auction.officers.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Officers
                      </Typography>
                      {auction.officers.map((officer, idx) => (
                        <Box
                          key={officer._id || idx}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {officer.name || `Officer ${idx + 1}`}
                            {officer.officerType ? ` · ${officer.officerType}` : ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[officer.phoneNumber, officer.email].filter(Boolean).join(' · ') ||
                              '—'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {step === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Lot status and vehicles. Open a lot to see vehicle details and photos.
                </Typography>
                {imagesLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                {!lots.length && (
                  <Typography variant="body2" color="text.secondary">
                    No lots
                  </Typography>
                )}
                {lots.map((lot, lotIdx) => {
                  const lotId = String(lot._id || lot.id || '');
                  const lotVehicles = vehiclesForLot(lotId);
                  const expanded = expandedLotId === lotId;
                  return (
                    <Paper key={lotId || lotIdx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight={700}>
                            {lot.lotName || lot.lotNumber || `Lot ${lotIdx + 1}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[
                              lot.lotNumber ? `No. ${lot.lotNumber}` : null,
                              `${lotVehicles.length || lot.vehicleCount || 0} vehicles`,
                              lot.preEmdAmount != null && lot.preEmdAmount !== ''
                                ? `Pre-EMD ₹${lot.preEmdAmount}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          {lot.outcomeStatus && (
                            <Chip size="small" label={lot.outcomeStatus} color="primary" variant="outlined" />
                          )}
                          {lot.status && (
                            <Chip size="small" label={lot.status} variant="outlined" />
                          )}
                          <Button
                            size="small"
                            variant={expanded ? 'contained' : 'outlined'}
                            onClick={() =>
                              setExpandedLotId(expanded ? null : lotId)
                            }
                            sx={{ textTransform: 'none' }}
                          >
                            {expanded ? 'Hide vehicles' : 'View vehicles'}
                          </Button>
                        </Box>
                      </Box>

                      {expanded && (
                        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                          {!lotVehicles.length && (
                            <Typography variant="caption" color="text.secondary">
                              No vehicles in this lot
                            </Typography>
                          )}
                          {lotVehicles.map((veh, vIdx) => {
                            const vid = veh._id || veh.id;
                            const docs = vehicleImages[vid] || [];
                            return (
                              <Box
                                key={vid || vIdx}
                                sx={{
                                  mb: 1.5,
                                  pb: 1.5,
                                  borderBottom:
                                    vIdx < lotVehicles.length - 1
                                      ? '1px solid'
                                      : 'none',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="body2" fontWeight={600}>
                                  {[veh.make, veh.model || veh.vehicleModel, veh.variant]
                                    .filter(Boolean)
                                    .join(' ') || `Vehicle ${vIdx + 1}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {[
                                    veh.vehicleNumber || veh.registrationNumber,
                                    veh.vehicleType,
                                    veh.color,
                                    veh.yearOfManufacture,
                                    veh.chassisLast5
                                      ? `Chassis …${veh.chassisLast5}`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                                </Typography>
                                <PhotoThumbs docs={docs} onPreview={handlePreview} />
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}

            {step === 2 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Lot-wise documents: gate pass, RCM, acceptance letter, delivery, and payment summary.
                </Typography>
                {lifecycleLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                )}
                {!lifecycleLoading && !lifecycleLots.length && (
                  <Typography variant="body2" color="text.secondary">
                    No lot document data found.
                  </Typography>
                )}
                {lifecycleLots.map((lot, idx) => {
                  const lotId = lot._id || lot.id;
                  const label = lot.lotName || lot.lotNumber || `Lot ${idx + 1}`;
                  const paymentStatus = lot.payment?.paymentStatus;
                  const gateUrl = lot.gatePassDocumentUrl;
                  const rcm = lot.rcm;
                  const acceptance = lot.acceptanceLetter;
                  const delivery = lot.delivery;
                  return (
                    <Paper key={lotId || idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          alignItems: 'center',
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="body1" fontWeight={700} sx={{ mr: 1 }}>
                          {label}
                        </Typography>
                        {lot.outcomeStatus && (
                          <Chip size="small" label={lot.outcomeStatus} color="primary" />
                        )}
                        {paymentStatus && (
                          <Chip size="small" label={`Payment: ${paymentStatus}`} variant="outlined" />
                        )}
                      </Box>

                      <DetailGrid
                        rows={[
                          [
                            'Deal amount',
                            lot.deal?.totalAmount != null
                              ? `₹${Number(lot.deal.totalAmount).toLocaleString('en-IN')}`
                              : null,
                          ],
                          [
                            'Amount paid',
                            lot.payment?.amountPaidTotal != null
                              ? `₹${Number(lot.payment.amountPaidTotal).toLocaleString('en-IN')}`
                              : null,
                          ],
                          [
                            'Amount left',
                            lot.payment?.amountLeft != null
                              ? `₹${Number(lot.payment.amountLeft).toLocaleString('en-IN')}`
                              : null,
                          ],
                          [
                            'Delivery approved',
                            delivery?.approved === true
                              ? 'Yes'
                              : delivery?.approved === false
                                ? 'No'
                                : null,
                          ],
                          [
                            'Lifting date',
                            delivery?.liftingDate
                              ? new Date(delivery.liftingDate).toLocaleDateString()
                              : null,
                          ],
                        ]}
                      />

                      <Divider sx={{ my: 1.5 }} />

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Documents &amp; compliance
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Gate pass
                          </Typography>
                          <Typography variant="body2">
                            {lot.gatePass?.gatePassDate
                              ? `Date: ${new Date(lot.gatePass.gatePassDate).toLocaleDateString()}`
                              : 'No gate pass date'}
                            {gateUrl ? (
                              <>
                                {' · '}
                                <Link
                                  href={gateUrl}
                                  target="_blank"
                                  rel="noopener"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePreview({
                                      src: gateUrl,
                                      name: `Gate pass — ${label}`,
                                      mime: '',
                                    });
                                  }}
                                >
                                  View document
                                </Link>
                              </>
                            ) : (
                              ' · No file'
                            )}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Acceptance letter
                          </Typography>
                          <Typography variant="body2">
                            {acceptance?.received
                              ? [
                                  'Received',
                                  acceptance.letterNumber,
                                  acceptance.receivedDate
                                    ? new Date(acceptance.receivedDate).toLocaleDateString()
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')
                              : 'Not received'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            RCM
                          </Typography>
                          <Typography variant="body2">
                            {rcm?.challanNumber
                              ? [
                                  `Challan ${rcm.challanNumber}`,
                                  rcm.amount != null
                                    ? `₹${Number(rcm.amount).toLocaleString('en-IN')}`
                                    : null,
                                  rcm.transactionDate
                                    ? new Date(rcm.transactionDate).toLocaleDateString()
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')
                              : 'No RCM details'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Authorization letter
                  </Typography>
                  <AuthorizationLetterStatus
                    auctionId={auctionId}
                    onCreate={(id) => onCreateAuthLetter?.(id || auctionId)}
                    onView={handleViewAuthLetter}
                    onDownload={async (letterId, letterNumber) => {
                      try {
                        await authorizationLettersApi.downloadPdf(
                          letterId,
                          `${letterNumber || 'authorization-letter'}.pdf`,
                        );
                      } catch {
                        toast.error('Download failed');
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </NormalModal>

      <DocumentPreview
        open={preview.open}
        onClose={() => setPreview({ open: false, src: null, name: null, mime: null })}
        src={preview.src}
        name={preview.name}
        mime={preview.mime}
      />
    </>
  );
};

AuctionViewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  auction: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onCreateAuthLetter: PropTypes.func,
  onViewAuthLetterHtml: PropTypes.func,
};

export default AuctionViewModal;
