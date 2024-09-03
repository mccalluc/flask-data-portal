import React, { useState, PropsWithChildren, useCallback } from 'react';
import { UseFormReturn, FieldErrors } from 'react-hook-form';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import Step, { StepDescription } from 'js/shared-styles/surfaces/Step';
import { Alert } from 'js/shared-styles/alerts/Alert';
import WorkspaceField from 'js/components/workspaces/WorkspaceField';
import { useLaunchWorkspaceStore } from 'js/stores/useWorkspaceModalStore';
import { useSelectItems } from 'js/hooks/useSelectItems';
import InternalLink from 'js/shared-styles/Links/InternalLink';

import { useWorkspaceTemplates } from './hooks';
import { CreateWorkspaceFormTypes } from './useCreateWorkspaceForm';
import { CreateTemplateNotebooksTypes } from '../types';
import WorkspaceDatasetsTable from '../WorkspaceDatasetsTable';
import TemplateSelectStep from '../TemplateSelectStep';
import WorkspaceJobTypeField from '../WorkspaceJobTypeField';
import AdvancedConfigOptions from '../AdvancedConfigOptions';
import AddDatasetsTable from '../AddDatasetsTable';
import { SearchAheadHit } from '../AddDatasetsTable/hooks';

const text = {
  overview: {
    title: 'Launch New Workspace',
    description: [
      'Workspaces are currently Jupyter Notebooks that allows you to perform operations on HuBMAP data.',
      'Three steps are shown for launching a workspace, but the only required field to launch a workspace is “Step 2: Configure Workspace”. “Step 1: Edit Datasets Selection” is only required if there are issues with any of the datasets selected, which will be indicated by an error banner.',
    ],
  },
  datasets: {
    title: 'Edit Datasets Selection',
    description: {
      searchBar: [
        <span key="datasets-step">
          {' '}
          Add datasets by HuBMAP ID below or navigate to the{' '}
          <InternalLink href="/search?entity_type[0]=Dataset">dataset search page</InternalLink>, select datasets and
          follow steps to launch a workspace.
        </span>,
      ],
      all: [
        'To remove a dataset, select the dataset and press the delete button. If all datasets are removed, an empty workspace will be launched.',
        'Once you navigate away from this page, all progress will be lost. You can copy IDs to your clipboard by selecting datasets in the table below and pressing the copy button. You can also save datasets to “My Lists”.',
        <Button variant="outlined" key="datasets-button">
          <InternalLink href="/search?entity_type[0]=Dataset">
            <Typography color="primary" variant="button">
              Select Additional Datasets
            </Typography>
          </InternalLink>
        </Button>,
      ],
    },
  },
  configure: {
    title: 'Configure Workspace',
    description: [
      'All workspaces are launched with Python support, with the option to add support for R. Workspaces with added R support may experience longer load times.',
    ],
    advancedDescription: 'Adjusting these settings may result in longer workspace load times.',
  },
  templates: {
    title: 'Select Templates',
  },
};

type ReactHookFormProps = Pick<UseFormReturn<CreateWorkspaceFormTypes>, 'handleSubmit' | 'control'> & {
  errors: FieldErrors<CreateWorkspaceFormTypes>;
};

interface NewWorkspaceDialogProps {
  errorMessages?: string[];
  dialogIsOpen: boolean;
  handleClose: () => void;
  removeDatasets?: (uuids: string[]) => void;
  onSubmit: ({ workspaceName, templateKeys, uuids }: CreateTemplateNotebooksTypes) => void;
  isSubmitting?: boolean;
  showDatasetsSearchBar?: boolean;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  autocompleteValue: SearchAheadHit | null;
  addDataset: (e: React.SyntheticEvent<Element, Event>, newValue: SearchAheadHit | null) => void;
  workspaceDatasets: string[];
  allDatasets: string[];
  searchHits: SearchAheadHit[];
}

function NewWorkspaceDialog({
  errorMessages = [],
  dialogIsOpen,
  handleClose,
  handleSubmit,
  control,
  errors,
  onSubmit,
  children,
  isSubmitting,
  showDatasetsSearchBar,
  inputValue,
  setInputValue,
  autocompleteValue,
  addDataset,
  removeDatasets,
  workspaceDatasets,
  allDatasets,
  searchHits,
}: PropsWithChildren<NewWorkspaceDialogProps & ReactHookFormProps>) {
  const { selectedItems: selectedRecommendedTags, toggleItem: toggleTag } = useSelectItems([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { isOpen: isLaunchWorkspaceDialogOpen } = useLaunchWorkspaceStore();

  const { templates } = useWorkspaceTemplates([...selectedTags, ...selectedRecommendedTags]);

  const submit = useCallback(
    ({
      'workspace-name': workspaceName,
      templates: templateKeys,
      workspaceJobTypeId,
      datasets,
      workspaceResourceOptions,
    }: CreateWorkspaceFormTypes) => {
      // setDialogType('LAUNCH_NEW_WORKSPACE');
      onSubmit({
        workspaceName,
        templateKeys,
        uuids: datasets,
        workspaceJobTypeId,
        workspaceResourceOptions,
      });
    },
    [onSubmit],
  );

  return (
    <Dialog
      open={dialogIsOpen && !isLaunchWorkspaceDialogOpen}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="create-workspace-dialog-title"
      maxWidth="lg"
    >
      <Box mb={2}>
        <DialogTitle id="create-workspace-dialog-title" variant="h3">
          {text.overview.title}
        </DialogTitle>
        <Box sx={{ px: 3 }}>
          <StepDescription blocks={text.overview.description} />
        </Box>
      </Box>
      <DialogContent dividers>
        <Step title={text.datasets.title} index={0}>
          <Stack spacing={1}>
            {children}
            <StepDescription
              blocks={[
                ...(showDatasetsSearchBar ? [...text.datasets.description.searchBar] : []),
                ...text.datasets.description.all,
              ]}
            />
            {showDatasetsSearchBar && removeDatasets ? (
              <AddDatasetsTable
                inputValue={inputValue}
                setInputValue={setInputValue}
                autocompleteValue={autocompleteValue}
                addDataset={addDataset}
                removeDatasets={removeDatasets}
                workspaceDatasets={workspaceDatasets}
                allDatasets={allDatasets}
                searchHits={searchHits}
              />
            ) : (
              <WorkspaceDatasetsTable
                datasetsUUIDs={allDatasets}
                removeDatasets={removeDatasets}
                emptyAlert={<Alert severity="info">No datasets available.</Alert>}
              />
            )}
          </Stack>
        </Step>
        <Step title={text.configure.title} isRequired index={1}>
          <Box
            id="create-workspace-form"
            component="form"
            sx={{
              display: 'grid',
              gap: 2,
              marginTop: 1,
            }}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(submit)}
          >
            <WorkspaceField
              control={control}
              name="workspace-name"
              label="Workspace Name"
              placeholder="Like “Spleen-Related Data” or “ATAC-seq Visualizations”"
              autoFocus
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                e.stopPropagation();
              }}
            />
            <Stack spacing={2} p={2} component={Paper} direction="column">
              <Typography variant="button" fontSize="1rem">
                Environment Selection
              </Typography>
              <Typography>{text.configure.description}</Typography>
              <WorkspaceJobTypeField control={control} name="workspaceJobTypeId" />
            </Stack>
            <AdvancedConfigOptions control={control} description={text.configure.advancedDescription} />
          </Box>
        </Step>
        <TemplateSelectStep
          title={text.templates.title}
          stepIndex={2}
          control={control}
          toggleTag={toggleTag}
          selectedRecommendedTags={selectedRecommendedTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          templates={templates}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          loading={isSubmitting}
          type="submit"
          form="create-workspace-form"
          disabled={Object.keys(errors).length > 0 || errorMessages.length > 0}
        >
          Launch Workspace
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default NewWorkspaceDialog;
