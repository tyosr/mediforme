CREATE TABLE "patientNotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"patientEmail" varchar NOT NULL,
	"note" text NOT NULL,
	"createdAt" varchar NOT NULL,
	"createdBy" varchar NOT NULL
);
