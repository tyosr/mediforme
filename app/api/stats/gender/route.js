// app/api/stats/gender/route.js
import { NextResponse } from 'next/server';
import { db } from '@/configs';
import { UserResponses } from '@/configs/schema';

export async function GET() {
  try {
    const responses = await db.select().from(UserResponses);

    let male = 0;
    let female = 0;

    responses.forEach(r => {
      try {
        const json = JSON.parse(r.jsonResponse);
        const gender = json.gender?.toLowerCase();
        if (gender === 'male') male++;
        if (gender === 'female') female++;
      } catch (e) {
        console.error("Erreur JSON", e);
      }
    });

    const total = male + female;
    return NextResponse.json({
      male: total ? (male / total * 100).toFixed(2) : 0,
      female: total ? (female / total * 100).toFixed(2) : 0,
      total
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
