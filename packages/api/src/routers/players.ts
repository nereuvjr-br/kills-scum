import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { db } from '../db';
import { players, clans, killfeeds } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const playersRouter = router({
  // Listar todos os players
  list: publicProcedure
    .input(
      z.object({
        clanId: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = db
        .select({
          player: players,
          clan: clans,
        })
        .from(players)
        .leftJoin(clans, eq(players.clanId, clans.id));
      
      if (input.clanId) {
        query = query.where(eq(players.clanId, input.clanId)) as typeof query;
      }
      
      if (input.search) {
        query = query.where(
          sql`${players.name} ILIKE ${`%${input.search}%`}`
        ) as typeof query;
      }
      
      const result = await query.orderBy(players.name);
      
      return result.map(({ player, clan }) => ({
        ...player,
        clan,
      }));
    }),

  // Criar player manualmente
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        clanId: z.number().optional(),
        discordId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newPlayer] = await db
        .insert(players)
        .values({
          name: input.name,
          clanId: input.clanId,
          discordId: input.discordId,
        })
        .returning();
      
      return newPlayer;
    }),

  // Atualizar player (principalmente para associar a clã)
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        clanId: z.number().nullable().optional(),
        discordId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const [updatedPlayer] = await db
        .update(players)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(players.id, id))
        .returning();
      
      return updatedPlayer;
    }),

  // Deletar player
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(players).where(eq(players.id, input.id));
      return { success: true };
    }),

  // Buscar ou criar player automaticamente
  getOrCreate: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      // Tentar buscar
      let [player] = await db
        .select()
        .from(players)
        .where(eq(players.name, input.name));
      
      // Se não existir, criar
      if (!player) {
        [player] = await db
          .insert(players)
          .values({ name: input.name })
          .returning();
      }
      
      return player;
    }),

  // Associar player a clã
  assignToClan: publicProcedure
    .input(
      z.object({
        playerId: z.number(),
        clanId: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedPlayer] = await db
        .update(players)
        .set({
          clanId: input.clanId,
          updatedAt: new Date(),
        })
        .where(eq(players.id, input.playerId))
        .returning();
      
      return updatedPlayer;
    }),

  // Associar múltiplos players a um clã
  assignMultipleToClan: publicProcedure
    .input(
      z.object({
        playerIds: z.array(z.number()),
        clanId: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(players)
        .set({
          clanId: input.clanId,
          updatedAt: new Date(),
        })
        .where(sql`${players.id} = ANY(${input.playerIds})`);
      
      return { success: true, count: input.playerIds.length };
    }),

  // Buscar players sem clã
  getUnassigned: publicProcedure.query(async () => {
    const unassignedPlayers = await db
      .select()
      .from(players)
      .where(sql`${players.clanId} IS NULL`)
      .orderBy(players.name);
    
    return unassignedPlayers;
  }),

  // Sincronizar players dos killfeeds
  syncFromKillfeeds: publicProcedure.mutation(async () => {
    // Buscar todos os nomes únicos de killers e victims
    const killerNames = await db
      .selectDistinct({ name: killfeeds.killer })
      .from(killfeeds);
    
    const victimNames = await db
      .selectDistinct({ name: killfeeds.victim })
      .from(killfeeds);
    
    // Combinar e remover duplicatas
    const allNames = new Set([
      ...killerNames.map((k) => k.name),
      ...victimNames.map((v) => v.name),
    ]);
    
    // Filtrar NPCs
    const playerNames = Array.from(allNames).filter(
      (name) => !name.startsWith('NPC ')
    );
    
    // Buscar players existentes
    const existingPlayers = await db.select().from(players);
    const existingNames = new Set(existingPlayers.map((p) => p.name));
    
    // Criar apenas os que não existem
    const newPlayerNames = playerNames.filter((name) => !existingNames.has(name));
    
    if (newPlayerNames.length > 0) {
      await db.insert(players).values(
        newPlayerNames.map((name) => ({ name }))
      );
    }
    
    return {
      total: playerNames.length,
      created: newPlayerNames.length,
      existing: existingPlayers.length,
    };
  }),
});
