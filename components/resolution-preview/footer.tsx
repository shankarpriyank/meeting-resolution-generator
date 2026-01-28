'use client';

import { Button } from '@/components/ui/button';
import { Check, Pencil, Plus, Download } from 'lucide-react';

interface ResolutionPreviewFooterProps {
  onAccept?: () => void;
  onEdit?: () => void;
  onAddAnother?: () => void;
  onDownload?: () => void;
  isEditMode?: boolean;
}

export default function ResolutionPreviewFooter({
  onAccept,
  onEdit,
  onAddAnother,
  onDownload,
  isEditMode = false,
}: ResolutionPreviewFooterProps) {
  return (
    <div className="bg-[#0A0A0A] border-t border-[#2A2A2A] p-6">
      <div className="flex items-center gap-3 w-full">
        <Button
          type="button"
          onClick={onAccept}
          disabled={isEditMode}
          className="flex-1 bg-white text-[#1A1A1A] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm p-6 flex items-center gap-2 cursor-pointer"
        >
          <Check className="h-4 w-4" />
          Accept Draft
        </Button>
        
        <Button
          type="button"
          onClick={onEdit}
          className={`flex-1 rounded-sm p-6 flex items-center gap-2 cursor-pointer ${
            isEditMode 
              ? 'bg-[#22C55E] text-white hover:bg-[#16A34A]' 
              : 'bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]'
          }`}
        >
          <Pencil className="h-4 w-4" />
          {isEditMode ? 'Editing...' : 'Edit Manually'}
        </Button>
        
        <Button
          type="button"
          onClick={onAddAnother}
          disabled={isEditMode}
          className="flex-1 bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm p-6 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Another
        </Button>

        <Button
          type="button"
          onClick={onDownload}
          disabled={isEditMode}
          className="flex-1 bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed rounded-sm p-6 flex items-center gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
