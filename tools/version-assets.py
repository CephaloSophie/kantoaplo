#!/usr/bin/env python3
"""Ajoute ?v=<empreinte> aux CSS / JS locaux des pages, pour que le navigateur
ne garde jamais une ancienne version en cache après une mise en ligne.

    python3 tools/version-assets.py            (index.html et 404.html)

À relancer après chaque modification de assets/ (l'empreinte suit le contenu).
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ['index.html', '404.html']
REF = re.compile(r'((?:href|src)=")(/?)((?:assets)/[^"?#]+\.(?:css|js))(\?v=[0-9a-f]+)?(")')


def stamp(m):
    f = ROOT / m.group(3)
    if not f.exists():
        return m.group(0)
    h = hashlib.sha1(f.read_bytes()).hexdigest()[:10]
    return f'{m.group(1)}{m.group(2)}{m.group(3)}?v={h}{m.group(5)}'


for page in PAGES:
    p = ROOT / page
    s = p.read_text(encoding='utf-8')
    out = REF.sub(stamp, s)
    if out != s:
        p.write_text(out, encoding='utf-8')
    print(page, ':', ', '.join(m.group(3) for m in REF.finditer(out)))
