import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useEvaluateMarkers, { EvaluateMarkersParams } from './useEvaluateMarkers';

import { SCFIND_BASE_STORYBOOK } from './utils';

function EvaluateMarkersControl(params: EvaluateMarkersParams) {
  const result = useEvaluateMarkers(params);
  return (
    <Stack>
      <Typography variant="h6">Evaluate Markers</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/EvaluateMarkers',
  component: EvaluateMarkersControl,
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
    cellTypes: {
      control: {
        type: 'text',
      },
    },
    backgroundCellTypes: {
      control: {
        type: 'text',
      },
    },
    sortField: {
      control: {
        type: 'text',
      },
    },
    includePrefix: {
      control: {
        type: 'boolean',
      },
    },
  },
};

type Story = StoryObj<typeof EvaluateMarkersControl>;

export const EvaluateMarkers: Story = {
  args: {
    geneList: ['PRKCB', 'PAX5', 'SP140'],
    cellTypes: 'Kidney.B cell',
  },
};

export default meta;
