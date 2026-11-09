CREATE TABLE "medical_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"patientId" integer,
	"doctorId" integer,
	"title" varchar(255),
	"description" text,
	"date" varchar,
	"fileUrl" text
);
--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_patients_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;