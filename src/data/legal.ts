/**
 * Legal information for the Impressum, Datenschutzerklärung, and
 * Barrierefreiheitserklärung pages.
 *
 * Required under § 5 TMG (Germany) and Art. 13/14 GDPR.
 */

export const legal = {
  operator: {
    name: 'Tobias Treppmann',
    street: 'Lückstraße 74',
    postcode: '10317',
    city: 'Berlin',
    country: 'Deutschland',
    // Replace / remove if not applicable:
    phone: 'auf Anfrage / available on request',
    email: { user: 'hello', domain: 'treppmann', tld: 'design' },
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
    street: 'Lückstraße 74',
    postcode: '10317',
    city: 'Berlin',
  },

  site: {
    domain: 'missional.design',
    url: 'https://missional.design',
    host: 'GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA (GitHub Pages)',
  },

  // Last update of the legal pages themselves
  lastUpdated: '2026-10-24',
};
