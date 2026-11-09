import { db } from "@/configs";
import { JsonForms, UserResponses } from "@/configs/schema";
import { count, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const forms = await db
      .select({
        ...JsonForms,
        userResponseCount: count(UserResponses.id),
      })
      .from(JsonForms)
      .leftJoin(UserResponses, eq(JsonForms.id, UserResponses.formRef))
      .where(eq(JsonForms.createdBy, email))
      .groupBy(JsonForms.id)
      .orderBy(desc(JsonForms.id));

    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Erreur lors de la récupération des formulaires:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}