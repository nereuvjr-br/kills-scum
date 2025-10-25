'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { parseCSV, processKillData, type ProcessedKillData } from './csv-parser';
import { uploadKillRecord } from './appwrite-service';

interface ImportStats {
  totalRows: number;
  duplicatesInDatabase: number;
  duplicatesInBatch: number;
  toImport: number;
  imported: number;
  failed: number;
}

interface DuplicateRecord {
  rowNumber: number;
  idDiscord: string;
  killer: string;
  victim: string;
  type: 'database' | 'batch';
}

interface LogRecord {
  idDiscord: string;
  killer: string;
  victim: string;
  rowNumber: number;
  type: 'novo' | 'existente';
  status: 'pendente' | 'importando' | 'importado' | 'erro';
  error?: string;
}

type RecordWithRow = ProcessedKillData & { rowNumber: number };

export function CSVImporterComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [logRecords, setLogRecords] = useState<LogRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setStats(null);
      setDuplicates([]);
      setErrors([]);

      const content = await file.text();
      const rawData = parseCSV(content);
      const processed = processKillData(rawData);

      const recordsWithRow: RecordWithRow[] = processed.map((record, index) => ({
        ...record,
        rowNumber: index + 2,
        idDiscord: String(record.idDiscord).trim(),
      }));

      const seenIds = new Set<string>();
      const batchDuplicates: DuplicateRecord[] = [];
      const uniqueRecords: RecordWithRow[] = [];
      const initialLogs: LogRecord[] = [];

      recordsWithRow.forEach((record) => {
        const logBase: LogRecord = {
          idDiscord: record.idDiscord,
          killer: record.killer,
          victim: record.victim,
          rowNumber: record.rowNumber,
          type: 'novo',
          status: 'pendente',
        };

        if (seenIds.has(record.idDiscord)) {
          batchDuplicates.push({
            rowNumber: record.rowNumber,
            idDiscord: record.idDiscord,
            killer: record.killer,
            victim: record.victim,
            type: 'batch',
          });

          initialLogs.push({
            ...logBase,
            type: 'existente',
            error: 'Duplicado no arquivo CSV',
          });
        } else {
          seenIds.add(record.idDiscord);
          uniqueRecords.push(record);
          initialLogs.push(logBase);
        }
      });

      setDuplicates(batchDuplicates);
      setLogRecords(initialLogs);

      if (recordsWithRow.length > 0) {
        setShowModal(true);
      }

      let importedCount = 0;
      let failedCount = 0;
      let duplicatesInDatabase = 0;
      const collectedErrors: string[] = [];
  let toastId: string | number | null = null;

      if (uniqueRecords.length > 0) {
        toastId = toast.loading(
          `Importando ${uniqueRecords.length} registros para o Appwrite...`
        );

        for (const record of uniqueRecords) {
          setLogRecords((prev) =>
            prev.map((log) =>
              log.idDiscord === record.idDiscord &&
              log.rowNumber === record.rowNumber &&
              log.type === 'novo'
                ? { ...log, status: 'importando', error: undefined }
                : log
            )
          );

          try {
            const response = await uploadKillRecord({
              killer: record.killer,
              victim: record.victim,
              distance: record.distance,
              weapon: record.weapon,
              timestamp: record.timestamp,
              idDiscord: record.idDiscord,
              rowNumber: record.rowNumber,
            });

            if (response.status === 'imported') {
              importedCount += 1;
              setLogRecords((prev) =>
                prev.map((log) =>
                  log.idDiscord === record.idDiscord &&
                  log.rowNumber === record.rowNumber
                    ? { ...log, status: 'importado' }
                    : log
                )
              );
            } else if (response.status === 'duplicate') {
              duplicatesInDatabase += 1;

              setDuplicates((prev) => {
                const alreadyRegistered = prev.some(
                  (dup) =>
                    dup.idDiscord === record.idDiscord &&
                    dup.rowNumber === record.rowNumber
                );

                if (alreadyRegistered) {
                  return prev;
                }

                return [
                  ...prev,
                  {
                    rowNumber: record.rowNumber,
                    idDiscord: record.idDiscord,
                    killer: record.killer,
                    victim: record.victim,
                    type: 'database' as const,
                  },
                ];
              });

              setLogRecords((prev) =>
                prev.map((log) =>
                  log.idDiscord === record.idDiscord &&
                  log.rowNumber === record.rowNumber
                    ? {
                        ...log,
                        type: 'existente',
                        status: 'pendente',
                        error:
                          response.message ||
                          'Registro já existente no banco',
                      }
                    : log
                )
              );
            } else {
              failedCount += 1;
              const errorMessage =
                response.message || 'Falha ao importar registro';

              collectedErrors.push(
                `Linha ${record.rowNumber}: ${errorMessage}`
              );

              setLogRecords((prev) =>
                prev.map((log) =>
                  log.idDiscord === record.idDiscord &&
                  log.rowNumber === record.rowNumber
                    ? { ...log, status: 'erro', error: errorMessage }
                    : log
                )
              );
            }
          } catch (error) {
            failedCount += 1;
            const errorMessage =
              error instanceof Error ? error.message : 'Erro desconhecido';

            collectedErrors.push(
              `Linha ${record.rowNumber}: ${errorMessage}`
            );

            setLogRecords((prev) =>
              prev.map((log) =>
                log.idDiscord === record.idDiscord &&
                log.rowNumber === record.rowNumber
                  ? { ...log, status: 'erro', error: errorMessage }
                  : log
              )
            );
          }
        }

        if (toastId) {
          toast.dismiss(toastId);
        }

        if (importedCount > 0) {
          toast.success(
            `✓ Importação concluída: ${importedCount} registro(s) adicionados`
          );
        }

        const totalDuplicates =
          duplicatesInDatabase + batchDuplicates.length;

        if (totalDuplicates > 0) {
          toast.info(`ℹ️ ${totalDuplicates} duplicata(s) ignorada(s)`);
        }

        if (failedCount > 0) {
          toast.error(`✗ ${failedCount} registro(s) falharam`);
        }

        if (collectedErrors.length > 0) {
          setErrors(collectedErrors);
        }
      } else {
        toast.info('ℹ️ Todos os registros no arquivo são duplicados');
      }

      setStats({
        totalRows: recordsWithRow.length,
        duplicatesInDatabase,
        duplicatesInBatch: batchDuplicates.length,
        toImport: uniqueRecords.length,
        imported: importedCount,
        failed: failedCount,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro: ${message}`);
      console.error('Erro na importação:', error);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Importar Killfeeds CSV</h2>

        <div className="flex gap-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={importing}
            className="flex-1"
            placeholder="Selecione um arquivo CSV"
          />
          <Button disabled={importing} className="min-w-fit">
            {importing ? 'Processando...' : 'Selecionar'}
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Formato esperado: killer, victim, distance, weapon, timestamp,
          idDiscord
        </p>
      </Card>

      {/* Stats Section */}
      {stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resumo da Importação</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total de Linhas</p>
              <p className="text-2xl font-bold">{stats.totalRows}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Duplicatas (DB)</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.duplicatesInDatabase}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Duplicatas (Batch)</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.duplicatesInBatch}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Será Importado</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.toImport}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Importados ✓</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.imported}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Falhas ✗</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Duplicates Section */}
      {duplicates.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Registros Duplicados ({duplicates.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Linha</th>
                  <th className="text-left py-2 px-2">ID Discord</th>
                  <th className="text-left py-2 px-2">Killer</th>
                  <th className="text-left py-2 px-2">Victim</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((dup, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${
                      dup.type === 'database'
                        ? 'bg-orange-50'
                        : 'bg-yellow-50'
                    }`}
                  >
                    <td className="py-2 px-2">{dup.rowNumber}</td>
                    <td className="py-2 px-2 font-mono text-xs">
                      {dup.idDiscord}
                    </td>
                    <td className="py-2 px-2 truncate">{dup.killer}</td>
                    <td className="py-2 px-2 truncate">{dup.victim}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          dup.type === 'database'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {dup.type === 'database' ? 'Banco' : 'Batch'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Errors Section */}
      {errors.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold mb-4 text-red-800">
            Erros Durante Importação
          </h3>

          <ul className="space-y-2">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Import Progress Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] p-6 overflow-hidden flex flex-col">
            {/* Header com Status */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-xl font-bold">
                  📋 Processando Registros
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {logRecords.filter((r) => r.type === 'novo').length} novos • {logRecords.filter((r) => r.type === 'existente').length} existentes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {logRecords.filter((r) => r.status === 'importado').length}/{logRecords.filter((r) => r.type === 'novo').length}
                  </div>
                  <p className="text-xs text-gray-500">Importados</p>
                </div>
                <div className="flex flex-col items-center">
                  {logRecords.some((r) => r.status === 'importando') ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-xs text-blue-600 font-semibold mt-1">EM PROGRESSO</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-600 font-semibold mt-1">CONCLUÍDO</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Progresso Grande */}
            {logRecords.filter((r) => r.type === 'novo').length > 0 && (
              <div className="mb-4">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                    style={{
                      width: `${
                        (logRecords.filter((r) => r.type === 'novo' && r.status === 'importado').length /
                          logRecords.filter((r) => r.type === 'novo').length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Progresso</span>
                  <span>
                    {Math.round(
                      (logRecords.filter((r) => r.type === 'novo' && r.status === 'importado').length /
                        logRecords.filter((r) => r.type === 'novo').length) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Registro Sendo Processado AGORA */}
            {logRecords.find((r) => r.status === 'importando') && (
              <div className="mb-4 p-3 bg-blue-100 border-2 border-blue-500 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold mb-1">🔄 PROCESSANDO AGORA:</p>
                {logRecords.map((record) =>
                  record.status === 'importando' ? (
                    <p key={record.idDiscord} className="text-sm font-medium">
                      {record.killer} → {record.victim} (ID: {record.idDiscord})
                    </p>
                  ) : null
                )}
              </div>
            )}

            <div className="overflow-y-auto flex-1 space-y-2">
              {logRecords.map((record, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                    record.type === 'existente'
                      ? record.status === 'pendente'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                      : record.status === 'pendente'
                        ? 'bg-blue-50 border-blue-200'
                        : record.status === 'importando'
                          ? 'bg-blue-50 border-blue-200'
                          : record.status === 'importado'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {record.type === 'existente' && (
                      <div className="w-5 h-5 text-gray-400 text-lg">⏭️</div>
                    )}
                    {record.type === 'novo' && record.status === 'pendente' && (
                      <div className="w-5 h-5 text-yellow-500 text-lg">⏳</div>
                    )}
                    {record.type === 'novo' && record.status === 'importando' && (
                      <div className="w-5 h-5 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin"></div>
                    )}
                    {record.type === 'novo' && record.status === 'importado' && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {record.type === 'novo' && record.status === 'erro' && (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs">✕</span>
                      </div>
                    )}
                  </div>

                  {/* Record Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {record.killer} → {record.victim}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ID: {record.idDiscord}
                      </span>
                    </div>
                    {record.error && (
                      <p className="text-xs text-red-600 mt-1">{record.error}</p>
                    )}
                  </div>

                  {/* Status Label */}
                  <div className="flex-shrink-0">
                    {record.type === 'existente' && (
                      <span className="text-xs text-gray-600 font-medium">
                        Já existe
                      </span>
                    )}
                    {record.type === 'novo' && record.status === 'pendente' && (
                      <span className="text-xs text-yellow-600 font-medium">
                        Na fila
                      </span>
                    )}
                    {record.type === 'novo' && record.status === 'importando' && (
                      <span className="text-xs text-blue-600 font-medium">
                        Processando...
                      </span>
                    )}
                    {record.type === 'novo' && record.status === 'importado' && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Importado
                      </span>
                    )}
                    {record.type === 'novo' && record.status === 'erro' && (
                      <span className="text-xs text-red-600 font-medium">
                        ✕ Erro
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Final - Aparece ao terminar */}
            {!logRecords.some(
              (r) =>
                r.type === 'novo' &&
                (r.status === 'importando' || r.status === 'pendente')
            ) && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-2xl font-bold text-green-600">
                      {logRecords.filter((r) => r.type === 'novo' && r.status === 'importado').length}
                    </p>
                    <p className="text-xs text-gray-600">Importados</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-2xl font-bold text-gray-600">
                      {logRecords.filter((r) => r.type === 'novo' && r.status === 'erro').length}
                    </p>
                    <p className="text-xs text-gray-600">Erros</p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <p className="text-2xl font-bold text-yellow-600">
                      {logRecords.filter((r) => r.type === 'existente').length}
                    </p>
                    <p className="text-xs text-gray-600">Existentes</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-2xl font-bold text-blue-600">
                      {logRecords.length}
                    </p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button - Show only after all complete */}
            {!logRecords.some(
              (r) =>
                r.type === 'novo' &&
                (r.status === 'importando' || r.status === 'pendente')
            ) && (
              <Button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full"
              >
                Fechar
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
