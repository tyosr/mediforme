export const dynamic = "force-dynamic";

import { db } from "@/configs";
import { LoginLogs, Users } from "@/configs/schema";
import { eq, inArray, desc } from "drizzle-orm";

export async function GET(req) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };

  let controller = null;

  const stream = new ReadableStream({
    async start(c) {
      controller = c;
      const sendUpdate = async () => {
        try {
          const doctors = await db
            .select({ clerkId: Users.clerkId, createdAt: Users.createdAt })
            .from(Users)
            .where(eq(Users.role, "medecin"));

          const doctorIds = doctors.map((doctor) => doctor.clerkId);

          const logs = await db
            .select({
              id: LoginLogs.id,
              userId: LoginLogs.userId,
              email: LoginLogs.email,
              ipAddress: LoginLogs.ipAddress,
              loginTime: LoginLogs.loginTime,
              accountCreatedAt: Users.createdAt,
            })
            .from(LoginLogs)
            .leftJoin(Users, eq(LoginLogs.userId, Users.clerkId))
            .where(inArray(LoginLogs.userId, doctorIds))
            .orderBy(desc(LoginLogs.loginTime))
            .limit(50);

          console.log("Logs SSE envoyés à 11:34 PM CET, May 24, 2025:", logs);

          // Vérifier si le contrôleur est fermé avant d'envoyer
          if (controller && !controller.desiredSize === null) {
            controller.enqueue(`data: ${JSON.stringify(logs)}\n\n`);
          }
        } catch (error) {
          console.error("Erreur SSE:", error);
        }
      };

      // Envoyer les données initiales
      await sendUpdate();

      // Configurer l'intervalle
      const interval = setInterval(async () => {
        if (controller && controller.desiredSize !== null) {
          await sendUpdate();
        } else {
          clearInterval(interval); // Arrêter l'intervalle si le contrôleur est fermé
        }
      }, 5000);

      // Nettoyage à la fermeture
      return () => {
        clearInterval(interval);
        if (controller) {
          controller.close();
          controller = null;
        }
      };
    },
    cancel() {
      if (controller) {
        controller.close();
        controller = null;
      }
    },
  });

  return new Response(stream, { headers });
}