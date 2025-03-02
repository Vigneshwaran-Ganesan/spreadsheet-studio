import React, { useState, useCallback, useRef } from 'react';
import { Cell } from './Cell';
import type { Cell as CellType, Spreadsheet } from '@shared/schema';
import { evaluateFormula } from '@/lib/formulaParser';
import { getCellId, findCellDependencies } from '@/lib/cellUtils';

interface GridProps {
  data: Spreadsheet['data'];
  onChange: (data: Spreadsheet['data']) => void;
  columnWidths?: Record<string, number>;
  rowHeights?: Record<string, number>;
}

export const Grid: React.FC<GridProps> = ({ data, onChange, columnWidths, rowHeights }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
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

    dependencies.forEach(depId => {
      const cell = newData[depId];
      if (cell?.formula) {
        cell.value = evaluateFormula(cell.formula, getCellValue) || '';
      }
    });

    onChange(newData);
  }, [data, onChange, getCellValue]);

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
              style={{ height: rowHeights?.[row.toString()] || 24 }}
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
                  onSelect={() => setSelectedCell(cellId)}
                  onChange={(updates) => updateCell(cellId, updates)}
                  width={columnWidths?.[cellId] || 100}
                  height={rowHeights?.[row.toString()] || 24}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};