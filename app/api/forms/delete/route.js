// app/api/forms/delete/route.js
import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { recordId, email } = await request.json();

    if (!recordId || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const result = await db
      .delete(JsonForms)
      .where(and(eq(JsonForms.id, recordId), eq(JsonForms.createdBy, email)));

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Erreur suppression formulaire:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
