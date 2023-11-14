import React from 'react';
import PropTypes from 'prop-types';

import SearchDatasetTutorial from 'js/components/tutorials/SearchDatasetTutorial';
import { useAppContext } from 'js/components/Contexts';
import { entityIconMap } from 'js/shared-styles/icons/entityIconMap';
import LookupEntity from 'js/helpers/LookupEntity';
import { combineQueryClauses, getAuthHeader, getDefaultQuery } from 'js/helpers/functions';
import SearchWrapper from 'js/components/searchPage/SearchWrapper';
import { donorConfig, sampleConfig, datasetConfig, fieldsToHighlight } from 'js/components/searchPage/config';
import { listFilter } from 'js/components/searchPage/utils';
import SearchNote from 'js/components/searchPage/SearchNote';
import Results from 'js/components/searchPage/Results';
import { SearchHeader, StyledSvgIcon, SearchEntityHeader } from './style';

const paramNotes = [
  { urlSearchParam: 'ancestor_ids[0]', label: 'Derived from' },
  { urlSearchParam: 'descendant_ids[0]', label: 'Ancestor of' },
  { urlSearchParam: 'cell_type', label: 'Contains' },
];
function Search({ title }) {
  const { elasticsearchEndpoint, groupsToken } = useAppContext();

  const hiddenFilters = [
    listFilter('ancestor_ids', 'Ancestor ID'),
    listFilter('entity_type', 'Entity Type'),
    listFilter('descendant_ids', 'Descendant ID'),
  ];

  const filtersByType = {
    donor: { ...donorConfig.filters, '': hiddenFilters },
    sample: { ...sampleConfig.filters, '': hiddenFilters },
    dataset: { ...datasetConfig.filters, '': hiddenFilters },
  };

  const resultFieldsByType = {
    donor: donorConfig.fields,
    sample: sampleConfig.fields,
    dataset: datasetConfig.fields,
  };

  const searchParams = new URLSearchParams(window.location.search);
  const typeParam = 'entity_type[0]';
  const capitalizedType = searchParams.get(typeParam) || '';
  const type = capitalizedType.toLowerCase();

  if (!(type in resultFieldsByType)) {
    throw Error(
      `Unexpected URL param "${typeParam}=${type}"; Should be one of {${Object.keys(resultFieldsByType).join(', ')}}`,
    );
  }

  const notesToDisplay = paramNotes.filter((note) => searchParams.has(note.urlSearchParam));

  const httpHeaders = getAuthHeader(groupsToken);
  const resultFields = resultFieldsByType[type];

  let defaultQuery = getDefaultQuery();
  const uuids = searchParams.get('uuid').split(',');
  if (uuids.length > 0) {
    defaultQuery = combineQueryClauses([
      defaultQuery,
      {
        ids: {
          values: uuids,
        },
      },
    ]);
  }

  const searchProps = {
    // The default behavior is to add a "_search" path.
    // We don't want that.
    searchUrlPath: '',
    // Pass Globus token:
    httpHeaders,
    // Prefix for details links:
    detailsUrlPrefix: `/browse/${type || 'dataset'}/`,
    // Search results field which will be appended to detailsUrlPrefix:
    idField: 'uuid',
    // Search results fields to display in table:
    resultFields,
    // Default hitsPerPage is 10:
    hitsPerPage: 18,
    // Entity type
    type,
    // Sidebar facet configuration:
    filters: filtersByType[type],
    queryFields: ['all_text', ...fieldsToHighlight],
    isLoggedIn: Boolean(groupsToken),
    apiUrl: elasticsearchEndpoint,
    defaultQuery,
  };

  return (
    <>
      <SearchHeader component="h1" variant="h2">
        <SearchEntityHeader data-testid="entity-header">
          <StyledSvgIcon component={entityIconMap[capitalizedType]} color="primary" />
          {title}
        </SearchEntityHeader>
      </SearchHeader>
      {type === 'dataset' && <SearchDatasetTutorial />}
      {notesToDisplay.map((note) => (
        <LookupEntity uuid={searchParams.get(note.urlSearchParam)} key={note.urlSearchParam}>
          <SearchNote label={note.label} />
        </LookupEntity>
      ))}
      <SearchWrapper
        {...searchProps}
        resultsComponent={Results}
        analyticsCategory={`${title} Search Page Interactions`}
        elasticsearchEndpoint={elasticsearchEndpoint}
        groupsToken={groupsToken}
      />
    </>
  );
}

Search.propTypes = {
  title: PropTypes.string.isRequired,
  groupsToken: PropTypes.string,
};

Search.defaultProps = {
  groupsToken: '',
};

export default Search;
