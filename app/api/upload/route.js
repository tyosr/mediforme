import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cette fonction gère les requêtes POST
export async function POST(request) {
  try {
    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get("file");

    // Vérifier si un fichier a été envoyé
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 }
      );
    }

    // Créer un buffer à partir des données du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convertir le buffer en base64 pour Cloudinary
    const base64File = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64File}`;

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'uploads', // Dossier dans Cloudinary
      resource_type: 'auto', // Détecte automatiquement le type (image, video, raw)
      public_id: `${Date.now()}-${file.name.replace(/\s+/g, "-").split('.')[0]}`,
    });

    // Retourner l'URL du fichier uploadé depuis Cloudinary
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    }, { status: 200 });

  } catch (error) {
    console.error("Erreur d'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}