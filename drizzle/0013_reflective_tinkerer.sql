ALTER TABLE "patients" DROP CONSTRAINT "patients_doctorId_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "firstName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "lastName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "birthDate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "userId" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "gender" varchar(10);--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "doctorId";--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "userResponses" DROP COLUMN "userId";