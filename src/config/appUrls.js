/** Marketing website (scrap-niti-landing) */
export const LANDING_BASE_URL =
  import.meta.env.VITE_LANDING_BASE_URL || 'http://localhost:5174';

export const LANDING_HOME_URL = LANDING_BASE_URL;
export const LANDING_CONTACT_URL = `${LANDING_BASE_URL}/#contact`;

export const SIGNUP_URL = '/signup';
export const SIGNUP_FROM_LANDING_URL = '/signup?from=landing';
