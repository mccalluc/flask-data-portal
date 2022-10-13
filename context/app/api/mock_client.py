import json

from datauri import DataURI

from portal_visualization.builders.base_builders import ConfigsCells
from .client import ApiClient


class MockApiClient(ApiClient):
    def get_entity(self, uuid=None, hbm_id=None):
        return {
            'created': '2020-01-01 00:00:00',
            'modified': '2020-01-01 00:00:00',
            'provenance_user_displayname': 'Chuck McCallum',
            'provenance_user_email': 'mccalluc@example.com',
            'provenance_group_name': 'Mock Group',
            'hubmap_id': 'abcd-1234',
            'description': 'Mock Entity'
        }

    def get_vitessce_conf_cells(self, entity):
        return ConfigsCells(_get_mock_vitessce_conf(), None)


def _get_mock_vitessce_conf():
    cellsData = json.dumps({'cell-id-1': {'mappings': {'t-SNE': [1, 1]}}})
    cellsUri = DataURI.make(
        'text/plain', charset='us-ascii', base64=True, data=cellsData
    )
    token = 'fake-token'
    return {
        'description': 'DEMO',
        'layers': [
            {
                'name': 'cells',
                'type': 'CELLS',
                'url': cellsUri,
                'requestInit': {
                    'headers': {
                        'Authorization': 'Bearer ' + token
                    }
                }
            },
        ],
        'name': 'Linnarsson',
        'staticLayout': [
            {
                'component': 'scatterplot',
                'props': {
                    'mapping': 'UMAP',
                    'view': {
                        'zoom': 4,
                        'target': [0, 0, 0]
                    }
                },
                'x': 0, 'y': 0, 'w': 12, 'h': 2
            },
        ]
    }
