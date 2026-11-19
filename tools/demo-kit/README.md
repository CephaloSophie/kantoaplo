# demo-kit — static, interactive demos of API-backed apps

The Pinax (board) and Mantis demos on kantoaplo.com run **without any server**.
They are the real production builds of each app, plus three small files:

| File | Role |
|---|---|
| `lib/demo-shim.js` | Intercepts `fetch` / `XMLHttpRequest` calls to the API. Reads are answered from `demo-data.json`; the visitor's writes (create, edit, delete) are kept in `localStorage` and merged into every later answer. Static login, "DÉMO" badge, "Reset" button, deep links on GitHub Pages (with `/404.html`). Dates are shifted by whole weeks so the data always looks current. |
| `<app>/demo-config.js` | API prefix, demo credentials, storage key, UI texts. |
| `<app>/*-rules.js` | Behaviour the generic shim cannot guess (Pinax: task filters, history, comments, sprints…). |
| `demo-data.json` | Every API answer recorded while a robot browses the real app filled with **fake data**. |

Demo accounts (also shown on the login screen of each demo):

- Pinax — `demo` or `demo@kantoaplo.com` / `Pinax2026!`
- Mantis — `demo@kantoaplo.com` / `Mantis2026!`

## Regenerate a demo

Requires Node 24, a local MongoDB and Playwright (`npm i playwright`, then `PLAYWRIGHT=<path>/node_modules/playwright`).
Always use a **throwaway database** (its name must contain `test`): never the real one.

### Pinax (CephaloSophie/board)

```bash
git clone git@github.com:CephaloSophie/board.git /tmp/board && cd /tmp/board
(cd server && npm install) && (cd client && npm install)
export MONGODB_URI='mongodb://root:toor@127.0.0.1:27017/boardDemoCaptureTest?authSource=admin'
(cd server && node <site>/tools/demo-kit/board/seed-demo.js)       # 3 projects, 10 people, ~180 tasks
(cd server && PORT=7102 JWT_SECRET=x node src/index.js &)
(cd client && VITE_API_PROXY_TARGET=http://localhost:7102 npx vite --port 7101 &)
node <site>/tools/demo-kit/board/record.js http://localhost:7101 /tmp/board-data.json
<site>/tools/demo-kit/board/build.sh /tmp/board /tmp/board-data.json   # → demos/pinax/
```

### Mantis (CephaloSophie/mantis)

```bash
cd ~/Projects/mantis/apps/server
export MONGO_URI=mongodb://127.0.0.1:27018/mantisDemoCaptureTest PORT=3710 JWT_SECRET=<32+ chars>
npx tsx --env-file-if-exists=../../.env scripts/seed-demo.ts --reset   # 90 days of traffic
# rename the account and the project (fake identity shown in the demo)
docker exec mantis-mongo mongosh --quiet mantisDemoCaptureTest --eval '
  db.users.updateOne({}, {$set:{email:"demo@kantoaplo.com", name:"Camille Laurent"}});
  db.projects.updateOne({}, {$set:{name:"Nebula Cloud", urls:["https://www.nebula-cloud.io"]}})'
npx tsx src/main.ts &
cd ../web && npx ng serve --port 4710 --proxy-config <proxy to :3710> &
node <site>/tools/demo-kit/mantis/record.js http://localhost:4710 /tmp/mantis-rec/demo-data.json
<site>/tools/demo-kit/mantis/build.sh ~/Projects/mantis /tmp/mantis-rec  # → demos/mantis/
```

## Preview like GitHub Pages

```bash
node tools/serve-pages.mjs 8088     # http://localhost:8088/demos/pinax/
```
