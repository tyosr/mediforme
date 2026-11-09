import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from "@/configs";
import { Doctors } from "@/configs/schema";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response(JSON.stringify({ message: "Non autorisé" }), { status: 401 });
    }

    const formData = await req.formData();
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const birthDate = formData.get("birthDate");
    const gender = formData.get("gender");
    const specialty = formData.get("specialty");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const file = formData.get("photo");

    let imageUrl = null;

    // Upload vers Cloudinary si une image est fournie
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload vers Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "medecin-profiles", // Dossier dans Cloudinary
              public_id: `profile-${userId}-${Date.now()}`, // ID unique
              transformation: [
                { width: 400, height: 400, crop: "fill" }, // Redimensionner automatiquement
                { quality: "auto:good" } // Optimiser la qualité
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        imageUrl = uploadResult.secure_url;
        console.log("Image uploadée vers Cloudinary:", imageUrl);
      } catch (uploadError) {
        console.error("Erreur upload Cloudinary:", uploadError);
        return new Response(
          JSON.stringify({ message: "Erreur lors de l'upload de l'image" }),
          { status: 500 }
        );
      }
    }

    // Vérifier si le profil existe
    const existing = await db.query.Doctors.findFirst({
      where: eq(Doctors.userId, userId),
    });

    if (existing) {
      // Si une nouvelle image est uploadée et qu'il y avait une ancienne, supprimer l'ancienne
      if (imageUrl && existing.photoUrl && existing.photoUrl.includes('cloudinary')) {
        try {
          // Extraire le public_id de l'ancienne URL Cloudinary
          const publicId = existing.photoUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`medecin-profiles/${publicId}`);
        } catch (deleteError) {
          console.error("Erreur suppression ancienne image:", deleteError);
        }
      }

      // Mettre à jour le profil existant
      await db
        .update(Doctors)
        .set({
          firstName,
          lastName,
          birthDate,
          gender,
          specialty,
          email,
          phone,
          address,
          photoUrl: imageUrl ?? existing.photoUrl,
        })
        .where(eq(Doctors.userId, userId));
    } else {
      // Insérer un nouveau profil
      await db.insert(Doctors).values({
        userId,
        firstName,
        lastName,
        birthDate,
        gender,
        specialty,
        email,
        phone,
        address,
        photoUrl: imageUrl,
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      photoPath: imageUrl,
      message: "Profil enregistré avec succès"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Erreur dans POST /api/medecin/save-profile:", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response(JSON.stringify({ message: "Non autorisé" }), { status: 401 });
    }

    const profile = await db.query.Doctors.findFirst({
      where: eq(Doctors.userId, userId),
    });

    return new Response(JSON.stringify(profile ?? {}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Erreur dans GET /api/medecin/save-profile:", error);
    return new Response(
      JSON.stringify({ message: "Erreur serveur", error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}