import React, { useMemo } from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ArrowDropDownRounded from '@mui/icons-material/ArrowDropDownRounded';
import { Button, Slider, Typography } from '@mui/material';
import Stack from '@mui/system/Stack';

import { ControllerRenderProps, FieldValues, Path, useController, UseControllerProps } from 'react-hook-form';
import InfoTooltipIcon from 'js/shared-styles/icons/TooltipIcon';
import { SpacedSectionButtonRow } from 'js/shared-styles/sections/SectionButtonRow';
import { StyledAccordion, StyledHeader, StyledSubtitle, StyledSwitch, StyledSwitchLabel } from './style';
import {
  MAX_MEMORY_MB,
  MAX_NUM_CPUS,
  MAX_TIME_LIMIT_MINUTES,
  MIN_MEMORY_MB,
  MIN_NUM_CPUS,
  MIN_TIME_LIMIT_MINUTES,
} from '../constants';

interface ConfigSliderProps<FormType extends FieldValues> {
  field: ControllerRenderProps<FormType, Path<FormType>>;
  id: string;
  label: string;
  tooltip: string;
  min: number;
  max: number;
  conversionFactor?: number;
}

const description =
  'Adjusting these settings may result in longer workspace load times and could potentially affect your saved work.';
const configSliderOptions = [
  {
    id: 'time_limit_minutes',
    label: 'Time Limit (hours)',
    tooltip: 'Session duration for your workspace.',
    min: MIN_TIME_LIMIT_MINUTES,
    max: MAX_TIME_LIMIT_MINUTES,
    conversionFactor: 60,
  },
  {
    id: 'memory_mb',
    label: 'Memory (GB)',
    tooltip: 'Available memory for your workspace.',
    min: MIN_MEMORY_MB,
    max: MAX_MEMORY_MB,
    conversionFactor: 1024,
  },
  {
    id: 'num_cpus',
    label: 'Number of CPUs',
    tooltip: 'Number of CPUs available for your workspace.',
    min: MIN_NUM_CPUS,
    max: MAX_NUM_CPUS,
  },
];

function ConfigSlider<FormType extends FieldValues>({
  field,
  id,
  label,
  tooltip,
  min,
  max,
  conversionFactor = 1,
}: ConfigSliderProps<FormType>) {
  const convert = (value: number) => value / conversionFactor;
  const unconvert = (value: number) => value * conversionFactor;

  const convertedMin = convert(min);
  const convertedMax = convert(max);

  const marks = useMemo(() => {
    const tempMarks = [];
    for (let i = convertedMin; i <= convertedMax; i += 1) {
      tempMarks.push({ value: i, label: i });
    }
    return tempMarks;
  }, [convertedMin, convertedMax]);

  return (
    <Stack marginTop={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <StyledSubtitle>{label}</StyledSubtitle>
        <InfoTooltipIcon iconTooltipText={tooltip} />
      </Stack>
      <Stack padding={1}>
        <Slider
          value={convert(field.value[id] as number)}
          onChange={(e, value) =>
            field.onChange({
              ...field.value,
              [id]: unconvert(value as number),
            })
          }
          valueLabelDisplay="auto"
          marks={marks}
          min={convertedMin}
          max={convertedMax}
        />
      </Stack>
    </Stack>
  );
}

type WorkspaceJobTypeFieldProps<FormType extends FieldValues> = Pick<UseControllerProps<FormType>, 'control'>;

function AdvancedConfigOptions<FormType extends FieldValues>({ control }: WorkspaceJobTypeFieldProps<FormType>) {
  const { field } = useController({
    name: 'workspaceResourceOptions' as Path<FormType>,
    control,
    rules: { required: true },
  });

  return (
    <StyledAccordion>
      <AccordionSummary expandIcon={<ArrowDropDownRounded color="primary" />}>
        <StyledHeader fontSize="5rem">Advanced Configurations (Optional)</StyledHeader>
      </AccordionSummary>
      <AccordionDetails>
        <Stack>
          <Typography>{description}</Typography>
          <SpacedSectionButtonRow
            buttons={
              <Stack direction="row" gap={1} marginTop={1}>
                <Button type="button" variant="contained" disabled>
                  Restore Defaults
                </Button>
              </Stack>
            }
          />
          {configSliderOptions.map((props) => (
            <ConfigSlider key={props.id} field={field} {...props} />
          ))}
          <StyledSubtitle>Enable GPU</StyledSubtitle>
          <Stack direction="row" component="label" alignItems="center">
            <StyledSwitchLabel>Disabled</StyledSwitchLabel>
            <StyledSwitch />
            <StyledSwitchLabel>Enabled</StyledSwitchLabel>
          </Stack>
        </Stack>
      </AccordionDetails>
    </StyledAccordion>
  );
}

export default AdvancedConfigOptions;
