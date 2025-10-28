"use client";

import { useEffect } from 'react';
import { trpc } from '@/utils/trpc';

export default function WarningAboutData() {
  const { data, isLoading, error } = trpc.dashboard.getFirstTimestamp.useQuery();

  // Optional: could log error
  useEffect(() => {
    if (error) console.error('Error fetching first timestamp:', error);
  }, [error]);

  const firstTimestamp = data?.firstTimestamp || null;

  return (
    <div className="mb-4 p-4 rounded-md bg-yellow-900/40 border border-yellow-700 text-yellow-100">
      <h2 className="font-semibold mb-1">Aviso sobre os dados</h2>
      <p className="text-sm">
        Os dados exibidos aqui são extraídos manualmente do killfeed do bot no canal do Discord do servidor.
        Como o processo envolve captura e processamento manual, podem ocorrer erros de extração ou parsing —
        algumas informações podem estar incorretas ou incompletas.
      </p>

      <p className="text-sm mt-2">
        {isLoading && 'Verificando o primeiro timestamp no banco...'}
        {!isLoading && firstTimestamp && (
          <>Os registros importados correspondem às mensagens a partir de <strong>{new Date(firstTimestamp).toLocaleString()}</strong> (primeiro registro na base).</>
        )}
        {!isLoading && !firstTimestamp && (
          <>Não foi possível determinar automaticamente o primeiro timestamp na base de dados.</>
        )}
      </p>

      <p className="text-sm mt-2 text-yellow-200">
        Use estes dados com cautela e confirme amostras manualmente antes de tomar decisões com base nas estatísticas.
      </p>
    </div>
  );
}

