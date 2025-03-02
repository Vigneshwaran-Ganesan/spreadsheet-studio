import React from 'react';
import { Input } from '@/components/ui/input';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  selectedCell: string | null;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  value,
  onChange,
  selectedCell
}) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-white">
      <div className="w-10 text-sm font-medium text-gray-500">fx</div>
      <div className="w-20 px-2 py-1 bg-gray-100 rounded text-sm">
        {selectedCell || ''}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
        placeholder="Enter a formula"
      />
    </div>
  );
};
