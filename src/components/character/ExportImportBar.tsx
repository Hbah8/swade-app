import { useRef } from 'react';
import { useCharacterStore } from '@/store/characterStore';
import { exportCharacterPDF } from '@/services/pdfExporter';
import { exportCharacterJSON, importCharacterJSON } from '@/services/jsonExporter';
import { Upload, FileJson, FileText, RotateCcw } from 'lucide-react';

export function ExportImportBar() {
  const { character, importCharacter, reset } = useCharacterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importCharacterJSON(file);
      importCharacter(imported);
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Export JSON */}
      <button
        onClick={() => exportCharacterJSON(character)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-swade-surface-light hover:bg-swade-surface-light/80 text-swade-text text-sm rounded-lg transition-colors"
      >
        <FileJson size={14} />
        Export JSON
      </button>

      {/* Export PDF */}
      <button
        onClick={() => exportCharacterPDF(character)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-swade-surface-light hover:bg-swade-surface-light/80 text-swade-text text-sm rounded-lg transition-colors"
      >
        <FileText size={14} />
        Export PDF
      </button>

      {/* Import JSON */}
      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-swade-surface-light hover:bg-swade-surface-light/80 text-swade-text text-sm rounded-lg transition-colors cursor-pointer">
        <Upload size={14} />
        Import JSON
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />
      </label>

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Reset character? All progress will be lost.')) reset();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-swade-accent/20 hover:bg-swade-accent/30 text-swade-accent text-sm rounded-lg transition-colors ml-auto"
      >
        <RotateCcw size={14} />
        Reset
      </button>
    </div>
  );
}
