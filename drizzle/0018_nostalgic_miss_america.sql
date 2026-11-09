ALTER TABLE "medicalNotes" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "medicalNotes" ALTER COLUMN "createdAt" SET DEFAULT now();