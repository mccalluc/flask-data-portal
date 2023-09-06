from flask import Flask, session, render_template, redirect, request

from . import (
    routes_main, routes_browse, routes_api, routes_file_based,
    routes_auth, routes_cells, routes_markdown, routes_notebooks,
    routes_workspaces, routes_cell_types, default_config)
from .flask_static_digest import FlaskStaticDigest
flask_static_digest = FlaskStaticDigest()


def render_react_error(code, title):
    return render_template('base-pages/react-content.html',
                           flask_data={'errorCode': code},
                           title=title), code


def bad_request(e):
    '''A 400 means the request to the API failed.'''
    return render_react_error(400, 'Bad Request')


def not_found(e):
    '''A 404 means Flask routing failed.'''
    return render_react_error(404, 'Page Not Found')


def unauthorized(e):
    '''A 401 probably means Globus credentials have expired.'''
    # Go ahead and clear the flask session for the user.
    # Without this, the button still says "Logout", as if they were still logged in.
    # We check group membership on login, which is a distinct 401,
    # with its own template.
    session.clear()
    return render_react_error(401, 'Unauthorized')


def forbidden(e):
    return render_react_error(403, 'Forbidden')


def gateway_timeout(e):
    '''A 504 means the API has timed out.'''
    return render_react_error(504, 'Gateway Timeout')


def any_other_error(e):
    '''
    In debug mode, we will still fall back to the interactive debugger.
    https://flask.palletsprojects.com/en/2.0.x/errorhandling/#unhandled-exceptions
    '''
    return render_react_error(500, 'Internal Server Error')


def create_app(testing=False):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(default_config.DefaultConfig)
    if testing:
        app.config['TESTING'] = True
    else:
        # We should not load the gitignored app.conf during tests.
        app.config.from_pyfile('app.conf')

    flask_static_digest.init_app(app)

    app.register_blueprint(routes_main.blueprint)
    app.register_blueprint(routes_browse.blueprint)
    app.register_blueprint(routes_api.blueprint)
    app.register_blueprint(routes_file_based.blueprint)
    app.register_blueprint(routes_cells.blueprint)
    app.register_blueprint(routes_auth.blueprint)
    app.register_blueprint(routes_markdown.blueprint)
    app.register_blueprint(routes_notebooks.blueprint)
    app.register_blueprint(routes_workspaces.blueprint)
    app.register_blueprint(routes_cell_types.blueprint)

    app.register_error_handler(400, bad_request)
    app.register_error_handler(401, unauthorized)
    app.register_error_handler(403, forbidden)
    app.register_error_handler(404, not_found)
    app.register_error_handler(504, gateway_timeout)
    app.register_error_handler(500, any_other_error)

    # Credit to https://stackoverflow.com/a/40365514
    # for this way to redirect from slash-ending urls to plain.
    app.url_map.strict_slashes = False

    @app.before_request
    def clear_trailing():
        path = request.path
        query_wo_mark = request.query_string.decode()
        query_w_mark = f'?{query_wo_mark}' if query_wo_mark else ''
        if path.endswith('/') and path != '/':
            return redirect(path[:-1] + query_w_mark)

    @app.context_processor
    def inject_template_globals():
        return {
            'is_authenticated': session.get('is_authenticated'),
            'groups_token': session.get('groups_token'),
            'user_email': session.get('user_email'),
            'workspaces_token': session.get('workspaces_token'),
            'user_groups': session.get('user_groups'),
        }

    @app.before_request
    def set_default_groups_token():
        if 'groups_token' not in session:
            session.update(
                groups_token='',
                user_email='',
                is_authenticated=False,
                workspaces_token='',
                user_groups=[])
    return app


app = create_app()
