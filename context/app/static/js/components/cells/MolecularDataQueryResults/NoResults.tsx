import React from 'react';
import { FullWidthAlert } from './style';

export default function NoResults() {
  return (
    <FullWidthAlert severity="info">
      No results found matching your search. Edit query parameters by returning to the previous step.
    </FullWidthAlert>
  );
}
