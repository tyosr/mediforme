import { db } from '@/configs';
import { UserResponses } from '@/configs/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  // Vérification de l'initialisation de la base
  if (!db) {
    console.error('Base de données non disponible (db est undefined)');
    return NextResponse.json({ error: 'Database not available' }, { status: 500 });
  }

  try {
    const totalUsers = await db.select().from(UserResponses);

    const maleCount = totalUsers.filter(user => user.gender === 'male').length;
    const femaleCount = totalUsers.filter(user => user.gender === 'female').length;

    const total = totalUsers.length;
    const malePercentage = total ? (maleCount / total * 100).toFixed(2) : 0;
    const femalePercentage = total ? (femaleCount / total * 100).toFixed(2) : 0;

    return NextResponse.json({ malePercentage, femalePercentage });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
    return NextResponse.json({ error: 'Échec de la récupération des données' }, { status: 500 });
  }
}
