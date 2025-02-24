import React, { useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { useController } from 'react-hook-form';
import { useAutocompleteQuery } from './hooks';
import { AutocompleteResult } from './types';
import { createInitialValue } from './utils';
import { QueryType, queryTypes } from '../../queryTypes';
import { PreserveWhiteSpaceListItem } from './styles';
import { useQueryType, useMolecularDataQueryFormState } from '../hooks';

function buildHelperText(entity: string): string {
  return `Multiple ${entity} are allowed and only 'OR' queries are supported.`;
}

const labelAndHelperTextProps: Record<QueryType, Pick<TextFieldProps, 'label' | 'helperText'>> = {
  gene: { label: 'Gene Symbol', helperText: buildHelperText('gene symbols') },
  protein: { label: 'Protein', helperText: buildHelperText('proteins') },
  'cell-type': { label: 'Cell Type', helperText: buildHelperText('cell types') },
};
interface AutocompleteEntityProps<T extends QueryType> {
  targetEntity: T;
  defaultValue?: string;
}

function AutocompleteEntity<T extends QueryType>({ targetEntity, defaultValue }: AutocompleteEntityProps<T>) {
  const [substring, setSubstring] = useState('');

  const { entityFieldName: fieldName } = useQueryType();

  const { control } = useMolecularDataQueryFormState();
  const { field } = useController({
    name: fieldName,
    control,
    defaultValue: createInitialValue(defaultValue),
  });

  const { data: options = [], isLoading } = useAutocompleteQuery({ targetEntity, substring });

  function handleChange({ target: { value } }: React.ChangeEvent<HTMLInputElement>) {
    setSubstring(value);
  }

  return (
    <Autocomplete
      options={options}
      multiple
      filterSelectedOptions
      getOptionLabel={(option) => option.full}
      isOptionEqualToValue={(option, value) => option.full === value.full}
      loading={isLoading}
      renderOption={(props, option) => (
        <PreserveWhiteSpaceListItem {...props}>
          <span>{option.pre}</span>
          <b>{option.match}</b>
          <span>{option.post}</span>
        </PreserveWhiteSpaceListItem>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const tagProps = getTagProps({ index });
          // Removing onDelete removes the delete icon
          const optionIsDefault = defaultValue && option.full === defaultValue;
          return (
            <Chip
              label={option.full}
              {...tagProps}
              onDelete={optionIsDefault ? undefined : tagProps.onDelete}
              key={option.full}
            />
          );
        })
      }
      renderInput={({ InputLabelProps, ...params }) => (
        <TextField
          {...labelAndHelperTextProps[targetEntity]}
          placeholder={`Select ${queryTypes[targetEntity].label.toLowerCase()} to query`}
          value={substring}
          name="substring"
          variant="outlined"
          onChange={handleChange}
          {...params}
          slotProps={{
            inputLabel: { shrink: true, ...InputLabelProps },
          }}
        />
      )}
      {...field}
      onChange={(_, value: AutocompleteResult[]) => {
        field.onChange(value);
      }}
    />
  );
}

export default AutocompleteEntity;
