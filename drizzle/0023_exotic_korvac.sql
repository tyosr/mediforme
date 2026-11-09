ALTER TABLE "medical_records" DROP CONSTRAINT "medical_records_doctorId_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_users_clerkId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("clerkId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_users_clerkId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("clerkId") ON DELETE cascade ON UPDATE no action;