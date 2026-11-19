/* Pinax demo — static configuration read by demo-shim.js */
window.DEMO_CONFIG = {
  app: 'pinax',
  basePath: '/demos/pinax/',
  apiPrefix: '/api',
  dataUrl: '/demos/pinax/demo/demo-data.json',
  storageKey: 'pinax-demo-v1',
  resetKeys: ['board.token'],
  idAliases: ['taskId'],
  readPost: ['/analytics/'],
  shiftDates: true,
  login: {
    path: '^/auth/login$',
    recordKey: 'POST /auth/login',
    userField: 'username',
    passwordField: 'password',
    // static demo accounts: identifiant or e-mail, same password
    accept: [['demo', 'Pinax2026!'], ['demo@kantoaplo.com', 'Pinax2026!']]
  },
  notFoundBody: { error: 'Cette donnée n’existe pas dans la démo.' },
  ui: {
    title: 'Pinax — démo interactive',
    accent: '#FFD166',
    backUrl: '/#pinax',
    backLabel: 'KANTO APLO',
    loginPath: '/login',
    credentials: { user: 'demo', email: 'demo@kantoaplo.com', password: 'Pinax2026!', fill: 'demo' }
  }
};
