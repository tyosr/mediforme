"use client";

import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUser } from '@clerk/nextjs';
import { db } from '@/configs';
import { JsonForms } from '@/configs/schema';
import { and, eq } from 'drizzle-orm';
import { toast } from 'sonner';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

function FormListItem({ jsonForm, recordId, refreshData }) {
    const { user } = useUser();

    const onDeleteForm = async () => {
    try {
        const res = await fetch("/api/forms/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recordId,
                email: user?.primaryEmailAddress?.emailAddress
            })
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error("Erreur: " + data.error);
            return;
        }

        toast("Formulaire supprimé !");
        refreshData();
    } catch (error) {
        console.error("Erreur de connexion au serveur:", error);
        toast.error("Erreur de connexion au serveur");
    }
};

    return (
        <div className="border-2 border-[#A0D755] shadow-md rounded-lg p-6 bg-white transition-all hover:shadow-lg hover:-translate-y-1 h-[250px] flex flex-col justify-between">
            {/* Header de la carte */}
            <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#0E8B8B] line-clamp-2 overflow-hidden text-ellipsis">
                    {jsonForm.form_title}
                </h2>
                <h3 className="text-sm text-[#647788] line-clamp-2 overflow-hidden text-ellipsis">
                    {jsonForm.form_subheading}
                </h3>
            </div>

            {/* Ligne de séparation */}
            <hr className="my-4 border-[#D2E8E8]" />

            {/* Actions */}
            <div className="flex justify-between items-center">
                {/* Bouton de suppression */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="p-2 rounded-md text-red-500 hover:bg-red-100 transition">
                            <Trash className="h-5 w-5" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border border-[#D2E8E8] rounded-lg p-5 shadow-lg">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">🚨 Veuillez confirmer</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#647788]">
                                Cette action est irréversible. Cela supprimera définitivement ce formulaire de votre compte.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel className="bg-[#E6F3D2] text-[#0E8B8B] hover:bg-[#D2E8E8] border-[#D2E8E8]">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteForm()} className="bg-red-600 hover:bg-red-700 text-white">
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Bouton Modifier */}
                <Link href={'/edit-form/' + recordId}>
                    <Button size="sm" className="flex gap-2 bg-[#0E8B8B] hover:bg-[#A0D755] text-white transition">
                        <Edit className="h-5 w-5" /> Modifier
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default FormListItem;