import React, { lazy, useContext } from 'react';
import PropTypes from 'prop-types';

import { AppContext } from 'js/components/Providers';
import Error from 'js/pages/Error';
import Route from './Route';
import useSendPageView from './useSendPageView';
import useSetUrlBeforeLogin from './useSetUrlBeforeLogin';

const Donor = lazy(() => import('js/pages/Donor'));
const Dataset = lazy(() => import('js/pages/Dataset'));
const Sample = lazy(() => import('js/pages/Sample'));
const Collection = lazy(() => import('js/pages/Collection'));
const Home = lazy(() => import('js/pages/Home/Home'));
const Search = lazy(() => import('js/pages/search/Search'));
const CellsSearch = lazy(() => import('js/pages/search/CellsSearch'));
const DevSearch = lazy(() => import('js/pages/search/DevSearch'));
const Diversity = lazy(() => import('js/pages/Diversity'));
const Preview = lazy(() => import('js/pages/Preview'));
const Publications = lazy(() => import('js/pages/Publications'));
const Publication = lazy(() => import('js/pages/Publication'));
const Services = lazy(() => import('js/pages/Services'));
const Collections = lazy(() => import('js/pages/Collections'));
const Cells = lazy(() => import('js/pages/Cells'));
const Markdown = lazy(() => import('js/components/Markdown'));
const SavedLists = lazy(() => import('js/pages/SavedLists'));
const SavedList = lazy(() => import('js/pages/SavedList'));
const LineUpPage = lazy(() => import('js/pages/LineUpPage'));
const Organs = lazy(() => import('js/pages/Organs'));
const Organ = lazy(() => import('js/pages/Organ'));
const DonorSearch = lazy(() => import('js/pages/entity-search/DonorSearch'));
const SampleSearch = lazy(() => import('js/pages/entity-search/SampleSearch'));
const DatasetSearch = lazy(() => import('js/pages/entity-search/DatasetSearch'));
const Workspaces = lazy(() => import('js/pages/Workspaces'));
const WorkspacePleaseWait = lazy(() => import('js/pages/WorkspacePleaseWait'));

function Routes({ flaskData }) {
  const {
    entity,
    vitessce_conf_list,
    title,
    publications,
    markdown,
    errorCode,
    list_uuid,
    has_notebook,
    vis_lifted_uuid,
    entities,
    organs,
    organs_count,
    organ,
    metadata,
  } = flaskData;
  const urlPath = window.location.pathname;
  const url = window.location.href;

  useSendPageView(urlPath);
  useSetUrlBeforeLogin(url);

  const { isAuthenticated } = useContext(AppContext);

  if (errorCode !== undefined) {
    return <Error errorCode={errorCode} urlPath={urlPath} isAuthenticated={isAuthenticated} />;
  }

  if (urlPath.startsWith('/browse/donor/')) {
    return (
      <Route>
        <Donor assayMetadata={entity} vitData={vitessce_conf_list} />
      </Route>
    );
  }
  if (urlPath.startsWith('/browse/sample/')) {
    return (
      <Route>
        <Sample assayMetadata={entity} vitData={vitessce_conf_list} />
      </Route>
    );
  }

  if (urlPath.startsWith('/browse/dataset/') || urlPath.startsWith('/browse/support/')) {
    return (
      <Route>
        <Dataset
          assayMetadata={entity}
          vitData={vitessce_conf_list}
          hasNotebook={has_notebook}
          visLiftedUUID={vis_lifted_uuid}
        />
      </Route>
    );
  }

  if (urlPath.startsWith('/browse/collection/')) {
    return (
      <Route>
        <Collection collection={entity} />
      </Route>
    );
  }

  if (urlPath === '/') {
    return (
      <Route disableWidthConstraint>
        <Home organsCount={organs_count} />
      </Route>
    );
  }

  if (urlPath.startsWith('/search')) {
    return (
      <Route>
        <Search title={title} />
      </Route>
    );
  }

  if (urlPath.startsWith('/test-search/donors')) {
    return (
      <Route>
        <DonorSearch />
      </Route>
    );
  }

  if (urlPath.startsWith('/test-search/samples')) {
    return (
      <Route>
        <SampleSearch />
      </Route>
    );
  }

  if (urlPath.startsWith('/test-search/datasets')) {
    return (
      <Route>
        <DatasetSearch />
      </Route>
    );
  }

  if (urlPath.startsWith('/cells-search')) {
    return (
      <Route>
        <CellsSearch title={title} />
      </Route>
    );
  }

  if (urlPath.startsWith('/dev-search')) {
    return (
      <Route>
        <DevSearch />
      </Route>
    );
  }

  if (urlPath.startsWith('/diversity')) {
    return (
      <Route>
        <Diversity />
      </Route>
    );
  }

  if (urlPath.startsWith('/preview')) {
    return (
      <Route>
        <Preview title={title} vitData={vitessce_conf_list} assayMetadata={entity} markdown={markdown} />
      </Route>
    );
  }

  if (urlPath === '/publication') {
    return (
      <Route>
        <Publications publications={publications} />
      </Route>
    );
  }

  if (urlPath.startsWith('/publication/')) {
    return (
      <Route>
        <Publication metadata={metadata} markdown={markdown} />
      </Route>
    );
  }

  if (urlPath === '/organ') {
    return (
      <Route>
        <Organs organs={organs} />
      </Route>
    );
  }

  if (urlPath.startsWith('/organ/')) {
    return (
      <Route>
        <Organ organ={organ} />
      </Route>
    );
  }

  if (urlPath === '/services') {
    return (
      <Route>
        <Services />
      </Route>
    );
  }

  if (urlPath === '/collections') {
    return (
      <Route>
        <Collections />
      </Route>
    );
  }

  if (urlPath === '/cells') {
    return (
      <Route>
        <Cells />
      </Route>
    );
  }

  if (urlPath === '/my-lists') {
    return (
      <Route>
        <SavedLists />
      </Route>
    );
  }

  if (urlPath.startsWith('/my-lists/')) {
    return (
      <Route>
        <SavedList listUUID={list_uuid} />
      </Route>
    );
  }

  if (urlPath === '/workspaces') {
    return (
      <Route>
        <Workspaces />
      </Route>
    );
  }

  if (urlPath.startsWith('/workspaces/')) {
    const workspaceId = urlPath.split('/').pop();
    return (
      <Route>
        <WorkspacePleaseWait workspaceId={workspaceId} />
      </Route>
    );
  }

  if (urlPath.startsWith('/lineup/')) {
    return (
      <Route>
        <LineUpPage entities={entities} />
      </Route>
    );
  }

  if (urlPath === '/client-side-error') {
    throw Error('Intentional client-side-error');
  }

  if ('markdown' in flaskData) {
    return (
      <Route>
        <Markdown markdown={markdown} />
      </Route>
    );
  }
}

Routes.propTypes = {
  flaskData: PropTypes.exact({
    title: PropTypes.string,
    publications: PropTypes.object,
    entity: PropTypes.object,
    entities: PropTypes.array,
    vitessce_conf_list: PropTypes.arrayOf(PropTypes.object),
    markdown: PropTypes.string,
    collection: PropTypes.object,
    errorCode: PropTypes.number,
    list_uuid: PropTypes.string,
    has_notebook: PropTypes.bool,
    vis_lifted_uuid: PropTypes.string,
    organ: PropTypes.object,
    organs: PropTypes.object,
    metadata: PropTypes.object,
    organs_count: PropTypes.number,
  }),
};

Routes.defaultProps = {
  flaskData: {},
};

export default Routes;
