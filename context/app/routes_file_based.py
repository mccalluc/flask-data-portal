from os.path import dirname
from pathlib import Path

from yaml import safe_load
from flask import render_template
from werkzeug.utils import secure_filename

import frontmatter

from .utils import get_default_flask_data, make_blueprint, get_organs


blueprint = make_blueprint(__name__)


@blueprint.route('/preview/<name>')
def preview_details_view(name):
    filename = dirname(__file__) + '/preview/' + secure_filename(name) + '.md'
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
        'vitessce_conf_list': [preview_metadata.get('vitessce_conf')]
    }
    return render_template(
        'base-pages/react-content.html',
        title='Preview',
        flask_data=flask_data
    )


@blueprint.route('/publication')
def publication_index_view():
    dir_path = Path(dirname(__file__) + '/publication')
    publications = {p.stem: dict(frontmatter.load(p)) for p in dir_path.glob('*.md')}
    flask_data = {
        **get_default_flask_data(),
        'publications': publications
    }
    return render_template(
        'base-pages/react-content.html',
        title='Publications',
        flask_data=flask_data
    )


@blueprint.route('/publication/<name>')
def publication_details_view(name):
    filename = dirname(__file__) + '/publication/' + secure_filename(name) + '.md'
    metadata_content = frontmatter.load(filename)
    flask_data = {
        **get_default_flask_data(),
        'metadata': metadata_content.metadata,
        'markdown': metadata_content.content,
    }
    return render_template(
        'base-pages/react-content.html',
        title='Publication',
        flask_data=flask_data
    )


@blueprint.route('/organ')
def organ_index_view():
    organs = get_organs()
    flask_data = {
        **get_default_flask_data(),
        'organs': organs
    }
    return render_template(
        'base-pages/react-content.html',
        title='Organs',
        flask_data=flask_data
    )


@blueprint.route('/organ/<name>')
def organ_details_view(name):
    filename = Path(dirname(__file__)) / 'organ' / f'{secure_filename(name)}.yaml'
    organ = safe_load(filename.read_text())
    flask_data = {
        **get_default_flask_data(),
        'organ': organ
    }
    return render_template(
        'base-pages/react-content.html',
        title=organ['name'],
        flask_data=flask_data
    )
