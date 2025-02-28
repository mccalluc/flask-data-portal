import { ContributorAPIResponse, ContactAPIResponse } from './detailPage/ContributorsTable/utils';
import { UnprocessedFile } from './detailPage/files/types';

export type DonorEntityType = 'Donor';
export type SampleEntityType = 'Sample';
export type DatasetEntityType = 'Dataset';
export type SupportEntityType = 'Support';
export type CollectionEntityType = 'Collection';
export type PublicationEntityType = 'Publication';

export type ESEntityType =
  | DonorEntityType
  | SampleEntityType
  | DatasetEntityType
  | SupportEntityType
  | CollectionEntityType
  | PublicationEntityType;

export interface CWLPipelineLink {
  hash: string;
  name: string;
  origin: string;
}

export interface IngestPipelineLink {
  hash: string;
  origin: string;
}

export type DagProvenanceType = CWLPipelineLink | IngestPipelineLink;

export interface Entity {
  entity_type: ESEntityType;
  description: string;
  uuid: string;
  hubmap_id: string;
  last_modified_timestamp: number;
  contacts: ContactAPIResponse[];
  contributors: ContributorAPIResponse[];
  created_timestamp: number;
  /** @deprecated Use `ancestor_ids` and `useEntitiesData` instead */
  ancestors: Entity[];
  ancestor_ids: string[];
  // eslint-disable-next-line no-use-before-define -- Donor is defined later in the file and extends Entity
  donor: Donor;
  descendant_counts: { entity_type: Record<string, number> };
  descendant_ids: string[];
  ingest_metadata: {
    dag_provenance_list: DagProvenanceType[];
    [key: string]: unknown;
  };
  metadata: Record<string, unknown>;
  /** @deprecated Use `descendant_ids` and `useEntitiesData` instead */
  descendants: Entity[];
  group_name: string;
  created_by_user_displayname: string;
  created_by_user_email: string;
  mapped_status: string;
  mapped_data_types?: string[];
  mapped_data_access_level: 'Public' | 'Protected' | 'Consortium';
  status: string;
  mapped_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export type PartialEntity = Partial<Entity> & Pick<Entity, 'entity_type' | 'uuid' | 'hubmap_id'>;

export interface Donor extends Entity {
  entity_type: 'Donor';
  mapped_metadata?: Partial<{
    sex: string;
    age_unit: string;
    age_value: string;
    race: string[];
    body_mass_index_value: string;
    body_mass_index_unit: string;
  }>;
  group_name: string;
  protocol_url: string;
}

export interface Sample extends Entity {
  entity_type: 'Sample';
  sample_category: string;
  mapped_organ: string;
  organ: string;
  origin_samples_unique_mapped_organs: string[];
  origin_samples: Sample[];
  protocol_url: string;
}

export type CreationAction =
  | 'Create Dataset Activity'
  | 'Central Process'
  | 'Multi-Assay Split'
  | 'Lab Process'
  | 'Create Publication Activity'
  | 'External Process';

export interface Dataset extends Entity {
  entity_type: 'Dataset';
  processing: 'raw' | 'processed';
  processing_type?: string;
  pipeline?: string;
  assay_display_name: string[];
  is_component?: boolean;
  assay_modality: 'single' | 'multiple';
  donor: Donor;
  mapped_data_access_level: 'Public' | 'Protected' | 'Consortium';
  creation_action: CreationAction;
  origin_samples: Sample[];
  origin_samples_unique_mapped_organs: string[];
  mapped_data_types: string[];
  mapped_consortium: string;
  thumbnail_file?: {
    file_uuid: string;
  };
  dbgap_study_url: string;
  dbgap_sra_experiment_url: string;
  files: UnprocessedFile[];
  sub_status: string;
  protocol_url: string;
  registered_doi: string;
  doi_url?: string;
  published_timestamp: number;
  mapped_external_group_name?: string;
  title: string;
  dataset_type: string;
  visualization: boolean;
  source_samples: Sample[];
}

export interface Collection extends Entity {
  entity_type: 'Collection';
  doi_url?: string;
  title: string;
  datasets: Dataset[];
}

export interface Publication extends Entity {
  entity_type: 'Publication';
  associated_collection?: Collection;
  doi_url: string;
  mapped_external_group_name?: string; // Does this exist?
  publication_doi: string;
  publication_venue: string;
  publication_url: string;
  publication_date: string;
  status: string;
  sub_status: string;
  title: string;
}

export interface Support extends Entity {
  entity_type: 'Support';
  origin_samples: Sample[];
  files: UnprocessedFile[];
  published_timestamp: number;
  assay_modality: 'single' | 'multiple';
  created_timestamp: number;
  last_modified_timestamp: number;
  mapped_data_types: string[];
}

export type AllEntities = Dataset | Donor | Sample | Collection | Publication | Support;

export type EntityWithType = Partial<Entity> & Required<Pick<Entity, 'entity_type'>>;

function checkEntityType(entity: EntityWithType, entityType: ESEntityType): boolean {
  return entity.entity_type === entityType;
}

export function isDataset(entity: EntityWithType): entity is Dataset {
  return checkEntityType(entity, 'Dataset');
}

export function isSample(entity: EntityWithType): entity is Sample {
  return checkEntityType(entity, 'Sample');
}

export function isDonor(entity: EntityWithType): entity is Donor {
  return checkEntityType(entity, 'Donor');
}

export function isCollection(entity: EntityWithType): entity is Collection {
  return checkEntityType(entity, 'Collection');
}

export function isPublication(entity: EntityWithType): entity is Publication {
  return checkEntityType(entity, 'Publication');
}

export function isSupport(entity: EntityWithType): entity is Support {
  return checkEntityType(entity, 'Support');
}
