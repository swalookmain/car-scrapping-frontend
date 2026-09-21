export const LEAD_WIZARD_STEPS = [
  'Lead Details',
  'Vehicle Details',
  'Document 1',
  'Offer',
  'KYC Details',
  'Documents',
  'Close deal',
];

export const VEHICLE_NUMBER_REGEX = /^[A-Za-z0-9]+$/;

const VEHICLE_DOC_TYPES = [
  'vehicleFront',
  'vehicleRight',
  'vehicleEngine',
  'vehicleLeft',
  'vehicleBack',
  'vehicleInterior',
  'rc',
];

const KYC_DOC_TYPES = ['aadhaar', 'pan', 'bankDetail'];

export const normalizeRegistration = (value) =>
  (value || '').toUpperCase().replace(/[\s-]+/g, '');

const undef = (value) => (value === '' || value == null ? undefined : value);

const numOrUndef = (value) => {
  if (value === '' || value == null) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

export function mapLeadToForm(item, initialForm) {
  return {
    ...initialForm,
    name: item.name || '',
    mobileNumber: item.mobileNumber || '',
    location: item.location || '',
    purchaseDate: item.purchaseDate ? String(item.purchaseDate).slice(0, 10) : '',
    leadSource: item.leadSource || 'WEBSITE',
    isOwnerSelf: typeof item.isOwnerSelf === 'boolean' ? item.isOwnerSelf : true,
    vehicleWorkingCondition: item.vehicleWorkingCondition || 'WORKING',
    isInterested: typeof item.isInterested === 'boolean' ? item.isInterested : true,
    ownerName: item.ownerName || '',
    registrationNumber: item.registrationNumber || '',
    vehicleType: item.vehicleType || 'CAR',
    vehicleName: item.vehicleName || '',
    variant: item.variant || '',
    yearOfManufacture: item.yearOfManufacture ?? '',
    color: item.color || '',
    rtoDistrictBranch: item.rtoDistrictBranch || '',
    last5ChassisNumber: item.last5ChassisNumber || '',
    aadhaarNumber: item.aadhaarNumber || '',
    aadhaarLinkedMobileNumber: item.aadhaarLinkedMobileNumber || '',
    email: item.email || '',
    panNumber: item.panNumber || '',
    bankAccountNumber: item.bankAccountNumber || '',
    bankIfscCode: item.bankIfscCode || '',
    bankBranchName: item.bankBranchName || '',
    bankName: item.bankName || '',
    assignedTo: item.assignedTo?._id || item.assignedTo || '',
    remarks: item.remarks || '',
    offerAmount: item.offerAmount ?? '',
    counterAmount: item.counterAmount ?? '',
    dealStatus: item.status || item.dealStatus || 'OPEN',
    closingAmount: item.closingAmount ?? '',
    codNumber: item.codNumber || '',
    codInwardNumber: item.codInwardNumber || '',
    liftingStaffId: item.liftingStaffId?._id || item.liftingStaffId || '',
    expectedArrivalAt: item.expectedArrivalAt
      ? String(item.expectedArrivalAt).slice(0, 10)
      : '',
  };
}

export function buildLeadStepPayload(currentStep, currentForm, { isAdmin = false } = {}) {
  if (currentStep === 0) {
    return {
      name: currentForm.name,
      mobileNumber: currentForm.mobileNumber,
      location: currentForm.location,
      purchaseDate: undef(currentForm.purchaseDate),
      leadSource: currentForm.leadSource,
    };
  }
  if (currentStep === 1) {
    return {
      isOwnerSelf: currentForm.isOwnerSelf,
      vehicleWorkingCondition: currentForm.vehicleWorkingCondition,
      isInterested: currentForm.isInterested,
      ownerName: undef(currentForm.ownerName),
      registrationNumber: undef(normalizeRegistration(currentForm.registrationNumber)),
      vehicleType: undef(currentForm.vehicleType),
      vehicleName: undef(currentForm.vehicleName),
      variant: undef(currentForm.variant),
      yearOfManufacture: numOrUndef(currentForm.yearOfManufacture),
      color: undef(currentForm.color),
      rtoDistrictBranch: undef(currentForm.rtoDistrictBranch),
      last5ChassisNumber: undef(currentForm.last5ChassisNumber),
    };
  }
  if (currentStep === 3) {
    return {
      offerAmount: numOrUndef(currentForm.offerAmount),
      counterAmount: numOrUndef(currentForm.counterAmount),
    };
  }
  return {
    aadhaarNumber: undef(currentForm.aadhaarNumber),
    aadhaarLinkedMobileNumber: undef(currentForm.aadhaarLinkedMobileNumber),
    email: undef(currentForm.email),
    panNumber: undef(currentForm.panNumber),
    bankAccountNumber: undef(currentForm.bankAccountNumber),
    bankIfscCode: undef(currentForm.bankIfscCode),
    bankBranchName: undef(currentForm.bankBranchName),
    bankName: undef(currentForm.bankName),
    ...(isAdmin ? { assignedTo: undef(currentForm.assignedTo) } : {}),
    remarks: undef(currentForm.remarks),
  };
}

export function snapshotStepPayloads(form, { isAdmin = false } = {}) {
  return {
    0: buildLeadStepPayload(0, form, { isAdmin }),
    1: buildLeadStepPayload(1, form, { isAdmin }),
    3: buildLeadStepPayload(3, form, { isAdmin }),
    4: buildLeadStepPayload(4, form, { isAdmin }),
  };
}

export function getPendingStep(nextForm, docs = []) {
  const docsList = Array.isArray(docs) ? docs : [];
  const types = new Set(docsList.map((doc) => doc?.documentType).filter(Boolean));
  const stepOneDone = Boolean(
    nextForm.name?.trim() &&
      /^\d{10}$/.test(nextForm.mobileNumber || '') &&
      nextForm.location?.trim(),
  );
  if (!stepOneDone) return 0;
  const registration = normalizeRegistration(nextForm.registrationNumber);
  const stepTwoDone = Boolean(
    registration &&
      VEHICLE_NUMBER_REGEX.test(registration) &&
      nextForm.yearOfManufacture,
  );
  if (!stepTwoDone) return 1;
  const hasDoc1 = VEHICLE_DOC_TYPES.some((type) => types.has(type));
  if (!hasDoc1) return 2;
  const offerDone =
    nextForm.offerAmount !== '' &&
    nextForm.offerAmount != null &&
    nextForm.counterAmount !== '' &&
    nextForm.counterAmount != null;
  if (!offerDone) return 3;
  const kycDone = Boolean(
    nextForm.aadhaarNumber?.trim() ||
      nextForm.panNumber?.trim() ||
      nextForm.bankAccountNumber?.trim(),
  );
  if (!kycDone) return 4;
  const hasFinalDocs = KYC_DOC_TYPES.some((type) => types.has(type));
  if (!hasFinalDocs) return 5;
  return 6;
}

export function getWizardCompletedLabels(leadOrForm, docs = []) {
  const status = leadOrForm.dealStatus || leadOrForm.status;
  if (status === 'CLOSED' || status === 'CANCELLED') {
    return [...LEAD_WIZARD_STEPS];
  }
  return LEAD_WIZARD_STEPS.slice(0, getPendingStep(leadOrForm, docs));
}
