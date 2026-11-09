CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom_enfant" varchar(255) NOT NULL,
	"numero_telephone" varchar(20) NOT NULL,
	"date_naissance" varchar(30),
	"createdAt" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_unique";--> statement-breakpoint
ALTER TABLE "userResponses" DROP CONSTRAINT "userResponses_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "userResponses" DROP COLUMN "userId";