/**
 * Script para verificar duplicatas de idDiscord no arquivo CSV
 * 
 * Uso: npx ts-node scripts/verify-duplicates.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DuplicateInfo {
  idDiscord: string;
  count: number;
  lines: number[];
}

async function verifyDuplicates() {
  try {
    console.log('\n📋 === VERIFICANDO DUPLICATAS DE idDiscord ===\n');

    // Caminho do arquivo
    const filePath = path.join(__dirname, '../apps/web/dados/File (6).csv');

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      return;
    }

    // Ler arquivo
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    console.log(`📖 Total de linhas: ${lines.length}`);
    console.log(`📊 Total de registros: ${lines.length - 1} (descontando header)\n`);

    // Parse headers
    const headerLine = lines[0];
    if (!headerLine) {
      console.error('❌ Arquivo vazio ou sem header!');
      return;
    }

    const headers = headerLine.split(',').map(h => h.trim());
    const idDiscordIndex = headers.indexOf('idDiscord');

    if (idDiscordIndex === -1) {
      console.error('❌ Coluna "idDiscord" não encontrada!');
      return;
    }

    // Mapa de idDiscords encontrados
    const idMap = new Map<string, number[]>();
    let validRecords = 0;

    // Verificar cada linha
    for (let i = 1; i < lines.length; i++) {
      const lineData = lines[i];
      if (!lineData) continue;

      const line = lineData.trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      if (parts.length <= idDiscordIndex) continue;

      const idDiscord = parts[idDiscordIndex];

      if (!idDiscord) {
        console.warn(`⚠️  Linha ${i + 1}: idDiscord vazio`);
        continue;
      }

      validRecords++;

      if (idMap.has(idDiscord)) {
        idMap.get(idDiscord)!.push(i + 1);
      } else {
        idMap.set(idDiscord, [i + 1]);
      }
    }

    console.log(`✅ Registros válidos: ${validRecords}\n`);

    // Encontrar duplicatas
    const duplicates: DuplicateInfo[] = [];
    idMap.forEach((lines, idDiscord) => {
      if (lines.length > 1) {
        duplicates.push({
          idDiscord,
          count: lines.length,
          lines,
        });
      }
    });

    // Resultado
    if (duplicates.length === 0) {
      console.log('✅ NENHUMA DUPLICATA ENCONTRADA!');
      console.log(`✓ Todos os ${validRecords} idDiscords são únicos`);
    } else {
      console.log(`❌ DUPLICATAS ENCONTRADAS: ${duplicates.length}`);
      console.log(`❌ Total de idDiscords duplicados: ${duplicates.length}\n`);

      // Ordena por quantidade de duplicatas (maior primeiro)
      duplicates.sort((a, b) => b.count - a.count);

      duplicates.forEach((dup, idx) => {
        console.log(`\n${idx + 1}. idDiscord: ${dup.idDiscord}`);
        console.log(`   Encontrado ${dup.count} vezes`);
        console.log(`   Linhas: ${dup.lines.join(', ')}`);

        // Mostra os dados de cada linha duplicada
        dup.lines.forEach((lineNum) => {
          const lineData = lines[lineNum - 1];
          if (!lineData) return;

          const parts = lineData.split(',').map(p => p.trim());
          const killer = parts[3] || 'N/A';
          const victim = parts[4] || 'N/A';
          console.log(`     └─ Linha ${lineNum}: ${killer} → ${victim}`);
        });
      });

      console.log(`\n📊 RESUMO:`);
      console.log(`  • Total de registros: ${validRecords}`);
      console.log(`  • Únicos: ${validRecords - duplicates.reduce((sum, d) => sum + (d.count - 1), 0)}`);
      console.log(`  • Duplicados (total): ${duplicates.reduce((sum, d) => sum + (d.count - 1), 0)}`);
      console.log(`  • Linhas duplicadas: ${duplicates.reduce((sum, d) => sum + d.count, 0)}`);
    }

    console.log('\n✨ === VERIFICAÇÃO CONCLUÍDA ===\n');

    // Retorna dados para análise posterior se necessário
    return {
      totalRecords: validRecords,
      totalUnique: validRecords - duplicates.reduce((sum, d) => sum + (d.count - 1), 0),
      duplicatesCount: duplicates.length,
      duplicates,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar duplicatas:', error);
    throw error;
  }
}

// Executar
verifyDuplicates().catch(console.error);
