import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const payloadSchema = z.object({
  killer: z.string().min(1),
  victim: z.string().min(1),
  distance: z.string().optional().default(''),
  weapon: z.string().optional().default(''),
  timestamp: z.string().min(1),
  idDiscord: z.string().min(1),
  rowNumber: z.number().int().min(1),
});

type Payload = z.infer<typeof payloadSchema>;

type UploadStatus = 'imported' | 'duplicate' | 'error';

interface UploadResponseBody {
  status: UploadStatus;
  message?: string;
}

export async function POST(req: NextRequest) {
  let payload: Payload;

  try {
    const json = await req.json();
    payload = payloadSchema.parse(json);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Payload inválido para upload';

    return NextResponse.json<UploadResponseBody>(
      {
        status: 'error',
        message,
      },
      { status: 400 }
    );
  }

  const idDiscord = payload.idDiscord.trim();

  // Converter timestamp para formato ISO 8601 se necessário
  const normalizedTimestamp = normalizeTimestamp(payload.timestamp);
  
  if (!normalizedTimestamp) {
    return NextResponse.json<UploadResponseBody>(
      {
        status: 'error',
        message: `Timestamp inválido na linha ${payload.rowNumber}: ${payload.timestamp}`,
      },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  
  try {
    // Verificar se o documento já existe pelo idDiscord
    const existsResult = await client.query(
      'SELECT id FROM killfeeds WHERE id_discord = $1 LIMIT 1',
      [idDiscord]
    );

    if (existsResult.rows.length > 0) {
      return NextResponse.json<UploadResponseBody>({
        status: 'duplicate',
        message: `idDiscord ${idDiscord} já existe`,
      });
    }

    // Inserir novo registro
    await client.query(
      `INSERT INTO killfeeds (killer, victim, distance, weapon, timestamp, id_discord, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        payload.killer,
        payload.victim,
        payload.distance,
        payload.weapon,
        normalizedTimestamp,
        idDiscord,
      ]
    );

    return NextResponse.json<UploadResponseBody>({ status: 'imported' });
  } catch (error) {
    // Verificar se é erro de unique constraint (duplicate)
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json<UploadResponseBody>({
        status: 'duplicate',
        message: `idDiscord ${idDiscord} já existe`,
      });
    }

    const message =
      error instanceof Error ? error.message : 'Erro inesperado no upload';

    return NextResponse.json<UploadResponseBody>(
      {
        status: 'error',
        message,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * Normaliza timestamp para formato ISO 8601
 * Aceita múltiplos formatos:
 * - ISO 8601: "2025-10-23T17:10:03.090Z"
 * - JavaScript toString(): "Thu Oct 23 2025 17:10:03 GMT+0000 (Coordinated Universal Time)"
 */
function normalizeTimestamp(timestamp: string): string | null {
  try {
    // Tentar parsear a data
    const date = new Date(timestamp);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Retornar no formato ISO 8601
    return date.toISOString();
  } catch (error) {
    return null;
  }
}
