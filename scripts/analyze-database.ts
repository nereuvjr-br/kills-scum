/**
 * Script para analisar os dados do banco de dados e gerar estatísticas
 * Uso: npx tsx scripts/analyze-database.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../apps/web/.env') });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_APPWRITE_TOKEN;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_KILLS;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KILLFEEDS;

interface KillfeedDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  killer: string;
  victim: string;
  distance: string;
  weapon: string;
  timestamp: string;
  idDiscord: number;
  Clan?: string;
}

async function analyzeDatabase() {
  if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID || !COLLECTION_ID) {
    console.error('❌ Variáveis de ambiente não configuradas');
    return;
  }

  console.log('\n📊 === ANÁLISE DO BANCO DE DADOS ===\n');

  let allDocuments: KillfeedDocument[] = [];
  let offset = 0;
  const limit = 100;

  // Buscar todos os documentos
  while (true) {
    const response = await fetch(
      `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'X-Appwrite-Project': PROJECT_ID,
          'X-Appwrite-Key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Erro ao buscar dados:', response.status);
      return;
    }

    const data = (await response.json()) as any;
    const documents = data.documents || [];

    if (documents.length === 0) break;

    allDocuments = allDocuments.concat(documents);
    offset += limit;

    process.stdout.write(`\r📥 Buscando dados... ${allDocuments.length} registros`);
  }

  console.log(`\n\n✅ Total de registros: ${allDocuments.length}\n`);

  // Análises
  const killerStats = new Map<string, number>();
  const victimStats = new Map<string, number>();
  const weaponStats = new Map<string, number>();
  const clanStats = new Map<string, number>();
  const distances: number[] = [];

  allDocuments.forEach((doc) => {
    // Killers
    killerStats.set(doc.killer, (killerStats.get(doc.killer) || 0) + 1);

    // Victims
    victimStats.set(doc.victim, (victimStats.get(doc.victim) || 0) + 1);

    // Weapons
    weaponStats.set(doc.weapon, (weaponStats.get(doc.weapon) || 0) + 1);

    // Clans
    if (doc.Clan) {
      clanStats.set(doc.Clan, (clanStats.get(doc.Clan) || 0) + 1);
    }

    // Distances
    const distNum = parseFloat(doc.distance.replace('m', ''));
    if (!isNaN(distNum)) {
      distances.push(distNum);
    }
  });

  // Top 10 Killers
  console.log('🎯 === TOP 10 KILLERS ===\n');
  const topKillers = Array.from(killerStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topKillers.forEach(([name, count], i) => {
    console.log(`${i + 1}. ${name}: ${count} kills`);
  });

  // Top 10 Victims
  console.log('\n💀 === TOP 10 VICTIMS (Mais Mortes) ===\n');
  const topVictims = Array.from(victimStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topVictims.forEach(([name, count], i) => {
    console.log(`${i + 1}. ${name}: ${count} mortes`);
  });

  // Top 10 Weapons
  console.log('\n🔫 === TOP 10 ARMAS MAIS USADAS ===\n');
  const topWeapons = Array.from(weaponStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topWeapons.forEach(([weapon, count], i) => {
    console.log(`${i + 1}. ${weapon}: ${count} kills`);
  });

  // Distance Stats
  if (distances.length > 0) {
    distances.sort((a, b) => a - b);
    const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
    const max = Math.max(...distances);
    const min = Math.min(...distances);
    const median = distances[Math.floor(distances.length / 2)];

    console.log('\n📏 === ESTATÍSTICAS DE DISTÂNCIA ===\n');
    console.log(`Média: ${avg.toFixed(2)}m`);
    console.log(`Mediana: ${median}m`);
    console.log(`Mínima: ${min}m`);
    console.log(`Máxima: ${max}m`);
  }

  // Clan Stats
  if (clanStats.size > 0) {
    console.log('\n👥 === TOP 5 CLANS ===\n');
    const topClans = Array.from(clanStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topClans.forEach(([clan, count], i) => {
      console.log(`${i + 1}. ${clan}: ${count} kills`);
    });
  }

  // Players únicos
  const uniqueKillers = killerStats.size;
  const uniqueVictims = victimStats.size;
  const uniquePlayers = new Set([...killerStats.keys(), ...victimStats.keys()]).size;

  console.log('\n👤 === JOGADORES ÚNICOS ===\n');
  console.log(`Total de jogadores únicos: ${uniquePlayers}`);
  console.log(`Jogadores que mataram: ${uniqueKillers}`);
  console.log(`Jogadores que morreram: ${uniqueVictims}`);

  // KD Ratio dos top 10
  console.log('\n📊 === K/D RATIO (Top 10) ===\n');
  const kdRatios: Array<{ name: string; kills: number; deaths: number; kd: number }> = [];

  Array.from(killerStats.keys()).forEach((name) => {
    const kills = killerStats.get(name) || 0;
    const deaths = victimStats.get(name) || 0;
    const kd = deaths > 0 ? kills / deaths : kills;
    kdRatios.push({ name, kills, deaths, kd });
  });

  kdRatios.sort((a, b) => b.kd - a.kd);
  kdRatios.slice(0, 10).forEach(({ name, kills, deaths, kd }, i) => {
    console.log(`${i + 1}. ${name}: ${kd.toFixed(2)} (${kills}K / ${deaths}D)`);
  });

  console.log('\n✨ === ANÁLISE CONCLUÍDA ===\n');
}

analyzeDatabase();
