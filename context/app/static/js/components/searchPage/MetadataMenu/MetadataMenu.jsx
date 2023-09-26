import React from 'react';
import { trackEvent } from 'js/helpers/trackers';
import MenuItem from '@mui/material/MenuItem';

import useSearchViewStore from 'js/stores/useSearchViewStore';
import postAndDownloadFile from 'js/helpers/postAndDownloadFile';
import { SecondaryBackgroundTooltip } from 'js/shared-styles/tooltips';
import withDropdownMenuProvider from 'js/shared-styles/dropdowns/DropdownMenuProvider/withDropdownMenuProvider';
import { useDropdownMenuStore } from 'js/shared-styles/dropdowns/DropdownMenuProvider';
import DropdownMenu from 'js/shared-styles/dropdowns/DropdownMenu';
import { Link } from '@mui/material';
import { StyledDropdownMenuButton, StyledInfoIcon } from './style';

async function fetchAndDownload({ urlPath, allResultsUUIDs, closeMenu, analyticsCategory }) {
  await postAndDownloadFile({ url: urlPath, body: { uuids: allResultsUUIDs } });

  trackEvent({
    category: analyticsCategory,
    action: `Download file`,
    label: urlPath.split('/').pop(),
  });

  closeMenu();
}

function MetadataMenu({ type, analyticsCategory }) {
  const lcPluralType = `${type.toLowerCase()}s`;
  const allResultsUUIDs = useSearchViewStore((state) => state.allResultsUUIDs);

  const { closeMenu } = useDropdownMenuStore();

  const menuID = 'metadata-menu';

  // TODO: Uncomment when workspaces UI is ready.
  // const { isAuthenticated } = useContext(AppContext);
  // const workspacesDisabled = !isAuthenticated;

  return (
    <>
      <StyledDropdownMenuButton menuID={menuID}>Metadata</StyledDropdownMenuButton>
      <DropdownMenu id={menuID}>
        <MenuItem>
          <Link underline="none" href={`/lineup/${lcPluralType}`}>
            Visualize
          </Link>
          <SecondaryBackgroundTooltip title="Visualize all available metadata in Lineup." placement="bottom-start">
            <StyledInfoIcon color="primary" />
          </SecondaryBackgroundTooltip>
        </MenuItem>
        <MenuItem
          onClick={() =>
            fetchAndDownload({
              urlPath: `/metadata/v0/${lcPluralType}.tsv`,
              allResultsUUIDs,
              closeMenu,
              analyticsCategory,
            })
          }
        >
          Download
          <SecondaryBackgroundTooltip title="Download a TSV of the table metadata." placement="bottom-start">
            <StyledInfoIcon color="primary" />
          </SecondaryBackgroundTooltip>
        </MenuItem>
        <MenuItem
          onClick={() =>
            fetchAndDownload({
              urlPath: `/notebooks/entities/${lcPluralType}.ipynb`,
              allResultsUUIDs,
              closeMenu,
              analyticsCategory,
            })
          }
        >
          Notebook
          <SecondaryBackgroundTooltip
            title="Download a Notebook which demonstrates how to programmatically access metadata."
            placement="bottom-start"
          >
            <StyledInfoIcon color="primary" />
          </SecondaryBackgroundTooltip>
        </MenuItem>
        {/* TODO: Uncomment when workspace UI is ready.
        <MenuItem
          disabled={workspacesDisabled}
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('TODO');
          }}
        >
          Workspace
          <SecondaryBackgroundTooltip
            title="Create a new HuBMAP workspace and load the load the notebook into it."
            placement="bottom-start"
          >
            <StyledInfoIcon color="primary" />
          </SecondaryBackgroundTooltip>
        </MenuItem> */}
      </DropdownMenu>
    </>
  );
}

export default withDropdownMenuProvider(MetadataMenu, false);
