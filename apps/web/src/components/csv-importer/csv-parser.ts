/**
 * CSV Parser e utilities para importação de killfeeds
 */

export interface RawKillData {
  id: string;
  createdAt: string;
  updatedAt: string;
  kill: string;
  victim: string;
  distance: string;
  weapon: string;
  timestamp: string;
  idDiscord: string;
}

export interface ProcessedKillData {
  killer: string;
  victim: string;
  distance: string;
  weapon: string;
  timestamp: string;
  idDiscord: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: Array<{
    rowNumber: number;
    idDiscord: string;
    killer: string;
    victim: string;
    reason: string;
  }>;
  errors: Array<{
    rowNumber: number;
    error: string;
  }>;
}

/**
 * Remove emoticons do texto
 */
export function removeEmoticons(text: string): string {
  return text
    .replace(/😎/g, '') // Remove smile emoticon
    .replace(/😭/g, '') // Remove sad emoticon
    .trim();
}

/**
 * Parse CSV string
 */
export function parseCSV(csvContent: string): RawKillData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV inválido: arquivo vazio ou sem headers');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const expectedHeaders = ['id', 'createdAt', 'updatedAt', 'kill', 'victim', 'distance', 'weapon', 'timestamp', 'idDiscord'];
  
  // Validar headers (pode ter variações)
  const hasRequiredHeaders = expectedHeaders.slice(3).every(h => headers.includes(h));
  if (!hasRequiredHeaders) {
    throw new Error(`CSV inválido: headers esperados ${expectedHeaders.join(', ')}`);
  }

  const data: RawKillData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse simples (funciona para valores sem vírgulas dentro de strings)
    const parts = line.split(',').map(p => p.trim());
    
    if (parts.length < 9) continue;

    const record: RawKillData = {
      id: parts[0],
      createdAt: parts[1],
      updatedAt: parts[2],
      kill: parts[3],
      victim: parts[4],
      distance: parts[5],
      weapon: parts[6],
      timestamp: parts[7],
      idDiscord: parts[8],
    };

    data.push(record);
  }

  return data;
}

/**
 * Processa dados brutos removendo emoticons
 */
export function processKillData(rawData: RawKillData[]): ProcessedKillData[] {
  return rawData.map(row => ({
    killer: removeEmoticons(row.kill),
    victim: removeEmoticons(row.victim),
    distance: row.distance,
    weapon: row.weapon,
    timestamp: row.timestamp,
    idDiscord: row.idDiscord,
  }));
}

/**
 * Detecta duplicatas baseado em idDiscord
 */
export function findDuplicates(
  data: ProcessedKillData[],
  existingIdDiscords: Set<string>
): {
  unique: ProcessedKillData[];
  duplicates: Array<{
    rowNumber: number;
    data: ProcessedKillData;
    type: 'database' | 'batch';
  }>;
} {
  const unique: ProcessedKillData[] = [];
  const duplicates: Array<{
    rowNumber: number;
    data: ProcessedKillData;
    type: 'database' | 'batch';
  }> = [];
  const seenInBatch = new Set<string>();

  data.forEach((item, index) => {
    // ⭐ NORMALIZA para string para comparação
    const idDiscord = String(item.idDiscord).trim();

    // Verifica se já existe no banco (converte para string também)
    if (existingIdDiscords.has(idDiscord)) {
      duplicates.push({
        rowNumber: index + 1, // +1 porque headers ocupam linha 1
        data: item,
        type: 'database',
      });
    }
    // Verifica se é duplicado no próprio batch
    else if (seenInBatch.has(idDiscord)) {
      duplicates.push({
        rowNumber: index + 1,
        data: item,
        type: 'batch',
      });
    } else {
      seenInBatch.add(idDiscord);
      unique.push(item);
    }
  });

  return { unique, duplicates };
}
