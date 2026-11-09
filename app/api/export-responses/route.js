import { db } from "@/configs";
import { UserResponses } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { formId } = await request.json();
    if (!formId) {
      return NextResponse.json({ error: "ID du formulaire requis" }, { status: 400 });
    }

    const responses = await db
      .select()
      .from(UserResponses)
      .where(eq(UserResponses.formRef, formId));

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Erreur lors de l'exportation des réponses:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}