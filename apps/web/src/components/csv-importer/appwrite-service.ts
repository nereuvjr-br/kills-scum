export interface ImportKillData {
  killer: string;
  victim: string;
  distance: string;
  weapon: string;
  timestamp: string;
  idDiscord: string;
  rowNumber: number;
}

export type UploadStatus = 'imported' | 'duplicate' | 'error';

export interface UploadKillResponse {
  status: UploadStatus;
  message?: string;
}

export async function uploadKillRecord(
  data: ImportKillData
): Promise<UploadKillResponse> {
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Falha ao comunicar com /api/upload');
  }

  return (await response.json()) as UploadKillResponse;
}
