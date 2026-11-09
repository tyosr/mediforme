ALTER TABLE "userResponses" DROP CONSTRAINT "userResponses_doctorId_doctors_userId_fk";
--> statement-breakpoint
ALTER TABLE "jsonForms" ALTER COLUMN "createdBy" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "clerkId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "userResponses" DROP COLUMN "doctorId";