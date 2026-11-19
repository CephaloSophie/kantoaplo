#!/usr/bin/env bash
# Builds the static Mantis demo into demos/mantis/.
#   tools/demo-kit/mantis/build.sh <mantis-repo> <recording-dir>
# <recording-dir> holds demo-data.json (+ api-files/) written by record.js.
# The Mantis sources are not modified: only the base href changes at build time.
set -euo pipefail
KIT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$KIT/../.." && pwd)"
SRC="${1:?mantis repo}"
REC="${2:?recording dir}"
OUT="$SITE/demos/mantis"
TMP="$(mktemp -d)"

cd "$SRC/apps/web"
npx ng build --base-href /demos/mantis/ --output-path "$TMP/dist" >/dev/null
rm -rf "$OUT" && mkdir -p "$OUT/demo"
cp -r "$TMP/dist/browser/." "$OUT/"
cp "$KIT/lib/demo-shim.js" "$KIT/mantis/demo-config.js" "$OUT/demo/"
[ -f "$KIT/mantis/mantis-rules.js" ] && cp "$KIT/mantis/mantis-rules.js" "$OUT/demo/"
cp "$REC/demo-data.json" "$OUT/demo/demo-data.json"
[ -d "$REC/api-files" ] && [ "$(ls -A "$REC/api-files")" ] && cp -r "$REC/api-files" "$OUT/demo/" || true
python3 - "$OUT/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
inject = ('<script src="/demos/mantis/demo/demo-config.js"></script>\n'
          '<script src="/demos/mantis/demo/demo-shim.js"></script>\n')
s = s.replace('<head>', '<head>\n' + inject, 1)
s = s.replace('<title>Mantis</title>', '<title>Mantis — analyse web · démo KANTO APLO</title>', 1)
open(p, 'w', encoding='utf-8').write(s)
PY
rm -rf "$TMP"
echo "Mantis demo → $OUT ($(du -sh "$OUT" | cut -f1))"
