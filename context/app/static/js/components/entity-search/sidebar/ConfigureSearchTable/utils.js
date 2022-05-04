function getFieldEntriesSortedByConfigureGroup(fields) {
  return Object.entries(fields).sort(
    (
      [, { configureGroup: configureGroupA, label: labelA }],
      [, { configureGroup: configureGroupB, label: labelB }],
    ) => {
      // put 'General' configure group at top
      if (configureGroupA === 'General' && configureGroupB !== 'General') {
        return -1;
      }
      if (configureGroupA !== 'General' && configureGroupB === 'General') {
        return 1;
      }

      return configureGroupA.localeCompare(configureGroupB) || labelA.localeCompare(labelB);
    },
  );
}

export { getFieldEntriesSortedByConfigureGroup };
