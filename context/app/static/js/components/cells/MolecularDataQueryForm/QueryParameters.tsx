import React from 'react';

import LogSlider from 'js/shared-styles/inputs/LogSlider';
import MarkedSlider from 'js/shared-styles/inputs/MarkedSlider';
import { useFormContext } from 'react-hook-form';
import QueryMethod from './QueryMethod';
import { MolecularDataQueryFormState } from './types';
import AutocompleteEntity from './AutocompleteEntity';
import { useIsQueryType, useMolecularDataQueryFormState, useQueryType } from './hooks';
import { FormFieldContainer } from './FormField';

function CellPercentageInput() {
  const { register } = useFormContext<MolecularDataQueryFormState>();
  const { measurement } = useQueryType();
  const isCellType = useIsQueryType('cell-type');

  if (isCellType) {
    return null;
  }

  return (
    <MarkedSlider
      label="Minimum Cell Percentage (%)"
      helperText={`Set the minimum cell percentage for cells in the datasets to represent the minimum ${measurement.toLowerCase()}.`}
      marks={[0, 1, 2, 5, 10].map((m) => ({ value: m, label: m || '>0' }))}
      id="min-cell-percentage"
      {...register('minimumCellPercentage')}
      min={0}
      max={10}
    />
  );
}

function ExpressionInput() {
  const { register } = useFormContext<MolecularDataQueryFormState>();

  const isCellType = useIsQueryType('cell-type');
  const { measurement, fieldName, value: queryType } = useQueryType();
  if (isCellType || !fieldName) {
    return null;
  }

  return (
    <LogSlider
      label={`Minimum ${measurement}`}
      helperText={`Set the minimum ${queryType} ${measurement.toLowerCase()} to refine your dataset selections.`}
      minLog={-4}
      maxLog={5}
      id="min-measurement"
      {...register(fieldName)}
    />
  );
}

function ThresholdOptions() {
  const queryMethod = useMolecularDataQueryFormState().watch('queryMethod');
  const queryType = useQueryType();
  if (queryType.value === 'protein' && queryMethod === 'scFind') {
    return null;
  }
  return (
    <FormFieldContainer title="Threshold Options">
      <CellPercentageInput />
      <ExpressionInput />
    </FormFieldContainer>
  );
}

function GeneParameters() {
  return (
    <>
      <QueryMethod />
      <FormFieldContainer title="Gene and Pathway Selection">
        <AutocompleteEntity targetEntity="gene" />
      </FormFieldContainer>
      <ThresholdOptions />
    </>
  );
}

function ProteinParameters() {
  return (
    <>
      <QueryMethod />
      <FormFieldContainer title="Protein Selection">
        <AutocompleteEntity targetEntity="protein" />
      </FormFieldContainer>
      <ThresholdOptions />
    </>
  );
}

function CellTypeParameters() {
  return (
    <>
      <QueryMethod />
      <FormFieldContainer title="Cell Type Selection">
        <AutocompleteEntity targetEntity="cell-type" />
      </FormFieldContainer>
    </>
  );
}

function QueryParametersFieldset() {
  const queryType = useQueryType();

  if (queryType.value === 'gene') {
    return <GeneParameters />;
  }

  if (queryType.value === 'protein') {
    return <ProteinParameters />;
  }

  return <CellTypeParameters />;
}

export default QueryParametersFieldset;
