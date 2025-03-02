import React, { useState } from 'react';
import { Grid } from '@/components/spreadsheet/Grid';
import { Toolbar } from '@/components/spreadsheet/Toolbar';
import { FormulaBar } from '@/components/spreadsheet/FormulaBar';
import type { Spreadsheet } from '@shared/schema';

export default function Home() {
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet>({
    id: 1,
    data: {},
    columnWidths: {},
    rowHeights: {}
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

  const handleFormulaChange = (formula: string) => {
    if (!selectedCell) return;

    setSpreadsheet(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [selectedCell]: {
          ...prev.data[selectedCell],
          formula,
          value: formula
        }
      }
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar onFormat={handleFormat} />
      <FormulaBar
        value={spreadsheet.data[selectedCell || '']?.formula || spreadsheet.data[selectedCell || '']?.value || ''}
        onChange={handleFormulaChange}
        selectedCell={selectedCell}
      />
      <div className="flex-1 overflow-hidden">
        <Grid
          data={spreadsheet.data}
          onChange={handleDataChange}
          columnWidths={spreadsheet.columnWidths}
          rowHeights={spreadsheet.rowHeights}
        />
      </div>
    </div>
  );
}