import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { db } from '../db';
import { killfeeds, players, clans } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Helper function to convert distance string to number
const parseDistance = (distance: string | number | null): number => {
  if (distance === null) return 0;
  if (typeof distance === 'number') return distance;
  // Remove 'm' suffix if present and parse
  const cleaned = typeof distance === 'string' ? distance.replace('m', '').trim() : distance;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const clanComparisonRouter = router({
  compare: publicProcedure
    .input(
      z.object({
        clan1Id: z.number(),
        clan2Id: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { clan1Id: clanId1, clan2Id: clanId2, startDate, endDate } = input;

      // Buscar informações dos clãs
      const [clan1Info, clan2Info] = await Promise.all([
        db.select().from(clans).where(eq(clans.id, clanId1)).limit(1),
        db.select().from(clans).where(eq(clans.id, clanId2)).limit(1),
      ]);

      if (!clan1Info[0] || !clan2Info[0]) {
        throw new Error('Clãs não encontrados');
      }

      // Buscar membros de cada clã
      const [clan1Members, clan2Members] = await Promise.all([
        db.select({ name: players.name }).from(players).where(eq(players.clanId, clanId1)),
        db.select({ name: players.name }).from(players).where(eq(players.clanId, clanId2)),
      ]);

      const clan1Names = clan1Members.map((m) => m.name);
      const clan2Names = clan2Members.map((m) => m.name);

      // Buscar TODOS os killfeeds (filtrar NPCs e por data se fornecido)
      const allKills = await db.select().from(killfeeds);
      
      // Filtrar TODOS os NPCs (Guard Level, Drifter Level, etc) e datas
      const filteredKills = allKills.filter(kill => {
        const isNpcKiller = kill.killer.includes('NPC Guard Level') ||
                           kill.killer.includes('NPC Drifter Level') ||
                           kill.killer.startsWith('NPC ');
        const isNpcVictim = kill.victim.includes('NPC Guard Level') ||
                           kill.victim.includes('NPC Drifter Level') ||
                           kill.victim.startsWith('NPC ');
        if (isNpcKiller || isNpcVictim) return false;

        // Filtro de data
        if (startDate) {
          const killDate = new Date(kill.timestamp);
          const start = new Date(startDate);
          if (killDate < start) return false;
        }
        if (endDate) {
          const killDate = new Date(kill.timestamp);
          const end = new Date(endDate);
          if (killDate > end) return false;
        }

        return true;
      });

      // Kills do clã 1
      const clan1Kills = filteredKills.filter((k) => clan1Names.includes(k.killer));
      const clan1Deaths = filteredKills.filter((k) => clan1Names.includes(k.victim));

      // Kills do clã 2
      const clan2Kills = filteredKills.filter((k) => clan2Names.includes(k.killer));
      const clan2Deaths = filteredKills.filter((k) => clan2Names.includes(k.victim));

      // Confrontos diretos: Clã 1 matando Clã 2
      const clan1VsClan2 = filteredKills.filter(
        (k) => clan1Names.includes(k.killer) && clan2Names.includes(k.victim)
      );

      // Confrontos diretos: Clã 2 matando Clã 1
      const clan2VsClan1 = filteredKills.filter(
        (k) => clan2Names.includes(k.killer) && clan1Names.includes(k.victim)
      );

      // Estatísticas de confrontos diretos - Clã 1
      const clan1VsWeaponMap = new Map<string, number>();
      clan1VsClan2.forEach(k => {
        clan1VsWeaponMap.set(k.weapon, (clan1VsWeaponMap.get(k.weapon) || 0) + 1);
      });
      const clan1VsTopWeapons = Array.from(clan1VsWeaponMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weapon, count]) => ({ weapon, count }));

      const clan1VsKillerMap = new Map<string, number>();
      clan1VsClan2.forEach(k => {
        clan1VsKillerMap.set(k.killer, (clan1VsKillerMap.get(k.killer) || 0) + 1);
      });
      const clan1VsTopKillers = Array.from(clan1VsKillerMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, kills]) => ({ name, kills }));

      const clan1VsAvgDistance = clan1VsClan2.length > 0
        ? clan1VsClan2.reduce((sum, k) => sum + parseDistance(k.distance), 0) / clan1VsClan2.length
        : 0;

      // Estatísticas de confrontos diretos - Clã 2
      const clan2VsWeaponMap = new Map<string, number>();
      clan2VsClan1.forEach(k => {
        clan2VsWeaponMap.set(k.weapon, (clan2VsWeaponMap.get(k.weapon) || 0) + 1);
      });
      const clan2VsTopWeapons = Array.from(clan2VsWeaponMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weapon, count]) => ({ weapon, count }));

      const clan2VsKillerMap = new Map<string, number>();
      clan2VsClan1.forEach(k => {
        clan2VsKillerMap.set(k.killer, (clan2VsKillerMap.get(k.killer) || 0) + 1);
      });
      const clan2VsTopKillers = Array.from(clan2VsKillerMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, kills]) => ({ name, kills }));

      const clan2VsAvgDistance = clan2VsClan1.length > 0
        ? clan2VsClan1.reduce((sum, k) => sum + parseDistance(k.distance), 0) / clan2VsClan1.length
        : 0;

      // Armas favoritas do clã 1
      const clan1WeaponMap = new Map<string, number>();
      clan1Kills.forEach((k) => {
        clan1WeaponMap.set(k.weapon, (clan1WeaponMap.get(k.weapon) || 0) + 1);
      });
      const clan1TopWeapons = Array.from(clan1WeaponMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weapon, count]) => ({ weapon, count }));

      // Armas favoritas do clã 2
      const clan2WeaponMap = new Map<string, number>();
      clan2Kills.forEach((k) => {
        clan2WeaponMap.set(k.weapon, (clan2WeaponMap.get(k.weapon) || 0) + 1);
      });
      const clan2TopWeapons = Array.from(clan2WeaponMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weapon, count]) => ({ weapon, count }));

      // Top killers de cada clã
      const clan1KillerMap = new Map<string, number>();
      clan1Kills.forEach((k) => {
        clan1KillerMap.set(k.killer, (clan1KillerMap.get(k.killer) || 0) + 1);
      });
      const clan1TopKillers = Array.from(clan1KillerMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, kills]) => ({ name, kills }));

      const clan2KillerMap = new Map<string, number>();
      clan2Kills.forEach((k) => {
        clan2KillerMap.set(k.killer, (clan2KillerMap.get(k.killer) || 0) + 1);
      });
      const clan2TopKillers = Array.from(clan2KillerMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, kills]) => ({ name, kills }));

      // Distância média de kills
      const clan1AvgDistance = clan1Kills.length > 0
        ? clan1Kills.reduce((sum, k) => sum + parseDistance(k.distance), 0) / clan1Kills.length
        : 0;
      
      const clan2AvgDistance = clan2Kills.length > 0
        ? clan2Kills.reduce((sum, k) => sum + parseDistance(k.distance), 0) / clan2Kills.length
        : 0;

      // Kill mais longo
      const clan1LongestKill = clan1Kills.length > 0
        ? clan1Kills.reduce((max, k) => {
            const kDist = parseDistance(k.distance);
            const maxDist = max ? parseDistance(max.distance) : 0;
            return kDist > maxDist ? k : max;
          })
        : null;
      
      const clan2LongestKill = clan2Kills.length > 0
        ? clan2Kills.reduce((max, k) => {
            const kDist = parseDistance(k.distance);
            const maxDist = max ? parseDistance(max.distance) : 0;
            return kDist > maxDist ? k : max;
          })
        : null;

      // Períodos mais ativos (kills por hora do dia)
      const clan1HourlyActivity = new Array(24).fill(0);
      clan1Kills.forEach(k => {
        const hour = new Date(k.timestamp).getHours();
        clan1HourlyActivity[hour]++;
      });
      const clan1MostActiveHour = clan1HourlyActivity.indexOf(Math.max(...clan1HourlyActivity));

      const clan2HourlyActivity = new Array(24).fill(0);
      clan2Kills.forEach(k => {
        const hour = new Date(k.timestamp).getHours();
        clan2HourlyActivity[hour]++;
      });
      const clan2MostActiveHour = clan2HourlyActivity.indexOf(Math.max(...clan2HourlyActivity));

      // Kills por dia
      const clan1DailyKills = new Map<string, number>();
      clan1Kills.forEach(k => {
        const dateStr = new Date(k.timestamp).toISOString().split('T')[0];
        if (dateStr) {
          clan1DailyKills.set(dateStr, (clan1DailyKills.get(dateStr) || 0) + 1);
        }
      });

      const clan2DailyKills = new Map<string, number>();
      clan2Kills.forEach(k => {
        const dateStr = new Date(k.timestamp).toISOString().split('T')[0];
        if (dateStr) {
          clan2DailyKills.set(dateStr, (clan2DailyKills.get(dateStr) || 0) + 1);
        }
      });

      // Dia com mais kills
      const clan1BestDay = Array.from(clan1DailyKills.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      const clan2BestDay = Array.from(clan2DailyKills.entries())
        .sort((a, b) => b[1] - a[1])[0];

      // Preparar dados para gráficos de atividade diária
      const allDates = new Set([
        ...Array.from(clan1DailyKills.keys()),
        ...Array.from(clan2DailyKills.keys())
      ]);
      const sortedDates = Array.from(allDates).sort();
      const dailyComparison = sortedDates.map(date => ({
        date,
        clan1Kills: clan1DailyKills.get(date) || 0,
        clan2Kills: clan2DailyKills.get(date) || 0,
      }));

      // Dados para gráfico de confrontos diretos por dia
      const clan1VsDailyMap = new Map<string, number>();
      clan1VsClan2.forEach(k => {
        const dateStr = new Date(k.timestamp).toISOString().split('T')[0];
        if (dateStr) {
          clan1VsDailyMap.set(dateStr, (clan1VsDailyMap.get(dateStr) || 0) + 1);
        }
      });

      const clan2VsDailyMap = new Map<string, number>();
      clan2VsClan1.forEach(k => {
        const dateStr = new Date(k.timestamp).toISOString().split('T')[0];
        if (dateStr) {
          clan2VsDailyMap.set(dateStr, (clan2VsDailyMap.get(dateStr) || 0) + 1);
        }
      });

      const headToHeadDates = new Set([
        ...Array.from(clan1VsDailyMap.keys()),
        ...Array.from(clan2VsDailyMap.keys())
      ]);
      const headToHeadDaily = Array.from(headToHeadDates).sort().map(date => ({
        date,
        clan1Kills: clan1VsDailyMap.get(date) || 0,
        clan2Kills: clan2VsDailyMap.get(date) || 0,
      }));

      // Maior sequência de kills consecutivas contra o oponente
      let clan1Streak = 0;
      let clan1MaxStreak = 0;
      let clan2Streak = 0;
      let clan2MaxStreak = 0;

      const allDirectBattles = [...clan1VsClan2, ...clan2VsClan1]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      allDirectBattles.forEach(battle => {
        if (clan1Names.includes(battle.killer)) {
          clan1Streak++;
          clan2Streak = 0;
          clan1MaxStreak = Math.max(clan1MaxStreak, clan1Streak);
        } else {
          clan2Streak++;
          clan1Streak = 0;
          clan2MaxStreak = Math.max(clan2MaxStreak, clan2Streak);
        }
      });

      return {
        clan1: {
          ...clan1Info[0],
          totalKills: clan1Kills.length,
          totalDeaths: clan1Deaths.length,
          kd: clan1Deaths.length > 0 ? clan1Kills.length / clan1Deaths.length : clan1Kills.length,
          memberCount: clan1Names.length,
          topWeapons: clan1TopWeapons,
          topKillers: clan1TopKillers,
          avgDistance: Math.round(clan1AvgDistance),
          longestKill: clan1LongestKill ? {
            distance: parseDistance(clan1LongestKill.distance),
            killer: clan1LongestKill.killer,
            victim: clan1LongestKill.victim,
            weapon: clan1LongestKill.weapon,
          } : null,
          mostActiveHour: clan1MostActiveHour,
          bestDay: clan1BestDay ? { date: clan1BestDay[0], kills: clan1BestDay[1] } : null,
          maxStreak: clan1MaxStreak,
          hourlyActivity: clan1HourlyActivity,
          dailyKills: Array.from(clan1DailyKills.entries()).map(([date, kills]) => ({ date, kills })),
        },
        clan2: {
          ...clan2Info[0],
          totalKills: clan2Kills.length,
          totalDeaths: clan2Deaths.length,
          kd: clan2Deaths.length > 0 ? clan2Kills.length / clan2Deaths.length : clan2Kills.length,
          memberCount: clan2Names.length,
          topWeapons: clan2TopWeapons,
          topKillers: clan2TopKillers,
          avgDistance: Math.round(clan2AvgDistance),
          longestKill: clan2LongestKill ? {
            distance: parseDistance(clan2LongestKill.distance),
            killer: clan2LongestKill.killer,
            victim: clan2LongestKill.victim,
            weapon: clan2LongestKill.weapon,
          } : null,
          mostActiveHour: clan2MostActiveHour,
          bestDay: clan2BestDay ? { date: clan2BestDay[0], kills: clan2BestDay[1] } : null,
          maxStreak: clan2MaxStreak,
          hourlyActivity: clan2HourlyActivity,
          dailyKills: Array.from(clan2DailyKills.entries()).map(([date, kills]) => ({ date, kills })),
        },
        headToHead: {
          clan1Wins: clan1VsClan2.length,
          clan2Wins: clan2VsClan1.length,
          clan1Stats: {
            topWeapons: clan1VsTopWeapons,
            topKillers: clan1VsTopKillers,
            avgDistance: Math.round(clan1VsAvgDistance),
          },
          clan2Stats: {
            topWeapons: clan2VsTopWeapons,
            topKillers: clan2VsTopKillers,
            avgDistance: Math.round(clan2VsAvgDistance),
          },
          dailyComparison,
          headToHeadDaily,
          recentBattles: [...clan1VsClan2, ...clan2VsClan1]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10)
            .map((k) => ({
              killer: k.killer,
              victim: k.victim,
              weapon: k.weapon,
              distance: parseDistance(k.distance),
              timestamp: k.timestamp.toISOString(),
            })),
        },
      };
    }),
});
