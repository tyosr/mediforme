CREATE TABLE "login_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"ip_address" varchar(255),
	"login_time" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_users_clerkId_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerkId") ON DELETE cascade ON UPDATE no action;