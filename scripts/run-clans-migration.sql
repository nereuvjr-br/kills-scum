-- Script para executar a migration manualmente no PostgreSQL

\c kills_scum;

-- Criar tabela de clãs
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
);

-- Criar tabela de players
CREATE TABLE IF NOT EXISTS "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"clan_id" integer,
	"discord_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "players_name_unique" UNIQUE("name")
);

-- Adicionar foreign key
ALTER TABLE "players" ADD CONSTRAINT "players_clan_id_clans_id_fk" 
	FOREIGN KEY ("clan_id") REFERENCES "clans"("id") ON DELETE set null;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "idx_players_clan_id" ON "players"("clan_id");
CREATE INDEX IF NOT EXISTS "idx_players_name" ON "players"("name");
CREATE INDEX IF NOT EXISTS "idx_clans_tag" ON "clans"("tag");

-- Inserir alguns clãs de exemplo (baseado nos padrões que vimos)
INSERT INTO "clans" ("name", "tag", "description", "color") VALUES
	('The Death Brigade', 'TDB', 'Clã TDB - The Death Brigade', '#ef4444'),
	('Polícia Civil Digital', 'PCD', 'Clã PCD - Polícia Civil Digital', '#3b82f6'),
	('Alfa Squad', 'Alfa', 'Clã Alfa', '#10b981'),
	('REI Clan', 'REI', 'Clã REI', '#f59e0b')
ON CONFLICT (tag) DO NOTHING;

\echo 'Migration concluída! Tabelas criadas com sucesso.'
