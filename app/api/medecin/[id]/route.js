//dans admin liste de medecin , profil et actions
// /api/medecin/[id]
import { db } from "@/configs";
import { JsonForms, Users, Doctors, UserResponses, MedicalNotes, AnnexedDocuments } from "@/configs/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getAuth } from "@clerk/nextjs/server";

const noCacheHeaders = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
};

// GET /api/medecin/[id]
export async function GET(req, { params }) {
  const id = params.id; // id can be Doctors.id (number) or Users.clerkId (string)

  try {
    let clerkId = id;

    // Check if the id is a Doctors.id (numeric)
    const isNumericId = !isNaN(id);
    if (isNumericId) {
      const doctor = await db
        .select({ userId: Doctors.userId })
        .from(Doctors)
        .where(eq(Doctors.id, Number(id)));

      if (doctor.length) {
        clerkId = doctor[0].userId; // Use the clerkId from Doctors
      } else {
        // If no Doctors record, treat the id as a potential clerkId
        const user = await db
          .select({ clerkId: Users.clerkId })
          .from(Users)
          .where(eq(Users.clerkId, id));
        if (!user.length) {
          return NextResponse.json({ message: "Médecin introuvable" }, { status: 404, headers: noCacheHeaders });
        }
      }
    } else {
      // If id is not numeric, assume it's a clerkId and verify it exists
      const user = await db
        .select({ clerkId: Users.clerkId })
        .from(Users)
        .where(eq(Users.clerkId, id));
      if (!user.length) {
        return NextResponse.json({ message: "Médecin introuvable" }, { status: 404, headers: noCacheHeaders });
      }
    }

    // Fetch the doctor data using the clerkId
    const doctorData = await db
      .select({
        id: Doctors.id,
        userId: Users.clerkId,
        photoUrl: Doctors.photoUrl,
        firstName: Doctors.firstName,
        lastName: Doctors.lastName,
        birthDate: Doctors.birthDate,
        gender: Doctors.gender,
        specialty: Doctors.specialty,
        email: Users.email,
        phone: Doctors.phone,
        address: Doctors.address,
        isActive: Doctors.isActive,
      })
      .from(Users)
      .leftJoin(Doctors, eq(Doctors.userId, Users.clerkId))
      .where(eq(Users.clerkId, clerkId));

    if (!doctorData.length) {
      return NextResponse.json({ message: "Médecin introuvable" }, { status: 404, headers: noCacheHeaders });
    }

    const formattedDoctor = {
      ...doctorData[0],
      id: doctorData[0].id || doctorData[0].userId, // Use Doctors.id if available, otherwise clerkId
      isActive: doctorData[0].isActive ?? true, // Default to true if null
    };

    return NextResponse.json(formattedDoctor, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Error in GET /api/medecin/[id]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500, headers: noCacheHeaders });
  }
}

// PUT /api/medecin/[id]
export async function PUT(req, { params }) {
  const id = params.id; // id can be Doctors.id (number) or Users.clerkId (string)

  try {
    const body = await req.json();

    // Determine the clerkId
    let clerkId = id;
    const isNumericId = !isNaN(id);
    if (isNumericId) {
      const doctor = await db
        .select({ userId: Doctors.userId })
        .from(Doctors)
        .where(eq(Doctors.id, Number(id)));
      if (doctor.length) {
        clerkId = doctor[0].userId;
      }
    }

    // Check if user exists
    const user = await db
      .select({ clerkId: Users.clerkId, email: Users.email })
      .from(Users)
      .where(eq(Users.clerkId, clerkId));

    if (!user.length) {
      return NextResponse.json({ message: "Médecin introuvable" }, { status: 404, headers: noCacheHeaders });
    }

    // Check if Doctors record exists
    const existingDoctor = await db
      .select({ id: Doctors.id, userId: Doctors.userId })
      .from(Doctors)
      .where(eq(Doctors.userId, clerkId));

    let updatedDoctor;

    if (existingDoctor.length) {
      // Update existing Doctors record
      updatedDoctor = await db
        .update(Doctors)
        .set({
          photoUrl: body.photoUrl,
          firstName: body.firstName,
          lastName: body.lastName,
          birthDate: body.birthDate,
          gender: body.gender,
          specialty: body.specialty,
          phone: body.phone,
          address: body.address,
          isActive: body.isActive,
        })
        .where(eq(Doctors.userId, clerkId))
        .returning();
    } else {
      // Create new Doctors record
      updatedDoctor = await db
        .insert(Doctors)
        .values({
          userId: clerkId,
          photoUrl: body.photoUrl,
          firstName: body.firstName,
          lastName: body.lastName,
          birthDate: body.birthDate,
          gender: body.gender,
          specialty: body.specialty,
          phone: body.phone,
          address: body.address,
          isActive: body.isActive ?? true,
        })
        .returning();
    }

    // Fetch updated data with email from Users
    const finalDoctor = await db
      .select({
        id: Doctors.id,
        userId: Users.clerkId,
        photoUrl: Doctors.photoUrl,
        firstName: Doctors.firstName,
        lastName: Doctors.lastName,
        birthDate: Doctors.birthDate,
        gender: Doctors.gender,
        specialty: Doctors.specialty,
        email: Users.email,
        phone: Doctors.phone,
        address: Doctors.address,
        isActive: Doctors.isActive,
      })
      .from(Users)
      .leftJoin(Doctors, eq(Doctors.userId, Users.clerkId))
      .where(eq(Users.clerkId, clerkId));

    const formattedDoctor = {
      ...finalDoctor[0],
      id: finalDoctor[0].id || finalDoctor[0].userId,
      isActive: finalDoctor[0].isActive ?? true,
    };

    return NextResponse.json(formattedDoctor, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Error in PUT /api/medecin/[id]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500, headers: noCacheHeaders });
  }
}

// DELETE /api/medecin/[id]
export async function DELETE(req, { params }) {
  const id = params.id;

  try {
    // Verify admin access
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: noCacheHeaders });
    }
    const adminUser = await db
      .select({ role: Users.role })
      .from(Users)
      .where(eq(Users.clerkId, userId));
    if (adminUser[0]?.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: noCacheHeaders });
    }

    let clerkId = id;
    const isNumericId = !isNaN(id);

    if (isNumericId) {
      const doctor = await db
        .select({ userId: Doctors.userId })
        .from(Doctors)
        .where(eq(Doctors.id, Number(id)));

      if (doctor.length === 0) {
        return NextResponse.json({ message: "Médecin introuvable" }, { status: 404, headers: noCacheHeaders });
      }

      clerkId = doctor[0].userId;
    }

    // Check if user exists
    const user = await db
      .select({ clerkId: Users.clerkId })
      .from(Users)
      .where(eq(Users.clerkId, clerkId));
    if (!user.length) {
      return NextResponse.json({ message: "Médecin introuvable" }, { status: 404, headers: noCacheHeaders });
    }

    // Delete from Clerk
    try {
      await clerkClient.users.deleteUser(clerkId);
      console.log(`Clerk user deleted: ${clerkId}`);
    } catch (clerkError) {
      console.error("Error deleting Clerk user:", clerkError);
      return NextResponse.json(
        { message: "Erreur lors de la suppression du compte Clerk" },
        { status: 500, headers: noCacheHeaders }
      );
    }

    // Delete JsonForms (cascades to UserResponses via formRef ON DELETE CASCADE)
    const formsDeleted = await db
      .delete(JsonForms)
      .where(eq(JsonForms.createdBy, clerkId))
      .returning({ id: JsonForms.id });
    console.log(`Deleted ${formsDeleted.length} JsonForms for clerkId: ${clerkId}`);

    // Delete UserResponses created by the doctor (in case they submitted responses)
    const userResponsesByDoctor = await db
      .select({ id: UserResponses.id })
      .from(UserResponses)
      .where(eq(UserResponses.createdBy, clerkId));
    const responseIdsByDoctor = userResponsesByDoctor.map((r) => r.id);
    console.log(`Found ${responseIdsByDoctor.length} UserResponses with createdBy: ${clerkId}`);

    if (responseIdsByDoctor.length > 0) {
      const medicalNotesDeleted = await db
        .delete(MedicalNotes)
        .where(inArray(MedicalNotes.patientResponseId, responseIdsByDoctor))
        .returning({ id: MedicalNotes.id });
      console.log(`Deleted ${medicalNotesDeleted.length} MedicalNotes for responseIds`);

      const documentsDeleted = await db
        .delete(AnnexedDocuments)
        .where(inArray(AnnexedDocuments.patientResponseId, responseIdsByDoctor))
        .returning({ id: AnnexedDocuments.id });
      console.log(`Deleted ${documentsDeleted.length} AnnexedDocuments for responseIds`);

      const responsesDeleted = await db
        .delete(UserResponses)
        .where(inArray(UserResponses.id, responseIdsByDoctor))
        .returning({ id: UserResponses.id });
      console.log(`Deleted ${responsesDeleted.length} UserResponses`);
    }

    // Delete MedicalNotes and AnnexedDocuments created by the doctor
    const medicalNotesByDoctor = await db
      .delete(MedicalNotes)
      .where(eq(MedicalNotes.doctorId, clerkId))
      .returning({ id: MedicalNotes.id });
    console.log(`Deleted ${medicalNotesByDoctor.length} MedicalNotes for doctorId: ${clerkId}`);

    const documentsByDoctor = await db
      .delete(AnnexedDocuments)
      .where(eq(AnnexedDocuments.doctorId, clerkId))
      .returning({ id: AnnexedDocuments.id });
    console.log(`Deleted ${documentsByDoctor.length} AnnexedDocuments for doctorId: ${clerkId}`);

    // Delete Doctors and Users
    const doctorsDeleted = await db
      .delete(Doctors)
      .where(eq(Doctors.userId, clerkId))
      .returning({ id: Doctors.id });
    console.log(`Deleted ${doctorsDeleted.length} Doctors for clerkId: ${clerkId}`);

    const usersDeleted = await db
      .delete(Users)
      .where(eq(Users.clerkId, clerkId))
      .returning({ id: Users.id });
    console.log(`Deleted ${usersDeleted.length} Users for clerkId: ${clerkId}`);

    return NextResponse.json({ success: true }, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Error in DELETE /api/medecin/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500, headers: noCacheHeaders });
  }
}