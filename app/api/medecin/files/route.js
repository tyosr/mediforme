import { db } from "@/configs";
import { AnnexedDocuments } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/medecin/files?patientResponseId={id}
export async function GET(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientResponseId = searchParams.get("patientResponseId");

  if (!patientResponseId || isNaN(parseInt(patientResponseId))) {
    return NextResponse.json({ error: "ID de réponse patient invalide" }, { status: 400 });
  }

  try {
    const documents = await db
      .select()
      .from(AnnexedDocuments)
      .where(eq(AnnexedDocuments.patientResponseId, parseInt(patientResponseId)));

    return NextResponse.json(documents || []);
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/medecin/files
export async function POST(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const patientResponseId = formData.get("patientResponseId");
    const file = formData.get("file");

    if (!patientResponseId || isNaN(parseInt(patientResponseId))) {
      return NextResponse.json({ error: "ID de réponse patient invalide" }, { status: 400 });
    }

    if (!file || typeof file.arrayBuffer !== 'function' || !file.name) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Convertir le fichier en buffer pour Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto", // Détecte automatiquement le type de fichier
          folder: "medical-documents", // Dossier dans Cloudinary
          public_id: `${Date.now()}-${file.name.split('.')[0]}`, // ID unique
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Sauvegarder les métadonnées dans la base de données
    const newDocument = await db
      .insert(AnnexedDocuments)
      .values({
        patientResponseId: parseInt(patientResponseId),
        doctorId: userId,
        fileUrl: uploadResult.secure_url, // URL Cloudinary
        fileName: file.name,
      })
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'upload du document:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/medecin/files?id={id}
export async function PUT(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: "ID de document invalide" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const patientResponseId = formData.get("patientResponseId");
    const file = formData.get("file");

    if (!patientResponseId || isNaN(parseInt(patientResponseId))) {
      return NextResponse.json({ error: "ID de réponse patient invalide" }, { status: 400 });
    }

    const updates = { patientResponseId: parseInt(patientResponseId) };

    if (file && typeof file.arrayBuffer === 'function' && file.name) {
      // Récupérer l'ancien document pour supprimer l'ancien fichier
      const currentDoc = await db
        .select()
        .from(AnnexedDocuments)
        .where(eq(AnnexedDocuments.id, parseInt(id)))
        .limit(1);

      // Supprimer l'ancien fichier de Cloudinary si il existe
      if (currentDoc.length && currentDoc[0].fileUrl) {
        try {
          // Extraire le public_id de l'URL Cloudinary
          const urlParts = currentDoc[0].fileUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `medical-documents/${publicIdWithExtension.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("Erreur lors de la suppression de l'ancien fichier:", err);
        }
      }

      // Upload du nouveau fichier
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "medical-documents",
            public_id: `${Date.now()}-${file.name.split('.')[0]}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      updates.fileUrl = uploadResult.secure_url;
      updates.fileName = file.name;
    }

    const updatedDocument = await db
      .update(AnnexedDocuments)
      .set(updates)
      .where(eq(AnnexedDocuments.id, parseInt(id)))
      .returning();

    if (!updatedDocument.length) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    return NextResponse.json(updatedDocument[0]);
  } catch (error) {
    console.error("Erreur lors de la modification du document:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/medecin/files?id={id}
export async function DELETE(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json({ error: "ID de document invalide" }, { status: 400 });
  }

  try {
    // Récupérer le document pour obtenir l'URL du fichier
    const document = await db
      .select()
      .from(AnnexedDocuments)
      .where(eq(AnnexedDocuments.id, parseInt(id)));

    if (!document.length) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    // Supprimer le fichier de Cloudinary
    if (document[0].fileUrl) {
      try {
        const urlParts = document[0].fileUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `medical-documents/${publicIdWithExtension.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Erreur lors de la suppression du fichier Cloudinary:", err);
      }
    }

    // Supprimer le document de la base de données
    const deletedDocument = await db
      .delete(AnnexedDocuments)
      .where(eq(AnnexedDocuments.id, parseInt(id)))
      .returning();

    if (!deletedDocument.length) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}