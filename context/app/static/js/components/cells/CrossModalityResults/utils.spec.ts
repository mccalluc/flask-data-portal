import { extractCLID, extractLabel } from './utils';

describe('extractCLID', () => {
  it('should extract the CLID from a cell name string', () => {
    expect(extractCLID('Cell Type Name (CL123)')).toBe('CL123');
    expect(extractCLID('Cell Type Name (CL:456)')).toBe('CL:456');
    expect(extractCLID('Cell Type Name CLEAN (CL:789)')).toBe('CL:789');
  });

  it('should return null if the cell name string does not contain a CLID', () => {
    expect(extractCLID('Cell Type Name')).toBe(null);
  });
});

describe('extractLabel', () => {
  it('should extract the label from a cell name string', () => {
    expect(extractLabel('Cell Type Name (CL123)')).toBe('Cell Type Name');
    expect(extractLabel('Cell Type Name (CL:456)')).toBe('Cell Type Name');
    expect(extractLabel('Cell Type Name CLEAN (CL:789)')).toBe('Cell Type Name CLEAN');
  });
  it('should return the original string if the cell name string does not contain a CLID', () => {
    expect(extractLabel('Cell Type Name')).toBe('Cell Type Name');
  });
});
