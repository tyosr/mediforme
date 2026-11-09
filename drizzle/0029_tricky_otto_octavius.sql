ALTER TABLE "patients" DROP CONSTRAINT "patients_userId_unique";--> statement-breakpoint
ALTER TABLE "medical_files" DROP CONSTRAINT "medical_files_patient_id_patients_userId_fk";
--> statement-breakpoint
ALTER TABLE "medical_files" DROP COLUMN "patient_id";