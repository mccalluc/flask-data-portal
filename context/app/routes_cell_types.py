from flask import render_template, current_app, jsonify, escape

from hubmap_api_py_client import Client
import requests

from .utils import get_default_flask_data, make_blueprint, get_organs

blueprint = make_blueprint(__name__)


def _get_client(app):
    return Client(app.config['XMODALITY_ENDPOINT'] + '/api/')


@blueprint.route('/cell-types')
def cell_types_ui():
    organs = get_organs()
    return render_template(
        'base-pages/react-content.html',
        title='Cell Types',
        flask_data={**get_default_flask_data(), 'organs': organs}
    )


# Fetches list of all cell types
@blueprint.route('/cell-types/list.json')
def cell_types_list():
    celltype_token_post = requests.post(
        'https://cells.api.hubmapconsortium.org/api/celltype/',
        {}).json()
    celltype_token = celltype_token_post['results'][0]['query_handle']
    celltype_list = requests.post('https://cells.api.hubmapconsortium.org/api/celltypeevaluation/', {
        'key': celltype_token,
        'set_type': 'cell_type',
        'limit': 500}).json()
    print(celltype_list)
    celltype_list = celltype_list['results']
    return jsonify(celltype_list)


# Fetches cell type description
@blueprint.route('/cell-types/<cell_type>/description.json')
def cell_type_description(cell_type):
    headers = {"accept": 'application/json'}
    celltype_concepts = requests.get(
        f'https://ontology.api.hubmapconsortium.org/terms/%s/concepts' % escape(cell_type),
        headers=headers).json()
    if (len(celltype_concepts) == 0):
        return jsonify('No description available')
    concept = celltype_concepts[0]
    description = requests.get(
        f'https://ontology.api.hubmapconsortium.org/concepts/%s/definitions' % escape(concept),
        headers=headers).json()
    if (len(description) == 0):
        return jsonify('No description available')
    return jsonify(description[0]['definition'])


# Fetches dataset UUIDs for a given cell type
@blueprint.route('/cell-types/<cell_type>/datasets.json')
def cell_type_datasets(cell_type):
    client = _get_client(current_app)
    datasets = client.select_datasets(where='celltype', has=[cell_type]).get_list()
    datasets = [dataset['uuid'] for dataset in list(datasets)]

    return jsonify(datasets)


# Fetches list of organs for a given cell type
@blueprint.route('/cell-types/<cell_type>/organs.json')
def cell_type_organs(cell_type):
    client = _get_client(current_app)
    organs = client.select_organs(where='celltype', has=[cell_type]).get_list()
    organs = [organ['grouping_name'] for organ in list(organs)]
    organs = ', '.join([organ for organ in list(organs)])

    return jsonify(organs)


# Fetches list of assays for a given cell type
@blueprint.route('/cell-types/<cell_type>/assays.json')
def cell_type_assays(cell_type):
    # TODO: Uncomment when assays are available
    # client = _get_client(current_app)
    # assays = [assay['grouping_name']
    #           for assay
    #           in client.select_assays(where='celltype', has=[cell_type]).get_list()]
    # assays = ','.join([dataset for dataset in list(assays)])

    assays = ', '.join(['TBD'])

    return jsonify(assays)
