import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface ToolbarProps {
  onFormat: (format: any) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
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
        <Select onValueChange={(value) => onFormat({ fontSize: parseInt(value) })}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="color"
          className="w-8 h-8 p-1"
          onChange={(e) => onFormat({ color: e.target.value })}
        />
      </div>
    </div>
  );
};