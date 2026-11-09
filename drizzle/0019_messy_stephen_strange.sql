ALTER TABLE "medicalNotes" ALTER COLUMN "createdAt" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "medicalNotes" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "userResponses" ALTER COLUMN "createdBy" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "userResponses" ALTER COLUMN "createdBy" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "userResponses" ALTER COLUMN "createdBy" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "userResponses" ADD COLUMN "doctorId" varchar(255);--> statement-breakpoint
ALTER TABLE "userResponses" ADD CONSTRAINT "userResponses_doctorId_doctors_userId_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("userId") ON DELETE cascade ON UPDATE no action;