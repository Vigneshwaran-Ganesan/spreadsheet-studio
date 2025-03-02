import React, { useCallback, useRef } from 'react';
import { Cell } from './Cell';
import type { Cell as CellType, Spreadsheet } from '@shared/schema';
import { evaluateFormula } from '@/lib/formulaParser';
import { getCellId, findCellDependencies, getCellCoordinates } from '@/lib/cellUtils';

interface GridProps {
  data: Spreadsheet['data'];
  onChange: (data: Spreadsheet['data']) => void;
  onCellSelect: (cellId: string | null) => void;
  selectedCell: string | null;
  columnWidths?: Record<string, number>;
  rowHeights?: Record<string, number>;
}

export const Grid: React.FC<GridProps> = ({ 
  data, 
  onChange, 
  onCellSelect,
  selectedCell,
  columnWidths, 
  rowHeights 
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const COLS = 26;
  const ROWS = 100;

  const getCellValue = useCallback((cellId: string): string | undefined => {
    return data[cellId]?.value;
  }, [data]);

  const updateCell = useCallback((cellId: string, updates: Partial<CellType>) => {
    const newData = { ...data };

    // Update the current cell
    const currentCell = { ...newData[cellId], ...updates };
    newData[cellId] = currentCell;

    // If this is a formula, evaluate it immediately
    if (currentCell.formula) {
      currentCell.value = evaluateFormula(currentCell.formula, getCellValue) || '';
      newData[cellId] = currentCell;
    }

    // Find and update dependent cells
    const dependencies = new Set<string>();
    Object.entries(newData).forEach(([id, cell]) => {
      if (cell.formula) {
        const deps = findCellDependencies(cell.formula);
        if (deps.includes(cellId)) {
          dependencies.add(id);
        }
      }
    });

    dependencies.forEach(cellId => {
      if (newData[cellId]?.formula) {
        const result = evaluateFormula(newData[cellId].formula || '', getCellValue) || '';
        newData[cellId] = {
          ...newData[cellId],
          value: result
        };
      }
    });

    // Ensure cell sizes adjust properly when format changes
    if (updates.format?.fontSize) {
      // Automatically adjust row height based on font size
      const fontSize = parseInt(updates.format.fontSize.toString());
      const { row } = getCellCoordinates(cellId);
      const rowStr = row.toString();
      
      // Calculate new height based on font size
      const newHeight = Math.max(24, Math.ceil(fontSize * 1.5));
      
      // Update the spreadsheet with the new row height
      onChange({
        ...newData,
        _rowHeights: {
          ...(newData._rowHeights || {}),
          [rowStr]: newHeight
        }
      });
    }

    onChange(newData);
  }, [data, getCellValue, onChange]);

  const handleCellNavigation = (cellId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const { col, row } = getCellCoordinates(cellId);
    let newCol = col;
    let newRow = row;

    switch (direction) {
      case 'up':
        newRow = Math.max(1, row - 1);
        break;
      case 'down':
        newRow = Math.min(ROWS, row + 1);
        break;
      case 'left':
        newCol = Math.max(1, col - 1);
        break;
      case 'right':
        newCol = Math.min(COLS, col + 1);
        break;
    }

    const newCellId = getCellId(newCol, newRow);
    onCellSelect(newCellId);
  };

  return (
    <div className="overflow-auto h-full" ref={gridRef}>
      <div className="relative min-w-max">
        {/* Column Headers */}
        <div className="sticky top-0 z-10 flex bg-gray-100">
          <div className="w-10 h-8 border-b border-r border-gray-300"></div>
          {Array.from({ length: COLS }).map((_, i) => (
            <div
              key={i}
              className="h-8 border-b border-r border-gray-300 bg-gray-100 flex items-center justify-center font-semibold"
              style={{ width: columnWidths?.[getCellId(i + 1, 0)] || 100 }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Row Headers + Cells */}
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex">
            <div
              className="sticky left-0 w-10 border-b border-r border-gray-300 bg-gray-100 flex items-center justify-center font-semibold"
              style={{ height: rowHeights?.[row.toString()] || data._rowHeights?.[row.toString()] || 24 }}
            >
              {row + 1}
            </div>
            {Array.from({ length: COLS }).map((_, col) => {
              const cellId = getCellId(col + 1, row + 1);
              return (
                <Cell
                  key={cellId}
                  id={cellId}
                  cell={data[cellId]}
                  selected={selectedCell === cellId}
                  onSelect={() => onCellSelect(cellId)}
                  onChange={(updates) => updateCell(cellId, updates)}
                  onNavigate={(direction) => handleCellNavigation(cellId, direction)}
                  width={columnWidths?.[cellId] || 100}
                  height={rowHeights?.[row.toString()] || data._rowHeights?.[row.toString()] || 24}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};