"""Verify that every guiding question appears inside its block on one A3 page.
Run with pdfplumber installed: python scripts/check-canvas-pdf.py file.pdf --variant church
"""
import argparse
import json
import logging
from pathlib import Path
import re
import pdfplumber

parser=argparse.ArgumentParser()
parser.add_argument('pdf',type=Path)
parser.add_argument('--variant',choices=['church','nonprofit','business'],default='church')
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
variant=next(v for v in json.loads((root/'src/data/missional-canvases.json').read_text())['variants'] if v['id']==args.variant)
geometry=(root/'src/lib/canvas-layout.ts').read_text()
boxes={number:tuple(map(float,(x,y,w,h))) for number,x,y,w,h in re.findall(r"'(\d+)':\{x:([\d.]+),y:([\d.]+),width:([\d.]+),height:([\d.]+)\}",geometry)}
normalize=lambda text:re.sub(r'\s+',' ',text).translate(str.maketrans({'’':"'",'ʼ':"'"}))
logging.getLogger('pdfminer').setLevel(logging.ERROR)
with pdfplumber.open(args.pdf) as pdf:
 assert len(pdf.pages)==1,'The canvas must be exactly one page.'
 page=pdf.pages[0]
 assert abs(page.width-420*72/25.4)<2 and abs(page.height-297*72/25.4)<2,'Expected A3 landscape.'
 for block in variant['blocks']:
  x,y,w,h=boxes[block['number']]
  region=page.crop(tuple(n*72/25.4 for n in (x,y,x+w,y+h)))
  text=normalize(region.extract_text() or '')
  for question in block['questions']:
   assert normalize(question) in text,f"Missing question in {block['title']}: {question}"
 assert all(c['x0']>=0 and c['x1']<=page.width+1 and c['top']>=0 and c['bottom']<=page.height+1 for c in page.chars),'Text falls outside the page.'
 print(f'PASS: {args.variant}, one A3 page, all guiding questions inside their own blocks.')
