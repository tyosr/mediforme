// app/live-form/[formId]/page.jsx
"use client"

import FormUi from '@/app/edit-form/_components/FormUi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { badgeVariants } from "@/components/ui/badge"

function LiveAiForm({ params }) {
  const [record, setRecord] = useState(null)
  const [jsonForm, setJsonForm] = useState(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${params.formId}`)
        const data = await res.json()

        if (res.ok) {
          setRecord(data)
          setJsonForm(JSON.parse(data.jsonform))
        } else {
          console.error("Form not found:", data.error)
        }
      } catch (err) {
        console.error("Erreur API :", err)
      }
    }

    if (params?.formId) {
      fetchForm()
    }
  }, [params])

  return (
    <div
      className='p-10 flex justify-center items-center min-h-screen'
      style={{ backgroundImage: record?.background }}
    >
      {record && jsonForm?.fields ? (
        <FormUi
          jsonForm={jsonForm}
          selectedTheme={record.theme}
          selectedStyle={JSON.parse(record.style)}
          onFieldUpdate={() => console.log}
          deleteField={() => console.log}
          editable={false}
          formId={record.id}
          requiredSignIn={record.requireSignIn}
        />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}

      <Link
        className={`flex gap-2 items-center px-3 py-1 rounded-full
          fixed bottom-5 left-5 cursor-pointer 
          ${badgeVariants({ variant: "secondary" })}`}
        href="/"
      >
        <Image src="/zapdoc-logo-icon.svg" width={16} height={16} alt="logo" />
        Créer un formulaire personnalisé avec l'IA
      </Link>
    </div>
  )
}

export default LiveAiForm
