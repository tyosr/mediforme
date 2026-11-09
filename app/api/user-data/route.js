import { db } from "@/configs";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
        }

        const userData = await db
            .select()
            .from(Users)
            .where(eq(Users.clerkId, userId));

        return NextResponse.json({ user: userData[0] || null });
    } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error);
        return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
    }
}