ALTER TABLE "patients" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "patients" CASCADE;--> statement-breakpoint
ALTER TABLE "userResponses" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "userResponses" ALTER COLUMN "createdAt" SET DEFAULT now();