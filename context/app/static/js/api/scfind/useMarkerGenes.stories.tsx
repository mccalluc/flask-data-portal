import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useMarkerGenes, { MarkerGenesParams } from './useMarkerGenes';

import { SCFIND_BASE_STORYBOOK } from './utils';

function MarkerGenesControl(params: MarkerGenesParams) {
  const result = useMarkerGenes(params);
  return (
    <Stack>
      <Typography variant="h6">Marker Genes</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/MarkerGenes',
  component: MarkerGenesControl,
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
    markerGenes: {
      control: {
        type: 'text',
      },
    },
    datasetName: {
      control: {
        type: 'text',
      },
    },
  },
};

type Story = StoryObj<typeof MarkerGenesControl>;

export const MarkerGenes: Story = {
  args: {
    markerGenes: 'PKHD1L1,MMRN1,PPFIBP1,PLCG2',
    datasetName: 'Kidney',
  },
};

export default meta;
