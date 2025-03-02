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

    // Always adjust height when content changes or formatting changes
    // This ensures row heights are updated appropriately
    if (updates.value !== undefined || updates.formula !== undefined || 
        updates.format?.fontSize !== undefined) {
      
      const { row } = getCellCoordinates(cellId);
      const rowStr = row.toString();
      
      // Calculate new height based on content and formatting
      let newHeight = 24; // Default height
      
      // If there's no content, don't expand the cell
      if (!currentCell.value || currentCell.value === '') {
        newHeight = 24; // Default height for empty cells
      } else {
        // Adjust for font size if present - use Excel-like scaling
        const fontSize = currentCell.format?.fontSize ? parseInt(currentCell.format.fontSize.toString()) : 16;
        
        // Excel uses a base height that's proportional to font size
        // Start with a base height calculation that scales with font size
        // Excel's default row height is about 20px for 11pt font, so scale accordingly
        const baseHeight = Math.max(24, Math.ceil(fontSize * 1.5));
        newHeight = baseHeight;
        
        // If there's content, calculate more precisely
        if (currentCell.value && currentCell.value !== '') {
          // Calculate approximate line breaks based on content length and cell width
          const avgCharWidth = fontSize * 0.6; // Approximate character width
          const cellWidth = columnWidths?.[cellId] || 100;
          const cellContentWidth = cellWidth - 10; // Cell width minus padding
          const charsPerLine = Math.floor(cellContentWidth / avgCharWidth);
          
          // Count both explicit line breaks and word wrapping
          const lines = currentCell.value.split('\n');
          let totalLines = 0;
          
          lines.forEach(line => {
            if (line.trim() === '') {
              totalLines += 1; // Count empty lines as one line
            } else {
              // Add at least one line, plus additional lines for wrapped content
              totalLines += Math.max(1, Math.ceil(line.length / Math.max(1, charsPerLine)));
            }
          });
          
          // Excel-style line height calculation
          const lineHeight = Math.max(Math.round(fontSize * 1.2), 20);
          
          // Calculate total height needed for all lines
          const contentHeight = Math.ceil(lineHeight * totalLines);
          
          // Add a small padding for better visual appearance (like Excel)
          const paddedHeight = contentHeight + 6;
          
          // Use the larger of base height or calculated content height
          newHeight = Math.max(baseHeight, paddedHeight);
        }
        
        console.log(`Cell ${cellId}: fontSize=${fontSize}, lines=${totalLines}, newHeight=${newHeight}`);
      }
      
      // Update the spreadsheet with the new row height
      if (!newData._rowHeights) {
        newData._rowHeights = {};
      }
      
      // Only update if the height has changed and ONLY for the specific row
      if (newData._rowHeights[rowStr] !== newHeight) {
        newData._rowHeights = {
          ...newData._rowHeights,
          [rowStr]: newHeight
        };
        
        // Force a re-render by updating the row height in the state
        if (onChange) {
          console.log(`Updating row ${rowStr} height to ${newHeight}px`);
        }
      }
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
      <div className="relative min-w-max bg-white">
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
              style={{ 
                height: rowHeights?.[row.toString()] || data._rowHeights?.[row.toString()] || 24,
                display: "flex",
                alignItems: "center"
              }}
            >
              {row + 1}
            </div>
            {Array.from({ length: COLS }).map((_, col) => {
              const cellId = getCellId(col + 1, row + 1);
              const rowNum = row + 1;
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
                  height={rowHeights?.[rowNum.toString()] || data._rowHeights?.[rowNum.toString()] || 24}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};