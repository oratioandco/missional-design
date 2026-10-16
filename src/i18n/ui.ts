/**
 * Missional by Design — i18n UI dictionary
 *
 * Short UI strings used across Nav, Footer, and shared components.
 * Long-form page content lives in the pages themselves (one .astro per locale).
 *
 * German terminology follows the project glossary in ./glossary.md.
 */

export type Locale = 'en' | 'de';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'de'];

export const ui = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.framework': 'Principles',
    'nav.canvas': 'Canvas',
    'nav.writing': 'Writing',
    'nav.about': 'About',

    // Footer
    'footer.tagline': 'Missional by Design',
    'footer.blurb': 'Practical frameworks, design patterns and theological reflection for churches, Christian organizations and product teams.',
    'footer.explore': 'Explore',
    'footer.related': 'Related',
    'footer.links.imprint': 'Impressum',
    'footer.links.privacy': 'Datenschutz',
    'footer.links.accessibility': 'Barrierefreiheit',
    'footer.credit': '© 2026 Tobias Treppmann',

    // Common
    'cta.getInTouch': 'Get in touch',
  },
  de: {
    // Nav
    'nav.home': 'Start',
    'nav.framework': 'Prinzipien',
    'nav.canvas': 'Canvas',
    'nav.writing': 'Texte',
    'nav.about': 'Über mich',

    // Footer
    'footer.tagline': 'Missional by Design',
    'footer.blurb': 'Praktische Werkzeuge, Gestaltungsmuster und theologische Reflexion für Gemeinden, christliche Organisationen und Produktteams.',
    'footer.explore': 'Erkunden',
    'footer.related': 'Verwandt',
    'footer.links.imprint': 'Impressum',
    'footer.links.privacy': 'Datenschutz',
    'footer.links.accessibility': 'Barrierefreiheit',
    'footer.credit': '© 2026 Tobias Treppmann',

    // Common
    'cta.getInTouch': 'Kontakt aufnehmen',
  },
} as const;

export type UIKey = keyof typeof ui['en'];

export function t(locale: Locale, key: UIKey): string {
  return ui[locale][key] ?? ui[defaultLocale][key] ?? key;
}

/** Derive the locale from a URL pathname. '/' → 'en', '/de/...' → 'de'. */
export function getLocaleFromPath(pathname: string, base = ''): Locale {
  const p = pathname.replace(base, '').replace(/^\/+/, '');
  if (p.startsWith('de/') || p === 'de') return 'de';
  return 'en';
}

/** Swap locale in a pathname. `/about` → `/de/about` and vice versa. */
export function altLocalePath(pathname: string, targetLocale: Locale, base = ''): string {
  // Strip base if present
  const hasBase = base && pathname.startsWith(base);
  const stripped = hasBase ? pathname.slice(base.length) : pathname;
  const withoutDe = stripped.replace(/^\/de(\/|$)/, '/');
  const normalized = withoutDe === '' ? '/' : withoutDe;
  const localePath = targetLocale === 'de'
    ? (normalized === '/' ? '/de' : `/de${normalized}`)
    : normalized;
  return (hasBase ? base : '') + localePath;
}
