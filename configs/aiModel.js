// configs/aiModel.js
// ⚠️ CE FICHIER EST UNIQUEMENT POUR RÉFÉRENCE
// N'EST PLUS UTILISÉ DANS LE NOUVEAU SYSTÈME

// L'ancien système utilisant AIChatSession a été remplacé par des appels API directs
// pour éviter les problèmes de contexte client/serveur

console.warn("⚠️ aiModel.js est déprécié. Utilisez les routes API directement.");

// Si vous avez absolument besoin de ces fonctions côté serveur uniquement :
const { GoogleGenerativeAI } = require("@google/generative-ai");

export function createGeminiInstance() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is required");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    return { genAI, model };
}

// Ne plus utiliser AIChatSession - remplacé par les routes API
export const AIChatSession = null;