import { db } from '../packages/api/src/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('🚀 Executando migration de clãs e players...\n');

  try {
    // Criar tabela de clãs
    console.log('📦 Criando tabela de clãs...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "clans" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "tag" varchar(50) NOT NULL,
        "description" text,
        "color" varchar(7) DEFAULT '#3b82f6',
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "clans_name_unique" UNIQUE("name"),
        CONSTRAINT "clans_tag_unique" UNIQUE("tag")
      )
    `);
    console.log('✅ Tabela de clãs criada!\n');

    // Criar tabela de players
    console.log('📦 Criando tabela de players...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "players" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "clan_id" integer,
        "discord_id" varchar(255),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "players_name_unique" UNIQUE("name")
      )
    `);
    console.log('✅ Tabela de players criada!\n');

    // Adicionar foreign key
    console.log('🔗 Adicionando foreign key...');
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'players_clan_id_clans_id_fk'
        ) THEN
          ALTER TABLE "players" 
          ADD CONSTRAINT "players_clan_id_clans_id_fk" 
          FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Foreign key adicionada!\n');

    // Criar índices
    console.log('📑 Criando índices...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_players_clan_id" ON "players"("clan_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_players_name" ON "players"("name")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_clans_tag" ON "clans"("tag")`);
    console.log('✅ Índices criados!\n');

    // Inserir clãs de exemplo
    console.log('🎯 Inserindo clãs de exemplo...');
    await db.execute(sql`
      INSERT INTO "clans" ("name", "tag", "description", "color") VALUES
        ('The Death Brigade', 'TDB', 'Clã TDB - The Death Brigade', '#ef4444'),
        ('Polícia Civil Digital', 'PCD', 'Clã PCD - Polícia Civil Digital', '#3b82f6'),
        ('Alfa Squad', 'Alfa', 'Clã Alfa', '#10b981'),
        ('REI Clan', 'REI', 'Clã REI', '#f59e0b'),
        ('B M X Crew', 'BMX', 'Clã BMX', '#8b5cf6')
      ON CONFLICT (tag) DO NOTHING
    `);
    console.log('✅ Clãs de exemplo inseridos!\n');

    console.log('🎉 Migration concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

runMigration();
