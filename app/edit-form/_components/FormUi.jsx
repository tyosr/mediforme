"use client";

import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import FieldEdit from "./FieldEdit";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function FormUi({
    jsonForm,
    selectedTheme,
    selectedStyle,
    onFieldUpdate,
    deleteField,
    editable = true,
    formId = 0,
    requiredSignIn = false,
}) {
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});
    const formRef = useRef();
    const { user, isSignedIn } = useUser();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (name, event) => {
        const file = event.target.files[0];
        setFiles((prev) => ({ ...prev, [name]: file }));
        setFormData((prev) => ({ ...prev, [name]: file ? file.name : "" }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckBoxChange = (fieldName, item, checked) => {
        const currentList = formData[fieldName] || [];
        const updatedList = checked
            ? [...currentList, item]
            : currentList.filter((val) => val !== item);
        setFormData((prev) => ({ ...prev, [fieldName]: updatedList }));
    };

    const onFormSubmit = async (event) => {
        event.preventDefault();

        if (requiredSignIn && !isSignedIn) {
            toast("❌ Vous devez être connecté pour soumettre.");
            return;
        }

        try {
            // Upload files to the server
            const uploadedFiles = {};
            for (const [fieldName, file] of Object.entries(files)) {
                if (file) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Erreur lors de l'upload du fichier");
                    }

                    const { url } = await response.json();
                    uploadedFiles[fieldName] = url;
                }
            }

            // Update formData with file URLs
            const updatedFormData = {
                ...formData,
                ...uploadedFiles,
            };

            // Submit response to the database via API
            const response = await fetch("/api/submit-form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jsonResponse: updatedFormData,
                    fileUrl: uploadedFiles.diagnostic_file || null,
                    formId,
                    userId: user?.id || "",
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l’enregistrement");
            }

            formRef.current.reset();
            setFormData({});
            setFiles({});
            toast("✔️ Réponse soumise avec succès !");
        } catch (error) {
            console.error("Erreur lors de l’envoi:", error);
            toast("❌ Une erreur s’est produite lors de l’envoi.");
        }
    };

    return (
        <form
            ref={formRef}
            onSubmit={onFormSubmit}
            className="border border-gray-200 shadow-lg p-6 md:w-[37.5rem] rounded-lg bg-white"
            data-theme={selectedTheme}
            style={{
                boxShadow: selectedStyle?.key === "boxshadow" ? "5px 5px 0px black" : "",
                border: selectedStyle?.key === "border" ? selectedStyle.value : "",
            }}
        >
            <h2 className="font-bold text-center text-2xl text-[#1A73E8]">{jsonForm?.form_title}</h2>
            <h2 className="text-sm text-gray-500 text-center mb-4">{jsonForm?.form_subheading}</h2>

            {jsonForm?.fields.map((field, index) => (
                <div key={index} className="flex items-center gap-3">
                    {field.field_type === "file" ? (
                        <div className="my-3 w-full">
                            <Label htmlFor={field.name} className="text-sm text-gray-600">
                                {field.label}
                            </Label>
                            <Input
                                type="file"
                                id={field.name}
                                name={field.name}
                                accept={field.accept || "*"}
                                required={field?.required}
                                className="border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A73E8] transition-all"
                                onChange={(event) => handleFileChange(field.name, event)}
                            />
                        </div>
                    ) : field.field_type === "select" ? (
                        <div className="my-3 w-full">
                            <Label className="text-sm text-gray-600">{field.label}</Label>
                            <Select
                                required={field?.required}
                                onValueChange={(value) => handleSelectChange(field.name, value)}
                            >
                                <SelectTrigger className="w-full border-gray-300 rounded-md shadow-sm">
                                    <SelectValue placeholder={field.placeholder} />
                                </SelectTrigger>
                                <SelectContent className="border border-gray-200 rounded-md shadow-md">
                                    {field.options.map((item, index) => (
                                        <SelectItem key={index} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : field.field_type === "radio" ? (
                        <div className="my-3 w-full">
                            <Label className="text-sm text-gray-600">{field.label}</Label>
                            <RadioGroup required={field?.required} className="mt-2">
                                {field.options.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={item}
                                            id={`${field.name}-${index}`}
                                            onClick={() => handleSelectChange(field.name, item)}
                                        />
                                        <Label htmlFor={`${field.name}-${index}`}>{item}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ) : field.field_type === "checkbox" ? (
                        field.options ? (
                            <div className="my-3 w-full">
                                <Label className="text-sm text-gray-600">{field.label}</Label>
                                {field.options.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Checkbox
                                            onCheckedChange={(checked) =>
                                                handleCheckBoxChange(field.name, item, checked)
                                            }
                                        />
                                        <h2>{item}</h2>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex my-3 gap-2 w-full">
                                <Checkbox required={field?.required} />
                                <Label className="text-sm text-gray-600">{field.label}</Label>
                            </div>
                        )
                    ) : (
                        <div className="my-3 w-full">
                            <Label htmlFor={field.name} className="text-sm text-gray-600">
                                {field.label}
                            </Label>
                            <Input
                                type={field.field_type}
                                id={field.name}
                                name={field.name}
                                placeholder={field.placeholder}
                                required={field?.required}
                                className="border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A73E8] transition-all"
                                onChange={handleInputChange}
                            />
                        </div>
                    )}

                    {editable && (
                        <FieldEdit
                            defaultValue={field}
                            onUpdate={(value) => onFieldUpdate(value, index)}
                            deleteField={() => deleteField(index)}
                        />
                    )}
                </div>
            ))}

            {!requiredSignIn ? (
                <Button
                    type="submit"
                    className="w-full bg-[#3CB371] hover:bg-[#2E8B57] text-white font-semibold mt-4"
                >
                    Soumettre
                </Button>
            ) : isSignedIn ? (
                <Button
                    type="submit"
                    className="w-full bg-[#3CB371] hover:bg-[#2E8B57] text-white font-semibold mt-4"
                >
                    Soumettre
                </Button>
            ) : (
                <Button className="w-full bg-[#FFC107] hover:bg-[#E6A700] text-white font-semibold mt-4">
                    <SignInButton mode="modal">Connectez-vous avant de soumettre</SignInButton>
                </Button>
            )}
        </form>
    );
}

export default FormUi;