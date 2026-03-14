/**
 * Central Tax Engine — reusable GST calculation logic for both
 * purchase and sales invoices.
 *
 * Rules:
 *  1. If GST not applicable → all tax fields = 0
 *  2. If RCM = true → tax is computed but NOT added to payable
 *  3. Intra-state  → CGST + SGST (rate/2 each), IGST = 0
 *  4. Inter-state  → IGST = rate, CGST = SGST = 0
 */

/**
 * @typedef {Object} GstBreakup
 * @property {number} taxableAmount
 * @property {number} cgstAmount
 * @property {number} sgstAmount
 * @property {number} igstAmount
 * @property {number} totalTaxAmount
 * @property {boolean} isInterstate
 * @property {boolean} rcmApplied
 * @property {number} totalPayable — taxable + tax (0 if RCM)
 */

/**
 * Calculate structured GST breakup.
 *
 * @param {Object} params
 * @param {number}  params.taxableAmount
 * @param {number}  params.gstRate      – e.g. 18 for 18%
 * @param {boolean} params.gstApplicable
 * @param {string}  params.orgStateCode – organisation state code
 * @param {string}  params.placeOfSupplyState – buyer / supply state code
 * @param {boolean} params.reverseCharge
 * @returns {GstBreakup}
 */
export function calculateGst({
  taxableAmount = 0,
  gstRate = 0,
  gstApplicable = false,
  orgStateCode = '',
  placeOfSupplyState = '',
  reverseCharge = false,
}) {
  const base = Number(taxableAmount) || 0;
  const rate = Number(gstRate) || 0;

  // Not applicable → zero breakup
  if (!gstApplicable || rate <= 0) {
    return {
      taxableAmount: base,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTaxAmount: 0,
      isInterstate: false,
      rcmApplied: false,
      totalPayable: base,
    };
  }

  const isInterstate =
    orgStateCode && placeOfSupplyState
      ? orgStateCode.toUpperCase() !== placeOfSupplyState.toUpperCase()
      : false;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterstate) {
    igst = round2(base * (rate / 100));
  } else {
    cgst = round2(base * (rate / 200)); // rate / 2 / 100
    sgst = round2(base * (rate / 200));
  }

  const totalTax = round2(cgst + sgst + igst);

  return {
    taxableAmount: base,
    cgstAmount: cgst,
    sgstAmount: sgst,
    igstAmount: igst,
    totalTaxAmount: totalTax,
    isInterstate,
    rcmApplied: Boolean(reverseCharge),
    totalPayable: reverseCharge ? base : round2(base + totalTax),
  };
}

/**
 * Format a currency value to Indian locale.
 */
export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Round to 2 decimal places.
 */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Indian state codes list for dropdowns.
 */
export const INDIAN_STATE_CODES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '25', name: 'Daman & Diu' },
  { code: '26', name: 'Dadra & Nagar Haveli' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' },
];

/**
 * Transport modes for E-Way Bill.
 */
export const TRANSPORT_MODES = ['ROAD', 'RAIL', 'AIR', 'SHIP'];

export default calculateGst;
