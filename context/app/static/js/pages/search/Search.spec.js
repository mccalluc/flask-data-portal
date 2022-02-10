import React from 'react';
// eslint-disable-next-line import/no-unresolved
import { render, screen } from 'test-utils/functions';

import Search from './Search';

test('Search error if missing entity_type param', () => {
  const originalConsoleError = console.error;
  console.error = jest.fn();

  expect(() => render(<Search elasticsearchEndpoint="not-used" title="not-used" />)).toThrow(
    'Unexpected URL param "entity_type[0]="; Should be one of {donor, sample, dataset, collection}',
  );

  console.error = originalConsoleError;
});

test('Search works with entity_type param', () => {
  const location = {
    ...window.location,
    search: '?entity_type[0]=Donor', // Donor is the least complicated of the three.
  };
  Object.defineProperty(window, 'location', {
    writable: true,
    value: location,
  });

  render(<Search elasticsearchEndpoint="not-used" title="TITLE" />);
  const expectedStrings = ['TITLE', 'Donor Metadata', 'Affiliation'];
  expectedStrings.forEach((s) => expect(screen.getByText(s)).toBeInTheDocument());
});
