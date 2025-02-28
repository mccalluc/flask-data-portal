import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useFindTissueSpecificities, { FindTissueSpecificitiesParams } from './useFindTissueSpecificities';

import { SCFIND_BASE_STORYBOOK } from './utils';

function FindTissueSpecificitiesControl(params: FindTissueSpecificitiesParams) {
  const result = useFindTissueSpecificities(params);
  return (
    <Stack>
      <Typography variant="h6">Find Tissue Specificities</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/FindTissueSpecificities',
  component: FindTissueSpecificitiesControl,
  parameters: {
    msw: {
      handlers: [
        http.get(`${SCFIND_BASE_STORYBOOK}/api/*`, () => {
          return passthrough();
        }),
      ],
    },
  },
  argTypes: {
    geneList: {
      control: {
        type: 'text',
      },
    },
    minCells: {
      control: {
        type: 'number',
      },
    },
  },
};

type Story = StoryObj<typeof FindTissueSpecificitiesControl>;

export const FindTissueSpecificities: Story = {
  args: {
    geneList: 'PKHD1L1,MMRN1,PPFIBP1',
  },
};

export default meta;
