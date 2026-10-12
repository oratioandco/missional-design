"""Sync shared owner-selected brand assets from the adjacent reference checkout.

Run whenever that brand changes. CI builds from the checked-in public assets;
it does not need access to the owner's local reference repo or font library.
"""
from pathlib import Path
import argparse
import shutil

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=ROOT.parent / 'bible-faith-patterns' / 'brand')
args = parser.parse_args()
target = ROOT / 'public/assets/brand'
target.mkdir(parents=True, exist_ok=True)
for p in (args.source / 'assets').iterdir():
    if p.is_file() and (p.suffix.lower() != ".png" or p.name.startswith("rock-mark-")):
        shutil.copy2(p, target / p.name)
shutil.copy2(args.source / 'tokens.css', target / 'tokens.css')
shutil.copy2(args.source / 'selection.json', target / 'selection.json')
print('Synced shared brand assets to', target)
