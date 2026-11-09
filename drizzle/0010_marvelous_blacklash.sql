ALTER TABLE "patients" ALTER COLUMN "createdAt" SET DEFAULT '2025-04-28T21:33:13.159Z';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "firstName" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "lastName" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "birthDate" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "phone" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "doctorId" integer;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "nom_enfant";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "numero_telephone";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "date_naissance";