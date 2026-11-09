ALTER TABLE "medicalNotes" ALTER COLUMN "patientId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "medicalNotes" ALTER COLUMN "patientId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "medicalNotes" ADD CONSTRAINT "medicalNotes_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;