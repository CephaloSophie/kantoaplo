#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   KANTO APLO — référencement, généré depuis assets/js/data.js
     node tools/seo.mjs
   Écrit :
   · index.html : balises du <head> (titre, description, mots-clés, Open Graph,
     Twitter, hreflang, icônes), données structurées JSON-LD, contenu statique
     lisible sans JavaScript (éditeurs, solfège, FAQ) ;
   · en/index.html : la même page en anglais (URL propre pour Google) ;
   · sitemap.xml (avec les captures), robots.txt, llms.txt, manifest.webmanifest.
   À relancer après toute modification de data.js, puis tools/version-assets.py.
   ═══════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kantoaplo.com';
const TODAY = new Date().toISOString().slice(0, 10);

const ctx = { window: {} };
vm.runInNewContext(readFileSync(join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
const K = ctx.window.KANTO;
const editors = K.editors;
const N = editors.length;
const NUM_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze'];
const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');
const bi = (fr, en, tag = 'span') => `<${tag} data-fr>${esc(fr)}</${tag}><${tag} data-en>${esc(en)}</${tag}>`;
const demoUrl = (e) => (e.href && !/^https?:/.test(e.href) ? `${SITE}/${e.href.replace(/index\.html$/, '')}` : e.href || null);
const shotUrl = (e, i, dir = 'assets/editors/') => `${SITE}/${dir}${e.id}/${pad(i + 1)}.webp`;
const OG_IMAGE = `${SITE}/assets/brand/kantoaplo-og.jpg`;

/* ── Mots-clés : tout ce qu'on peut chercher pour trouver KANTO APLO ── */
const KEYWORDS_FR = [
  'KANTO APLO', 'Kanto Aplo', 'kantoaplo', 'Κάντο απλό', 'rends-le simple', 'Cephalo Sophie',
  'no-code', 'low-code', 'plateforme no-code', 'plateforme low-code', 'plateforme no-code française', 'logiciel no-code',
  'outil no-code', 'SaaS no-code', 'développement sans code', 'créer une application sans coder', 'application sans code',
  'créer une application métier', 'application métier', 'logiciel métier sur mesure', 'outil interne', 'back-office sans code',
  'éditeur visuel', 'éditeurs visuels', 'éditeur no-code', 'constructeur d’applications', 'générateur d’applications',
  'glisser-déposer', 'drag and drop', 'programmation visuelle', 'langage visuel', 'blocs visuels', 'Blockly',
  'créateur de site', 'créateur de funnel', 'tunnel de vente', 'créateur de quiz', 'landing page',
  'éditeur d’API', 'API REST sans code', 'OpenAPI', 'générateur OpenAPI', 'tâches planifiées', 'cron', 'règles métier',
  'automatisation', 'workflow', 'éditeur de workflow', 'automatisation des processus', 'BPMN', 'orchestration',
  'agents IA', 'intelligence artificielle', 'agent IA no-code', 'connecteurs', 'intégration de données', 'iPaaS',
  'UML', 'éditeur UML', 'diagramme de classes', 'diagramme de séquence', 'modélisation', 'MCD', 'schéma de base de données',
  'tests d’API', 'tests de non-régression', 'TNR', 'alternative à Postman', 'monitoring d’API', 'surveillance d’API', 'détection d’anomalies',
  'gestion de projet', 'gestion de projet agile', 'Scrum', 'Kanban', 'sprint', 'burndown', 'vélocité', 'alternative à Jira',
  'board agile', 'rétrospective', 'refinement', 'backlog', 'tableau Kanban',
  'analyse web', 'web analytics', 'statistiques de site', 'analytics auto-hébergé', 'alternative à Google Analytics',
  'alternative à Matomo', 'RGPD', 'sans cookie', 'tableau de bord', 'temps réel', 'cohortes', 'rétention', 'entonnoir de conversion',
  'tests A/B', 'A/B testing', 'feature flags', 'statistiques bayésiennes', 'Core Web Vitals',
  'templates', 'thèmes', 'plugins', 'marque blanche', 'design system', 'éditeur de templates',
  'transformation digitale', 'digitalisation', 'citizen developer', 'développeur citoyen', 'productivité', 'DSI',
  'éditeur de logiciels Paris', 'startup Paris', 'logiciel français', 'SaaS français'
];
const KEYWORDS_EN = [
  'no-code platform', 'low-code platform', 'no-code app builder', 'low-code development', 'build apps without code',
  'business application builder', 'internal tools builder', 'visual editor', 'visual programming', 'visual language builder',
  'drag and drop builder', 'website builder', 'funnel builder', 'quiz builder', 'API builder', 'REST API without code',
  'OpenAPI generator', 'workflow automation', 'workflow builder', 'process automation', 'AI agents', 'no-code AI agents',
  'integration platform', 'data connectors', 'UML editor', 'class diagram', 'sequence diagram', 'database schema designer',
  'API testing', 'regression testing', 'Postman alternative', 'API monitoring', 'anomaly detection',
  'agile project management', 'Jira alternative', 'Scrum board', 'Kanban board', 'sprint planning', 'burndown chart',
  'web analytics', 'self-hosted analytics', 'privacy-friendly analytics', 'Google Analytics alternative', 'Matomo alternative',
  'GDPR analytics', 'A/B testing tool', 'feature flags', 'Bayesian statistics', 'cohort analysis', 'retention analysis',
  'Blockly block editor', 'domino editor', 'editor framework', 'white label', 'citizen developer', 'digital transformation',
  'French software', 'SaaS', 'Greek editors'
];
const EDITOR_KEYWORDS = editors.flatMap((e) => [e.latin, e.greek, `${e.latin} ${e.role_fr}`]);
const KEYWORDS = [...new Set([...KEYWORDS_FR, ...KEYWORDS_EN, ...EDITOR_KEYWORDS])];

const L = {
  fr: {
    lang: 'fr', locale: 'fr_FR', altLocale: 'en_US', url: `${SITE}/`,
    title: `KANTO APLO — Plateforme no-code / low-code : ${N} éditeurs visuels pour vos applications métier`,
    description: `KANTO APLO, la plateforme SaaS no-code / low-code de Cephalo Sophie : ${NUM_FR[N]} éditeurs visuels — front, APIs, UML, workflows, gestion de projet agile, analyse web, tests A/B — pour créer vos applications métier sans coder. Démos en ligne.`,
    ogTitle: `KANTO APLO — ${cap(NUM_FR[N])} éditeurs. Une seule partition.`,
    ogDesc: `Composez vos applications métier sans écrire de code : ${NUM_FR[N]} éditeurs visuels no-code / low-code, démos interactives en ligne.`,
    imageAlt: `KANTO APLO — ${NUM_FR[N]} éditeurs visuels no-code / low-code`
  },
  en: {
    lang: 'en', locale: 'en_US', altLocale: 'fr_FR', url: `${SITE}/en/`,
    title: `KANTO APLO — No-code / low-code platform: ${N} visual editors for business apps`,
    description: `KANTO APLO, Cephalo Sophie's no-code / low-code SaaS platform: ${NUM_EN[N]} visual editors — front end, APIs, UML, workflows, agile project management, web analytics, A/B testing — to build business applications without code. Live demos.`,
    ogTitle: `KANTO APLO — ${cap(NUM_EN[N])} editors. One shared score.`,
    ogDesc: `Compose business applications without writing code: ${NUM_EN[N]} no-code / low-code visual editors, live interactive demos.`,
    imageAlt: `KANTO APLO — ${NUM_EN[N]} no-code / low-code visual editors`
  }
};

function head(l) {
  const t = L[l];
  return [
    `<title>${esc(t.title)}</title>`,
    `<meta name="description" content="${esc(t.description)}"/>`,
    `<meta name="keywords" content="${esc(KEYWORDS.join(', '))}"/>`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>`,
    `<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1"/>`,
    `<meta name="author" content="Cephalo Sophie"/>`,
    `<meta name="publisher" content="Cephalo Sophie"/>`,
    `<meta name="creator" content="Cephalo Sophie"/>`,
    `<meta name="application-name" content="KANTO APLO"/>`,
    `<meta name="apple-mobile-web-app-title" content="KANTO APLO"/>`,
    `<meta name="category" content="${l === 'fr' ? 'Logiciel, no-code, low-code, SaaS' : 'Software, no-code, low-code, SaaS'}"/>`,
    `<meta name="classification" content="Business software / No-code platform"/>`,
    `<meta name="geo.region" content="FR-75"/>`,
    `<meta name="geo.placename" content="Paris"/>`,
    `<meta name="language" content="${l === 'fr' ? 'French' : 'English'}"/>`,
    `<meta name="referrer" content="strict-origin-when-cross-origin"/>`,
    `<meta name="format-detection" content="telephone=no"/>`,
    `<meta name="color-scheme" content="dark"/>`,
    `<meta name="theme-color" content="#08090d"/>`,
    `<meta name="msapplication-TileColor" content="#08090d"/>`,
    `<link rel="canonical" href="${t.url}"/>`,
    `<link rel="alternate" hreflang="fr" href="${SITE}/"/>`,
    `<link rel="alternate" hreflang="en" href="${SITE}/en/"/>`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/"/>`,
    `<meta property="og:type" content="website"/>`,
    `<meta property="og:site_name" content="KANTO APLO"/>`,
    `<meta property="og:title" content="${esc(t.ogTitle)}"/>`,
    `<meta property="og:description" content="${esc(t.ogDesc)}"/>`,
    `<meta property="og:url" content="${t.url}"/>`,
    `<meta property="og:locale" content="${t.locale}"/>`,
    `<meta property="og:locale:alternate" content="${t.altLocale}"/>`,
    `<meta property="og:image" content="${OG_IMAGE}"/>`,
    `<meta property="og:image:secure_url" content="${OG_IMAGE}"/>`,
    `<meta property="og:image:type" content="image/jpeg"/>`,
    `<meta property="og:image:width" content="1200"/>`,
    `<meta property="og:image:height" content="630"/>`,
    `<meta property="og:image:alt" content="${esc(t.imageAlt)}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(t.ogTitle)}"/>`,
    `<meta name="twitter:description" content="${esc(t.ogDesc)}"/>`,
    `<meta name="twitter:image" content="${OG_IMAGE}"/>`,
    `<meta name="twitter:image:alt" content="${esc(t.imageAlt)}"/>`,
    `<link rel="icon" href="/favicon.ico" sizes="48x48"/>`,
    `<link rel="icon" type="image/svg+xml" href="/assets/brand/icon.svg"/>`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/icon-32.png"/>`,
    `<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png"/>`,
    `<link rel="manifest" href="/manifest.webmanifest"/>`
  ].join('\n');
}

/* ── Données structurées ── */
function jsonld(l) {
  const fr = l === 'fr';
  const t = L[l];
  const org = {
    '@type': 'Organization', '@id': `${SITE}/#cephalosophie`, name: 'Cephalo Sophie', url: 'https://cephalosophie.com',
    email: 'contact@cephalosophie.com', foundingDate: '2018',
    logo: { '@type': 'ImageObject', url: `${SITE}/assets/brand/icon-512.png`, width: 512, height: 512 },
    address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
    founder: [
      { '@type': 'Person', name: 'Ameur Hamdouni', jobTitle: 'CEO, Founder, Architect', email: 'ameur.hamdouni@cephalosophie.com' },
      { '@type': 'Person', name: 'Abdelhamid Sghaier', jobTitle: 'Co-founder, CTO', email: 'abdelhamid.sghaier@cephalosophie.com' }
    ],
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: 'contact@cephalosophie.com', availableLanguage: ['French', 'English'], areaServed: 'Worldwide' }],
    brand: [{ '@type': 'Brand', name: 'KANTO APLO' }, { '@type': 'Brand', name: 'Kýdos Belote' }],
    sameAs: ['https://cephalosophie.com', 'https://kydosbelote.com']
  };
  const app = (e) => ({
    '@type': 'SoftwareApplication',
    '@id': `${SITE}/#ed-${e.id}`,
    name: `${e.latin} (${e.greek})`,
    alternateName: [e.latin, e.greek, `KANTO APLO ${e.latin}`],
    description: fr ? e.pitch_fr : e.pitch_en,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: fr ? e.role_fr : e.role_en,
    operatingSystem: 'Web',
    isAccessibleForFree: e.status === 'ready',
    ...(e.version ? { softwareVersion: e.version.replace(/^v/, '') } : {}),
    ...(e.status === 'ready' && demoUrl(e) ? { url: demoUrl(e), installUrl: demoUrl(e) } : { url: `${t.url}#ed-${e.id}` }),
    ...(e.shots ? { screenshot: Array.from({ length: Math.min(e.shots, 6) }, (_, i) => shotUrl(e, i)), image: shotUrl(e, 0) } : {}),
    featureList: (e.features || []).map((f) => (fr ? f.fr : f.en)),
    creator: { '@id': `${SITE}/#cephalosophie` },
    isPartOf: { '@id': `${SITE}/#kantoaplo` },
    inLanguage: ['fr', 'en']
  });
  const graph = [
    org,
    {
      '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'KANTO APLO',
      alternateName: ['Kanto Aplo', 'Κάντο απλό', 'kantoaplo.com'], description: t.description,
      inLanguage: ['fr', 'en'], publisher: { '@id': `${SITE}/#cephalosophie` }
    },
    {
      '@type': 'WebPage', '@id': `${t.url}#webpage`, url: t.url, name: t.title, description: t.description,
      inLanguage: l, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#kantoaplo` },
      primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE, width: 1200, height: 630 }, dateModified: TODAY,
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'KANTO APLO', item: t.url }] }
    },
    {
      '@type': 'SoftwareApplication', '@id': `${SITE}/#kantoaplo`, name: 'KANTO APLO',
      alternateName: ['Kanto Aplo', 'Κάντο απλό', 'KANTO APLO no-code'],
      slogan: fr ? 'Rends-le simple' : 'Just make it simple',
      description: t.description, url: t.url, image: OG_IMAGE,
      applicationCategory: 'BusinessApplication', applicationSubCategory: fr ? 'Plateforme no-code / low-code' : 'No-code / low-code platform',
      operatingSystem: 'Web', inLanguage: ['fr', 'en'], keywords: KEYWORDS.slice(0, 60).join(', '),
      featureList: editors.map((e) => `${e.latin} — ${fr ? e.role_fr : e.role_en}`),
      screenshot: editors.filter((e) => e.shots).map((e) => shotUrl(e, 0)),
      creator: { '@id': `${SITE}/#cephalosophie` }, publisher: { '@id': `${SITE}/#cephalosophie` },
      hasPart: editors.map((e) => ({ '@id': `${SITE}/#ed-${e.id}` }))
    },
    ...editors.map(app),
    {
      '@type': 'ItemList', '@id': `${t.url}#editors`, name: fr ? 'Les éditeurs de KANTO APLO' : 'The KANTO APLO editors', numberOfItems: N,
      itemListElement: editors.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: `${e.latin} — ${fr ? e.role_fr : e.role_en}`, url: `${t.url}#ed-${e.id}` }))
    },
    ...(K.projects || []).map((p) => ({
      '@type': 'VideoGame', name: p.latin, alternateName: p.greek, url: p.href, description: fr ? p.pitch_fr : p.pitch_en,
      gamePlatform: ['Android', 'iOS'], genre: fr ? 'Jeu de cartes' : 'Card game', publisher: { '@id': `${SITE}/#cephalosophie` }
    })),
    {
      '@type': 'FAQPage', '@id': `${t.url}#faq`, inLanguage: l,
      mainEntity: K.faq.map((q) => ({ '@type': 'Question', name: fr ? q.q_fr : q.q_en, acceptedAnswer: { '@type': 'Answer', text: fr ? q.a_fr : q.a_en } }))
    },
    {
      '@type': 'DefinedTermSet', '@id': `${t.url}#solfege`, name: fr ? 'Le solfège de KANTO APLO' : 'The KANTO APLO solfeggio', inLanguage: l,
      hasDefinedTerm: K.solfege.map((s) => ({ '@type': 'DefinedTerm', name: fr ? s.fr : s.en, description: fr ? s.text_fr : s.text_en }))
    }
  ];
  return `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1)}\n</script>`;
}

/* ── Contenu statique (lisible sans JavaScript) ── */
function editorsStatic() {
  const items = editors.map((e) => {
    const demo = e.status === 'ready' && e.href
      ? `<p><a href="${esc(demoUrl(e).replace(SITE, ''))}">${bi(`Écouter la symphonie : démo de ${e.latin}`, `Listen to the symphony: ${e.latin} demo`)}</a></p>`
      : `<p>${bi('En répétition : démo bientôt disponible.', 'In rehearsal: demo coming soon.')}</p>`;
    return `  <li id="seo-${e.id}"><h3>${esc(e.greek)} — ${esc(e.latin)} · ${bi(e.role_fr, e.role_en)}</h3>` +
      `<p>${bi(e.pitch_fr, e.pitch_en)}</p>` +
      `<p>${bi((e.features || []).map((f) => f.fr).join(' · '), (e.features || []).map((f) => f.en).join(' · '))}</p>${demo}</li>`;
  }).join('\n');
  return `<div class="seo-static wrap" id="seoEditors">\n <h2>${bi(`Les ${NUM_FR[N]} éditeurs de KANTO APLO`, `The ${NUM_EN[N]} KANTO APLO editors`)}</h2>\n <ol>\n${items}\n </ol>\n</div>`;
}
function solfegeStatic() {
  return '<ul class="sol-grid">\n' + K.solfege.map((s, i) =>
    `  <li data-reveal style="--d:${(i % 4) * 80}ms"><article class="sol-card"><span class="sol-glyph" aria-hidden="true">${esc(s.glyph)}</span>` +
    `<h3 class="sol-term">${bi(s.fr, s.en)}</h3><span class="sol-eq">${bi('en clair', 'in plain words')}</span>` +
    `<p class="sol-def">${bi(s.text_fr, s.text_en)}</p></article></li>`).join('\n') + '\n</ul>';
}
function faqStatic() {
  return '<div class="faq-list">\n' + K.faq.map((q, i) =>
    `  <details class="faq-item" data-reveal style="--d:${(i % 4) * 60}ms"${i === 0 ? ' open' : ''}><summary>${bi(q.q_fr, q.q_en)}</summary><p>${bi(q.a_fr, q.a_en)}</p></details>`).join('\n') + '\n</div>';
}

function fill(html, name, content) {
  const re = new RegExp(`(<!-- seo:${name}:start -->)[\\s\\S]*?(<!-- seo:${name}:end -->)`);
  if (!re.test(html)) throw new Error(`marker seo:${name} missing`);
  return html.replace(re, `$1\n${content}\n$2`);
}

/* index.html (français) puis en/index.html (anglais) */
let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
html = fill(html, 'editors', editorsStatic());
html = fill(html, 'solfege', solfegeStatic());
html = fill(html, 'faq', faqStatic());
const fr = fill(fill(html, 'head', head('fr')), 'jsonld', jsonld('fr'));
writeFileSync(join(ROOT, 'index.html'), fr);
let en = fill(fill(html, 'head', head('en')), 'jsonld', jsonld('en'));
en = en.replace('<html lang="fr" data-lang="fr">', '<html lang="en" data-lang="en">');
mkdirSync(join(ROOT, 'en'), { recursive: true });
writeFileSync(join(ROOT, 'en/index.html'), en);

/* sitemap.xml : les pages, les démos et les captures (Google Images) */
const img = (loc, title) => `    <image:image><image:loc>${loc}</image:loc><image:title>${esc(title)}</image:title></image:image>`;
const images = editors.flatMap((e) => Array.from({ length: e.shots }, (_, i) => img(shotUrl(e, i), `${e.latin} — ${(e.captions_fr && e.captions_fr[i]) || e.role_fr}`)));
const pageUrl = (loc, prio, extra = '') => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${prio}</priority>\n    <xhtml:link rel="alternate" hreflang="fr" href="${SITE}/"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>\n${extra}  </url>`;
const demos = editors.filter((e) => e.status === 'ready' && e.href && !/^https?:/.test(e.href))
  .map((e) => demoUrl(e)).filter((u, i, a) => a.indexOf(u) === i)
  .map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`);
writeFileSync(join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  pageUrl(`${SITE}/`, '1.0', images.join('\n') + '\n') + '\n' + pageUrl(`${SITE}/en/`, '0.9') + '\n' + demos.join('\n') + '\n</urlset>\n');

writeFileSync(join(ROOT, 'robots.txt'),
  `# KANTO APLO — ${SITE}\nUser-agent: *\nAllow: /\nDisallow: /tools/\nDisallow: /images/\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* llms.txt : résumé pour les assistants et moteurs IA */
writeFileSync(join(ROOT, 'llms.txt'), [
  '# KANTO APLO', '',
  `> ${L.en.description}`, '',
  `KANTO APLO (Greek κάντο απλό, "just make it simple") is built by Cephalo Sophie (Paris, since 2018). French site: ${SITE}/ — English: ${SITE}/en/. Contact: contact@cephalosophie.com.`, '',
  '## Editors', '',
  ...editors.map((e) => `- [${e.latin} (${e.greek}) — ${e.role_en}](${e.status === 'ready' && demoUrl(e) ? demoUrl(e) : `${SITE}/#ed-${e.id}`}): ${e.pitch_en}${e.status === 'ready' ? ' Live demo.' : ' In development.'}`), '',
  '## Demo accounts', '',
  ...editors.filter((e) => e.login).map((e) => `- ${e.latin}: ${e.login.user} / ${e.login.password} (fictional data, changes stay in the browser)`), '',
  '## Glossary (musical words used on the site)', '',
  ...K.solfege.map((s) => `- ${s.en}: ${s.text_en}`), '',
  '## FAQ', '',
  ...K.faq.flatMap((q) => [`### ${q.q_en}`, '', q.a_en, '']),
  '## Other Cephalo Sophie projects', '',
  ...(K.projects || []).map((p) => `- [${p.latin}](${p.href}): ${p.pitch_en}`), ''
].join('\n'));

writeFileSync(join(ROOT, 'manifest.webmanifest'), JSON.stringify({
  name: 'KANTO APLO — no-code / low-code', short_name: 'KANTO APLO', description: L.fr.description, lang: 'fr', dir: 'ltr',
  start_url: '/', scope: '/', display: 'standalone', background_color: '#08090d', theme_color: '#08090d',
  categories: ['business', 'productivity', 'developer'],
  icons: [
    { src: '/assets/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/assets/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2) + '\n');

console.log(`SEO : ${KEYWORDS.length} mots-clés, ${N} éditeurs, ${K.faq.length} questions, ${images.length} images dans le sitemap → index.html, en/index.html, sitemap.xml, robots.txt, llms.txt, manifest.webmanifest`);
if (!existsSync(join(ROOT, 'assets/brand/kantoaplo-og.jpg'))) console.log('⚠ assets/brand/kantoaplo-og.jpg manquant : node tools/brand.mjs');
