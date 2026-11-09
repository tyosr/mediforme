//route envoyer email brevo rappel rendez vous le patient 
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { to, subject, htmlContent } = await req.json();
    
    // Vérifier les paramètres requis
    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "Les champs to, subject et htmlContent sont obligatoires" },
        { status: 400 }
      );
    }

    // Utiliser l'API REST de Brevo directement avec fetch
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Cabinet Médical",
          email: process.env.SENDER_EMAIL || "raniazayene8@gmail.com" // Idéalement, configurez cette valeur dans .env
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API Brevo:", data);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, messageId: data.messageId });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email", details: error.message },
      { status: 500 }
    );
  }
}