CREATE TABLE "killfeeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"killer" varchar(255) NOT NULL,
	"victim" varchar(255) NOT NULL,
	"distance" varchar(50) NOT NULL,
	"weapon" varchar(255) NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"id_discord" varchar(255),
	"clan" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
