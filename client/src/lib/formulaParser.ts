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
    }
  } catch (error) {
    return '#ERROR!';
  }
  
  return '#INVALID!';
}

function parseRange(range: string): string[] {
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
    return value ? parseFloat(value) : undefined;
  }).filter(v => v !== undefined) as number[];
}

function extractRange(formula: string): string {
  const match = formula.match(/\((.*)\)/);
  return match ? match[1] : '';
}

function calculateSum(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  return values.reduce((sum, val) => sum + val, 0).toString();
}

function calculateAverage(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  return (values.reduce((sum, val) => sum + val, 0) / values.length).toString();
}

function calculateMax(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  return Math.max(...values).toString();
}

function calculateMin(formula: string, getCellValue: (ref: string) => string | undefined): string {
  const range = extractRange(formula);
  const values = getRangeValues(range, getCellValue);
  return Math.min(...values).toString();
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
