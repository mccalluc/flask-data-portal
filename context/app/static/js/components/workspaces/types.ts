import { JobStatus, JobStatusDisplayName, WorkspaceStatus } from './statusCodes';

// Once workspaces API issues are resolved. We expect the workspaces API to consistently return an object.
type WorkspaceFile = string | { name: string };
interface Symlink {
  name: string;
  dataset_uuid?: string;
}
interface CurrentWorkspaceDetail {
  files: WorkspaceFile[];
  symlinks: Symlink[];
}

interface RequestWorkspaceDetail extends CurrentWorkspaceDetail {
  globus_groups_token: string;
}

interface WorkspaceDetails {
  current_workspace_details: CurrentWorkspaceDetail;
  request_workspace_details: RequestWorkspaceDetail;
}

export interface Workspace {
  id: number;
  name: string;
  status: WorkspaceStatus;
  description: string;
  disk_space: number;
  default_job_type?: string;
  datetime_created: string;
  workspace_details: WorkspaceDetails;
}

export interface WorkspaceResourceOptions {
  num_cpus: number;
  memory_mb: number;
  time_limit_minutes: number;
  gpu_enabled: boolean;
}

interface WorkspaceJobDetail {
  message: string;
  time_left: number;
  proxy_details: {
    path: string;
    port: number;
    hostname: string;
  };
  connection_details: {
    url_path: string;
    url_domain: string;
  };
  resource_options: WorkspaceResourceOptions;
}

interface WorkspaceJobDetails {
  current_job_details: WorkspaceJobDetail;
  request_job_details: WorkspaceJobDetail;
}

export interface WorkspaceJobType {
  id: string;
  name: string;
}

export interface WorkspaceJob {
  id: number;
  workspace_id: number;
  resource_job_id: number;
  job_type: string;
  status: JobStatus;
  datetime_created: string;
  datetime_start: string;
  datetime_end: string;
  core_hours: string;
  job_details: WorkspaceJobDetails;
}

export interface WorkspaceJobWithDisplayStatus extends Omit<WorkspaceJob, 'status'> {
  status: JobStatusDisplayName;
}

export interface MergedWorkspace extends Workspace {
  jobs: WorkspaceJob[];
  path: string;
}

export interface WorkspaceUser {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface WorkspaceWithUserId extends MergedWorkspace {
  user_id?: WorkspaceUser;
}

export interface SharedWorkspace {
  id: number;
  name: string;
  description: string;
  user_id: WorkspaceUser;
}

export type InvitationType = 'Sent' | 'Received';

export interface WorkspaceInvitation {
  original_workspace_id: SharedWorkspace;
  shared_workspace_id: SharedWorkspace;
  last_resource_options: WorkspaceResourceOptions;
  last_job_type: string;
  is_accepted: boolean;
  datetime_share_created: string;
}

export interface AllWorkspaceInvitations {
  original_workspaces: WorkspaceInvitation[];
  shared_workspaces: WorkspaceInvitation[];
}

interface WorkspaceAPIFailure {
  success: false;
  message: string;
  data: undefined;
}

interface WorkspaceAPISuccess<Data> {
  success: true;
  message: string;
  data: Data;
}

type WorkspaceAPIResponse<Data> = WorkspaceAPIFailure | WorkspaceAPISuccess<Data>;

type WorkspaceAPIResponseWithoutData = Omit<WorkspaceAPIResponse<undefined>, 'data'>;

interface TemplateExample {
  title: string;
  description: string;
  datasets: string[];
  assay_display_name?: string[];
  resource_options?: Partial<WorkspaceResourceOptions>;
  required_filetypes?: string[];
}

interface TemplateTypes {
  title: string;
  description: string;
  tags: string[];
  is_multi_dataset_template: boolean;
  template_format: string;
  is_hidden: boolean;
  job_types?: string[];
  examples: TemplateExample[];
  last_modified_unix_timestamp: number;
}

type TemplatesTypes = Record<string, TemplateTypes>;

type TemplatesResponse = WorkspaceAPIResponse<TemplatesTypes>;

interface CreateTemplateData {
  template: string;
}

type CreateTemplatesResponse = WorkspaceAPIResponse<CreateTemplateData>;

interface CreateWorkspaceData {
  workspace: {
    id: number;
  };
}

type CreateWorkspaceResponse = WorkspaceAPIResponse<CreateWorkspaceData>;

type TemplateTags = Record<string, string>;

type TemplateTagsResponse = WorkspaceAPIResponse<TemplateTags>;

export enum WorkspacesEventCategories {
  Workspaces = 'Workspaces',
  WorkspaceDialog = 'Workspace Dialog',
  WorkspaceLandingPage = 'Workspace Landing Page',
  WorkspaceDetailPage = 'Workspace Detail Page',
  WorkspaceTemplateLandingPage = 'Workspace Template Landing Page',
  WorkspaceTemplateDetailPage = 'Workspace Template Detail Page',
}

interface WorkspacesEventInfo {
  category: WorkspacesEventCategories;
  action?: string;
  label?: string;
}

interface CreateTemplateNotebooksTypes {
  templateKeys: string[];
  uuids: string[];
  workspaceName: string;
  workspaceJobTypeId: string;
  workspaceResourceOptions: WorkspaceResourceOptions;
  trackingInfo?: WorkspacesEventInfo;
}

export type {
  WorkspaceFile,
  WorkspaceAPIResponse,
  WorkspaceAPIResponseWithoutData,
  TemplatesResponse,
  CreateTemplatesResponse,
  CreateWorkspaceResponse,
  TemplateExample,
  TemplatesTypes,
  CreateTemplateNotebooksTypes,
  TemplateTags,
  TemplateTagsResponse,
  WorkspacesEventInfo,
};
