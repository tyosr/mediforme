"use client";

import { db } from "@/configs";
import { JsonForms } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Share2, SquareArrowOutUpRight, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import FormUi from "../_components/FormUi";
import Controller from "../_components/Controller";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RWebShare } from "react-web-share";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

function EditForm({ params }) {
  const { user } = useUser();
  const [jsonForm, setJsonForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [updateTrigger, setUpdateTrigger] = useState();
  const [record, setRecord] = useState({});
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedBackground, setSelectedBackground] = useState();
  const [selectedStyle, setSelectedStyle] = useState();
  const [openAddFieldDialog, setOpenAddFieldDialog] = useState(false);
  const [newField, setNewField] = useState({
    name: "",
    label: "",
    field_type: "text",
    placeholder: "",
    required: false,
    options: [],
    accept: "",
  });

  useEffect(() => {
    if (user) {
      GetFormData();
    }
  }, [user]);

  const GetFormData = async () => {
    try {
      const response = await fetch("/api/get-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: params?.formId,
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du formulaire");
      }

      const { form } = await response.json();
      if (form) {
        const parsedForm = JSON.parse(form.jsonform);
        setRecord(form);
        setJsonForm(parsedForm);
        setSelectedBackground(form.background);
        setSelectedTheme(form.theme);
        setSelectedStyle(form.style ? JSON.parse(form.style) : null);
      } else {
        console.log("Aucun formulaire trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (updateTrigger) {
      updateJsonFormInDb();
    }
  }, [updateTrigger]);

  const onFieldUpdate = (value, index) => {
    jsonForm.fields[index].label = value.label;
    jsonForm.fields[index].placeholder = value.placeholder;
    setUpdateTrigger(Date.now());
  };

  const updateJsonFormInDb = async () => {
    try {
      const response = await fetch("/api/update-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: record.id,
          email: user?.primaryEmailAddress?.emailAddress,
          jsonform: jsonForm,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du formulaire");
      }

      toast(`${jsonForm.form_title} mis à jour !`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du formulaire:", error);
      toast.error("Erreur lors de la mise à jour du formulaire");
    }
  };

  const deleteField = (indexToRemove) => {
    jsonForm.fields = jsonForm.fields.filter(
      (_, index) => index !== indexToRemove
    );
    setUpdateTrigger(Date.now());
  };

  const updateControllerFields = async (value, columnName) => {
    try {
      const response = await fetch("/api/update-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId: record.id,
          email: user?.primaryEmailAddress?.emailAddress,
          [columnName]: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du champ");
      }

      toast(
        `${columnName.charAt(0).toUpperCase() + columnName.slice(1)} mis à jour !`
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du champ:", error);
      toast.error("Erreur lors de la mise à jour du champ");
    }
  };

  const handleAddField = () => {
    const fieldToAdd = {
      name: newField.name || newField.label.toLowerCase().replace(/\s+/g, "_"),
      label: newField.label,
      field_type: newField.field_type,
      ...(newField.placeholder && { placeholder: newField.placeholder }),
      required: newField.required,
      ...(newField.field_type === "select" ||
      newField.field_type === "checkbox" ||
      newField.field_type === "radio"
        ? { options: newField.options.length > 0 ? newField.options : ["Option 1", "Option 2"] }
        : {}),
      ...(newField.field_type === "file" && newField.accept
        ? { accept: newField.accept }
        : {}),
    };

    const updatedFields = [...jsonForm.fields, fieldToAdd];
    setJsonForm({ ...jsonForm, fields: updatedFields });
    setUpdateTrigger(Date.now());

    setNewField({
      name: "",
      label: "",
      field_type: "text",
      placeholder: "",
      required: false,
      options: [],
      accept: "",
    });
    setOpenAddFieldDialog(false);
  };

  return (
    <section className="p-4 w-full mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6 px-4">
        <h2
          className="flex gap-2 items-center mt-16 text-2xl font-bold text-[#0E8B8B] cursor-pointer hover:underline"
          onClick={() => router.back()}
        >
          <ArrowLeft /> Retour
        </h2>

        <div className="flex gap-3 mt-16">
          <Link href={`/ai-form/${record?.id}`} target="_blank">
            <Button className="flex gap-2 bg-[#0E8B8B] hover:bg-[#A0D755] text-white transition-all duration-300 transform hover:-translate-y-1">
              <SquareArrowOutUpRight className="h-5 w-5" /> Aperçu
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 bg-white p-6 rounded-lg shadow-lg border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755] mx-4">
        <div className="xl:col-span-1 p-5 border border-[#D2E8E8] rounded-lg shadow-md bg-white">
          <h3 className="text-lg font-semibold mb-4 text-[#0E8B8B]">Contrôles</h3>
          <Controller
            selectedTheme={(themeValue) => {
              updateControllerFields(themeValue, "theme");
              setSelectedTheme(themeValue);
            }}
            currentTheme={selectedTheme}
            selectedBackground={(backgroundValue) => {
              updateControllerFields(backgroundValue, "background");
              setSelectedBackground(backgroundValue);
            }}
            selectedStyle={(value) => {
              setSelectedStyle(value);
              updateControllerFields(value, "style");
            }}
            setSignInEnabled={(signInValue) => {
              updateControllerFields(signInValue, "requireSignIn");
            }}
          />
        </div>

        <div
          className="xl:col-span-3 border border-[#D2E8E8] rounded-lg p-8 bg-[#E6F3D2] flex items-center justify-center shadow-md min-h-[600px]"
          style={{ backgroundImage: selectedBackground }}
        >
          {loading ? (
            <Loader2 className="animate-spin text-[#0E8B8B] w-8 h-8" />
          ) : (
            jsonForm && (
              <div className="w-full max-w-4xl flex justify-center">
                <div className="w-full max-w-2xl">
                  <FormUi
                    jsonForm={jsonForm}
                    onFieldUpdate={onFieldUpdate}
                    deleteField={(index) => deleteField(index)}
                    selectedTheme={selectedTheme}
                    selectedStyle={selectedStyle}
                    formId={record.id}
                  />
                </div>
              </div>
            )
          )}
        </div>

        <div className="xl:col-span-1 p-5 border border-[#D2E8E8] rounded-lg shadow-md bg-white">
          <h3 className="text-base font-semibold mb-4 text-[#0E8B8B] whitespace-nowrap">Personnaliser le formulaire</h3>
          <div className="space-y-4">
            <Button
              onClick={() => setOpenAddFieldDialog(true)}
              className="flex gap-2 bg-[#0E8B8B] hover:bg-[#A0D755] text-white w-full transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="h-5 w-5" /> Ajouter un champ
            </Button>
            
            
          </div>
        </div>
      </div>

      <Dialog open={openAddFieldDialog} onOpenChange={setOpenAddFieldDialog}>
        <DialogContent className="max-w-lg bg-white rounded-lg p-6 shadow-xl border border-[#D2E8E8]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0E8B8B]">
              Ajouter un nouveau champ
            </DialogTitle>
            <DialogDescription className="text-[#647788] mt-2">
              Configurez le nouveau champ à ajouter au formulaire.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-[#647788]">Libellé</Label>
              <Input
                value={newField.label}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
                placeholder="Ex: Symptômes supplémentaires"
                className="border-[#D2E8E8] focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
              />
            </div>

            <div>
              <Label className="text-[#647788]">Type de champ</Label>
              <Select
                value={newField.field_type}
                onValueChange={(value) =>
                  setNewField({ ...newField, field_type: value })
                }
              >
                <SelectTrigger className="border-[#D2E8E8] focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texte</SelectItem>
                  <SelectItem value="textarea">Zone de texte</SelectItem>
                  <SelectItem value="select">Liste déroulante</SelectItem>
                  <SelectItem value="checkbox">Case à cocher</SelectItem>
                  <SelectItem value="radio">Bouton radio</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="file">Pièce jointe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["text", "textarea", "date"].includes(newField.field_type) && (
              <div>
                <Label className="text-[#647788]">Placeholder</Label>
                <Input
                  value={newField.placeholder}
                  onChange={(e) =>
                    setNewField({ ...newField, placeholder: e.target.value })
                  }
                  placeholder="Ex: Entrez une description"
                  className="border-[#D2E8E8] focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
                />
              </div>
            )}

            {(newField.field_type === "select" ||
              newField.field_type === "checkbox" ||
              newField.field_type === "radio") && (
              <div>
                <Label className="text-[#647788]">Options (séparées par des virgules)</Label>
                <Input
                  value={newField.options.join(", ")}
                  onChange={(e) =>
                    setNewField({
                      ...newField,
                      options: e.target.value
                        .split(",")
                        .map((opt) => opt.trim()),
                    })
                  }
                  placeholder="Ex: Oui, Non"
                  className="border-[#D2E8E8] focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
                />
              </div>
            )}

            {newField.field_type === "file" && (
              <div>
                <Label className="text-[#647788]">Types de fichiers acceptés</Label>
                <Input
                  value={newField.accept}
                  onChange={(e) =>
                    setNewField({ ...newField, accept: e.target.value })
                  }
                  placeholder="Ex: image/*, application/pdf"
                  className="border-[#D2E8E8] focus:ring-2 focus:ring-[#A0D755] text-[#647788] bg-white"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={newField.required}
                onCheckedChange={(checked) =>
                  setNewField({ ...newField, required: checked })
                }
              />
              <Label className="text-[#647788]">Champ requis</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="destructive"
              onClick={() => setOpenAddFieldDialog(false)}
              className="bg-[#E6F3D2] hover:bg-[#A0D755] text-[#647788] transition-all duration-300 transform hover:-translate-y-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddField}
              className="bg-[#0E8B8B] hover:bg-[#A0D755] text-white transition-all duration-300 transform hover:-translate-y-1"
            >
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default EditForm;