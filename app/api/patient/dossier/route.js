import { db } from "@/configs";
import { UserResponses, MedicalNotes, AnnexedDocuments, Users } from "@/configs/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email manquant" }, { status: 400 });
  }

  try {
    // Vérifier que l'email correspond à l'utilisateur connecté
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    console.log("User email:", user[0]?.email, "Requested email:", email);

    if (!user.length || user[0].email !== email) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Récupérer les UserResponses où l'email correspond
    const responses = await db
      .select()
      .from(UserResponses)
      .where(eq(UserResponses.jsonResponse, email, { jsonPath: "$.email" }));

    console.log("UserResponses found:", responses.length);

    if (!responses.length) {
      // Essayer avec d'autres noms de champ possibles
      const alternativeFields = ["patient_email", "email_patient"];
      let altResponses = [];
      for (const field of alternativeFields) {
        altResponses = await db
          .select()
          .from(UserResponses)
          .where(eq(UserResponses.jsonResponse, email, { jsonPath: `$.${field}` }));
        if (altResponses.length) break;
      }
      if (altResponses.length) {
        console.log("Found responses with alternative field:", altResponses.length);
        responses.push(...altResponses);
      }
    }

    if (!responses.length) {
      console.log("Aucun UserResponses trouvé pour cet email");
      return NextResponse.json({ dossiers: [], notes: [], documents: [] });
    }

    const patientResponseIds = responses.map((resp) => resp.id);
    console.log("patientResponseIds:", patientResponseIds);

    // Traiter les dossiers
    const dossiers = responses.map((entry) => {
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

    // Récupérer les notes médicales
    let notes = [];
    if (patientResponseIds.length > 0) {
      notes = await db
        .select()
        .from(MedicalNotes)
        .where(inArray(MedicalNotes.patientResponseId, patientResponseIds));
    }
    console.log("MedicalNotes found:", notes.length);

    // Récupérer les documents annexes
    let documents = [];
    if (patientResponseIds.length > 0) {
      documents = await db
        .select()
        .from(AnnexedDocuments)
        .where(inArray(AnnexedDocuments.patientResponseId, patientResponseIds));
    }
    console.log("AnnexedDocuments found:", documents.length);

    return NextResponse.json({
      dossiers,
      notes: notes || [],
      documents: documents || [],
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du dossier patient:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}