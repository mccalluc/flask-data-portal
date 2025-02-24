import React, { PropsWithChildren, useEffect, useId } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { useEventCallback } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useSnackbarActions } from 'js/shared-styles/snackbars';
import StepAccordion from 'js/shared-styles/accordions/StepAccordion';
import { AccordionStepsProvider } from 'js/shared-styles/accordions/AccordionSteps/store';
import { MolecularDataQueryFormState } from './types';
import SubmitButton from './SubmitButton';

interface MolecularDataQueryFormProps extends PropsWithChildren {
  initialValues?: Partial<MolecularDataQueryFormState>;
  onSubmit: (data: MolecularDataQueryFormState) => void;
}

export default function MolecularDataQueryForm({ children, onSubmit, initialValues }: MolecularDataQueryFormProps) {
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
      default:
        break;
    }
  }, [queryType, setValue]);

  const handleSubmit: React.FormEventHandler = useEventCallback((event) => {
    event.preventDefault();
    methods.handleSubmit(onSubmit, onError);
  });

  const id = `${useId()}-molecular-data-query`;

  return (
    <FormProvider {...methods}>
      <AccordionStepsProvider stepsLength={2}>
        <StepAccordion
          index={0}
          summaryHeading="Parameters"
          id={`${id}-parameters`}
          content={
            <Stack component="form" onSubmit={handleSubmit} gap={2}>
              {children}
              <SubmitButton />
            </Stack>
          }
        />
        <StepAccordion index={1} summaryHeading="Results" id={`${id}-results`} />
      </AccordionStepsProvider>
    </FormProvider>
  );
}
