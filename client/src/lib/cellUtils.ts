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

export type DataType = 'text' | 'number' | 'date' | 'boolean';

export interface ValidationResult {
  isValid: boolean;
  type: DataType;
  error?: string;
}

export function validateCellInput(value: string): ValidationResult {
  // Check for number
  if (/^-?\d*\.?\d*$/.test(value)) {
    return { isValid: true, type: 'number' };
  }

  // Check for date (YYYY-MM-DD format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return { isValid: true, type: 'date' };
    }
    return {
      isValid: false,
      type: 'text',
      error: 'Invalid date format. Use YYYY-MM-DD'
    };
  }

  // Check for boolean
  if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
    return { isValid: true, type: 'boolean' };
  }

  // Default to text
  return { isValid: true, type: 'text' };
}

export function formatCell(cell: Cell): string {
  if (!cell.value) return '';

  if (cell.formula?.startsWith('=')) {
    // For formulas, return the calculated value
    return cell.value;
  }

  if (cell.type === 'number') {
    const num = parseFloat(cell.value);
    if (!isNaN(num)) {
      return num.toLocaleString();
    }
  }

  if (cell.type === 'date') {
    const date = new Date(cell.value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  if (cell.type === 'boolean') {
    return cell.value.toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
  }

  return cell.value;
}


// Converts absolute reference ($A$1) to normal reference (A1)
export function normalizeReference(ref: string): string {
  return ref.replace(/\$/g, '');
}

// Checks if a reference is absolute (column, row, or both)
export function isAbsoluteReference(ref: string): { col: boolean; row: boolean } {
  return {
    col: ref.charAt(0) === '$',
    row: ref.includes('$', 1)
  };
}

//Rudimentary formula evaluation (needs significant improvement for production use)
export function evaluateFormula(formula: string, cellData: {[key:string]: Cell}): string {
    //Very basic example, only handles addition of two cells.
    const matches = formula.match(/([A-Z]+\d+)/g);
    if(matches && matches.length === 2){
        const cell1 = cellData[matches[0]]?.value;
        const cell2 = cellData[matches[1]]?.value;
        if(typeof cell1 === 'number' && typeof cell2 === 'number'){
            return (cell1 + cell2).toString();
        }
    }
    return "Error: Formula not supported";
}