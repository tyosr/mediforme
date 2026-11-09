CREATE TABLE "medical_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_response_id" integer,
	"uploaded_by" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text,
	"file_type" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "attachments" CASCADE;--> statement-breakpoint
DROP TABLE "document_categories" CASCADE;--> statement-breakpoint
DROP TABLE "medical_records" CASCADE;--> statement-breakpoint
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_patient_response_id_userResponses_id_fk" FOREIGN KEY ("patient_response_id") REFERENCES "public"."userResponses"("id") ON DELETE no action ON UPDATE no action;