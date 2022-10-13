#!/usr/bin/env python3

from pathlib import Path
import sys
import argparse
from time import perf_counter

from flask import Flask

# Run from anywhere:
for path in Path(__file__).parents:
    if (path / '.git').is_dir():
        sys.path.append(str(path))
        break
from context.app.api.client import ApiClient  # noqa: E402
from context.app.default_config import DefaultConfig  # noqa: E402


def get_parser():
    parser = argparse.ArgumentParser(
        description='Scan all datasets for visualization bugs. Exits with status 0 if no errors.',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        '--search_url',
        default='https://search.api.hubmapconsortium.org',
        help='Search API endpoint')
    parser.add_argument(
        '--portal_index_path',
        default=DefaultConfig.PORTAL_INDEX_PATH,
        help='Under the Search API endpoint, the particular index to use')
    parser.add_argument(
        '--types_url',
        default='https://search.api.hubmapconsortium.org',
        help='Type Service endpoint')
    parser.add_argument(
        '--assets_url',
        default='https://assets.hubmapconsortium.org',
        help='Assets endpoint')
    parser.add_argument(
        '--uuids',
        nargs='*',
        help='Instead of querying all public datasets, use given UUIDs')
    return parser


def get_context(args):
    search_url = args.search_url
    types_url = args.types_url
    assets_url = args.assets_url
    portal_index_path = args.portal_index_path

    app = Flask(__name__)
    app.config.from_mapping({
        'TYPE_SERVICE_ENDPOINT': types_url,
        'ASSETS_ENDPOINT': assets_url,
        'ELASTICSEARCH_ENDPOINT': search_url,
        'PORTAL_INDEX_PATH': portal_index_path
    })

    return app.app_context()


def get_errors(override_uuids):
    errors = {}
    client = ApiClient()
    uuids = override_uuids or client.get_all_dataset_uuids()
    waiting_for_json = 0
    waiting_for_conf = 0
    for (i, uuid) in enumerate(uuids):
        before_json = perf_counter()
        dataset = client.get_entity(uuid=uuid)
        waiting_for_json += perf_counter() - before_json
        warn(f'{i}/{len(uuids)} ({len(errors)} errors): Checking {uuid} ...')
        try:
            before_conf = perf_counter()
            configs_cells_uuid = client.get_configs_cells_and_lifted_uuid(dataset, wrap_error=False)
            warn(
                f'\tVis: {len(configs_cells_uuid.configs_cells.configs) > 0}; '
                f'Lifted: {configs_cells_uuid.vis_lifted_uuid} ')
            waiting_for_conf += perf_counter() - before_conf
        except Exception as e:
            warn(f'\tERROR: {e}')
            errors[uuid] = e
        warn(f'\tJSON: {waiting_for_json:.2f}s; Vitessce: {waiting_for_conf:.2f}s')
    return errors


def main():
    args = get_parser().parse_args()

    with get_context(args):
        errors = get_errors(args.uuids)

    if not errors:
        print('No errors')
        sys.exit(0)
    for k, v in errors.items():
        print(f'{k}\t{v}')
    sys.exit(1)


def warn(s):
    print(s, file=sys.stderr)


if __name__ == "__main__":
    sys.exit(main())
