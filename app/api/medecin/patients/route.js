import { db } from "@/configs";
import { UserResponses } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const medecinId = searchParams.get("medecinId");
    
    if (!medecinId) {
      return NextResponse.json({ error: "ID du médecin manquant" }, { status: 400 });
    }

    const responses = await db
      .select()
      .from(UserResponses)
      .where(eq(UserResponses.createdBy, medecinId));

    if (!responses || responses.length === 0) {
      console.log("Aucune réponse trouvée pour ce médecin");
      return NextResponse.json([]);
    }

    const patients = responses.map((resp) => {
      try {
        const json = JSON.parse(resp.jsonResponse);
        return {
          id: resp.id,
          nom_patient: json.nom_patient || json.name || "Patient sans nom",
          sexe: json.sexe || json.gender || null,
          telephone: json.telephone || json.phone || null,
          email: json.email || null,
          createdAt: resp.createdAt,
        };
      } catch (err) {
        console.error("Erreur lors du parsing JSON:", err);
        return {
          id: resp.id,
          nom_patient: "Format de données invalide",
          createdAt: resp.createdAt,
        };
      }
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération" }, { status: 500 });
  }
}