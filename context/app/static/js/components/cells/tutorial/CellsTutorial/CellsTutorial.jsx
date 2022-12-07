import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import Joyride, { ACTIONS } from 'react-joyride';

import { useStore } from 'js/shared-styles/tutorials/TutorialProvider/store';
import TutorialTooltip from 'js/shared-styles/tutorials/TutorialTooltip';
import Prompt from 'js/shared-styles/tutorials/Prompt';
import { withTutorialProvider } from 'js/shared-styles/tutorials/TutorialProvider';
import { queryTypes } from 'js/components/cells/queryTypes';

import { steps } from './config';

function CellsTutorial({ setQueryType, setParametersButtonRef }) {
  const themeContext = useContext(ThemeContext);
  const { tutorialStep, tutorialIsRunning, runTutorial } = useStore();

  const handleJoyrideCallback = (data) => {
    const { action, index } = data;

    if (action === ACTIONS.NEXT && index === 0) {
      setQueryType(queryTypes.gene.value);
      setParametersButtonRef.current.click();
    }
  };

  return (
    <>
      <Prompt
        headerText="Getting Started"
        descriptionText="Get a tutorial of how to explore the genomic and proteomic information in the HuBMAP data portal."
        buttonText="Take the Molecular Data Queries Tutorial"
        buttonOnClick={runTutorial}
        buttonIsDisabled={false}
        closeOnClick={() => {}}
      />
      <Joyride
        steps={steps}
        callback={handleJoyrideCallback}
        run={tutorialIsRunning}
        scrollOffset={100}
        floaterProps={{
          disableAnimation: true,
        }}
        tooltipComponent={TutorialTooltip}
        styles={{ options: { arrowColor: themeContext.palette.info.dark, zIndex: themeContext.zIndex.tutorial } }}
        stepIndex={tutorialStep}
      />
    </>
  );
}

export default withTutorialProvider(CellsTutorial, 'has_exited_cells_tutorial');
