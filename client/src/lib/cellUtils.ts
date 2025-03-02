import type { Cell } from "@shared/schema";

export function getCellCoordinates(cellId: string): { col: number; row: number } {
  const col = cellId.match(/[A-Z]+/)?.[0] || 'A';
  const row = parseInt(cellId.match(/\d+/)?.[0] || '1');
  return {
    col: col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0),
    row
  };
}

export function getCellId(col: number, row: number): string {
  let colStr = '';
  let n = col;
  while (n > 0) {
    const rem = (n - 1) % 26;
    colStr = String.fromCharCode(65 + rem) + colStr;
    n = Math.floor((n - 1) / 26);
  }
  return `${colStr}${row}`;
}

export function findCellDependencies(formula: string): string[] {
  if (!formula?.startsWith('=')) return [];
  
  const cellRefs = formula.match(/[A-Z]+\d+/g);
  return cellRefs || [];
}

export function formatCell(cell: Cell): string {
  if (!cell.value) return '';
  
  if (cell.formula?.startsWith('=')) {
    return cell.value;
  }
  
  const num = parseFloat(cell.value);
  if (!isNaN(num)) {
    return num.toLocaleString();
  }
  
  return cell.value;
}
