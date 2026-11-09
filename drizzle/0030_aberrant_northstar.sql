CREATE TABLE "medical_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_response_id" integer NOT NULL,
	"doctor_id" varchar(255) NOT NULL,
	"symptoms" text,
	"diagnosis" text,
	"tests" text,
	"medications" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medical_files" DROP CONSTRAINT "medical_files_patient_response_id_userResponses_id_fk";
--> statement-breakpoint
ALTER TABLE "medical_notes" ADD CONSTRAINT "medical_notes_patient_response_id_userResponses_id_fk" FOREIGN KEY ("patient_response_id") REFERENCES "public"."userResponses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_notes" ADD CONSTRAINT "medical_notes_doctor_id_users_clerkId_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."users"("clerkId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_patient_response_id_userResponses_id_fk" FOREIGN KEY ("patient_response_id") REFERENCES "public"."userResponses"("id") ON DELETE cascade ON UPDATE no action;