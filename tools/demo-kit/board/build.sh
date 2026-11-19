#!/usr/bin/env bash
# Builds the static Pinax (board) demo into demos/pinax/.
#   tools/demo-kit/board/build.sh <board-clone> [demo-data.json]
# <board-clone> is a throwaway clone of CephaloSophie/board (its sources are patched).
set -euo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$KIT/../.." && pwd)"
SRC="${1:?board clone}"
DATA="${2:-$KIT/board/demo-data.json}"
OUT="$SITE/demos/pinax"

cd "$SRC/client"
# 1. router under /demos/pinax/ and product name
sed -i 's#<BrowserRouter>#<BrowserRouter basename={import.meta.env.BASE_URL.replace(/\\/$/, "")}>#' src/main.tsx
sed -i 's#Kýdos</b> Board#Pinax</b> Board#' src/pages/LoginPage.tsx src/components/Layout/Header.tsx
sed -i 's#<title>.*</title>#<title>Pinax — board agile · démo KANTO APLO</title>#' index.html
# 2. build
npx vite build --base /demos/pinax/ --outDir "$SRC/demo-dist" --emptyOutDir
# 3. assemble
rm -rf "$OUT" && mkdir -p "$OUT/demo"
cp -r "$SRC/demo-dist/." "$OUT/"
cp "$KIT/lib/demo-shim.js" "$KIT/board/pinax-rules.js" "$KIT/board/demo-config.js" "$OUT/demo/"
cp "$DATA" "$OUT/demo/demo-data.json"
python3 - "$OUT/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
inject = ('<script src="/demos/pinax/demo/demo-config.js"></script>\n'
          '<script src="/demos/pinax/demo/demo-shim.js"></script>\n'
          '<script src="/demos/pinax/demo/pinax-rules.js"></script>\n')
s = s.replace('<head>', '<head>\n' + inject, 1)
open(p, 'w', encoding='utf-8').write(s)
PY
echo "Pinax demo → $OUT ($(du -sh "$OUT" | cut -f1))"
