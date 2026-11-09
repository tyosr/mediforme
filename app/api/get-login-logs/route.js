export const dynamic = "force-dynamic";

import { db } from "@/configs";
import { LoginLogs, Users } from "@/configs/schema";
import { eq, inArray, desc } from "drizzle-orm";

export async function GET(req) {
  
  try {
    const doctors = await db
      .select({ clerkId: Users.clerkId, createdAt: Users.createdAt })
      .from(Users)
      .where(eq(Users.role, "medecin"));

    const doctorIds = doctors.map((doctor) => doctor.clerkId);
    

    if (doctorIds.length === 0) {
      console.log("Aucun médecin trouvé");
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    const loginLogs = await db
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
      .orderBy(desc(LoginLogs.loginTime));

    

    return new Response(JSON.stringify(loginLogs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Erreur get-login-logs:", error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la récupération des logs", details: error.message }),
      { status: 500 }
    );
  }
}