#!/usr/bin/env python3

from time import sleep
import argparse
import sys
import json
from pathlib import Path
from datetime import date

import requests


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--index_url',
        default='https://search.api.hubmapconsortium.org/v3/entities/search')
    parser.add_argument(
        '--doc_dir',
        default=Path(__file__).parent / 'cache',
        type=Path)
    parser.add_argument(
        '--start',
        default=0,
        type=int)
    parser.add_argument(
        '--size',
        default=1,  # Small so we don't choke on a few large documents.
        type=int)
    parser.add_argument(
        '--sort',
        default='created_timestamp')
    parser.add_argument(
        '--sleep',
        default=1,
        type=int)
    args = parser.parse_args()

    Path(args.doc_dir).mkdir(exist_ok=True)

    es_from = args.start
    while(True):
        print(f'from: {es_from}')
        response = requests.post(
            args.index_url,
            json={
                'from': es_from,
                'size': args.size,
                'sort': args.sort
            })
        if not response.ok:
            print(f'HTTP {response.status_code}:')
            print(response.text)
            break

        hits = response.json()['hits']['hits']
        if not hits:
            print('No more hits')
            break

        for hit in hits:
            id = hit['_id']
            source = hit['_source']
            entity_type = source['entity_type']
            created_timestamp = source['created_timestamp']
            iso_date = date.fromtimestamp(created_timestamp / 1000)
            name = f'{entity_type}_{iso_date}_{id}.json'
            (args.doc_dir / name).write_text(json.dumps(source, indent=2))

        es_from += args.size
        sleep(args.sleep)
    return 0


if __name__ == "__main__":
    sys.exit(main())  # pragma: no cover
