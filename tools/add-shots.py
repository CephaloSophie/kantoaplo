#!/usr/bin/env python3
"""Ajoute des captures à un éditeur de la vitrine KANTO APLO.

    python3 tools/add-shots.py <id-editeur> capture1.png capture2.jpg …

Chaque image est convertie en WebP (≤ 1600 px de large) dans
assets/editors/<id>/NN.webp, avec sa miniature (560 px) dans
assets/editors/<id>/thumbs/NN.webp, à la suite des captures existantes.
Pensez ensuite à mettre à jour `shots` dans assets/js/data.js.
Nécessite Pillow : pip install pillow
"""
import sys
from pathlib import Path

from PIL import Image

FULL_WIDTH, THUMB_WIDTH = 1600, 560
ROOT = Path(__file__).resolve().parent.parent


def resized(im, width):
    if im.width <= width:
        return im
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    editor, files = sys.argv[1], sys.argv[2:]
    folder = ROOT / 'assets' / 'editors' / editor
    (folder / 'thumbs').mkdir(parents=True, exist_ok=True)
    n = len(list(folder.glob('[0-9][0-9].webp')))
    for f in files:
        n += 1
        im = Image.open(f).convert('RGB')
        resized(im, FULL_WIDTH).save(folder / f'{n:02d}.webp', 'WEBP', quality=84, method=6)
        resized(im, THUMB_WIDTH).save(folder / 'thumbs' / f'{n:02d}.webp', 'WEBP', quality=78, method=6)
        print(f'{f} → assets/editors/{editor}/{n:02d}.webp')
    print(f'\n{editor} : {n} captures — mettez `shots: {n}` dans assets/js/data.js')


if __name__ == '__main__':
    main()
