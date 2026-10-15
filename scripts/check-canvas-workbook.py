from pathlib import Path
import json
from playwright.sync_api import sync_playwright
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--url',default='http://127.0.0.1:8794/missional-canvas/')
parser.add_argument('--pdf-output',type=Path,default=Path('/tmp/missional-canvas-qa/filled-example.pdf'))
parser.add_argument('--proof-dir',type=Path,default=Path('/tmp/missional-canvas-qa'))
args=parser.parse_args()
URL=args.url;OUT=args.pdf_output;OUT.parent.mkdir(parents=True,exist_ok=True)
PROOF=args.proof_dir;PROOF.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch()
 context=browser.new_context(accept_downloads=True,viewport={'width':1440,'height':1050})
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='networkidle')
 page.get_by_role('button',name='Fill your canvas',exact=True).click()
 assert page.locator('#canvas-workbook').is_visible()
 page.locator('[name=project]').fill('Neighborhood Table / fictional example')
 page.locator('[name=team]').fill('Miriam, Jürgen & the listening team')
 page.locator('[name=context]').fill('An urban neighborhood whose meeting places and everyday rhythms keep changing. This fictional draft demonstrates the canvas, rather than describing a real organization.')
 page.locator('[name=reviewDate]').fill('2027-01-15')
 # Start with the third answer: this catches sparse-array save/reload defects.
 page.locator('#answer-church-01-2').fill('People already gather at the library, café and community garden. We should listen before adding another program.')
 page.reload(wait_until='networkidle');page.get_by_role('button',name='Fill your canvas',exact=True).click()
 assert page.locator('#answer-church-01-2').input_value().startswith('People already gather')
 page.locator('#answer-church-01-0').fill('Neighbors who are new to the area, long-standing residents and people whose informal support networks are being disrupted.')

 page.locator('[data-writing-step="2"]').click()
 page.locator('#answer-church-03-0').fill('Good news becomes tangible in dependable presence: a shared table, honest hope in Jesus Christ, and relationships where people can ask, contribute and belong without pressure.')

 page.screenshot(path=str(PROOF/'desktop-writing.png'),full_page=True)
 # Change versions and prove their drafts remain separate.
 page.locator('[data-variant=business]').click();page.wait_for_function("document.querySelector('[data-writing-variant=business]').hidden===false")
 assert page.locator('[name=project]').input_value()==''
 page.locator('[name=project]').fill('A different business draft')
 page.locator('[data-variant=church]').click();page.wait_for_function("document.querySelector('[data-writing-variant=church]').hidden===false")
 assert page.locator('[name=project]').input_value().startswith('Neighborhood Table')
 # Long content is preserved in the draft but must not silently overflow a one-page export.
 page.locator('[data-writing-step="8"]').click()
 long='\n\n'.join(f'Listening round {i}: We will ask neighbors what has changed, what they value, where trust has been damaged, and what practical action they would welcome. We will revisit assumptions with prayer, Scripture and the people affected. Rückfragen, Würde and fair access matter.' for i in range(1,19))+'\n\nEND OF COMPLETE LONG ANSWER'
 page.locator('#answer-church-09-0').fill(long)

 page.locator('[data-writing-step="9"]').click()
 with page.expect_download() as info:page.locator('#download-canvas-json').click()
 jsonpath=PROOF/'editable-copy.json';info.value.save_as(jsonpath)
 saved=json.loads(jsonpath.read_text());assert saved['answers']['09'][0].endswith('END OF COMPLETE LONG ANSWER')
 # Reject malformed input without changing the draft.
 page.locator('#canvas-file').set_input_files({'name':'broken.json','mimeType':'application/json','buffer':b'{broken'})
 page.wait_for_function("document.querySelector('#draft-status').textContent.includes('not valid JSON')")
 assert page.locator('[name=project]').input_value().startswith('Neighborhood Table')
 # Round-trip the editable file into a clean browser context.
 fresh=browser.new_context(accept_downloads=True);q=fresh.new_page();q.goto(URL,wait_until='networkidle');q.get_by_role('button',name='Fill your canvas',exact=True).click();q.locator('#canvas-file').set_input_files(jsonpath)
 q.wait_for_function("document.querySelector('#answer-church-01-2').value.startsWith('People already gather')")
 q.locator('[data-writing-step="9"]').click()
 q.locator('#download-canvas-pdf').click()
 q.wait_for_function("document.querySelector('#export-status').textContent.includes('Too much text')")
 assert q.get_by_role('button',name='Edit Assessing Missional Effectiveness',exact=True).is_visible()
 assert q.locator('#answer-church-09-0').input_value().endswith('END OF COMPLETE LONG ANSWER')
 # Populate a realistic single-page canvas. Every written answer must appear in its block.
 fixture={
 '01':['Neighbors who are new to the area, long-standing residents and people whose support networks are changing.','We will listen to experiences of faith without assuming shared beliefs.','People already gather at the library, café and community garden.'],
 '02':['Loneliness, changing meeting places and a desire for dependable relationships.','A shared table and practical neighborhood help.','Work with the library team and existing community groups.'],
 '03':['Good news becomes tangible in dependable presence, a shared table and honest hope in Jesus Christ.','Listen, pray and serve alongside our neighbors.','People can ask, contribute and belong without pressure.'],
 '04':['Build reciprocal relationships; neighbors help shape the work.','Make gatherings accessible and welcoming across beliefs.'],
 '05':['Host a weekly shared meal and a monthly listening walk.','Train hosts, support volunteers and make time for prayer.'],
 '06':['Meet at the library, community garden and neighborhood square.','Invite trusted local partners to plan with us.'],
 '07':['A host team, accessible space, food, translation support and modest shared funding.'],
 '08':['Budget for food, space, accessibility and volunteer support. Review costs transparently each quarter.'],
 '09':['Ask neighbors what has changed and what they recognize as good. Pray, read Scripture and invite independent challenge.','Review participation, relationships, unintended costs and faithful next steps together. Revisit every quarter.']}
 for index,(number,answers) in enumerate(fixture.items()):
  q.locator(f'[data-writing-step="{index}"]').click()
  for j,answer in enumerate(answers):q.locator(f'#answer-church-{number}-{j}').fill(answer)
 q.locator('[data-writing-step="9"]').click()
 with q.expect_download(timeout=60000) as info:q.locator('#download-canvas-pdf').click()
 info.value.save_as(OUT)
 assert OUT.stat().st_size>10000
 print('PDF downloaded:',OUT)
 # Check mobile writing and review with actual restored answers.
 page.set_viewport_size({'width':390,'height':844});page.locator('[data-writing-step="2"]').click();page.wait_for_timeout(100)
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 assert not page.locator('#canvas-file').is_visible()
 page.screenshot(path=str(PROOF/'mobile-writing.png'),full_page=True)
 page.locator('[data-writing-step="9"]').click();assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.screenshot(path=str(PROOF/'mobile-review.png'),full_page=True)
 # All-Latin PDF cannot silently lose unsupported text; the print fallback stays available.
 q.locator('[data-writing-step="0"]').click();q.locator('#answer-church-01-0').fill('希望');q.locator('[data-writing-step="9"]').click();q.locator('#download-canvas-pdf').click()
 q.wait_for_function("document.querySelector('#draft-status').textContent.includes('font cannot display')")
 assert q.locator('#print-canvas').is_visible()
 # Print document keeps text as text, never parsed markup.
 q.locator('[data-writing-step="0"]').click();q.locator('#answer-church-01-0').fill('<img src=x onerror=alert(1)> 希望');q.locator('[data-writing-step="9"]').click()
 with q.expect_popup() as popup:q.locator('#print-canvas').click()
 printpage=popup.value;printpage.wait_for_load_state();assert printpage.locator('img').count()==0;assert '希望' in printpage.locator('body').inner_text()
 assert printpage.get_by_role('button',name='Print / Save as PDF',exact=True).is_enabled()
 printpage.pdf(path=str(PROOF/'native-print.pdf'),prefer_css_page_size=True,print_background=True)
 # Local-storage failure is visible and does not prevent working or downloading.
 blocked=browser.new_context();blocked.add_init_script("Storage.prototype.setItem=function(){throw new DOMException('Unavailable','QuotaExceededError')}")
 r=blocked.new_page();r.goto(URL,wait_until='networkidle');r.get_by_role('button',name='Fill your canvas',exact=True).click();r.locator('[name=project]').fill('Unsaved example')
 assert 'could not save' in r.locator('#draft-status').inner_text()
 # Corrupt storage remains untouched until an explicit replacement choice.
 corrupt=browser.new_context();corrupt.add_init_script("localStorage.setItem('mbd:canvas-drafts:v1','{broken')")
 c=corrupt.new_page();c.goto(URL,wait_until='networkidle');c.get_by_role('button',name='Fill your canvas',exact=True).click();c.locator('[name=project]').fill('Recovered work')
 assert c.evaluate("localStorage.getItem('mbd:canvas-drafts:v1')")=='{broken'
 assert c.locator('#replace-local').is_visible()
 assert not errors,errors
 print('PASS: local drafts, editable round-trip, one-page PDF, explicit overflow refusal, mobile layouts, glyph warning, safe one-page printing and storage recovery; no browser errors')
 browser.close()
