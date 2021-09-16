import React from 'react';
import Button from '@material-ui/core/Button';
import AccordionSteps from './AccordionSteps';

export default {
  title: 'AccordionSteps',
  component: AccordionSteps,
};

function ExampleContent({ completeStep, stepNumber }) {
  return (
    <>
      <Button onClick={() => completeStep(`Step ${stepNumber} Completed!`)}>Complete Step</Button>
    </>
  );
}

const Template = (args) => (
  <AccordionSteps
    {...args}
    steps={[1, 2, 3].map((stepNumber) => ({
      heading: `Step ${stepNumber}`,
      content: <ExampleContent stepNumber={stepNumber} />,
    }))}
  />
);

export const Default = Template.bind({});

Default.args = {};
