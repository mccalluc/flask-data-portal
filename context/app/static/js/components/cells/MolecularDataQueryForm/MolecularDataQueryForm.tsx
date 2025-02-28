import React, { PropsWithChildren, useEffect, useId, useState } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { useEventCallback } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useSnackbarActions } from 'js/shared-styles/snackbars';
import IndependentStepAccordion from 'js/shared-styles/accordions/StepAccordion/IndependentStepAccordion';
import { MolecularDataQueryFormState } from './types';
import SubmitButton from './SubmitButton';
import Results from '../MolecularDataQueryResults';

interface MolecularDataQueryFormProps extends PropsWithChildren {
  initialValues?: Partial<MolecularDataQueryFormState>;
}

export default function MolecularDataQueryForm({ children, initialValues }: MolecularDataQueryFormProps) {
  const methods = useForm<MolecularDataQueryFormState>({
    defaultValues: {
      queryType: 'gene',
      queryMethod: 'scFind',
      genes: [],
      ...initialValues,
    },
  });
  const { setValue, watch } = methods;

  const { toastError } = useSnackbarActions();
  const onError = useEventCallback((errors: FieldErrors<MolecularDataQueryFormState>) => {
    const error = Object.values(errors)
      .map((field) => field.message)
      .join(' ');
    toastError(error);
  });

  const queryType = watch('queryType');

  // Reset selected options when query type changes
  useEffect(() => {
    setValue('genes', []);
    setValue('proteins', []);
    setValue('cellTypes', []);
    switch (queryType) {
      case 'gene':
        setValue('queryMethod', 'scFind');
        break;
      case 'protein':
        setValue('queryMethod', 'crossModality');
        break;
      default:
        break;
    }
  }, [queryType, setValue]);

  const onSubmit = useEventCallback((data: MolecularDataQueryFormState) => {
    methods.reset({}, { keepValues: true, keepDirty: false });
    console.log(data);
  });

  const id = `${useId()}-molecular-data-query`;

  const [formIsExpanded, setFormIsExpanded] = useState(true);
  const [resultsAreExpanded, setResultsAreExpanded] = useState(false);

  return (
    <FormProvider {...methods}>
      <IndependentStepAccordion
        index={0}
        summaryHeading="Parameters"
        id={`${id}-parameters`}
        content={
          // TODO fix eslint rule
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          <Stack component="form" onSubmit={methods.handleSubmit(onSubmit, onError)} gap={2}>
            {children}
            <SubmitButton />
          </Stack>
        }
        isExpanded={formIsExpanded || !methods.formState.isSubmitted}
        onChange={() => setFormIsExpanded(!formIsExpanded)}
        noProvider
      />
      <IndependentStepAccordion
        index={1}
        summaryHeading="Results"
        id={`${id}-results`}
        content={<Results />}
        isExpanded={resultsAreExpanded || methods.formState.isSubmitSuccessful}
        noProvider
        disabled={!methods.formState.isSubmitSuccessful}
      />
    </FormProvider>
  );
}
