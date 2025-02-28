import MolecularDataQueryResults from 'js/components/cells/MolecularDataQueryResults';
import QueryParameters from 'js/components/cells/MolecularDataQueryForm/QueryParameters';
import { CollapsibleDetailPageSection } from 'js/components/detailPage/DetailPageSection';
import AccordionSteps from 'js/shared-styles/accordions/AccordionSteps';
import { AccordionStepsProvider } from 'js/shared-styles/accordions/AccordionSteps/store';
import React, { useMemo } from 'react';
import { useGeneOntology, useGenePageContext } from '../hooks';
import { biomarkerQuery } from '../constants';

export default function BiomarkerQuery() {
  const { geneSymbol } = useGenePageContext();
  const { data } = useGeneOntology();
  const steps = useMemo(() => {
    return [
      {
        heading: '1. Parameters',
        content: <QueryParameters defaultEntity={data?.approved_symbol ?? geneSymbol.toUpperCase()} />,
      },
      {
        heading: '2. Results',
        content: <MolecularDataQueryResults />,
      },
    ];
  }, [geneSymbol, data?.approved_symbol]);

  return (
    <CollapsibleDetailPageSection
      id={biomarkerQuery.id}
      title={biomarkerQuery.title}
      iconTooltipText={biomarkerQuery.tooltip}
    >
      <AccordionStepsProvider stepsLength={steps.length}>
        <AccordionSteps id="biomarker-query-steps" steps={steps} />
      </AccordionStepsProvider>
    </CollapsibleDetailPageSection>
  );
}
