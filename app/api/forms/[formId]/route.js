// app/api/forms/[formId]/route.js
import { db } from '@/configs'
import { JsonForms } from '@/configs/schema'
import { eq } from 'drizzle-orm'

export async function GET(request, { params }) {
  const formId = params.formId

  try {
    const result = await db
      .select()
      .from(JsonForms)
      .where(eq(JsonForms.id, formId))

    if (!result || result.length === 0) {
      return new Response(JSON.stringify({ error: "Form not found" }), {
        status: 404,
      })
    }

    return new Response(JSON.stringify(result[0]), { status: 200 })
  } catch (error) {
    console.error("Error in API:", error)
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    })
  }
}
