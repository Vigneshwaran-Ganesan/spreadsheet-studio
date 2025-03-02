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

  const handleSaveSpreadsheet = async (name: string) => {
    const saveData = {
      ...spreadsheet,
      name,
      lastModified: new Date()
    };
    
    try {
      if (spreadsheet.id === 1) {
        // Create new
        const response = await fetch('/api/spreadsheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData)
        });
        const data = await response.json();
        setSpreadsheet(data);
      } else {
        // Update existing
        const response = await fetch(`/api/spreadsheets/${spreadsheet.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData)
        });
        const data = await response.json();
        setSpreadsheet(data);
      }
    } catch (error) {
      console.error('Failed to save spreadsheet', error);
    }
  };
  
  const handleLoadSpreadsheet = async (id: number) => {
    try {
      const response = await fetch(`/api/spreadsheets/${id}`);
      const data = await response.json();
      setSpreadsheet(data);
    } catch (error) {
      console.error('Failed to load spreadsheet', error);
    }
  };
  
  const handleNewSpreadsheet = () => {
    setSpreadsheet({
      id: 1, // Temporary ID for new spreadsheet
      data: {},
      columnWidths: {},
      rowHeights: {}
    });
    setSelectedCell(null);
  };
  
  const getDataFromRange = (range: string) => {
    const [start, end] = range.split(':');
    if (!start || !end) return { labels: [], values: [] };
    
    const startCoords = getCellCoordinates(start);
    const endCoords = getCellCoordinates(end);
    
    const labels: string[] = [];
    const values: number[] = [];
    
    // Handle column range (e.g., A1:A10)
    if (startCoords.col === endCoords.col) {
      for (let i = startCoords.row; i <= endCoords.row; i++) {
        const cellId = getCellId(startCoords.col, i);
        const cell = spreadsheet.data[cellId];
        labels.push(cellId);
        values.push(cell?.value ? parseFloat(cell.value) : 0);
      }
    } 
    // Handle row range (e.g., A1:F1)
    else if (startCoords.row === endCoords.row) {
      for (let i = startCoords.col; i <= endCoords.col; i++) {
        const cellId = getCellId(i, startCoords.row);
        const cell = spreadsheet.data[cellId];
        labels.push(cellId);
        values.push(cell?.value ? parseFloat(cell.value) : 0);
      }
    }
    
    return { labels, values };
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center px-2 py-1 border-b">
        <FileMenu 
          onSave={handleSaveSpreadsheet}
          onLoad={handleLoadSpreadsheet}
          onNew={handleNewSpreadsheet}
          currentSpreadsheet={spreadsheet}
        />
        <div className="flex-1 flex justify-center">
          <Toolbar onFormat={handleFormat} />
        </div>
        <div>
          <ChartBuilder 
            getData={getDataFromRange}
            currentCell={selectedCell}
          />
        </div>
      </div>
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