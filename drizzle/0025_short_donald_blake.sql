CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"medicalRecordId" integer,
	"fileName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" varchar(100),
	"uploadedBy" varchar(255) NOT NULL,
	"uploadedAt" varchar NOT NULL,
	"description" text,
	"isPrivate" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "document_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(20),
	"icon" varchar(50),
	"isDefault" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "recordType" varchar(100);--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "status" varchar(50) DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "updatedAt" varchar;--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "updatedBy" varchar(255);--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_medicalRecordId_medical_records_id_fk" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;