#!/usr/bin/env python3
"""Copie une famille Google Fonts dans le site : plus aucun appel à fonts.googleapis.com.

    python3 tools/vendor-fonts.py "<url css2 Google Fonts>" <dossier> [nom.css]

Télécharge la feuille CSS (format woff2, tous les sous-ensembles : latin, latin-ext,
grec…), puis chaque fichier woff2, et écrit <dossier>/<nom.css> (fonts.css par
défaut) qui pointe vers les fichiers locaux. Les plages unicode-range sont gardées :
le navigateur ne télécharge que ce dont la page a besoin.
"""
import hashlib
import re
import sys
import urllib.request
from pathlib import Path

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0 Safari/537.36'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    url, out = sys.argv[1], Path(sys.argv[2])
    name = sys.argv[3] if len(sys.argv) > 3 else 'fonts.css'
    out.mkdir(parents=True, exist_ok=True)
    css = get(url).decode('utf-8')
    files = {}

    def local(m):
        src = m.group(1)
        if src not in files:
            fam = re.search(r"font-family:\s*'([^']+)'", css[:m.start()][::-1][::-1].split('@font-face')[-1])
            base = re.sub(r'[^a-z0-9]+', '-', (fam.group(1) if fam else 'font').lower()).strip('-')
            fname = f'{base}-{hashlib.sha1(src.encode()).hexdigest()[:10]}.woff2'
            (out / fname).write_bytes(get(src))
            files[src] = fname
        return f'url({files[src]})'

    css = re.sub(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', local, css)
    header = '/* Polices copiées localement depuis Google Fonts (SIL Open Font License). Source : ' + url + ' */\n'
    (out / name).write_text(header + css, encoding='utf-8')
    print(f'{out / name} : {len(files)} fichiers woff2')


if __name__ == '__main__':
    main()
