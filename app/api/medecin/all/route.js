//Liste des Médecins fl admin 
import { db } from "@/configs";
import { Doctors, Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const revalidate = 0; // Ignorer le cache côté serveur

export async function GET() {
  try {
    const doctors = await db
      .select({
        id: Users.clerkId, // Always use Users.clerkId as the id
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
      .where(eq(Users.role, "medecin"));

    const formattedDoctors = doctors.map((doc) => ({
      ...doc,
      isActive: doc.isActive ?? true, // Default to true if isActive is null
    }));

    return NextResponse.json(formattedDoctors, {
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error in /api/medecin/all:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}