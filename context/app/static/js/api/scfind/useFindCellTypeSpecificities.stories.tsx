import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Stack } from '@mui/material';
import { http, passthrough } from 'msw';
import useFindCellTypeSpecificities, { FindCellTypeSpecificitiesParams } from './useFindCellTypeSpecificities';

import { SCFIND_BASE_STORYBOOK } from './utils';

function FindCellTypeSpecificitiesControl(params: FindCellTypeSpecificitiesParams) {
  const result = useFindCellTypeSpecificities(params);
  return (
    <Stack>
      <Typography variant="h6">Find Cell Type Specificities</Typography>
      <Typography variant="body1">Params:</Typography>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <Typography variant="body1">Results:</Typography>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </Stack>
  );
}

const meta: Meta = {
  title: 'SCFind/FindCellTypeSpecificities',
  component: FindCellTypeSpecificitiesControl,
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
    annotationNames: {
      control: {
        type: 'text',
      },
    },
    backgroundCellTypes: {
      control: {
        type: 'text',
      },
    },
    backgroundAnnotationNames: {
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

type Story = StoryObj<typeof FindCellTypeSpecificitiesControl>;

export const EvaluateMarkers: Story = {
  args: {},
};

export default meta;
