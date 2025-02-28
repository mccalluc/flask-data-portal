import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useFindSimilarGenes, { FindSimilarGenesParams } from './useFindSimilarGenes';

import { SCFIND_BASE_STORYBOOK } from './utils';

function FindSimilarGenesControl(params: FindSimilarGenesParams) {
  const result = useFindSimilarGenes(params);
  return (
    <Stack>
      <Typography variant="h6">Find Similar Genes</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/FindSimilarGenes',
  component: FindSimilarGenesControl,
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
    annotationNames: {
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

type Story = StoryObj<typeof FindSimilarGenesControl>;

export const FindSimilarGenes: Story = {
  args: {
    geneList: 'MMRN1,PKHD1L1',
  },
};

export default meta;
