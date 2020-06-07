/* eslint-disable import/no-unresolved */
/* eslint-disable camelcase */
import React from 'react';
import { render } from 'test-utils.js';
import Attribution from './Attribution';

test('text displays properly', () => {
  const group_name = 'Fake TMC';
  const created_by_user_displayname = 'Fake Name';
  const created_by_user_email = 'fake@fake.com';
  const { getByText } = render(
    <Attribution
      group_name={group_name}
      created_by_user_displayname={created_by_user_displayname}
      created_by_user_email={created_by_user_email}
    />,
  );
  const textToTest = ['Attribution', 'Creator', 'Fake TMC', 'Creator', 'Fake Name', 'fake@fake.com'];
  textToTest.forEach((text) => expect(getByText(text)).toBeInTheDocument());
});
