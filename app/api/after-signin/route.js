import { db } from "@/configs";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, email, firstName, lastName, role } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const existing = await db.select().from(Users).where(eq(Users.clerkId, userId));

    if (existing.length === 0) {
      const fullName = `${firstName || ""} ${lastName || ""}`.trim();
      await db.insert(Users).values({
        clerkId: userId,
        email,
        name: fullName || "Utilisateur",
        role,
        createdAt: new Date().toISOString(),
      });
    }

    // Enregistrement de l'historique de connexion (si nécessaire)
    // Vous pouvez également déplacer cette logique ici

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("Erreur dans l'API after-signin:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}