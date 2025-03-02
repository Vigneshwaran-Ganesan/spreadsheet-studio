
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, FolderOpen, FileText, Plus } from 'lucide-react';
import type { Spreadsheet } from '@shared/schema';

interface FileMenuProps {
  onSave: (name: string) => void;
  onLoad: (id: number) => void;
  onNew: () => void;
  currentSpreadsheet: Spreadsheet;
}

export const FileMenu: React.FC<FileMenuProps> = ({ onSave, onLoad, onNew, currentSpreadsheet }) => {
  const [savedSheets, setSavedSheets] = useState<{ id: number; name: string }[]>([]);
  const [newSheetName, setNewSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const loadSpreadsheets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/spreadsheets');
      const data = await response.json();
      setSavedSheets(data);
    } catch (error) {
      console.error('Failed to load spreadsheets', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    if (newSheetName) {
      onSave(newSheetName);
      setNewSheetName('');
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={onNew} title="New Spreadsheet">
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Save Spreadsheet">
            <Save className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Spreadsheet</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Spreadsheet name" 
              value={newSheetName} 
              onChange={(e) => setNewSheetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button onClick={handleSave} disabled={!newSheetName}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="Open Spreadsheet" onClick={loadSpreadsheets}>
            <FolderOpen className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <ScrollArea className="h-72">
            <div className="p-2">
              {isLoading ? (
                <div className="text-center p-4">Loading...</div>
              ) : savedSheets.length === 0 ? (
                <div className="text-center p-4 text-sm text-gray-500">No saved spreadsheets</div>
              ) : (
                savedSheets.map((sheet) => (
                  <Button
                    key={sheet.id}
                    variant="ghost"
                    className="w-full justify-start mb-1"
                    onClick={() => onLoad(sheet.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {sheet.name}
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
