import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useCellTypeNames from './useCellTypeNames';

import { SCFIND_BASE_STORYBOOK } from './utils';

function CellTypeNamesControl() {
  const result = useCellTypeNames();
  return (
    <Stack>
      <Typography variant="h6">Cell Type Names</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>(None)</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/CellTypeNames',
  component: CellTypeNamesControl,
  parameters: {
    msw: {
      handlers: [
        http.get(`${SCFIND_BASE_STORYBOOK}/api/*`, () => {
          return passthrough();
        }),
      ],
    },
  },
};

type Story = StoryObj<typeof CellTypeNamesControl>;

export const CellTypeNames: Story = {
  args: {},
};

export default meta;
