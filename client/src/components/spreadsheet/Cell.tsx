import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { Cell as CellType } from '@shared/schema';
import { formatCell } from '@/lib/cellUtils';
import { cn } from '@/lib/utils';

interface CellProps {
  id: string;
  cell?: CellType;
  selected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CellType>) => void;
  width: number;
  height: number;
}

export const Cell: React.FC<CellProps> = ({
  id,
  cell = {},
  selected,
  onSelect,
  onChange,
  width,
  height
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected && editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected, editing]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const updates: Partial<CellType> = {
      value,
      formula: value.startsWith('=') ? value : undefined
    };
    onChange(updates);
  };

  return (
    <div
      className={cn(
        "border-b border-r border-gray-300 relative",
        selected && "ring-2 ring-blue-500 ring-inset z-10",
        cell.format?.bold && "font-bold",
        cell.format?.italic && "italic"
      )}
      style={{
        width,
        height,
        color: cell.format?.color,
        fontSize: cell.format?.fontSize
      }}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <Input
          ref={inputRef}
          className="absolute inset-0 w-full h-full border-none focus:ring-0"
          value={cell.formula || cell.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="px-2 py-1 w-full h-full overflow-hidden text-ellipsis whitespace-nowrap">
          {formatCell(cell)}
        </div>
      )}
    </div>
  );
};
