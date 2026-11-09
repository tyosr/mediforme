"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AfterSignIn() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    console.log("User object:", user);

    const handleUser = async () => {
      try {
        const role = user.unsafeMetadata?.role;
        if (role !== "admin" && role !== "medecin") {
          console.warn("Invalid role, redirecting to sign-in");
          router.push("/sign-in");
          return;
        }

        const email = user.emailAddresses[0]?.emailAddress || "";
        const response = await fetch("/api/after-signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            email,
            firstName: user.firstName,
            lastName: user.lastName,
            role,
          }),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", [...response.headers.entries()]);
        const text = await response.text();
        console.log("Response body:", text);

        if (!response.ok) {
          throw new Error(`Erreur lors de la vérification de l'utilisateur: ${response.status} ${text}`);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("Erreur de parsing JSON:", jsonError);
          throw new Error("Réponse du serveur non-JSON");
        }

        const { role: userRole } = data;

        // Enregistrement de l'historique de connexion
        await fetch("/api/save-login-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            email,
          }),
        });

        router.push(userRole === "admin" ? "/dashboard" : "/medecin");
      } catch (err) {
        console.error("Erreur AfterSignIn:", err);
        router.push("/sign-in");
      }
    };

    handleUser();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>⏳ Connexion en cours...</p>
    </div>
  );
}