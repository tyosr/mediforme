// app/api/test-gemini/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Vérification de la clé API
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: "GEMINI_API_KEY not found in environment variables",
        envVars: Object.keys(process.env).filter(key => key.includes('GEMINI'))
      }, { status: 500 });
    }

    console.log("=== TEST API GEMINI ===");
    console.log("API Key présente:", !!apiKey);
    console.log("API Key longueur:", apiKey.length);
    console.log("API Key premiers/derniers caractères:", `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // Test de connexion simple
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Test avec un prompt très simple
    const prompt = "Répondre uniquement par le mot 'TEST'";
    
    console.log("Envoi du test à Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("✅ Réponse Gemini reçue:", text);

    return NextResponse.json({
      success: true,
      message: "API Gemini fonctionne",
      apiKeyLength: apiKey.length,
      apiKeyPreview: `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
      geminiResponse: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur test Gemini:", error);
    
    return NextResponse.json({
      error: "Erreur lors du test Gemini",
      message: error.message,
      apiKey: process.env.GEMINI_API_KEY ? {
        present: true,
        length: process.env.GEMINI_API_KEY.length,
        preview: `${process.env.GEMINI_API_KEY.substring(0, 4)}...${process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 4)}`
      } : { present: false },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  // Si vous voulez aussi supporter les requêtes POST
  return GET(request);
}