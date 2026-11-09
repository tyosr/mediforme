CREATE TABLE "annexed_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_response_id" integer NOT NULL,
	"doctor_id" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "medical_files" CASCADE;--> statement-breakpoint
ALTER TABLE "annexed_documents" ADD CONSTRAINT "annexed_documents_patient_response_id_userResponses_id_fk" FOREIGN KEY ("patient_response_id") REFERENCES "public"."userResponses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annexed_documents" ADD CONSTRAINT "annexed_documents_doctor_id_users_clerkId_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("clerkId") ON DELETE cascade ON UPDATE no action;