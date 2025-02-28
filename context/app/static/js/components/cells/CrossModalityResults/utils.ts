// Extracts the CLID from a cell name string provided in the format <Cell Type Name> (<CLID>)
export function extractCLID(cellName: string) {
  const match = /\((CL[^)]+)\)/.exec(cellName);
  return match ? match[1] : null;
}

// Extracts the label from a cell name string provided in the format <Cell Type Name> (<CLID>)
export function extractLabel(cellName: string) {
  return cellName.split(' (CL')[0];
}
