import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { Dataset } from '../types';

export type WrappedCellsResultsDataset = Required<SearchHit<Dataset>>;
