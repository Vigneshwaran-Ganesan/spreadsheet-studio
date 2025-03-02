import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { Cell as CellType } from '@shared/schema';
import { formatCell, validateCellInput } from '@/lib/cellUtils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CellProps {
  id: string;
  cell?: CellType;
  selected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CellType>) => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  width: number;
  height: number;
}

export const Cell: React.FC<CellProps> = ({
  id,
  cell = {},
  selected,
  onSelect,
  onChange,
  onNavigate,
  width,
  height
}) => {
  const [editing, setEditing] = useState(false);
  const [keyInterval, setKeyInterval] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selected && editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected, editing]);

  useEffect(() => {
    return () => {
      if (keyInterval) {
        clearInterval(keyInterval);
      }
    };
  }, [keyInterval]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (keyInterval) {
      clearInterval(keyInterval);
      setKeyInterval(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditing(false);
      onNavigate?.('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setEditing(false);
      onNavigate?.('right');
    } else if (selected && !editing) {
      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'F2':
        case 'Enter':
          e.preventDefault();
          setEditing(true);
          return;
      }

      if (direction) {
        e.preventDefault();
        onNavigate?.(direction);

        // Set up interval for continuous navigation
        if (!keyInterval) {
          const interval = setInterval(() => {
            onNavigate?.(direction!);
          }, 100); // Adjust timing as needed
          setKeyInterval(interval);
        }
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (keyInterval) {
      clearInterval(keyInterval);
      setKeyInterval(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Skip validation for formulas
    if (value.startsWith('=')) {
      onChange({ value, formula: value });
      return;
    }

    const validation = validateCellInput(value);
    if (!validation.isValid) {
      toast({
        title: "Invalid Input",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    const updates: Partial<CellType> = {
      value,
      type: validation.type,
      formula: undefined
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
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={selected ? 0 : -1}
    >
      {editing ? (
        <Input
          ref={inputRef}
          className="absolute inset-0 w-full h-full border-none focus:ring-0"
          value={cell.formula || cell.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
      ) : (
        <div 
          className={cn(
            "px-2 w-full h-full",
            cell.format?.align === 'center' && "text-center",
            cell.format?.align === 'right' && "text-right",
            cell.format?.align === 'left' && "text-left"
          )}
          style={{
            minHeight: cell.format?.fontSize ? `${Math.ceil(parseInt(cell.format.fontSize.toString()) * 1.5)}px` : undefined,
            height: "auto",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            display: "block",
            padding: "4px 8px",
            boxSizing: "border-box",
            overflow: "visible"
          }}
        >
          {formatCell(cell)}
        </div>
      )}
    </div>
  );
};