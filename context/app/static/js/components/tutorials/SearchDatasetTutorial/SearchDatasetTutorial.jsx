import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import Joyride, { STATUS, ACTIONS } from 'react-joyride';
import Box from '@material-ui/core/Box';

import TutorialTooltip from 'js/components/tutorials/TutorialTooltip';
import useSearchViewStore from 'js/stores/useSearchViewStore';
import { WhiteTypography } from 'js/components/tutorials/TutorialTooltip/style';

const viewMoreSelector = '#Data-Type div.sk-refinement-list__view-more-action';

const tileViewStepTitle = 'Sort Search Results for Tile View';

const searchViewStoreSelector = (state) => ({
  searchView: state.searchView,
  setSearchView: state.setSearchView,
  toggleItem: state.toggleItem,
});
const defaultSteps = [
  {
    target: '#Data-Type div.sk-item-list > div:nth-child(1)',
    disableBeacon: true,
    content: `The Dataset Metadata menu on the left side allows filtering datasets by any combination of metadata categories: Data Type, Organ and Specimen Type.
      ${' '}Search results update automatically as you edit the selection of filters.`,
    title: 'Filter Your Browsing',
  },
  {
    target: 'div.sk-search-box',
    content: 'To further narrow the relevant datasets, type search terms or phrases in “quotes" into the Search bar.',
    disableBeacon: true,
    title: 'Search Datasets by Free Text',
  },
  {
    target: 'div.sk-layout__results.sk-results-list > table > thead > tr > th:nth-child(3)',
    content: `Press the arrow button by the relevant column to sort search results. A bolded arrow indicates the current sorting selection.
      ${' '}Click again to reverse the order.`,
    disableBeacon: true,
    title: 'Sort Search Results',
  },
  {
    target: '#tile-view-toggle-button',
    content: (
      <>
        <WhiteTypography gutterBottom>
          Toggle the results display mode between table view and tile view.
        </WhiteTypography>
        <WhiteTypography component="div">
          <Box component="strong" fontWeight="fontWeightMedium">
            Click the tile view button above to continue.
          </Box>
        </WhiteTypography>
      </>
    ),
    contentIsComponent: true,
    title: 'Toggle Display Mode',
    disableBeacon: true,
    spotlightClicks: true,
  },
  {
    target: '#search-tiles-sort-button',
    content: 'To sort your search results in tile view, select your sorting option in this dropdown menu.',
    disableBeacon: true,
    title: tileViewStepTitle,
  },
];

const stepToAddIfViewMoreExists = {
  target: '#Data-Type div.sk-refinement-list__view-more-action',
  content: 'Click the View All button to display the entire list of filters in the selected category.',
  disableBeacon: true,
  title: 'View More Filters',
};

function SearchDatasetTutorial({ runTutorial, closeSearchDatasetTutorial, stepIndex }) {
  const themeContext = useContext(ThemeContext);
  const [steps, setSteps] = useState(defaultSteps);
  const { searchView, setSearchView, toggleItem } = useSearchViewStore(searchViewStoreSelector);

  const handleJoyrideCallback = (data) => {
    const {
      status,
      action,
      step: { title },
    } = data;

    // If the user selects back after tile view has been toggled, return to table view.
    if (action === ACTIONS.PREV && title === tileViewStepTitle && searchView === 'tile') {
      toggleItem('table');
      setSearchView('table');
    }

    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    // If the user clicks the overlay or highlighted element, close the search tutorial.
    if (finishedStatuses.includes(status) || ACTIONS.CLOSE) {
      closeSearchDatasetTutorial();
    }
  };

  React.useEffect(() => {
    if (runTutorial) {
      const element = document.querySelector(viewMoreSelector);
      if (element) {
        const defaultStepsCopy = [...defaultSteps];
        defaultStepsCopy.splice(1, 0, stepToAddIfViewMoreExists);
        setSteps(defaultStepsCopy);
      }
    }
  }, [runTutorial]);

  return (
    <Joyride
      steps={steps}
      callback={handleJoyrideCallback}
      run={runTutorial}
      scrollOffset={100}
      floaterProps={{
        disableAnimation: true,
      }}
      tooltipComponent={TutorialTooltip}
      styles={{ options: { arrowColor: themeContext.palette.info.dark, zIndex: themeContext.zIndex.tutorial } }}
      stepIndex={stepIndex}
    />
  );
}

SearchDatasetTutorial.propTypes = {
  runTutorial: PropTypes.bool.isRequired,
  closeSearchDatasetTutorial: PropTypes.func.isRequired,
  stepIndex: PropTypes.number.isRequired,
};

export default SearchDatasetTutorial;
