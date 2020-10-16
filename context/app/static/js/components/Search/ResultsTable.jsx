import React from 'react';
import PropTypes from 'prop-types';
import { SortingSelector, ViewSwitcherHits } from 'searchkit'; // eslint-disable-line import/no-duplicates

import { StyledTable } from './style';
import ResultsTableBody from './ResultsTableBody';
import ResultsTiles from './ResultsTiles';
import SortingTableHead from './SortingTableHead';

function ResultsTable(props) {
  const { sortOptions, hitsPerPage, resultFields, detailsUrlPrefix, idField, resultFieldIds } = props;

  return (
    <StyledTable>
      <SortingSelector options={sortOptions} listComponent={SortingTableHead} />
      <ViewSwitcherHits
        hitsPerPage={hitsPerPage}
        hitComponents={[
          {
            key: 'table',
            title: 'Table',
            listComponent: (
              <ResultsTableBody resultFields={resultFields} detailsUrlPrefix={detailsUrlPrefix} idField={idField} />
            ),
            defaultOption: true,
          },
          { key: 'tile', title: 'Tile', listComponent: ResultsTiles },
        ]}
        sourceFilter={resultFieldIds}
        customHighlight={{
          fields: { everything: { type: 'plain' } },
        }}
      />
    </StyledTable>
  );
}

ResultsTable.propTypes = {
  sortOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  hitsPerPage: PropTypes.number.isRequired,
  resultFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  detailsUrlPrefix: PropTypes.string.isRequired,
  idField: PropTypes.string.isRequired,
  resultFieldIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ResultsTable;
