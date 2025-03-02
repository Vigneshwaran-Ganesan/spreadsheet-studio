import React, { useState } from 'react';
import { Grid } from '@/components/spreadsheet/Grid';
import { Toolbar } from '@/components/spreadsheet/Toolbar';
import { FormulaBar } from '@/components/spreadsheet/FormulaBar';
import type { Spreadsheet } from '@shared/schema';
import { evaluateFormula } from '@/lib/formulaParser';

export default function Home() {
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet>({
    id: 1,
    data: {},
    columnWidths: {},
    rowHeights: {},
    _rowHeights: {}
  });

  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const handleDataChange = (newData: Spreadsheet['data']) => {
    setSpreadsheet(prev => ({
      ...prev,
      data: newData
    }));
  };

  const handleFormat = (format: any) => {
    if (!selectedCell) return;

    setSpreadsheet(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [selectedCell]: {
          ...prev.data[selectedCell],
          format: {
            ...prev.data[selectedCell]?.format,
            ...format
          }
        }
      }
    }));
  };

  const getCellValue = (cellId: string) => {
    return spreadsheet.data[cellId]?.value;
  };

  const handleFormulaChange = (formula: string) => {
    if (!selectedCell) return;

    const newData = { ...spreadsheet.data };
    const currentCell = { ...newData[selectedCell] };

    if (formula.startsWith('=')) {
      currentCell.formula = formula;
      currentCell.value = evaluateFormula(formula, getCellValue) || '';
    } else {
      currentCell.formula = undefined;
      currentCell.value = formula;
    }

    newData[selectedCell] = currentCell;

    // Update dependent cells
    Object.entries(newData).forEach(([cellId, cell]) => {
      if (cell.formula && cell.formula.includes(selectedCell)) {
        cell.value = evaluateFormula(cell.formula, getCellValue) || '';
      }
    });

    setSpreadsheet(prev => ({
      ...prev,
      data: newData
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar onFormat={handleFormat} />
      <FormulaBar
        value={selectedCell ? (spreadsheet.data[selectedCell]?.formula || spreadsheet.data[selectedCell]?.value || '') : ''}
        onChange={handleFormulaChange}
        selectedCell={selectedCell}
      />
      <div className="flex-1 overflow-hidden">
        <Grid
          data={spreadsheet.data}
          onChange={handleDataChange}
          onCellSelect={setSelectedCell}
          selectedCell={selectedCell}
          columnWidths={spreadsheet.columnWidths}
          rowHeights={spreadsheet.rowHeights}
        />
      </div>
    </div>
  );
}