import React, { useState, useEffect, useCallback } from 'react';
import { Vitessce } from 'vitessce';
import Paper from '@material-ui/core/Paper';
import FullscreenRoundedIcon from '@material-ui/icons/FullscreenRounded';
import debounce from 'lodash/debounce';
import Bowser from 'bowser';

import OutboundIconLink from 'js/shared-styles/Links/iconLinks/OutboundIconLink';
import { Alert } from 'js/shared-styles/alerts';
import DropdownListbox from 'js/shared-styles/dropdowns/DropdownListbox';
import DropdownListboxOption from 'js/shared-styles/dropdowns/DropdownListboxOption';
import { SpacedSectionButtonRow } from 'js/shared-styles/sections/SectionButtonRow';
import { SecondaryBackgroundTooltip } from 'js/shared-styles/tooltips';
import useVisualizationStore from 'js/stores/useVisualizationStore';
import VisualizationThemeSwitch from '../VisualizationThemeSwitch';
import VisualizationShareButton from '../VisualizationShareButton';
import VisualizationNotebookButton from '../VisualizationNotebookButton';
import {
  vitessceFixedHeight,
  bodyExpandedCSS,
  ExpandButton,
  VitessceInfoSnackbar,
  ErrorSnackbar,
  ExpandableDiv,
  StyledFooterText,
  SelectionButton,
  StyledSectionHeader,
  Flex,
  StyledDetailPageSection,
} from './style';
import { useVitessceConfig } from './hooks';
import 'vitessce/dist/es/production/static/css/index.css';

function sniffBrowser() {
  const { browser } = Bowser.parse(window.navigator.userAgent);
  return browser.name;
}

const FIREFOX_WARNING = 'If the performance of Vitessce in Firefox is not satisfactory, please use Chrome or Safari.';

const visualizationStoreSelector = (state) => ({
  vizIsFullscreen: state.vizIsFullscreen,
  expandViz: state.expandViz,
  collapseViz: state.collapseViz,
  vizTheme: state.vizTheme,
  vizEscSnackbarIsOpen: state.vizEscSnackbarIsOpen,
  setVizEscSnackbarIsOpen: state.setVizEscSnackbarIsOpen,
  setVitessceState: state.setVitessceState,
  onCopyUrlWarning: state.onCopyUrlWarning,
  onCopyUrlSnackbarOpen: state.onCopyUrlSnackbarOpen,
  setOnCopyUrlSnackbarOpen: state.setOnCopyUrlSnackbarOpen,
});
const sharedInfoSnackbarProps = {
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'center',
  },
  autoHideDuration: 4000,
};
function Visualization({ vitData, uuid, hasNotebook, shouldDisplayHeader }) {
  const {
    vizIsFullscreen,
    expandViz,
    collapseViz,
    vizTheme,
    vizEscSnackbarIsOpen,
    setVizEscSnackbarIsOpen,
    setVitessceState,
    onCopyUrlWarning,
    onCopyUrlSnackbarOpen,
    setOnCopyUrlSnackbarOpen,
  } = useVisualizationStore(visualizationStoreSelector);

  const [vitessceErrors, setVitessceErrors] = useState([]);
  const [isVisibleFirefoxWarning, setIsVisibleFirefoxWarning] = useState(sniffBrowser() === 'Firefox');

  // Get the vitessce configuration from the url if available and set the selection if it is a multi-dataset.
  const { vitessceConfig, vitessceSelection, setVitessceSelection } = useVitessceConfig({
    vitData,
    setVitessceState,
    setVitessceErrors,
  });

  // The application is very slow without debouncing since state can be quite large.
  const handleVitessceConfigDebounced = useCallback(debounce(setVitessceState, 250, { trailing: true }), []);
  function removeError(message) {
    setVitessceErrors((prev) => prev.filter((d) => d !== message));
  }

  function addError(message) {
    setVitessceErrors((prev) => (prev.includes(message) ? prev : [...prev, message]));
  }

  function setSelectionAndClearErrors(itemAndIndex) {
    const { i } = itemAndIndex;
    setVitessceErrors([]);
    setVitessceSelection(i);
  }

  useEffect(() => {
    function onKeydown(event) {
      if (event.key === 'Escape') {
        collapseViz();
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('keydown', onKeydown);
    };
  }, [collapseViz]);

  const isMultiDataset = Array.isArray(vitessceConfig);

  return (
    vitessceConfig &&
    // Don't render multi-datasets unless they have a selection from the list of options in vitessceConfig.
    (!isMultiDataset || Number.isInteger(vitessceSelection)) && (
      <StyledDetailPageSection id="visualization" $vizIsFullscreen={vizIsFullscreen}>
        <SpacedSectionButtonRow
          leftText={shouldDisplayHeader ? <StyledSectionHeader>Visualization</StyledSectionHeader> : undefined}
          buttons={
            <Flex>
              {hasNotebook && <VisualizationNotebookButton uuid={uuid} />}
              <VisualizationShareButton />
              <VisualizationThemeSwitch />
              <SecondaryBackgroundTooltip title="Switch to Fullscreen">
                <ExpandButton size="small" onClick={expandViz} variant="contained">
                  <FullscreenRoundedIcon color="primary" />
                </ExpandButton>
              </SecondaryBackgroundTooltip>
              {isMultiDataset && (
                <DropdownListbox
                  buttonComponent={SelectionButton}
                  optionComponent={DropdownListboxOption}
                  selectedOptionIndex={vitessceSelection}
                  options={vitessceConfig}
                  selectOnClick={setSelectionAndClearErrors}
                  getOptionLabel={(v) => v.name}
                  buttonProps={{ color: 'primary' }}
                  id="visualization-data"
                />
              )}
            </Flex>
          }
        />
        <Paper>
          <ExpandableDiv $isExpanded={vizIsFullscreen} $theme={vizTheme}>
            <VitessceInfoSnackbar
              {...sharedInfoSnackbarProps}
              open={isVisibleFirefoxWarning}
              onClose={() => setIsVisibleFirefoxWarning(false)}
              message={FIREFOX_WARNING}
            />
            <VitessceInfoSnackbar
              {...sharedInfoSnackbarProps}
              open={vizEscSnackbarIsOpen}
              onClose={() => setVizEscSnackbarIsOpen(false)}
              message="Press [esc] to exit full window."
            />
            <VitessceInfoSnackbar
              {...sharedInfoSnackbarProps}
              open={onCopyUrlSnackbarOpen}
              $isWarning={onCopyUrlWarning}
              onClose={() => setOnCopyUrlSnackbarOpen(false)}
              message={`Shareable URL copied to clipboard. ${onCopyUrlWarning}`}
            />
            {vitessceErrors.length > 0 && (
              <ErrorSnackbar
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                open
                key={vitessceErrors[0]}
              >
                <Alert severity="error" onClose={() => removeError(vitessceErrors[0])}>
                  {vitessceErrors[0]}
                </Alert>
              </ErrorSnackbar>
            )}
            <Vitessce
              config={vitessceConfig[vitessceSelection] || vitessceConfig}
              theme={vizTheme}
              onConfigChange={handleVitessceConfigDebounced}
              height={vizIsFullscreen ? null : vitessceFixedHeight}
              onWarn={addError}
              isBounded
            />
          </ExpandableDiv>
        </Paper>
        <StyledFooterText variant="body2">
          Powered by&nbsp;
          <OutboundIconLink href="http://vitessce.io">Vitessce</OutboundIconLink>
        </StyledFooterText>
        <style type="text/css">{vizIsFullscreen && bodyExpandedCSS}</style>
      </StyledDetailPageSection>
    )
  );
}

export default Visualization;
