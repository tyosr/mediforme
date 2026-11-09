ALTER TABLE "medicalNotes" DROP CONSTRAINT "medicalNotes_patientId_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "medicalNotes" ALTER COLUMN "patientId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "medicalNotes" ALTER COLUMN "patientId" SET NOT NULL;