/**
 * Legal information for the Impressum, Datenschutzerklärung, and
 * Barrierefreiheitserklärung pages.
 *
 * !!! FILL IN THESE PLACEHOLDERS BEFORE GOING LIVE !!!
 *
 * Required under § 5 TMG (Germany) and Art. 13/14 GDPR.
 */

export const legal = {
  operator: {
    name: 'Tobias Treppmann',
    // Replace with your legal postal address:
    street: 'MUSTERSTRASSE 1',
    postcode: '00000',
    city: 'MUSTERSTADT',
    country: 'Deutschland',
    // Replace / remove if not applicable:
    phone: 'auf Anfrage / available on request',
    email: { user: 'tobias', domain: 'missional', tld: 'design' },
    // Optional – include only if you have them:
    vatId: '', // e.g. 'DE123456789'
    taxNumber: '', // Steuernummer, e.g. '123/456/7890'
  },

  /**
   * Person responsible for editorial content (§ 18 Abs. 2 MStV).
   * Usually the same as the operator.
   */
  editorialResponsible: {
    name: 'Tobias Treppmann',
    // Often the operator's postal address:
    street: 'MUSTERSTRASSE 1',
    postcode: '00000',
    city: 'MUSTERSTADT',
  },

  site: {
    domain: 'missional.design',
    url: 'https://missional.design',
    host: 'GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA (GitHub Pages)',
  },

  // Last update of the legal pages themselves
  lastUpdated: '2026-04-14',
};
