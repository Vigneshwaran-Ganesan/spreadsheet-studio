export function evaluateFormula(formula: string, getCellValue: (ref: string) => string | undefined): string | undefined {
  if (!formula.startsWith('=')) return formula;

  const expression = formula.substring(1).trim().toUpperCase();

  try {
    if (expression.startsWith('SUM(')) {
      return calculateSum(expression, getCellValue);
    } else if (expression.startsWith('AVERAGE(')) {
      return calculateAverage(expression, getCellValue);
    } else if (expression.startsWith('MAX(')) {
      return calculateMax(expression, getCellValue);
    } else if (expression.startsWith('MIN(')) {
      return calculateMin(expression, getCellValue);
    } else if (expression.startsWith('COUNT(')) {
      return calculateCount(expression, getCellValue);
    } else if (expression.startsWith('TRIM(')) {
      return applyTrim(expression, getCellValue);
    } else if (expression.startsWith('UPPER(')) {
      return applyUpper(expression, getCellValue);
    } else if (expression.startsWith('LOWER(')) {
      return applyLower(expression, getCellValue);
    } else if (expression.startsWith('REMOVE_DUPLICATES(')) {
      return removeDuplicates(expression, getCellValue);
    } else if (expression.startsWith('FIND_AND_REPLACE(')) {
      return findAndReplace(expression, getCellValue);
    }
  } catch (error) {
    return '#ERROR!';
  }

  return '#INVALID!';
}

function parseRange(range: string): string[] {
  // Handle comma-separated references
  if (range.includes(',')) {
    return range.split(',').map(ref => ref.trim());
  }

  // Handle range with colon
  const [start, end] = range.split(':');
  if (!end) return [start];

  const startCol = start.match(/[A-Z]+/)?.[0] || '';
  const startRow = parseInt(start.match(/\d+/)?.[0] || '0');
  const endCol = end.match(/[A-Z]+/)?.[0] || '';
  const endRow = parseInt(end.match(/\d+/)?.[0] || '0');

  const cells: string[] = [];
  for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
    for (let row = startRow; row <= endRow; row++) {
      cells.push(`${String.fromCharCode(col)}${row}`);
    }
  }

  return cells;
}

function getRangeValues(range: string, getCellValue: (ref: string) => string | undefined): (number | undefined)[] {
  const cells = parseRange(range);
  return cells.map(cell => {
    const value = getCellValue(cell);
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }).filter(v => v !== undefined);
}

function extractRange(formula: string): string {
  const match = formula.match(/\((.*)\)/);
  return match ? match[1] : '';
}

function calculateSum(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  if (values.length === 0) return '0';
  return values.reduce((sum, val) => (sum || 0) + (val || 0), 0).toString();
}

function calculateAverage(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  if (values.length === 0) return '#DIV/0!';
  return (values.reduce((sum, val) => (sum || 0) + (val || 0), 0) / values.length).toString();
}

function calculateMax(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  if (values.length === 0) return '#N/A';
  return Math.max(...values.filter(v => v !== undefined) as number[]).toString();
}

function calculateMin(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  if (values.length === 0) return '#N/A';
  return Math.min(...values.filter(v => v !== undefined) as number[]).toString();
}

function calculateCount(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  return values.length.toString();
}

function applyTrim(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const value = getCellValue(range);
  return value ? value.trim() : '';
}

function applyUpper(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const value = getCellValue(range);
  return value ? value.toUpperCase() : '';
}

function applyLower(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const value = getCellValue(range);
  return value ? value.toLowerCase() : '';
}

function removeDuplicates(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const cells = parseRange(range);
  const values = cells.map(cell => getCellValue(cell));
  const uniqueValues = Array.from(new Set(values));
  return uniqueValues.filter(v => v !== undefined).join(',');
}

function findAndReplace(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const params = extractRange(formula).split(',').map(p => p.trim());
  if (params.length !== 3) return '#ERROR!';

  const [range, find, replace] = params;
  const value = getCellValue(range);
  if (!value || !find) return value || '';

  const findStr = find.replace(/^["']|["']$/g, '');
  const replaceStr = replace.replace(/^["']|["']$/g, '');

  return value.replace(new RegExp(findStr, 'g'), replaceStr);
}