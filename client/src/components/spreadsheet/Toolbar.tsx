import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Type
} from 'lucide-react';
import { Select } from '@/components/ui/select';

interface ToolbarProps {
  onFormat: (format: any) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn
}) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white">
      <div className="flex items-center gap-1 border-r pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat({ bold: true })}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat({ italic: true })}
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat({ align: 'left' })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat({ align: 'center' })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFormat({ align: 'right' })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 border-r pr-2">
        <Select
          defaultValue="11"
          onValueChange={(value) => onFormat({ fontSize: parseInt(value) })}
        >
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24].map((size) => (
            <option key={size} value={size.toString()}>
              {size}
            </option>
          ))}
        </Select>
        <Input
          type="color"
          className="w-8 h-8 p-1"
          onChange={(e) => onFormat({ color: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddRow}
        >
          <Plus className="h-4 w-4 mr-1" /> Row
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteRow}
        >
          <Minus className="h-4 w-4 mr-1" /> Row
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddColumn}
        >
          <Plus className="h-4 w-4 mr-1" /> Column
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteColumn}
        >
          <Minus className="h-4 w-4 mr-1" /> Column
        </Button>
      </div>
    </div>
  );
};
