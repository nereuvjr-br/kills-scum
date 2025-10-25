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
