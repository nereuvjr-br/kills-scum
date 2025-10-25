import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { db } from '../db';
import { clans, players } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const clansRouter = router({
  // Listar todos os clãs
  list: publicProcedure.query(async () => {
    const allClans = await db.select().from(clans).orderBy(clans.name);
    
    // Para cada clã, contar quantos players tem
    const clansWithCount = await Promise.all(
      allClans.map(async (clan) => {
        const [result] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(players)
          .where(eq(players.clanId, clan.id));
        
        return {
          ...clan,
          memberCount: result?.count ?? 0,
        };
      })
    );
    
    return clansWithCount;
  }),

  // Criar novo clã
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        tag: z.string().min(1).max(50),
        description: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newClan] = await db
        .insert(clans)
        .values({
          name: input.name,
          tag: input.tag,
          description: input.description,
          color: input.color || '#3b82f6',
        })
        .returning();
      
      return newClan;
    }),

  // Atualizar clã
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        tag: z.string().min(1).max(50).optional(),
        description: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const [updatedClan] = await db
        .update(clans)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(clans.id, id))
        .returning();
      
      return updatedClan;
    }),

  // Deletar clã
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Primeiro, remover a associação de players com este clã
      await db
        .update(players)
        .set({ clanId: null })
        .where(eq(players.clanId, input.id));
      
      // Depois deletar o clã
      await db.delete(clans).where(eq(clans.id, input.id));
      
      return { success: true };
    }),

  // Buscar clã por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [clan] = await db
        .select()
        .from(clans)
        .where(eq(clans.id, input.id));
      
      if (!clan) {
        throw new Error('Clã não encontrado');
      }
      
      // Buscar membros do clã
      const members = await db
        .select()
        .from(players)
        .where(eq(players.clanId, input.id));
      
      return {
        ...clan,
        members,
      };
    }),

  // Estatísticas do clã
  getStats: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [clan] = await db
        .select()
        .from(clans)
        .where(eq(clans.id, input.id));
      
      if (!clan) {
        throw new Error('Clã não encontrado');
      }
      
      // Buscar membros
      const members = await db
        .select()
        .from(players)
        .where(eq(players.clanId, input.id));
      
      // TODO: Calcular estatísticas baseadas nos killfeeds
      // Por enquanto retorna estrutura básica
      
      return {
        clan,
        memberCount: members.length,
        members,
        // Adicionar estatísticas quando integrar com killfeeds
      };
    }),
});
