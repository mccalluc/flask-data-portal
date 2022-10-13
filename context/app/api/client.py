from collections import namedtuple
import traceback
from copy import deepcopy
from dataclasses import dataclass

from flask import abort, current_app
import requests

from hubmap_commons.type_client import TypeClient
from vitessce import VitessceConfig

from .client_utils import files_from_response
from portal_visualization.builder_factory import get_view_config_builder
from portal_visualization.builders.base_builders import ConfigsCells

Entity = namedtuple('Entity', ['uuid', 'type', 'name'], defaults=['TODO: name'])


@dataclass
class VitessceConfLiftedUUID:
    configs_cells: tuple
    vis_lifted_uuid: str


def _get_hits(response_json):
    '''
    The repeated key makes error messages ambiguous.
    Split it into separate calls so we can tell which fails.
    '''
    outer_hits = response_json['hits']
    inner_hits = outer_hits['hits']
    return inner_hits


class ApiClient():
    def __init__(self, url_base=None, groups_token=None):
        self.url_base = url_base
        self.groups_token = groups_token

    def _request(self, url, body_json=None):
        headers = {'Authorization': 'Bearer ' + self.groups_token} if self.groups_token else {}
        try:
            response = (
                requests.post(url, headers=headers, json=body_json)
                if body_json
                else requests.get(url, headers=headers)
            )
        except requests.exceptions.ConnectTimeout as error:
            current_app.logger.error(error)
            abort(504)
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as error:
            current_app.logger.error(error.response.text)
            status = error.response.status_code
            if status in [400, 404]:
                # The same 404 page will be returned,
                # whether it's a missing route in portal-ui,
                # or a missing entity in the API.
                abort(status)
            if status in [401]:
                # I believe we have 401 errors when the globus credentials
                # have expired, but are still in the flask session.
                abort(status)
            raise
        return response.json()

    def get_all_dataset_uuids(self):
        size = 10000  # Default ES limit
        query = {
            "size": size,
            "post_filter": {
                "term": {"entity_type.keyword": "Dataset"}
            },
            "_source": ["empty-returns-everything"]
        }
        response_json = self._request(
            current_app.config['ELASTICSEARCH_ENDPOINT']
            + current_app.config['PORTAL_INDEX_PATH'],
            body_json=query)
        uuids = [hit['_id'] for hit in _get_hits(response_json)]
        if len(uuids) == size:
            raise Exception('At least 10k datasets: need to make multiple requests')
        return uuids

    def get_entities(self,
                     plural_lc_entity_type=None,
                     non_metadata_fields=[],
                     constraints={}, uuids=[]):
        entity_type = plural_lc_entity_type[:-1].capitalize()
        query = {
            "size": 10000,  # Default ES limit,
            "post_filter": {
                "term": {"entity_type.keyword": entity_type}
            },
            "query": _make_query(constraints, uuids),
            "_source": {
                "include": [*non_metadata_fields, 'mapped_metadata', 'metadata'],
                "exclude": ['*.files']
            }
        }
        response_json = self._request(
            current_app.config['ELASTICSEARCH_ENDPOINT']
            + current_app.config['PORTAL_INDEX_PATH'],
            body_json=query)
        sources = [hit['_source'] for hit in _get_hits(response_json)]
        total_hits = response_json['hits']['total']['value']
        if len(sources) < total_hits:
            raise Exception('Incomplete results: need to make multiple requests')
        flat_sources = _flatten_sources(sources, non_metadata_fields)
        filled_flat_sources = _fill_sources(flat_sources)
        return filled_flat_sources

    def get_entity(self, uuid=None, hbm_id=None):
        if uuid is not None and hbm_id is not None:
            raise Exception('Only UUID or HBM ID should be provided, not both')
        query = {'query':
                 # ES guarantees that _id is unique, so this is best:
                 {'ids': {'values': [uuid]}}
                 if uuid else
                 {'match': {'hubmap_id.keyword': hbm_id}}
                 # With default mapping, without ".keyword", it splits into tokens,
                 # and we get multiple substring matches, instead of unique match.
                 }

        response_json = self._request(
            current_app.config['ELASTICSEARCH_ENDPOINT']
            + current_app.config['PORTAL_INDEX_PATH'],
            body_json=query)

        hits = _get_hits(response_json)
        return _get_entity_from_hits(hits, has_token=self.groups_token, uuid=uuid, hbm_id=hbm_id)

    def get_latest_entity_uuid(self, uuid, type):
        lowercase_type = type.lower()
        route = f'/{lowercase_type}s/{uuid}/revisions'
        response_json = self._request(
            current_app.config['ENTITY_API_BASE'] + route)
        return _get_latest_uuid(response_json)

    def get_files(self, uuids):
        query = {
            'size': 10000,
            'query': {'bool': {
                'must': [{'ids': {'values': uuids}}]
            }},
            '_source': ['files.rel_path']
        }
        response_json = self._request(
            current_app.config['ELASTICSEARCH_ENDPOINT']
            + current_app.config['PORTAL_INDEX_PATH'],
            body_json=query)
        return files_from_response(response_json)

    def get_configs_cells_and_lifted_uuid(self, entity, marker=None, wrap_error=True):
        '''
        Returns a dataclass with configs_cells and vis_lifted_uuid.
        '''
        vis_lifted_uuid = None  # default
        image_pyramid_descendants = _get_image_pyramid_descendants(entity)

        # First, try "vis-lifting": Display image pyramids on their parent entity pages.
        if image_pyramid_descendants:
            if len(image_pyramid_descendants) > 1:
                current_app.logger.error(f'Expected only one descendant on {entity["uuid"]}')
            derived_entity = image_pyramid_descendants[0]
            # TODO: Entity structure will change in the future to be consistent
            # about "files". Bill confirms that when the new structure comes in
            # there will be a period of backward compatibility to allow us to migrate.
            derived_entity['files'] = derived_entity['metadata'].get('files', [])
            configs_cells = self.get_configs_cells_and_lifted_uuid(
                derived_entity, marker=marker, wrap_error=wrap_error
            ).configs_cells
            vis_lifted_uuid = derived_entity['uuid']

        elif not entity.get('files') or not entity.get('data_types'):
            configs_cells = ConfigsCells([], [])

        # Otherwise, just try to visualize the data for the entity itself:
        else:
            try:
                def get_assay(name):
                    type_client = TypeClient(
                        current_app.config["TYPE_SERVICE_ENDPOINT"]
                        + current_app.config["TYPE_SERVICE_PATH"])
                    return type_client.getAssayType(name)
                Builder = get_view_config_builder(entity=entity, get_assay=get_assay)
                builder = Builder(entity, self.groups_token, current_app.config["ASSETS_ENDPOINT"])
                configs_cells = builder.get_configs_cells(marker=marker)
            except Exception as e:
                if not wrap_error:
                    raise e
                current_app.logger.error(
                    f'Building vitessce conf threw error: {traceback.format_exc()}')
                configs_cells = ConfigsCells([VitessceConfig.from_dict({
                    'name': 'Error',
                    'version': '1.0.4',
                    'datasets': [],
                    'initStrategy': 'none',
                    'layout': [{
                        'component': 'description',
                        "props": {
                            "description": 'Error while generating the Vitessce configuration'
                        },
                        'x': 0, 'y': 0, 'w': 12, 'h': 1
                    }],
                })], [])

        return VitessceConfLiftedUUID(
            configs_cells=configs_cells,
            vis_lifted_uuid=vis_lifted_uuid)


def _make_query(constraints, uuids):
    '''
    Given a constraints dict of lists,
    return a ES query that handles all structual variations.
    Repeated values for a single key are OR;
    Separate keys are AND.

    >>> constraints = {'color': ['red', 'green'], 'number': ['42']}
    >>> uuids = ['abc', '123']
    >>> query = _make_query(constraints, uuids)
    >>> from pprint import pp
    >>> pp(query['bool'])
    {'must': [{'bool': {'should': [{'term': {'metadata.metadata.color.keyword': 'red'}},
                                   {'term': {'mapped_metadata.color.keyword': 'red'}},
                                   {'term': {'metadata.metadata.color.keyword': 'green'}},
                                   {'term': {'mapped_metadata.color.keyword': 'green'}}]}},
              {'bool': {'should': [{'term': {'metadata.metadata.number.keyword': '42'}},
                                   {'term': {'mapped_metadata.number.keyword': '42'}}]}},
              {'ids': {'values': ['abc', '123']}}]}
    '''
    shoulds = [
        [
            {"term": {f'{root}.{k}.keyword': v}}
            for v in v_list
            for root in ['metadata.metadata', 'mapped_metadata']
        ]
        for k, v_list in constraints.items()
    ]
    musts = [
        {'bool': {'should': should}}
        for should in shoulds
    ]
    if uuids:
        musts.append({'ids': {'values': uuids}})
    query = {'bool': {'must': musts}}

    return query


def _get_nested(path, nested):
    '''
    >>> path = 'a.b.c'
    >>> nested = {'a': {'b': {'c': 123}}}

    >>> _get_nested(path, {}) is None
    True
    >>> _get_nested(path, nested)
    123
    '''
    tokens = path.split('.')
    for t in tokens:
        nested = nested.get(t, {})
    return nested or None


def _flatten_sources(sources, non_metadata_fields):
    '''
    >>> from pprint import pp
    >>> donor_sources = [
    ...     {'uuid': 'abcd1234', 'name': 'Ann',
    ...      'other': 'skipped',
    ...      'mapped_metadata': {'age': [40], 'weight': [150]}
    ...     },
    ...     {'uuid': 'wxyz1234', 'name': 'Bob',
    ...      'donor': {'hubmap_id': 'HBM1234.ABCD.7890'},
    ...      'mapped_metadata': {'age': [50], 'multi': ['A', 'B', 'C']}
    ...     }]
    >>> pp(_flatten_sources(donor_sources, ['uuid', 'name', 'donor.hubmap_id']))
    [{'uuid': 'abcd1234',
      'name': 'Ann',
      'donor.hubmap_id': None,
      'age': '40',
      'weight': '150'},
     {'uuid': 'wxyz1234',
      'name': 'Bob',
      'donor.hubmap_id': 'HBM1234.ABCD.7890',
      'age': '50',
      'multi': 'A, B, C'}]

    >>> sample_sources = [
    ...     {'uuid': 'abcd1234',
    ...      'metadata': {'organ': 'belly button',
    ...                   'organ_donor_data': {'example': 'Should remove!'},
    ...                   'metadata': {'example': 'Should remove!'}}
    ...     }]
    >>> pp(_flatten_sources(sample_sources, ['uuid', 'name']))
    [{'uuid': 'abcd1234', 'name': None, 'organ': 'belly button'}]
    '''
    flat_sources = [
        {
            **{
                field: _get_nested(field, source)
                for field in non_metadata_fields
            },

            # This gets sample and donor metadata.
            **source.get('metadata', {}),

            # This gets donor metadata, and concatenates nested lists.
            **{
                k: ', '.join(str(s) for s in v)
                for (k, v) in source.get('mapped_metadata', {}).items()
            }
        }
        for source in sources
    ]
    for source in flat_sources:
        if 'assay_type' in source.get('metadata', {}):
            # For donors, this is the metadata in EAV form,
            # for samples, this is a placeholder for dev-search,
            # but for datasets, we want to move it up a level.
            source.update(source['metadata'])

        for field in [
                'metadata',
                # From datasets JSON:
                'dag_provenance_list', 'extra_metadata', 'files_info_alt_path',
                # Dataset TSV columns to hide:
                'antibodies_path', 'contributors_path', 'version',
                # From samples:
                'organ_donor_data', 'living_donor_data']:
            source.pop(field, None)
    return flat_sources


def _fill_sources(sources):
    '''
    Lineup infers columns from first row.
    Just to be safe, fill in all keys for all rows.

    >>> sources = [{'a': 1}, {'b': 2}, {}]
    >>> from pprint import pp
    >>> pp(_fill_sources(sources), width=30, sort_dicts=True)
    [{'a': 1, 'b': ''},
     {'a': '', 'b': 2},
     {'a': '', 'b': ''}]
    '''
    all_keys = set().union(*(source.keys() for source in sources))
    for source in sources:
        for missing_key in all_keys - source.keys():
            source[missing_key] = ''
    return sources


def _get_entity_from_hits(hits, has_token=None, uuid=None, hbm_id=None):
    '''
    >>> _get_entity_from_hits(['fake-hit-1', 'fake-hit-2'])
    Traceback (most recent call last):
    ...
    Exception: ID not unique; got 2 matches

    >>> def error(f):
    ...   try: f()
    ...   except Exception as e: print(type(e).__name__)

    >>> error(lambda: _get_entity_from_hits([], hbm_id='HBM123.XYZ.456'))
    Forbidden

    >>> error(lambda: _get_entity_from_hits([], uuid='0123456789abcdef0123456789abcdef'))
    Forbidden

    >>> error(lambda: _get_entity_from_hits([], uuid='0123456789abcdef0123456789abcdef',
    ...       has_token=True))
    NotFound

    >>> error(lambda: _get_entity_from_hits([], uuid='too-short'))
    NotFound

    >>> _get_entity_from_hits([{'_source': 'fake-entity'}])
    'fake-entity'

    '''
    if len(hits) == 0:
        if (uuid and len(uuid) == 32 or hbm_id) and not has_token:
            # Assume that the UUID is not yet published:
            # UI will suggest logging in.
            abort(403)
        abort(404)
    if len(hits) > 1:
        raise Exception(f'ID not unique; got {len(hits)} matches')
    entity = hits[0]['_source']
    return entity


def _get_image_pyramid_descendants(entity):
    '''
    >>> _get_image_pyramid_descendants({
    ...     'descendants': []
    ... })
    []

    >>> _get_image_pyramid_descendants({
    ...     'descendants': [{'no_data_types': 'should not error!'}]
    ... })
    []

    >>> _get_image_pyramid_descendants({
    ...     'descendants': [{'data_types': ['not_a_pyramid']}]
    ... })
    []

    >>> doc = {'data_types': ['image_pyramid']}
    >>> descendants = _get_image_pyramid_descendants({
    ...     'descendants': [doc]
    ... })
    >>> descendants
    [{'data_types': ['image_pyramid']}]
    >>> assert doc == descendants[0]
    >>> assert id(doc) != id(descendants[0])

    >>> _get_image_pyramid_descendants({
    ...     'descendants': [
    ...         {'data_types': ['not_a_pyramid']},
    ...         {'data_types': ['image_pyramid']}
    ...     ]
    ... })
    [{'data_types': ['image_pyramid']}]

    There shouldn't be multiple image pyramids, but if there are, we should capture all of them:

    >>> _get_image_pyramid_descendants({
    ...     'descendants': [
    ...         {'id': 'A', 'data_types': ['image_pyramid']},
    ...         {'id': 'B', 'data_types': ['not_a_pyramid']},
    ...         {'id': 'C', 'data_types': ['image_pyramid']}
    ...     ]
    ... })
    [{'id': 'A', 'data_types': ['image_pyramid']}, {'id': 'C', 'data_types': ['image_pyramid']}]

    '''
    descendants = entity.get('descendants', [])
    image_pyramid_descendants = [
        d for d in descendants
        if 'image_pyramid' in d.get('data_types', [])
    ]
    return deepcopy(image_pyramid_descendants)


def _get_latest_uuid(revisions):
    '''
    >>> revisions = [{'a_uuid': 'x', 'revision_number': 1}, {'a_uuid': 'z', 'revision_number': 10}]
    >>> _get_latest_uuid(revisions)
    'z'
    '''
    clean_revisions = [
        {
            ('uuid' if k.endswith('_uuid') else k): v
            for k, v in revision.items()
        }
        for revision in revisions
    ]
    return max(clean_revisions,
               key=lambda revision: revision['revision_number'])['uuid']
