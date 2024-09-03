import React, { useCallback } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import SummaryPaper from 'js/shared-styles/sections/SectionPaper';
import { useSnackbarActions } from 'js/shared-styles/snackbars';
import DialogModal from 'js/shared-styles/DialogModal';
import { Alert } from 'js/shared-styles/alerts';
import WorkspaceJobTypeField from '../WorkspaceJobTypeField';
import { useLaunchWorkspaceDialog, LaunchWorkspaceFormTypes } from './hooks';
import AdvancedConfigOptions from '../AdvancedConfigOptions';

const formId = 'launch-workspace-form';

const text = {
  environment: {
    title: 'Environment Selection',
    description: [
      'All workspaces are launched with Python support, with the option to add support for R. Workspaces with added R support may experience longer load times.',
      'If a workspace was previously launched with R, launching a workspace without R support may cause issues with your saved work.',
    ],
  },
  resources: {
    alert:
      'Advanced configuration settings are not retained from previous sessions. If you customized settings in a previous launch, you will need to reapply those changes.',
    description:
      'Adjusting these settings may result in longer workspace load times and could potentially affect your saved work.',
  },
};

function LaunchWorkspaceDialog() {
  const {
    runningWorkspaceName,
    runningWorkspaceIsCurrentWorkpace,
    control,
    handleSubmit,
    submit,
    isOpen,
    handleClose,
    workspace,
    isSubmitting,
    // dialogType,
    // setDialogType,
  } = useLaunchWorkspaceDialog();

  const workspaceName = workspace?.name;
  const { toastError } = useSnackbarActions();

  // const newWorkspaceLaunch = dialogType === 'LAUNCH_NEW_WORKSPACE';
  const isAnotherWorkspaceRunning = runningWorkspaceName && !runningWorkspaceIsCurrentWorkpace;

  const runningWorkspaceAlert = isAnotherWorkspaceRunning && (
    <Alert
      severity="warning"
      sx={{
        '.MuiAlert-message': {
          flexGrow: 1,
        },
        alignItems: 'center',
      }}
    >
      {runningWorkspaceName} is currently running. You can only run one workspace at a time. To launch this workspace,
      jobs in the workspace {runningWorkspaceName} will be stopped. Make sure to save all progress before launching this
      workspace.
    </Alert>
  );

  const onSubmit = useCallback(
    ({ workspaceJobTypeId, workspaceResourceOptions }: LaunchWorkspaceFormTypes) => {
      submit({ workspaceJobTypeId, workspaceResourceOptions })
        .then(() => {
          handleClose();
          // setDialogType(null);
        })
        .catch((e) => {
          toastError('Failed to launch workspace. Please try again.');
          console.error(e);
        });
    },
    [submit, handleClose, toastError],
  );

  const dialogContent = (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      {/* {newWorkspaceLaunch ? (
        runningWorkspaceAlert
      ) : ( */}
      <Stack direction="column" spacing={1}>
        {runningWorkspaceAlert}
        <Alert severity="info">{text.resources.alert}</Alert>
        <SummaryPaper>
          <Stack direction="column" spacing={2}>
            <Typography variant="button" fontSize="1rem">
              {text.environment.title}
            </Typography>
            {text.environment.description.map((description) => (
              <Typography key={description}>{description}</Typography>
            ))}
            <WorkspaceJobTypeField control={control} name="workspaceJobTypeId" />
          </Stack>
        </SummaryPaper>
        <AdvancedConfigOptions control={control} description={text.resources.description} />
      </Stack>
      {/* )} */}
    </form>
  );

  return (
    <DialogModal
      title={`Launch ${workspaceName}`}
      maxWidth="md"
      content={dialogContent}
      isOpen={isOpen}
      handleClose={handleClose}
      actions={
        <Stack direction="row" spacing={2} alignItems="end">
          <Button type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" form={formId} loading={isSubmitting}>
            Launch Workspace
          </LoadingButton>
        </Stack>
      }
      withCloseButton
    />
  );
}

export default LaunchWorkspaceDialog;
