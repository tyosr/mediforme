CREATE TABLE "medicalNotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctorId" varchar(255) NOT NULL,
	"patientId" varchar(255) NOT NULL,
	"note" text NOT NULL,
	"fileUrl" text,
	"createdAt" varchar NOT NULL
);
