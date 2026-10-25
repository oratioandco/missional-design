"""Project the canonical assessment rubric and public principles without app grades.

Usage: python3 scripts/import-app-design-rubric.py ../bible-faith-patterns/research/app-assessment/2026-10-25/rubric.json
Principle links describe coverage, never inherited assessment results.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def export(source):
    rubric = json.loads(source.read_text())
    source_principles = json.loads((ROOT / 'public/api/principles.json').read_text())['principles']
    principles = [{key: item[key] for key in ['id', 'name', 'place', 'question', 'url']} for item in source_principles]
    ids = {item['id'] for item in principles}
    assert len(principles) == len(ids) == 10
    dimensions = [{key: item[key] for key in ['id', 'label', 'principle_ids']} for item in rubric['dimensions']]
    assert all(set(item['principle_ids']) <= ids for item in dimensions)
    payload = dict(version=rubric['version'], dimensions=dimensions, principles=principles, frame=[
        dict(id='concern', label='Concern', description='Actual coercion, deception or extraction must be evidenced in the feature or flow; do not infer malicious intent.'),
        dict(id='ethical', label='Ethical baseline', description='Respect agency, truth and dignity through clear roles, meaningful choice and appropriate safeguards in the assessed interaction.'),
        dict(id='redemptive', label='Redemptive possibility', description='Requires a concrete loss or exclusion addressed, a restorative mechanism, cost or risk freely borne by the builder, and benefit or a credible mechanism for people served. Candidates are not awards.'),
    ])
    (ROOT / 'src/data/app-design-rubric.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    print(f"Imported rubric {rubric['version']}: {len(dimensions)} dimensions, {len(principles)} principles; no app scalar")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    export(parser.parse_args().source)
