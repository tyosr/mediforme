import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { NextResponse } from "next/server";
import moment from "moment";

export async function POST(request) {
  try {
    const { jsonform, email } = await request.json();
    if (!jsonform || !email) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const resp = await db
      .insert(JsonForms)
      .values({
        jsonform: JSON.stringify(jsonform),
        createdBy: email,
        createdAt: moment().format('DD/MM/YYYY'),
      })
      .returning({ id: JsonForms.id });

    if (resp.length > 0 && resp[0].id) {
      return NextResponse.json({ id: resp[0].id });
    } else {
      return NextResponse.json({ error: "Échec de l'insertion" }, { status: 500 });
    }
  } catch (error) {
    console.error("Erreur lors de la création du formulaire:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}