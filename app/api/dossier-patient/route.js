import { db } from "@/configs";
import { UserResponses } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: Retrieve patient dossier
export async function GET(req) {
  if (!db) {
    return NextResponse.json(
      { error: "Base de données non disponible pendant le build" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: "ID du patient invalide ou manquant" },
      { status: 400 }
    );
  }

  try {
    const results = await db
      .select()
      .from(UserResponses)
      .where(eq(UserResponses.id, parseInt(id)));

    if (results.length === 0) {
      return NextResponse.json([]);
    }

    const patientData = results.map((entry) => {
      let jsonData = {};
      try {
        jsonData = JSON.parse(entry.jsonResponse);
      } catch (err) {
        console.error("Erreur parsing JSON:", err);
      }

      const processedJson = {};
      for (const [key, value] of Object.entries(jsonData)) {
        const isLikelyFile =
          typeof value === "string" &&
          entry.fileUrl &&
          (value.includes(entry.fileUrl.split("/").pop()) || key.toLowerCase().includes("file"));

        processedJson[key] = isLikelyFile ? entry.fileUrl : value;
      }

      return {
        id: entry.id,
        createdAt: entry.createdAt,
        json: processedJson,
        fileUrl: entry.fileUrl,
      };
    });

    return NextResponse.json(patientData);
  } catch (error) {
    console.error("Erreur lors de la récupération du dossier patient:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
}

// PUT: Update patient dossier
export async function PUT(req) {
  if (!db) {
    return NextResponse.json(
      { error: "Base de données non disponible pendant le build" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: "ID du patient invalide ou manquant" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { jsonResponse } = body;

    if (!jsonResponse) {
      return NextResponse.json(
        { error: "Données JSON manquantes" },
        { status: 400 }
      );
    }

    // Update the patient record in the database
    const updated = await db
      .update(UserResponses)
      .set({ jsonResponse: JSON.stringify(jsonResponse) })
      .where(eq(UserResponses.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Aucun dossier trouvé pour cet ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Dossier mis à jour avec succès",
      data: updated[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier patient:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour" },
      { status: 500 }
    );
  }
}