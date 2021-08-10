from os.path import dirname
from urllib.parse import urlparse
import json
from io import StringIO
from csv import DictWriter

import nbformat
from nbformat.v4 import (new_notebook, new_markdown_cell, new_code_cell)

from flask import (Blueprint, render_template, abort, current_app,
                   session, request, redirect, url_for, Response)

import frontmatter

from .api.client import ApiClient


entity_types = ['donor', 'sample', 'dataset', 'support', 'collection']
blueprint = Blueprint('routes', __name__, template_folder='templates')


def _get_client():
    try:
        is_mock = current_app.config['IS_MOCK']
    except KeyError:
        is_mock = False
    if is_mock:
        return ApiClient(is_mock=is_mock)
    return ApiClient(
        current_app.config['ENTITY_API_BASE'],
        session['nexus_token']
    )


def get_default_flask_data():
    return {
        'endpoints': {
            'elasticsearchEndpoint': current_app.config['ELASTICSEARCH_ENDPOINT']
            + current_app.config['PORTAL_INDEX_PATH'],
            'assetsEndpoint': current_app.config['ASSETS_ENDPOINT'],
            'entityEndpoint': current_app.config['ENTITY_API_BASE'],
            'xmodalityEndpoint': current_app.config['XMODALITY_ENDPOINT'],
            'gatewayEndpoint': current_app.config['GATEWAY_ENDPOINT'],
        },
        'globalAlertMd': current_app.config.get('GLOBAL_ALERT_MD')
    }


@blueprint.route('/')
def index():
    flask_data = {**get_default_flask_data()}
    return render_template(
        'pages/base_react.html',
        types=entity_types,
        flask_data=flask_data,
        title='HuBMAP Data Portal',
        is_home_page=True
    )


@blueprint.route('/services')
def service_status():
    flask_data = {**get_default_flask_data()}
    return render_template(
        'pages/base_react.html',
        types=entity_types,
        flask_data=flask_data,
        title='Services'
    )


@blueprint.route('/ccf-eui')
def ccf_eui():
    return render_template(
        'pages/ccf-eui.html',
        config=current_app.config,
        url_root=request.url_root,
        nexus_token=(
            session['nexus_token']
            if 'nexus_token' in session
            else ''
        )
    )


@blueprint.route('/browse/HBM<hbm_suffix>')
def hbm_redirect(hbm_suffix):
    client = _get_client()
    entity = client.get_entity(hbm_id=f'HBM{hbm_suffix}')
    return redirect(
        url_for('routes.details', type=entity['entity_type'].lower(), uuid=entity['uuid']))


@blueprint.route('/browse/<type>/<uuid>.<unknown_ext>')
def unknown_ext(type, uuid, unknown_ext):
    # https://github.com/pallets/werkzeug/blob/b01fa1817343d2a36a9d8bb17f61ddf209c27c2b/src/werkzeug/routing.py#L1126
    # Rules with static parts come before variable routes...
    # so the known extensions will come before this.
    abort(404)


@blueprint.route('/browse/<type>/<uuid>')
def details(type, uuid):
    if type not in entity_types:
        abort(404)
    client = _get_client()
    entity = client.get_entity(uuid)
    actual_type = entity['entity_type'].lower()
    if type != actual_type:
        return redirect(url_for('routes.details', type=actual_type, uuid=uuid))

    template = 'pages/base_react.html'
    conf_cells = client.get_vitessce_conf_cells(entity)
    flask_data = {
        **get_default_flask_data(),
        'entity': entity,
        'vitessce_conf': conf_cells.conf,
        'has_notebook': conf_cells.cells is not None
    }
    return render_template(
        template,
        type=type,
        uuid=uuid,
        title=f'{entity["hubmap_id"]} | {type.title()}',
        flask_data=flask_data
    )


@blueprint.route('/browse/<type>/<uuid>.json')
def details_json(type, uuid):
    if type not in entity_types:
        abort(404)
    client = _get_client()
    entity = client.get_entity(uuid)
    return entity


@blueprint.route('/browse/<type>/<uuid>.ipynb')
def details_notebook(type, uuid):
    if type not in entity_types:
        abort(404)
    client = _get_client()
    entity = client.get_entity(uuid)
    vitessce_conf = client.get_vitessce_conf_cells(entity)
    if (vitessce_conf is None
            or vitessce_conf.conf is None
            or vitessce_conf.cells is None):
        abort(404)
    nb = new_notebook()
    nb['cells'] = [
        new_markdown_cell(f"""
Visualization for [{entity['hubmap_id']}]({request.base_url.replace('.ipynb','')})
        """.strip()),
        new_code_cell("""
!pip install vitessce==0.1.0a9
!jupyter nbextension install --py --sys-prefix vitessce
!jupyter nbextension enable --py --sys-prefix vitessce
        """.strip()),
        new_code_cell('from vitessce import VitessceConfig')
    ] + vitessce_conf.cells + [
        new_code_cell('conf.widget()')
    ]
    return Response(
        response=nbformat.writes(nb),
        headers={'Content-Disposition': f"attachment; filename={entity['hubmap_id']}.ipynb"},
        mimetype='application/x-ipynb+json'
    )


@blueprint.route('/browse/<type>/<uuid>.rui.json')
def details_rui_json(type, uuid):
    # Note that the API returns a blob of JSON as a string,
    # so, to return a JSON object, and not just a string, we need to decode.
    if type not in entity_types:
        abort(404)
    client = _get_client()
    entity = client.get_entity(uuid)
    # For Samples...
    if 'rui_location' in entity:
        return json.loads(entity['rui_location'])
    # For Datasets...
    if 'ancestors' not in entity:
        abort(404)
    located_ancestors = [a for a in entity['ancestors'] if 'rui_location' in a]
    if not located_ancestors:
        abort(404)
    # There may be multiple: The last should be the closest...
    # but this should be confirmed, when there are examples.
    return json.loads(located_ancestors[-1]['rui_location'])


@blueprint.route('/search')
@blueprint.route('/cells-search')
def search():
    entity_type = request.args.get('entity_type[0]')
    title = f'{entity_type}s' if entity_type else 'Search'
    flask_data = {
        **get_default_flask_data(),
        'title': title,
    }
    return render_template(
        'pages/base_react.html',
        title=title,
        types=entity_types,
        flask_data=flask_data,
    )


@blueprint.route('/dev-search')
def dev_search():
    title = 'Dev Search'
    flask_data = {
        **get_default_flask_data(),
        'title': title,
    }
    return render_template(
        'pages/base_react.html',
        title=title,
        types=entity_types,
        flask_data=flask_data
    )


@blueprint.route('/diversity')
def vis():
    title = 'Donor Diversity'
    flask_data = {
        **get_default_flask_data(),
        'title': title
    }
    return render_template(
        'pages/base_react.html',
        title=title,
        types=entity_types,
        flask_data=flask_data
    )


@blueprint.route('/preview/<name>')
def preview_view(name):
    filename = dirname(__file__) + '/preview/' + name + '.md'
    metadata_content = frontmatter.load(filename)
    preview_metadata = metadata_content.metadata
    markdown = metadata_content.content
    flask_data = {
        **get_default_flask_data(),
        'title': preview_metadata['title'],
        'markdown': markdown,
        'entity': {
            'group_name': preview_metadata['group_name'],
            'created_by_user_displayname': preview_metadata['created_by_user_displayname'],
            'created_by_user_email': preview_metadata['created_by_user_email'],
        },
        'vitessce_conf': preview_metadata.get('vitessce_conf')
    }
    return render_template(
        'pages/base_react.html',
        title='Preview',
        flask_data=flask_data
    )


@blueprint.route('/publication/<name>')
def publication_view(name):
    filename = dirname(__file__) + '/publication/' + name + '.md'
    metadata_content = frontmatter.load(filename)
    publication_metadata = metadata_content.metadata
    markdown = metadata_content.content
    flask_data = {
        **get_default_flask_data(),
        'title': publication_metadata['title'],
        'markdown': markdown,
        # Unlike preview, no "entity".
        'vitessce_conf': publication_metadata.get('vitessce_conf')
    }
    return render_template(
        'pages/base_react.html',
        title='Publication',
        flask_data=flask_data
    )


@blueprint.route('/collections')
def collections():
    flask_data = {**get_default_flask_data()}
    return render_template(
        'pages/base_react.html',
        title='Collections',
        flask_data=flask_data
    )


@blueprint.route('/my-lists')
def my_lists():
    flask_data = {**get_default_flask_data()}
    return render_template(
        'pages/base_react.html',
        title='My Lists',
        flask_data=flask_data
    )


@blueprint.route('/my-lists/<saved_list_uuid>')
def list_page(saved_list_uuid):
    flask_data = {
        **get_default_flask_data(),
        'list_uuid': saved_list_uuid
    }
    return render_template(
        'pages/base_react.html',
        title='Saved List',
        flask_data=flask_data
    )


@blueprint.route('/robots.txt')
def robots_txt():
    allowed_hostname = 'portal.hubmapconsortium.org'
    hostname = urlparse(request.base_url).hostname
    disallow = '/search' if hostname == allowed_hostname else '/'
    return Response(
        f'''
# This host: {hostname}
# Allowed host: {allowed_hostname}
User-agent: *
Disallow: {disallow}
Sitemap: {get_url_base_from_request()}/sitemap.txt
''',
        mimetype='text/plain')


@blueprint.route('/sitemap.txt')
def sitemap_txt():
    client = _get_client()
    uuids = client.get_all_dataset_uuids()
    url_base = get_url_base_from_request()
    return Response(
        '\n'.join(
            f'{url_base}/browse/dataset/{uuid}' for uuid in uuids
        ),
        mimetype='text/plain')


def get_url_base_from_request():
    parsed = urlparse(request.base_url)
    scheme = parsed.scheme
    netloc = parsed.netloc
    return f'{scheme}://{netloc}'


# TODO: Move these, once the routes cleanup is merged:
# https://github.com/hubmapconsortium/portal-ui/pull/2052
@blueprint.route('/api/v0/donors.tsv')
def donors_tsv():
    client = _get_client()
    first_fields = ['uuid', 'hubmap_id']
    donors = client.get_all_donors(first_fields)
    return _make_tsv_response(_dicts_to_tsv(donors, first_fields), 'donors.tsv')


@blueprint.route('/api/v0/samples.tsv')
def samples_tsv():
    client = _get_client()
    first_fields = ['uuid', 'hubmap_id']
    samples = client.get_all_samples(first_fields)
    return _make_tsv_response(_dicts_to_tsv(samples, first_fields), 'samples.tsv')


def _make_tsv_response(tsv_content, filename):
    return Response(
        response=tsv_content,
        headers={'Content-Disposition': f"attachment; filename={filename}"},
        mimetype='text/tab-separated-values'
    )


def _dicts_to_tsv(data_dicts, first_fields):
    '''
    >>> data_dicts = [
    ...   {'title': 'Star Wars', 'subtitle': 'A New Hope', 'date': '1977'},
    ...   {'title': 'The Empire Strikes Back', 'date': '1980'},
    ...   {'title': 'The Return of the Jedi', 'date': '1983'}
    ... ]
    >>> from pprint import pp
    >>> pp(dicts_to_tsv(data_dicts, ['title']))
    ('title\\tdate\\tsubtitle\\r\\n'
     'Star Wars\\t1977\\tA New Hope\\r\\n'
     'The Empire Strikes Back\\t1980\\t\\r\\n'
     'The Return of the Jedi\\t1983\\t\\r\\n')
    '''
    body_fields = sorted(
        set().union(*[d.keys() for d in data_dicts])
        - set(first_fields)
    )
    output = StringIO()
    writer = DictWriter(output, first_fields + body_fields, delimiter='\t')
    writer.writeheader()
    writer.writerows(data_dicts)
    return output.getvalue()
