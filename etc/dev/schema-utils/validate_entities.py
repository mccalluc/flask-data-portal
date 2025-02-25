#!/usr/bin/env python3

import argparse
import sys
from pathlib import Path
import json
import urllib

import yaml
from jsonschema.validators import Draft7Validator
from jsonschema import RefResolver


def load_yaml_url(url):
    text = urllib.request.urlopen(url).read()
    return yaml.safe_load(text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--doc_dir',
        default=Path(__file__).parent / 'cache',
        type=Path)
    parser.add_argument(
        '--schema',
        default=Path(__file__).parent / 'schema/index.yaml',
        type=Path)
    args = parser.parse_args()

    schema = yaml.safe_load(args.schema.read_text())
    validator = Draft7Validator(
        schema=schema,
        resolver=RefResolver(
            base_uri=f"{(Path(__file__).parent / 'schema').as_uri()}/",
            referrer=schema,
            handlers={
                'file': load_yaml_url
            }
        ))

    total = 0
    valid = 0
    for entity_path in args.doc_dir.iterdir():
        entity = json.loads(entity_path.read_text())
        # TODO: Right now, I'm just trying to get zero errors.
        # If this is used in production, you'll need to experiment
        # to get the most useful error message.
        errors = [
            {
                # 'message': e.message,
                # 'absolute_schema_path': e.absolute_schema_path,
                # 'absolute_path': e.absolute_path
            } for e in validator.iter_errors(entity)
        ]
        if errors:
            print(entity_path.name[0:2], end='', flush=True)
        else:
            valid += 1
            print('.', end='', flush=True)
        total += 1
    print(f'\nValidated {valid}/{total}')
    return 0 if valid == total else 1


if __name__ == "__main__":
    sys.exit(main())  # pragma: no cover
