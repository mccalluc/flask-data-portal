import React from 'react';
import { render, screen, appProviderEndpoints, appProviderToken } from 'test-utils/functions';

import { DetailContext } from 'js/components/detailPage/DetailContext';

import { FilesContext } from '../Files/FilesContext';

import FileBrowserFile from './FileBrowserFile';

const fakeOpenDUA = jest.fn();

const uuid = 'fakeuuid';

const detailContext = { uuid: 'fakeuuid' };
const filesContext = { openDUA: fakeOpenDUA, hasAgreedToDUA: 'fakedua' };

const defaultFileObject = {
  rel_path: 'fakepath',
  edam_term: 'faketerm',
  description: 'fakedescription',
  file: 'fakefile',
  size: 1000,
};

function RenderFileTest({ fileObjOverrides = {}, depth = 0 }) {
  const completeFileObject = {
    ...defaultFileObject,
    ...fileObjOverrides,
  };
  return (
    <DetailContext.Provider value={detailContext}>
      <FilesContext.Provider value={filesContext}>
        <FileBrowserFile fileObj={completeFileObject} depth={depth} />
      </FilesContext.Provider>
    </DetailContext.Provider>
  );
}

const file = {
  get qaChip() {
    return screen.queryByText('QA');
  },
  get dataProductChip() {
    return screen.queryByText('Data Product');
  },
  get qaDataProductChip() {
    return screen.queryByText('QA / Data Product');
  },
  get link() {
    return screen.getByRole('link');
  },
  get container() {
    return screen.getByTestId('file-indented-div');
  },
};

describe('FileBrowserFile', () => {
  it('displays a link with correct href when dua is agreed to', () => {
    render(<RenderFileTest />);

    const refToTest = `${appProviderEndpoints.assetsEndpoint}/${uuid}/${defaultFileObject.rel_path}?token=${appProviderToken}`;

    expect(file.link).toHaveAttribute('href', refToTest);
  });

  it('has correct left margin', () => {
    const depth = 3;

    render(<RenderFileTest depth={depth} />);

    // depth * indentation multiplier * 8px spacing unit
    const expectedMargin = depth * 4 * 8;
    expect(file.container).toHaveStyle(`margin-left: ${expectedMargin}px`);
  });

  it('displays QA chip when is_qa_qc is true', () => {
    render(<RenderFileTest fileObjOverrides={{ is_qa_qc: true }} />);

    expect(file.qaChip).toBeInTheDocument();
  });

  it('does not display QA chip when is_qa_qc is not provided', () => {
    render(<RenderFileTest />);

    expect(file.qaChip).not.toBeInTheDocument();
  });

  it('does not display QA chip when is_qa_qc is false', () => {
    render(<RenderFileTest fileObjOverrides={{ is_qa_qc: false }} />);

    expect(file.qaChip).not.toBeInTheDocument();
  });

  it('displays Data Product chip when is_data_product is true', () => {
    render(<RenderFileTest fileObjOverrides={{ is_data_product: true }} />);

    expect(file.dataProductChip).toBeInTheDocument();
  });

  it('does not display Data Product chip when is_data_product is false', () => {
    render(<RenderFileTest fileObjOverrides={{ is_data_product: false }} />);

    expect(file.dataProductChip).not.toBeInTheDocument();
  });

  it('does not display Data Product chip when is_data_product is not provided', () => {
    render(<RenderFileTest />);

    expect(file.dataProductChip).not.toBeInTheDocument();
  });

  it('displays "QA / Data Product" chip when is_qa_qc and is_data_product are true', () => {
    render(<RenderFileTest fileObjOverrides={{ is_qa_qc: true, is_data_product: true }} />);

    expect(file.qaDataProductChip).toBeInTheDocument();
  });
});
