export function getSearchQuery(cellsResults: { uuid: string }[] | undefined) {
  if (cellsResults === undefined) {
    return {};
  }
  return {
    size: 10000,
    post_filter: {
      bool: {
        must: [
          {
            term: {
              'entity_type.keyword': 'Dataset',
            },
          },
          {
            terms: {
              uuid: cellsResults.map((result) => result.uuid),
            },
          },
        ],
      },
    },
    _source: [
      'uuid',
      'hubmap_id',
      'dataset_type',
      'origin_samples_unique_mapped_organs',
      'donor',
      'last_modified_timestamp',
    ],
  };
}
