/* Mantis demo — static configuration read by demo-shim.js */
window.DEMO_CONFIG = {
  app: 'mantis',
  basePath: '/demos/mantis/',
  apiPrefix: '/api/v1',
  dataUrl: '/demos/mantis/demo/demo-data.json',
  filesUrl: '/demos/mantis/demo/api-files/',
  storageKey: 'mantis-demo-v1',
  resetKeys: ['mantis.auth', 'mantis.appearance.boot'],
  idAliases: [],
  shiftDates: true,
  login: {
    path: '^/auth/login$',
    recordKey: 'POST /auth/login',
    userField: 'email',
    passwordField: 'password',
    accept: [['demo@kantoaplo.com', 'Mantis2026!']],
    errorBody: { message: 'E-mail ou mot de passe incorrect. Démo : demo@kantoaplo.com / Mantis2026!', statusCode: 401 }
  },
  notFoundBody: { message: 'Cette donnée n’existe pas dans la démo.', statusCode: 404 },
  ui: {
    title: 'Mantis — démo interactive',
    accent: '#8B5CF6',
    backUrl: '/#ed-mantis',
    backLabel: 'KANTO APLO',
    loginPath: '/login',
    badgeRight: true,
    credentials: { email: 'demo@kantoaplo.com', password: 'Mantis2026!', fill: 'demo@kantoaplo.com' }
  }
};
