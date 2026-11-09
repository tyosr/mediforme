import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { id, email } = await request.json();
    if (!id || !email) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const result = await db
      .delete(JsonForms)
      .where(and(eq(JsonForms.id, id), eq(JsonForms.createdBy, email)));

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Échec de la suppression" }, { status: 500 });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du formulaire:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}