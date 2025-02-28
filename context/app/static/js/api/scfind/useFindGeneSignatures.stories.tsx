import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useFindGeneSignatures, { FindGeneSignaturesParams } from './useFindGeneSignatures';

import { SCFIND_BASE_STORYBOOK } from './utils';

function FindGeneSignaturesControl(params: FindGeneSignaturesParams) {
  const result = useFindGeneSignatures(params);
  return (
    <Stack>
      <Typography variant="h6">Find Gene Signatures</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/FindGeneSignatures',
  component: FindGeneSignaturesControl,
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
    minCells: {
      control: {
        type: 'number',
      },
    },
    minFraction: {
      control: {
        type: 'number',
      },
    },
  },
};

type Story = StoryObj<typeof FindGeneSignaturesControl>;

export const FindGeneSignatures: Story = {
  args: {
    cellTypes: 'Lung.B cell',
  },
};

export default meta;
