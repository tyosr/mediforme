//histor de cnx 
import { db } from "@/configs";
import { LoginLogs } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { userId, email } = await req.json();

    // Vérifier que userId et email sont présents
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: "userId et email sont requis" }),
        { status: 400 }
      );
    }

    // Récupération de l'adresse IP
    let ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.socket?.remoteAddress ||
      "N/A";

    // Si l'adresse IP contient plusieurs valeurs, prendre la première
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Vérifier si un enregistrement existe pour cet utilisateur
    const existingLog = await db
      .select()
      .from(LoginLogs)
      .where(eq(LoginLogs.userId, userId))
      .limit(1);

    if (existingLog.length > 0) {
      // Mettre à jour l'enregistrement existant
      await db
        .update(LoginLogs)
        .set({
          email,
          ipAddress: ip,
          loginTime: new Date(),
        })
        .where(eq(LoginLogs.userId, userId));
    } else {
      // Insérer un nouvel enregistrement
      await db.insert(LoginLogs).values({
        userId,
        email,
        ipAddress: ip,
        loginTime: new Date(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur login-log:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'enregistrement du log" }),
      { status: 500 }
    );
  }
}