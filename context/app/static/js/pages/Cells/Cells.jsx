import React, { useState, useRef } from 'react';
import Typography from '@material-ui/core/Typography';

import AccordionSteps from 'js/shared-styles/accordions/AccordionSteps';
import DatasetsSelectedByExpression from 'js/components/cells/DatasetsSelectedByExpression';
import SectionPaper from 'js/shared-styles/sections/SectionPaper';
import QuerySelect from 'js/components/cells/QuerySelect';
import CellsResults from 'js/components/cells/CellsResults';
import { queryTypes } from 'js/components/cells/queryTypes';

import CellsTutorial from 'js/components/cells/tutorial/CellsTutorial';

function Cells() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minExpressionLog, setMinExpressionLog] = useState(1);
  const [minCellPercentage, setMinCellPercentage] = useState(10);
  const [cellVariableNames, setCellVariableNames] = useState([]);
  const [queryType, setQueryType] = useState(queryTypes.gene.value);

  const setParametersButtonRef = useRef(null);

  return (
    <>
      <CellsTutorial setQueryType={setQueryType} setParametersButtonRef={setParametersButtonRef} />
      <Typography variant="h2" component="h1" color="primary">
        Datasets: Molecular Data Queries
      </Typography>
      <SectionPaper>
        Refine datasets to discover genomic and proteomic information including expression distribution and cluster
        membership. To begin your search, select a query type and the relevant parameters.
      </SectionPaper>
      <AccordionSteps
        id="cells-steps"
        steps={[
          {
            heading: '1. Query Type',
            content: (
              <QuerySelect
                setQueryType={setQueryType}
                setCellVariableNames={setCellVariableNames}
                setParametersButtonRef={setParametersButtonRef}
              />
            ),
          },
          {
            heading: '2. Parameters',
            content: (
              <DatasetsSelectedByExpression
                setResults={setResults}
                minExpressionLog={minExpressionLog}
                setMinExpressionLog={setMinExpressionLog}
                minCellPercentage={minCellPercentage}
                setMinCellPercentage={setMinCellPercentage}
                cellVariableNames={cellVariableNames}
                setCellVariableNames={setCellVariableNames}
                queryType={queryType}
                setIsLoading={setIsLoading}
              />
            ),
          },
          {
            heading: '3. Results',
            content: (
              <CellsResults
                isLoading={isLoading}
                results={results}
                minExpressionLog={minExpressionLog}
                cellVariableNames={cellVariableNames}
                queryType={queryType}
              />
            ),
          },
        ]}
        isFirstStepOpen
      />
    </>
  );
}

export default Cells;
