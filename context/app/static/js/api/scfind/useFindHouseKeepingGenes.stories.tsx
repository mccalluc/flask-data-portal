import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useFindHousekeepingGenes, { FindHouseKeepingGenesParams } from './useFindHouseKeepingGenes';

import { SCFIND_BASE_STORYBOOK } from './utils';

function FindHousekeepingGenes(params: FindHouseKeepingGenesParams) {
  const result = useFindHousekeepingGenes(params);
  return (
    <Stack>
      <Typography variant="h6">Find Housekeeping Genes</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/FindHouseKeepingGenes',
  component: FindHousekeepingGenes,
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
    cellTypes: {
      control: {
        type: 'text',
      },
    },
    minRecall: {
      control: {
        type: 'number',
      },
    },
    maxGenes: {
      control: {
        type: 'number',
      },
    },
  },
};

type Story = StoryObj<typeof FindHousekeepingGenes>;

export const FindHouseKeepingGenes: Story = {
  args: {
    cellTypes: 'Kidney.B cell,Kidney.conventional dendritic cell',
  },
};

export default meta;
