# portal-ui

HuBMAP Data Portal:
This is a Flask app, using React on the front end and primarily Elasticsearch on the back end,
wrapped in a Docker container for deployment using Docker Compose. The front end depends on AWS S3 and CloudFront for the hosting and delivery of images.
It is deployed at [portal.hubmapconsortium.org](https://portal.hubmapconsortium.org/)

The Data Portal depends on many [APIs](https://portal.hubmapconsortium.org/services),
and directly or indirectly, on many other HuBMAP repos.

```mermaid
graph LR
    gateway
    click gateway "https://github.com/hubmapconsortium/gateway"

    top[portal-ui] --> commons
    click top href "https://github.com/hubmapconsortium/portal-ui"
    click commons href "https://github.com/hubmapconsortium/commons"
    top --> ccf-ui
    click ccf-ui href "https://github.com/hubmapconsortium/ccf-ui"
    top --> vitessce --> viv
    click vitessce href "https://github.com/vitessce/vitessce"
    click viv href "https://github.com/hms-dbmi/viv"
    top --> portal-visualization --> vitessce-python
    click portal-visualization href "https://github.com/hubmapconsortium/portal-visualization"
    click vitessce-python href "https://github.com/vitessce/vitessce-python"
    top --> cells-sdk --> cells-api --> pipe
    click cells-sdk href "https://github.com/hubmapconsortium/cells-api-py-client"
    click cells-api href "https://github.com/hubmapconsortium/cross_modality_query"
    top --> gateway
    gateway --> entity-api --> pipe[ingest-pipeline]
    click entity-api href "https://github.com/hubmapconsortium/entity-api"
    click pipe href "https://github.com/hubmapconsortium/ingest-pipeline"
    gateway --> assets-api --> pipe
    %% assets-api is just a file server: There is no repo.
    gateway --> search-api --> pipe
    click search-api href "https://github.com/hubmapconsortium/search-api"
    gateway --> workspaces-api
    click workspaces-api href "https://github.com/hubmapconsortium/user_workspaces_server"

    pipe --> valid
    pipe --> portal-containers
    click portal-containers href "https://github.com/hubmapconsortium/portal-containers/"

    subgraph APIs
        entity-api
        search-api
        cells-api
        assets-api
        workspaces-api
    end

    subgraph Git Submodules
        valid
    end

    subgraph Python Packages
        commons
        portal-visualization
        vitessce-python
        cells-sdk
    end

    subgraph NPM Packages
        vitessce
        viv
    end

    subgraph cdn.jsdelivr.net
        ccf-ui
    end

    subgraph legend
        owner
        contributor
        not-harvard
    end

    classDef contrib fill:#ddffdd,stroke:#88AA88,color:#000;
    class owner,contributor,top,vitessce,viv,portal-visualization,vitessce-python,cells-sdk,portal-containers,valid,search-api contrib

    classDef owner stroke-width:3px,font-style:italic,color:#000;
    class owner,top,vitessce,viv,portal-visualization,vitessce-python,portal-containers owner

    style legend fill:#f8f8f8,stroke:#888888;
```

## Feedback

Issues with the Portal can be reported [via email](mailto:help@hubmapconsortium.org).
More information on how issues are tracked across HuBMAP is available
[here](https://docs.hubmapconsortium.org/feedback).

## Design

We try to have a design ready before we start coding.
Often, issues are filed in pairs, tagged [`design`](https://github.com/hubmapconsortium/portal-ui/issues?q=is%3Aissue+is%3Aopen+label%3Adesign)
and [`enhancement`](https://github.com/hubmapconsortium/portal-ui/labels/enhancement).
All designs are in [Figma](https://www.figma.com/files/team/834568130405102661/HuBMAP).
(Note that if that link redirects to `/files/recent`, you'll need to be added to the project, preferably with a `.edu` email, if you want write access.)

## Development

### Prerequisites

- `git`: Suggest [installing Apple XCode](https://developer.apple.com/xcode/).
- `python 3.10`
  - `uv` (Recommended):
    - [Install `uv`](https://docs.astral.sh/uv/getting-started/installation/) using any supported installation method.
    - Create a `uv` virtual environment with the appropriate python version via `uv venv --python $(cat .python-version)`.
    - Activate the environment with `source .venv/bin/activate`.
    - Install locked requirements with `uv pip sync context/requirements.txt` and `uv pip sync context/requirements-dev.txt`.
  - MiniConda:
    - [installing miniconda](https://docs.conda.io/en/latest/miniconda.html#macosx-installers) and [creating a new conda environment](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-with-commands): `conda create -n portal python=$(cat .python-version)`
  - pyenv:
    - `brew install pyenv`
    - `brew install pyenv-virtualenv`
    - cd into portal-ui (or provide full path to /portal-ui/.python-version file)
    - `` pyenv install `cat .python-version`  ``
    - `` pyenv virtualenv `cat .python-version` portal ``
    - `pyenv activate portal`
- `nodejs/npm`: Suggest [installing nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and then using it to install the appropriate node version: `nvm install`.
  - `` nvm install `cat .nvmrc`  ``
  - `` nvm use `cat .nvmrc`  ``

Optional:

- `VS Code`, with [recommended extensions](./.vscode/extensions.json).
  - While this is optional, it is worth noting that it is in use by the whole development team
  - Using VS Code lets us share [default configuration settings](./.vscode/default.settings.json) and easily run scripts using [VS Code tasks](./.vscode/tasks.json).
- `docker`
  - Docker is necessary in order to create images for the [deploy process](https://hms-dbmi.atlassian.net/wiki/spaces/GL/pages/3009282049/Deployment)
  - It is also used to run a local instance of the application when using the test scripts in the `./etc` directory

### Development

After checking out the project, cd-ing into it, and setting up a Python 3.9 virtual environment,

- Get `app.conf` from [Confluence](https://hms-dbmi.atlassian.net/wiki/spaces/GL/pages/3045457929/app.conf) or from another developer and place it at `context/instance/app.conf`.
- Run `etc/dev/dev-start.sh` to start the webpack dev and flask servers and then visit [localhost:5001](http://localhost:5001).
  - If using VS Code, you can also use the `dev-start` task, which will launch these services in separate terminal windows.

The webpack dev server serves all files within the public directory and provides hot module replacement for the react application;
The webpack dev server proxies all requests outside of those for files in the public directory to the flask server.

Note: Searchkit, our interface to Elasticsearch, has changed significantly in the latest release. Documentation for version 2.0 can be found [here](https://github.com/searchkit/searchkit/tree/6f3786657c8afa6990a41acb9f2371c28b2e0986/packages/searchkit-docs).

### Changelog files

Every PR should be reviewed, and every PR should include a new `CHANGELOG-something.md` at the root of the repository. These are concatenated by `etc/build/push.sh` during deploy.

### File and directory structure conventions

<details><summary>:atom_symbol: React</summary>

> **Note**  
> **Any mentions of `.js`/`.jsx` in the following guidelines are interchangeable with `.ts`/`.tsx`. New features should ideally be developed in TypeScript.**

- Components with tests or styles should be placed in to their own directory.
- Styles should follow the `style.*` pattern where the extension is `js` for styled components or `css` for stylesheets.
  - New styled components should use `styled` from `@mui/material/styles`.
- Supporting test files have specific naming conventions:
  - Jest Tests should follow the `*.spec.js` pattern.
  - Stories should follow the `*.stories.js` pattern.
  - Cypress tests should follow the `*.cy.js` pattern.
  - For all test files, the prefix is the name of the component.
- Each component directory should have an `index.js` which exports the component as default.
- Components which share a common domain can be placed in a directory within components named after the domain.

</details>

<details><summary>:framed_picture: Images</summary>

Images should displayed using the `source srcset` attribute. You should prepare four versions of the image starting at its original size and at 75%, 50% and 25% the original image's size preserving its aspect ratio. If available, you should also provide a 2x resolution for higher density screens.

- For example, to resize images using Mac's Preview you can visit the 'Tools' menu and select 'Adjust Size', from there you can change the image's width while making sure 'Scale Proportionally' and 'Resample Image' are checked. You can also use the [`resize-images.sh`](./etc/dev/resize-images.sh) script. Once ready, each version of the image should be processed with an image optimizer such as [ImgOptim](https://imageoptim.com/mac) or [Online Image Compressor](https://imagecompressor.com/).

Homepage images should also be provided in `.webp` format; a [batch conversion script is provided](./etc/dev/convert-to-webp.sh) to aid this process.

Finally after processing, the images should be added to the S3 bucket, `portal-ui-images-s3-origin`,
to be delivered by the cloudfront CDN.
SVG files larger than 5KB should also be stored in S3 and delivered by the CDN.
SVG files smaller than 5KB can be included in the repository in `context/app/static/assets/svg/`.
The CDN responds with a `cache-control: max-age=1555200` header for all items,
but can be overridden on a per image basis by setting the `cache-control` header for the object in S3.

If an uploaded file replaces an existing one and uses the same file name, a CloudFront cache invalidation should be run, targeting the specific file(s) that have been updated.

- Log in to the AWS console and go to [distributions](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home?region=us-east-1#/distributions)
- Select the distribution corresponding to the S3 server.
- Go to the `Invalidations` tab and click `Create Invalidation`.
- Enter the file names which should be invalidated in cache, with the full path; you can target multiple similar file names by using wildcards
  - e.g. to invalidate all files in `/` starting with `publication-slide`, you would enter `/publication-slide*`, which would select all the different sizes of that image.
- After confirming that you are targeting only the intended files, click `Create Invalidation` again.

For the homepage carousel, images should have a 16:9 aspect ratio, a width of at least 1400px, a title, a description, and, if desired, a url to be used for the 'Get Started' button.

</details>

## Testing

Python unit tests use Pytest, front end tests use Jest, and end-to-end tests use Cypress.
Each suite is run separately on GitHub CI.

Load tests [are available](end-to-end/artillery/), but they are not run as part of CI.

### Running tests locally without docker

- **Jest**: `cd context; npm run test`
- **Cypress**: With the application running, `cd end-to-end; npm run cypress:open`
  - If using WSL2, see the WSL2-specific steps in the [end to end readme](./end-to-end/README.md).
  - Note that the cypress tests (particularly for the publication page) are expected to be run with the `test` environment enabled in app.conf
- **Pytest**: `cd context; pytest app --ignore app/api/vitessce_conf_builder`

### Linting and pre-commit hooks

CI lints the codebase, and to save time, we also lint in a pre-commit hook.
If you want to bypass the hook, set `HUSKY_SKIP_HOOKS=1`.

You can also lint and auto-correct from the command-line:

```
cd context
npm run lint
npm run lint:fix
EXCLUDE=node_modules,etc/dev/organ-utils
autopep8 --in-place --aggressive -r . --exclude $EXCLUDE
```

### Storybook

To start storybook locally you can either run `etc/dev/dev-start.sh`, or just `npm run storybook`,
and after it has started, visit [localhost:6006](http://localhost:6006).

## Build, tag, and deploy

The build, tag, deploy, and QA procedures are [detailed here](https://hms-dbmi.atlassian.net/wiki/spaces/GL/pages/3009282049/Deployment).

Instructions for Production are provided [here](compose/README-deploy-PROD.txt).

### Understanding the build

<details><summary>Webpack</summary>

To view visualizations of the production webpack bundle run `npm run build:analyze`.
The script will generate two files, report.html and stats.html, inside the public directory each showing a different visual representation of the bundle.

</details>

<details><summary>Docker</summary>

To build and run the docker image locally:

```sh
etc/dev/docker.sh 5001 --follow
```

Our base image is based on [this template](https://github.com/tiangolo/uwsgi-nginx-flask-docker#quick-start-for-bigger-projects-structured-as-a-python-package).

</details>

<details><summary>Docker Compose</summary>

In the deployments, our container is behind a NGINX reverse reproxy;
Here's a [simple demonstration](compose/) of how that works.

</details>

## Related projects and dependencies

### Search

The portal team contributes code to a [subdirectory within `search-api`](https://github.com/hubmapconsortium/search-api/tree/main/src/elasticsearch/addl_index_transformations)
to clean up the raw Neo4J export and provide us with clean, usable facets.
Within that directory, [`config.yaml`](https://github.com/hubmapconsortium/search-api/blob/test-release/src/elasticsearch/addl_index_transformations/portal/config.yaml) configures the Elasticsearch index itself.

### Visualization

Data visualization is an integral part of the portal, allowing users to view the results of analysis pipelines or raw uploaded data easily directly in the browser. How such data is processed and prepared for visualization in the client-side Javascript via [`vitessce`](https://github.com/hubmapconsortium/vitessce) can be found [here](https://github.com/hubmapconsortium/portal-visualization#readme).

General-purpose tools:

- [`viv`](https://github.com/hms-dbmi/viv): JavaScript library for rendering OME-TIFF and OME-NGFF (Zarr) directly in the browser. Packaged as [deck.gl](https://deck.gl/) layers.
- [`vitessce`](https://github.com/hubmapconsortium/vitessce): Visual integration tool for exploration of spatial single-cell experiments. Built on top of [deck.gl](https://deck.gl/).
- [`vitessce-python`](https://github.com/vitessce/vitessce-python): Python wrapper classes which make it easier to build configurations.

Particular to HuBMAP:

- [`portal-visualization`](https://github.com/hubmapconsortium/portal-visualization): Given HuBMAP Dataset JSON, creates a Vitessce configuration.
- [`portal-containers`](https://github.com/hubmapconsortium/portal-containers): Docker containers for visualization preprocessing.
- [`airflow-dev`](https://github.com/hubmapconsortium/airflow-dev): CWL pipelines wrapping those Docker containers.
