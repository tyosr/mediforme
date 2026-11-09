const { pgTable, serial, text, varchar, integer, timestamp, boolean } = require("drizzle-orm/pg-core");

// Table JsonForms: formulaire créé par un médecin
export const JsonForms = pgTable('jsonForms', {
    id: serial('id').primaryKey(),
    jsonform: text('jsonform').notNull(),
    theme: varchar('theme'),
    background: varchar('background'),
    style: varchar('style'),
    createdBy: varchar('createdBy', { length: 255 }).notNull(), // Clerk ID du médecin
    createdAt: varchar('createdAt').notNull(),
    requireSignIn: boolean('requireSignIn').default(false),
});

// Table Users (Clerk)
export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    clerkId: varchar('clerkId', { length: 255 }).notNull().unique(),
    email: varchar('email').notNull(),
    name: varchar('name', { length: 255 }),
    role: varchar('role').notNull(),
    createdAt: varchar('createdAt').notNull(),
    
});

// Table Doctors
export const Doctors = pgTable("doctors", {
    id: serial("id").primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull().unique().references(() => Users.clerkId, { onDelete: 'cascade' }),
    photoUrl: text("photoUrl"),
    firstName: varchar("firstName", { length: 100 }),
    lastName: varchar("lastName", { length: 100 }),
    birthDate: varchar("birthDate", { length: 20 }),
    gender: varchar("gender", { length: 10 }),
    specialty: varchar("specialty", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    isActive: boolean("is_active").default(true),
});



// Table UserResponses
export const UserResponses = pgTable('userResponses', {
    id: serial('id').primaryKey(),
    jsonResponse: text('jsonResponse').notNull(),
    createdBy: varchar('createdBy', { length: 255 }).notNull(), // Clerk ID de la personne qui a rempli
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    formRef: integer('formRef').references(() => JsonForms.id, { onDelete: 'cascade' }),
});

// Table MedicalNotes: notes médicales pour un patient
export const MedicalNotes = pgTable("medical_notes", {
    id: serial("id").primaryKey(),
    patientResponseId: integer("patient_response_id").notNull().references(() => UserResponses.id, { onDelete: 'cascade' }),
    doctorId: varchar("doctor_id", { length: 255 }).notNull().references(() => Users.clerkId, { onDelete: 'cascade' }),
    symptoms: text("symptoms"),
    diagnosis: text("diagnosis"),
    tests: text("tests"),
    medications: text("medications"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table AnnexedDocuments: documents annexes pour un patient
export const AnnexedDocuments = pgTable("annexed_documents", {
    id: serial("id").primaryKey(),
    patientResponseId: integer("patient_response_id").notNull().references(() => UserResponses.id, { onDelete: 'cascade' }),
    doctorId: varchar("doctor_id", { length: 255 }).notNull().references(() => Users.clerkId, { onDelete: 'cascade' }),
    fileUrl: text("file_url").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table LoginLogs
export const LoginLogs = pgTable("login_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(), // Ajout de la contrainte unique
  email: varchar("email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  loginTime: timestamp("login_time").defaultNow().notNull(),
});



