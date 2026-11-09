CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"photoUrl" text,
	"firstName" varchar(100),
	"lastName" varchar(100),
	"birthDate" varchar(20),
	"gender" varchar(10),
	"specialty" varchar(100),
	"email" varchar(255),
	"phone" varchar(20),
	"address" text
);
