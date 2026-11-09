// app/api/generate-form/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("=== GÉNÉRATION DE FORMULAIRE ===");
    
    // Récupération du prompt depuis la requête
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        error: "Prompt manquant",
        debug: "Le prompt est requis pour générer le formulaire"
      }, { status: 400 });
    }

    // Vérification de la clé API
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY manquante");
      return NextResponse.json({ 
        error: "Configuration manquante",
        debug: "GEMINI_API_KEY non définie dans les variables d'environnement"
      }, { status: 500 });
    }

    console.log("✅ API Key présente, longueur:", apiKey.length);
    console.log("📝 Prompt reçu (premiers 200 chars):", prompt.substring(0, 200));

    // Initialisation de Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    // Configuration pour forcer une réponse JSON propre
    const generationConfig = {
      temperature: 0.7, // Réduit pour plus de consistance
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: "text/plain", // Important : pas application/json
    };

    // Prompt amélioré pour forcer le JSON
    const enhancedPrompt = `${prompt}

RÈGLES ABSOLUES À RESPECTER :
1. Répondre UNIQUEMENT avec un objet JSON valide
2. AUCUN texte avant ou après le JSON
3. AUCUN markdown, AUCUNE explication
4. Structure exacte requise avec guillemets doubles
5. Le champ "telephone" avec "required": true est OBLIGATOIRE

EXEMPLE DE RÉPONSE ATTENDUE :
{"form_title":"Titre","form_subheading":"Sous-titre","fields":[...]}`;

    console.log("🚀 Envoi de la requête à Gemini...");
    
    // Appel à Gemini avec gestion d'erreur améliorée
    const result = await model.generateContent(enhancedPrompt, {
      generationConfig
    });
    
    if (!result || !result.response) {
      throw new Error("Réponse vide de Gemini");
    }

    const response = result.response;
    const text = response.text();
    
    console.log("✅ Réponse reçue de Gemini");
    console.log("📏 Longueur de la réponse:", text.length);
    console.log("🔍 Début de la réponse:", text.substring(0, 100));

    // Validation que la réponse contient du JSON
    if (!text.includes('{') || !text.includes('}')) {
      console.error("❌ Réponse ne semble pas contenir de JSON");
      throw new Error(`Invalid response format: ${text.substring(0, 200)}`);
    }

    // Test de parsing JSON pour vérification
    try {
      // Nettoyage basique
      let cleanJson = text.trim()
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      
      const jsonStart = cleanJson.indexOf('{');
      const jsonEnd = cleanJson.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = cleanJson.substring(jsonStart, jsonEnd + 1);
        const testParse = JSON.parse(jsonStr);
        
        // Vérification des champs obligatoires
        if (!testParse.form_title || !testParse.fields || !Array.isArray(testParse.fields)) {
          throw new Error("Structure JSON invalide");
        }
        
        console.log("✅ JSON validé avec succès");
        console.log("📊 Nombre de champs:", testParse.fields.length);
      }
    } catch (validationError) {
      console.error("❌ Erreur de validation JSON:", validationError.message);
      // On continue quand même, le frontend gèrera
    }

    return NextResponse.json({ 
      success: true,
      response: text,
      debug: {
        responseLength: text.length,
        hasJson: text.includes('{') && text.includes('}'),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("❌ ERREUR dans generate-form:");
    console.error("Type:", error.constructor.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack?.substring(0, 500));
    
    // Gestion spécifique des erreurs Gemini
    let errorMessage = "Erreur lors de la génération du formulaire";
    let statusCode = 500;
    
    if (error.message?.includes('API key not valid')) {
      errorMessage = "Clé API invalide - vérifiez la configuration";
      statusCode = 401;
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = "Limite de quota atteinte - réessayez plus tard";
      statusCode = 429;
    } else if (error.message?.includes('blocked')) {
      errorMessage = "Contenu bloqué par les filtres de sécurité";
      statusCode = 400;
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.message,
      debug: {
        errorType: error.constructor.name,
        hasApiKey: !!process.env.GEMINI_API_KEY,
        timestamp: new Date().toISOString()
      }
    }, { status: statusCode });
  }
}

// Route GET pour les tests
export async function GET() {
  return NextResponse.json({
    message: "API generate-form active",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY?.length,
    timestamp: new Date().toISOString()
  });
}