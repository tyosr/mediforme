DROP TABLE "login_logs" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ip_address" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "login_time" timestamp DEFAULT now() NOT NULL;