"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { db } from "@/configs";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { useEffect } from "react";

export default function AfterSignUp() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const setupUser = async () => {
      try {
        const role = user.unsafeMetadata?.role;

        if (role !== "admin" && role !== "medecin") {
          router.push("/sign-in");
          return;
        }

        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        const email = user.emailAddresses[0]?.emailAddress || "";

        const existing = await db.select().from(Users).where(eq(Users.clerkId, user.id));
        if (existing.length === 0) {
          await db.insert(Users).values({
            clerkId: user.id,
            email,
            name: fullName || "Utilisateur",
            role,
            createdAt: new Date().toISOString(),
          });
        }

        router.push(role === "admin" ? "/dashboard" : "/medecin");
      } catch (err) {
        console.error("Erreur AfterSignUp:", err);
        router.push("/sign-in");
      }
    };

    setupUser();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>⏳ Configuration de votre compte...</p>
    </div>
  );
}
