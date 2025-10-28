import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { db } from '../db';
import { killfeeds, players, clans } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { asc } from 'drizzle-orm';

interface KillfeedDocument {
  id: number;
  killer: string;
  victim: string;
  distance: string;
  weapon: string;
  timestamp: Date;
  idDiscord: string | null;
  clan: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function fetchRecentDocuments(): Promise<KillfeedDocument[]> {
  // Buscar TODOS os documentos do PostgreSQL (sem cache)
  const allDocuments = await db
    .select()
    .from(killfeeds)
    .orderBy(desc(killfeeds.timestamp));

  // Filtrar TODOS os NPCs (Guard Level, Drifter Level, etc)
  return allDocuments.filter(doc => {
    const isNpcKiller = doc.killer.includes('NPC Guard Level') || 
                        doc.killer.includes('NPC Drifter Level') ||
                        doc.killer.startsWith('NPC ');
    const isNpcVictim = doc.victim.includes('NPC Guard Level') || 
                        doc.victim.includes('NPC Drifter Level') ||
                        doc.victim.startsWith('NPC ');
    return !isNpcKiller && !isNpcVictim;
  });
}

function buildCharts(documents: KillfeedDocument[]) {
  const killsByDay = new Map<string, number>();
  const killsByHour = Array.from({ length: 24 }, (_, hour) => ({ hour, kills: 0 }));
  const distanceBuckets = new Map<string, number>([
    ['0-25m', 0],
    ['25-50m', 0],
    ['50-100m', 0],
    ['100-200m', 0],
    ['200m+', 0],
  ]);

  // Obter data atual (início do dia de hoje)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calcular início dos últimos 7 dias (6 dias atrás + hoje = 7 dias)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  // Função auxiliar para formatar data como YYYY-MM-DD
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  documents.forEach((doc) => {
    const killDate = new Date(doc.timestamp);

    if (!Number.isNaN(killDate.getTime())) {
      const killDateOnly = new Date(killDate.getFullYear(), killDate.getMonth(), killDate.getDate());

      // Filtrar apenas últimos 7 dias (incluindo hoje)
      if (killDateOnly >= sevenDaysAgo && killDateOnly <= today) {
        const dayKey = formatDateKey(killDateOnly);
        killsByDay.set(dayKey, (killsByDay.get(dayKey) ?? 0) + 1);

        // Kills por hora - apenas dos últimos 7 dias
        const hour = killDate.getHours();
        const hourBucket = killsByHour[hour];
        if (hourBucket) {
          hourBucket.kills += 1;
        }
      }
    }

    const distNum = parseFloat(doc.distance.replace('m', ''));
    if (!Number.isNaN(distNum)) {
      if (distNum < 25) {
        distanceBuckets.set('0-25m', (distanceBuckets.get('0-25m') ?? 0) + 1);
      } else if (distNum < 50) {
        distanceBuckets.set('25-50m', (distanceBuckets.get('25-50m') ?? 0) + 1);
      } else if (distNum < 100) {
        distanceBuckets.set('50-100m', (distanceBuckets.get('50-100m') ?? 0) + 1);
      } else if (distNum < 200) {
        distanceBuckets.set('100-200m', (distanceBuckets.get('100-200m') ?? 0) + 1);
      } else {
        distanceBuckets.set('200m+', (distanceBuckets.get('200m+') ?? 0) + 1);
      }
    }
  });

  // Preencher TODOS os últimos 7 dias com zero kills (se não houver dados)
  const last7DaysMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i)); // De 6 dias atrás até hoje
    const dayKey = formatDateKey(date);
    last7DaysMap.set(dayKey, killsByDay.get(dayKey) ?? 0);
  }

  return {
    killsByDay: Array.from(last7DaysMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, kills]) => ({ date, kills })),
    killsByHour: killsByHour.map(({ hour, kills }) => ({
      hour: `${hour.toString().padStart(2, '0')}h`,
      kills,
      average: Number((kills / 7).toFixed(1)), // Média dos últimos 7 dias
    })),
    distanceBuckets: Array.from(distanceBuckets.entries()).map(([bucket, kills]) => ({
      bucket,
      kills,
    })),
  };
}

// Função auxiliar para buscar clã de um player
async function getPlayerClan(playerName: string): Promise<{ clanTag: string | null; clanColor: string | null }> {
  const result = await db
    .select({
      clanTag: clans.tag,
      clanColor: clans.color,
    })
    .from(players)
    .leftJoin(clans, eq(players.clanId, clans.id))
    .where(eq(players.name, playerName))
    .limit(1);

  return result[0] || { clanTag: null, clanColor: null };
}

export const dashboardRouter = router({
  getStats: publicProcedure.query(async () => {
    const documents = await fetchRecentDocuments();

    const killerStats = new Map<string, number>();
    const victimStats = new Map<string, number>();
    const weaponStats = new Map<string, number>();
    const clanStats = new Map<string, { name: string; tag: string; color: string; kills: number }>();
    const distances: number[] = [];

    documents.forEach((doc: KillfeedDocument) => {
      killerStats.set(doc.killer, (killerStats.get(doc.killer) ?? 0) + 1);
      victimStats.set(doc.victim, (victimStats.get(doc.victim) ?? 0) + 1);
      weaponStats.set(doc.weapon, (weaponStats.get(doc.weapon) ?? 0) + 1);

      const distNum = parseFloat(doc.distance.replace('m', ''));
      if (!Number.isNaN(distNum)) {
        distances.push(distNum);
      }
    });

    const sortDesc = (entries: Array<[string, number]>) => entries.sort((a, b) => b[1] - a[1]);

    // Buscar clãs para os top killers (filtrar Unknown)
    const topKillersData = sortDesc(Array.from(killerStats.entries()))
      .filter(([name]) => name.toLowerCase() !== 'unknown')
      .slice(0, 10);
    const topKillers = await Promise.all(
      topKillersData.map(async ([name, kills]) => {
        const clan = await getPlayerClan(name);
        return { name, kills, clanTag: clan.clanTag, clanColor: clan.clanColor };
      })
    );

    // Buscar clãs para os top victims (filtrar Unknown)
    const topVictimsData = sortDesc(Array.from(victimStats.entries()))
      .filter(([name]) => name.toLowerCase() !== 'unknown')
      .slice(0, 10);
    const topVictims = await Promise.all(
      topVictimsData.map(async ([name, deaths]) => {
        const clan = await getPlayerClan(name);
        return { name, deaths, clanTag: clan.clanTag, clanColor: clan.clanColor };
      })
    );

    const topWeapons = sortDesc(Array.from(weaponStats.entries()))
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const distanceSorted = distances.slice().sort((a, b) => a - b);
    const medianIndex = Math.floor(distanceSorted.length / 2);
    const median =
      distanceSorted.length === 0
        ? 0
        : distanceSorted.length % 2 !== 0
        ? distanceSorted[medianIndex] ?? 0
        : ((distanceSorted[medianIndex - 1] ?? 0) + (distanceSorted[medianIndex] ?? 0)) / 2;

    const distanceStats = {
      avg:
        distanceSorted.length > 0
          ? Number((distanceSorted.reduce((a, b) => a + b, 0) / distanceSorted.length).toFixed(2))
          : 0,
      median: Number(median.toFixed(2)),
      min: distanceSorted.length > 0 ? distanceSorted[0] ?? 0 : 0,
      max: distanceSorted.length > 0 ? distanceSorted[distanceSorted.length - 1] ?? 0 : 0,
    };

    const kdRatios: Array<{ name: string; kills: number; deaths: number; kd: number }> = [];
    Array.from(killerStats.keys()).forEach((name) => {
      // Filtrar jogadores "Unknown"
      if (name.toLowerCase() === 'unknown') return;

      const kills = killerStats.get(name) ?? 0;
      const deaths = victimStats.get(name) ?? 0;
      const kd = deaths > 0 ? kills / deaths : kills;
      kdRatios.push({ name, kills, deaths, kd: Number(kd.toFixed(2)) });
    });

    // Buscar clãs para os top K/D
    const topKDData = kdRatios
      .filter((entry) => entry.kills >= 5)
      .sort((a, b) => b.kd - a.kd)
      .slice(0, 10);
    
    const topKD = await Promise.all(
      topKDData.map(async (entry) => {
        const clan = await getPlayerClan(entry.name);
        return { ...entry, clanTag: clan.clanTag, clanColor: clan.clanColor };
      })
    );

    // Buscar estatísticas de clãs baseadas nos killers
    // Para cada killer, buscar seu clã e acumular kills
    await Promise.all(
      Array.from(killerStats.entries()).map(async ([killerName, kills]) => {
        const result = await db
          .select({
            clanId: clans.id,
            clanName: clans.name,
            clanTag: clans.tag,
            clanColor: clans.color,
          })
          .from(players)
          .innerJoin(clans, eq(players.clanId, clans.id))
          .where(eq(players.name, killerName))
          .limit(1);

        if (result[0]) {
          const clanKey = result[0].clanId.toString();
          const existing = clanStats.get(clanKey);
          if (existing) {
            existing.kills += kills;
          } else {
            clanStats.set(clanKey, {
              name: result[0].clanName,
              tag: result[0].clanTag,
              color: result[0].clanColor || '#3b82f6',
              kills,
            });
          }
        }
      })
    );

    const topClans = Array.from(clanStats.values())
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 5)
      .map((clan) => ({
        name: clan.name,
        tag: clan.tag,
        color: clan.color,
        count: clan.kills,
      }));

    const charts = buildCharts(documents);

    return {
      totalKills: documents.length,
      uniquePlayers: new Set([...killerStats.keys(), ...victimStats.keys()]).size,
      uniqueKillers: killerStats.size,
      uniqueVictims: victimStats.size,
      uniqueWeapons: weaponStats.size,
      distanceStats,
      topKillers,
      topVictims,
      topWeapons,
      topKD,
      topClans,
      charts: {
        killsByDay: charts.killsByDay,
        killsByHour: charts.killsByHour,
        distanceBuckets: charts.distanceBuckets,
        weaponUsage: topWeapons.map(({ name, count }) => ({ weapon: name, kills: count })),
      },
      lastUpdated: new Date().toISOString(),
    };
  }),

  getRecentKills: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const documents = await fetchRecentDocuments();

      const recentDocs = documents
        .slice()
        .sort((a: KillfeedDocument, b: KillfeedDocument) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, input.limit);

      // Buscar clãs para killer e victim
      return await Promise.all(
        recentDocs.map(async (doc: KillfeedDocument) => {
          const killerClan = await getPlayerClan(doc.killer);
          const victimClan = await getPlayerClan(doc.victim);
          return {
            id: doc.id.toString(),
            killer: doc.killer,
            killerClanTag: killerClan.clanTag,
            killerClanColor: killerClan.clanColor,
            victim: doc.victim,
            victimClanTag: victimClan.clanTag,
            victimClanColor: victimClan.clanColor,
            distance: doc.distance,
            weapon: doc.weapon,
            timestamp: doc.timestamp.toISOString(),
          };
        })
      );
    }),

  getPlayerStats: publicProcedure
    .input(
      z.object({
        playerName: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const documents = await fetchRecentDocuments();

      const asKiller = documents.filter((doc: KillfeedDocument) => doc.killer === input.playerName);
      const asVictim = documents.filter((doc: KillfeedDocument) => doc.victim === input.playerName);

      const kills = asKiller.length;
      const deaths = asVictim.length;
      const kd = deaths > 0 ? Number((kills / deaths).toFixed(2)) : kills;

      const weaponMap = new Map<string, number>();
      asKiller.forEach((doc: KillfeedDocument) => {
        weaponMap.set(doc.weapon, (weaponMap.get(doc.weapon) ?? 0) + 1);
      });

      const favoriteWeapons = Array.from(weaponMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weapon, count]) => ({ weapon, count }));

      const victimMap = new Map<string, number>();
      asKiller.forEach((doc: KillfeedDocument) => {
        victimMap.set(doc.victim, (victimMap.get(doc.victim) ?? 0) + 1);
      });

      const topVictims = Array.from(victimMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([victim, count]) => ({ victim, count }));

      const killedByMap = new Map<string, number>();
      asVictim.forEach((doc: KillfeedDocument) => {
        killedByMap.set(doc.killer, (killedByMap.get(doc.killer) ?? 0) + 1);
      });

      const killedBy = Array.from(killedByMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([killer, count]) => ({ killer, count }));

      return {
        playerName: input.playerName,
        kills,
        deaths,
        kd,
        favoriteWeapons,
        topVictims,
        killedBy,
      };
    }),

  refreshCache: publicProcedure.mutation(async () => {
    // Sem cache, apenas retorna sucesso
    return { refreshedAt: new Date().toISOString() };
  }),

  getFirstTimestamp: publicProcedure.query(async () => {
    // Busca o registro com o menor timestamp (primeiro por data)
    const result = await db
      .select({ timestamp: killfeeds.timestamp })
      .from(killfeeds)
      .orderBy(asc(killfeeds.timestamp))
      .limit(1);

    if (!result || result.length === 0) return { firstTimestamp: null };

    const first = result[0];
    if (!first || !first.timestamp) return { firstTimestamp: null };

    return { firstTimestamp: new Date(first.timestamp).toISOString() };
  }),
});
