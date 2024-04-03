import { useCallback, useState, SyntheticEvent } from 'react';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useSearchHits } from 'js/hooks/useSearchData';
import { Dataset } from 'js/components/Contexts';
import { useSelectItems } from 'js/hooks/useSelectItems';
import { Workspace } from '../types';
import { useWorkspaceDetail, useUpdateWorkspaceDatasets } from '../hooks';
import { MAX_NUMBER_OF_WORKSPACE_DATASETS } from '../api';
import { datasetsField } from '../workspaceFormFields';

interface BuildIDPrefixQueryType {
  value: string;
  valuePrefix?: string;
  uuidsToExclude?: string[];
}

function buildIDPrefixQuery({ value, valuePrefix = '', uuidsToExclude = [] }: BuildIDPrefixQueryType) {
  return {
    query: {
      bool: {
        must: [
          {
            prefix: {
              'hubmap_id.keyword': {
                value: `${valuePrefix}${value}`,
                case_insensitive: true,
              },
            },
          },
          {
            term: {
              entity_type: {
                value: 'dataset',
              },
            },
          },
          {
            term: {
              mapped_data_access_level: {
                value: 'public',
              },
            },
          },
          {
            bool: {
              must_not: [
                {
                  ids: {
                    values: uuidsToExclude,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    _source: ['hubmap_id', 'uuid', 'assay_display_name', 'origin_samples_unique_mapped_organs'],
    size: 10,
    sort: 'hubmap_id.keyword',
  };
}

interface Hit<Doc extends Record<string, unknown>> {
  _source: Doc;
}

interface Hits<Doc extends Record<string, unknown>> {
  searchHits: Hit<Doc>[];
  isLoading: boolean;
}

type SearchAheadDoc = Pick<
  Dataset,
  'hubmap_id' | 'uuid' | 'origin_samples_unique_mapped_organs' | 'assay_display_name'
>;

type SearchAheadHit = Hit<SearchAheadDoc>;
type SearchAheadHits = Hits<SearchAheadDoc>;

function useSearchAhead({ value, valuePrefix = '', uuidsToExclude = [] }: BuildIDPrefixQueryType) {
  return useSearchHits(buildIDPrefixQuery({ value, valuePrefix, uuidsToExclude })) as SearchAheadHits;
}

export interface AddDatasetsFormTypes {
  datasets: string[];
}

const schema = z
  .object({
    ...datasetsField,
  })
  .partial()
  .required({ datasets: true });

function useAddWorkspaceDatasetsForm() {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<AddDatasetsFormTypes>({
    defaultValues: {
      datasets: [],
    },
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  return {
    handleSubmit,
    control,
    errors,
    reset,
    isSubmitting: isSubmitting || isSubmitSuccessful,
  };
}

const tooManyDatasetsMessage =
  'Workspaces can currently only contain 10 datasets. Datasets can no longer be added to this workspace unless datasets are removed.';

function useDatasetsAutocomplete({
  workspaceId,
  initialDatasetsUUIDS = [],
  updateDatasetsFormState,
}: {
  workspaceId: number;
  initialDatasetsUUIDS?: string[];
  updateDatasetsFormState?: (datasetUUIDS: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [autocompleteValue, setAutocompleteValue] = useState<SearchAheadHit | null>(null);

  const {
    selectedItems: selectedDatasets,
    addItem: selectDataset,
    setSelectedItems: setSelectedDatasets,
  } = useSelectItems(initialDatasetsUUIDS);

  const addDataset = useCallback(
    (e: SyntheticEvent<Element, Event>, newValue: SearchAheadHit | null) => {
      const datasetsCopy = selectedDatasets;
      const uuid = newValue?._source?.uuid;
      if (uuid) {
        setAutocompleteValue(newValue);
        selectDataset(uuid);
        if (updateDatasetsFormState) {
          updateDatasetsFormState([...datasetsCopy, uuid]);
        }
      }
    },
    [selectDataset, selectedDatasets, updateDatasetsFormState],
  );

  const removeDatasets = useCallback(
    (uuids: string[]) => {
      const datasetsCopy = selectedDatasets;
      uuids.forEach((uuid) => datasetsCopy.delete(uuid));

      const updatedDatasetsArray = [...datasetsCopy];
      setSelectedDatasets(updatedDatasetsArray);
      if (updateDatasetsFormState) {
        updateDatasetsFormState(updatedDatasetsArray);
      }
    },
    [setSelectedDatasets, selectedDatasets, updateDatasetsFormState],
  );

  const resetAutocompleteState = useCallback(() => {
    setInputValue('');
    setAutocompleteValue(null);
    setSelectedDatasets([]);
  }, [setSelectedDatasets, setInputValue, setAutocompleteValue]);

  const { workspaceDatasets } = useWorkspaceDetail({ workspaceId });
  const allDatasets = [...workspaceDatasets, ...selectedDatasets];
  const { searchHits } = useSearchAhead({ value: inputValue, valuePrefix: 'HBM', uuidsToExclude: allDatasets });

  return {
    inputValue,
    setInputValue,
    autocompleteValue,
    selectedDatasets,
    addDataset,
    removeDatasets,
    resetAutocompleteState,
    workspaceDatasets,
    allDatasets,
    searchHits,
  };
}

function useAddDatasetsDialog({ workspace }: { workspace: Workspace }) {
  const workspaceId = workspace.id;

  const { handleSubmit, isSubmitting, control, errors, reset } = useAddWorkspaceDatasetsForm();
  const { field, fieldState } = useController({
    control,
    name: 'datasets',
  });

  const {
    inputValue,
    setInputValue,
    autocompleteValue,
    selectedDatasets,
    addDataset,
    removeDatasets,
    workspaceDatasets,
    allDatasets,
    searchHits,
    resetAutocompleteState,
  } = useDatasetsAutocomplete({
    workspaceId,
    initialDatasetsUUIDS: field.value,
    updateDatasetsFormState: field.onChange,
  });

  const updateWorkspaceDatasets = useUpdateWorkspaceDatasets({ workspaceId });

  const submit = useCallback(
    async ({ datasets }: { datasets: string[] }) => {
      await updateWorkspaceDatasets({
        datasetUUIDs: datasets,
      });
    },
    [updateWorkspaceDatasets],
  );

  const errorMessage = fieldState?.error?.message;
  const tooManyDatasetsSelected = selectedDatasets.size + workspaceDatasets.length > MAX_NUMBER_OF_WORKSPACE_DATASETS;

  const errorMessages = [];

  if (tooManyDatasetsSelected) {
    errorMessages.push(tooManyDatasetsMessage);
  }
  if (errorMessage) {
    errorMessages.push(errorMessage);
  }

  return {
    autocompleteValue,
    inputValue,
    setInputValue,
    submit,
    handleSubmit,
    isSubmitting,
    errors,
    reset,
    resetAutocompleteState,
    addDataset,
    removeDatasets,
    searchHits,
    workspaceDatasets,
    allDatasets,
    errorMessages,
  };
}

export { type SearchAheadHit, useAddDatasetsDialog };
