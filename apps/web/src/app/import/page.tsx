'use client';

import { CSVImporterComponent } from '@/components/csv-importer/csv-importer';

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Importador de Killfeeds
          </h1>
          <p className="text-gray-400">
            Importe dados de kills de um arquivo CSV para o banco de dados
          </p>
        </div>

        <CSVImporterComponent />

        <div className="mt-12 bg-gray-800 rounded-lg p-6 text-gray-300 text-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            Instruções:
          </h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              Prepare um arquivo CSV com as colunas: id, createdAt, updatedAt,
              kill, victim, distance, weapon, timestamp, idDiscord
            </li>
            <li>
              Os emoticons (😎 e 😭) serão automaticamente removidos dos nomes
            </li>
            <li>
              Registros com idDiscord duplicado não serão importados (evita
              duplicação)
            </li>
            <li>
              Você será informado sobre quais registros foram pulados por
              duplicação
            </li>
            <li>
              Após o processamento, será exibido um resumo com estatísticas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
