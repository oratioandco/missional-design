"""Derive static PDF fonts from the existing OFL-licensed site fonts.
Run: uv run --with fonttools --with brotli python scripts/prepare-canvas-pdf-fonts.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root=Path(__file__).resolve().parent.parent/'public/assets/brand'
for source,target,weight in [('mona-sans.woff2','mona-sans-pdf.ttf',400),('mona-sans.woff2','mona-sans-pdf-semibold.ttf',600),('instrument-serif.woff2','instrument-serif-pdf.ttf',None)]:
 font=TTFont(root/source)
 if 'fvar' in font:
  font=instantiateVariableFont(font,{axis.axisTag:weight if axis.axisTag=='wght' else axis.defaultValue for axis in font['fvar'].axes},inplace=True)
 if weight is not None:
  # Static instances are derivatives; respect Mona Sans's reserved font name.
  family='MBD Canvas Sans';style='Regular' if weight==400 else 'Semibold'
  replacements={1:family,2:style,3:family.replace(' ','')+'-'+style+'-2026',4:family+' '+style,6:family.replace(' ','')+'-'+style,16:family,17:style}
  for record in font['name'].names:
   if record.nameID in replacements:
    record.string=replacements[record.nameID].encode(record.getEncoding())
 font.flavor=None
 font.save(root/target)
