import type { SWCharacter } from '@/models/character';

/** Download character as .json file */
export function exportCharacterJSON(character: SWCharacter): void {
  const blob = new Blob([JSON.stringify(character, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name || 'character'}-swade.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Read and parse a character from a .json File */
export function importCharacterJSON(file: File): Promise<SWCharacter> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const character = JSON.parse(e.target?.result as string) as SWCharacter;
        if (!character.id || !character.attributes) {
          reject(new Error('Invalid character file: missing required fields'));
          return;
        }
        resolve(character);
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
