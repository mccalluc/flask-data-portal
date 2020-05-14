import pytest

from .vitessce import Vitessce
from ..main import create_app
\
TEST_ENTITY_CODEX = {
    'data_types': ['codex_cytokit'],
    'uuid': 'uuid'
}

TEST_ENTITY_RNASEQ = {
    'data_types': ['salmon_rnaseq_10x'],
    'uuid': 'uuid'
}

TEST_NEXUS_TOKEN = 'nexus_token'

TEST_UUID = 'uuid'

TEST_PATH_TIFF = 'path/to/example.ome.tiff'

MOCK_URL = 'https://example.com'

def test_build_image_schema():
  vitessce = Vitessce(entity=TEST_ENTITY_CODEX, nexus_token=TEST_NEXUS_TOKEN, is_mock=True)
  schema = vitessce._build_image_schema(rel_path=TEST_PATH_TIFF, uuid=TEST_UUID)
  assert (
      schema['name'] == 'example.ome.tiff'
  )
  assert (
      schema['url'] == f'https://example.com/uuid/path/to/example.ome.tiff?token={TEST_NEXUS_TOKEN}'
  )
  assert (
      schema['type'] == 'ome-tiff'
  )
  assert (
    schema['metadata']['omeTiffOffsetsUrl'] == f'https://example.com/uuid/ppneorh7/example.offsets.json?token={TEST_NEXUS_TOKEN}'
  )


def test_build_assets_url():
  vitessce = Vitessce(entity=TEST_ENTITY_CODEX, nexus_token=TEST_NEXUS_TOKEN, is_mock=True)
  url = vitessce._build_assets_url(rel_path=TEST_PATH_TIFF, uuid=TEST_UUID)
  assert (
      url == f'https://example.com/uuid/path/to/example.ome.tiff?token={TEST_NEXUS_TOKEN}'
  )

def test_build_layer_conf():
  vitessce = Vitessce(entity=TEST_ENTITY_RNASEQ, nexus_token=TEST_NEXUS_TOKEN, is_mock=True)
  vitessce._build_vitessce_conf()
  conf = vitessce.conf
  layer = conf['layers'][0]
  vitessce_component = conf['staticLayout'][0]['component']
  assert (
    layer['url'] == f'https://example.com/uuid/dim_reduced_clustered/dim_reduced_clustered.json?token={TEST_NEXUS_TOKEN}'
  )
  assert (
    layer['type'] == 'CELLS'
  )
  assert (
    layer['name'] == 'cells'
  )
  assert (
    vitessce_component == 'scatterplot'
  )