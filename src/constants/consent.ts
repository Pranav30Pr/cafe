// Consent constants as required by PROJECT_SPEC.md Section 7.6

export const CONSENT_VERSION = 'v1.0';

export const CONSENT_TEXTS = {
  version: CONSENT_VERSION,
  // Order contact notice (not a checkbox, displayed directly above the submit button)
  orderContactNotice:
    'We use your name and mobile number only to identify and contact you about this order. See our Privacy Policy.',
  // Marketing checkbox (unticked by default, optional)
  marketingCheckbox: (cafeName: string) =>
    `I agree to receive offers and updates from ${cafeName} on WhatsApp. I am 18 or older. I can withdraw this at any time.`,
};

export const PRICE_NOTICE = 'Prices are in INR [[CLIENT_TO_PROVIDE: inclusive or exclusive of taxes]].';
