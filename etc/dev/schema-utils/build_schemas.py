#!/usr/bin/env python3

import argparse
from pathlib import Path
import sys
import json
import re

from genson import SchemaBuilder
import yaml


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--doc_dir',
        default=Path(__file__).parent / 'cache',
        type=Path)
    parser.add_argument(
        '--schema_dir',
        default=Path(__file__).parent / 'schema/entities',
        type=Path)
    args = parser.parse_args()

    Path(args.schema_dir).mkdir(exist_ok=True)

    for entity_type in ['Collection', 'Donor', 'Sample', 'Dataset']:
        builder = SchemaBuilder()
        builder.add_schema({"type": "object", "properties": {}})
        print(f'Loading {entity_type}s', end='', flush=True)
        for entity_path in args.doc_dir.glob(f'{entity_type}*.json'):
            # The genson CLI almost works for this...
            # but for Datasets and Samples it runs out of file handles.
            # Might be an easy PR to fix it upstream.
            entity = json.loads(entity_path.read_text())
            builder.add_object(entity)
            print(f'.', end='', flush=True)
        schema_path = args.schema_dir / f'{entity_type}.yaml'
        schema_yaml_raw = yaml.dump(builder.to_schema())
        schema_yaml_baked = re.sub(
            # If we had a field called "properties", this would break,
            # but apart from that, should be robust.
            r'^(\s*)(properties:)',
            r'\1additionalProperties: false\n\1\2',
            schema_yaml_raw,
            flags=re.MULTILINE)
        schema_path.write_text(schema_yaml_baked)
        print(f'\nBuilt {schema_path.name}')
    return 0


if __name__ == "__main__":
    sys.exit(main())  # pragma: no cover
