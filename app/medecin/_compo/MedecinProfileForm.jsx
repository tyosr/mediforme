"use client";
import { useForm, setValue } from "react-hook-form";
import { useEffect, useState, useCallback } from "react";
import dynamic from 'next/dynamic';
import Select from 'react-select';

// Dynamically import react-easy-crop to avoid SSR issues
const Cropper = dynamic(() => import('react-easy-crop'), { ssr: false });

// Liste des spécialités prédéfinies
const specialties = [
  { value: "Cardiologie", label: "Cardiologie" },
  { value: "Dermatologie", label: "Dermatologie" },
  { value: "Pédiatrie", label: "Pédiatrie" },
  { value: "Neurologie", label: "Neurologie" },
  { value: "Chirurgie", label: "Chirurgie" },
];

export default function MedecinProfileForm() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [preview, setPreview] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/medecin/save-profile");
      if (!res.ok) return;
      const data = await res.json();

      const isCustom = data.specialty && !specialties.some(s => s.value === data.specialty);
      reset({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        birthDate: data.birthDate || "",
        gender: data.gender || "",
        specialty: data.specialty || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });

      if (data.specialty) {
        setSelectedSpecialty(
          isCustom ? { value: data.specialty, label: data.specialty } : specialties.find(s => s.value === data.specialty) || null
        );
      }

      if (data.photoUrl) {
        setPreview(data.photoUrl);
        setCroppedImage(data.photoUrl);
      }
    }

    fetchProfile();
  }, [reset]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    async function createCroppedImage() {
      const image = new Image();
      image.src = imageSrc;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      setCroppedImage(croppedImageUrl);
      setPreview(croppedImageUrl);
    }

    createCroppedImage();
  }, [imageSrc]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("birthDate", data.birthDate);
    formData.append("gender", data.gender);
    formData.append("specialty", data.specialty);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("address", data.address);

    if (croppedImage) {
      const blob = await (await fetch(croppedImage)).blob();
      formData.append("photo", blob, "profile.jpg");
    }

    try {
      const res = await fetch("/api/medecin/save-profile", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        alert("✅ Profil enregistré !");
        if (json.photoPath) {
          setPreview(json.photoPath);
          setCroppedImage(json.photoPath);
        }
      } else {
        alert("❌ Erreur : " + json.message);
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      alert("❌ Une erreur est survenue.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg border-t-4 border-t-[#A0D755] border-b-4 border-b-[#A0D755]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            {preview ? (
              <img
                src={preview}
                alt="Aperçu"
                className="w-full h-full object-cover rounded-full border-2 border-[#D2E8E8]"
              />
            ) : (
              <div className="w-full h-full bg-[#D2E8E8] rounded-full flex items-center justify-center text-[#647788]">
                Pas d'image
              </div>
            )}
          </div>
          <label className="mt-2">
            <span className="text-sm text-[#647788]">Choisir une photo</span>
            <input
              type="file"
              accept="image/*"
              {...register("photo")}
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-[#647788] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#E6F3D2] file:text-[#0E8B8B] hover:file:bg-[#A0D755] hover:file:text-white"
            />
          </label>
        </div>

        {/* Cropper Modal */}
        {showCropper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h3 className="text-lg font-medium mb-4 text-[#0E8B8B]">Ajuster l'image</h3>
              <div className="relative w-full h-64">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCropper(false)}
                  className="bg-[#D2E8E8] text-[#0E8B8B] py-2 px-4 rounded-md hover:bg-[#6DCCE7]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setShowCropper(false)}
                  className="bg-[#0E8B8B] text-white py-2 px-4 rounded-md hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personal Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#647788]">
              Prénom
            </label>
            <input
              id="firstName"
              {...register("firstName", { required: "Le prénom est requis" })}
              placeholder="Prénom"
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] ${errors.firstName ? "border-red-500" : "border-[#D2E8E8]"}`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#647788]">
              Nom
            </label>
            <input
              id="lastName"
              {...register("lastName", { required: "Le nom est requis" })}
              placeholder="Nom"
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] ${errors.lastName ? "border-red-500" : "border-[#D2E8E8]"}`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-[#647788]">
              Date de naissance
            </label>
            <input
              id="birthDate"
              type="date"
              {...register("birthDate", { required: "La date de naissance est requise" })}
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] ${errors.birthDate ? "border-red-500" : "border-[#D2E8E8]"}`}
            />
            {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-[#647788]">
              Sexe
            </label>
            <select
              id="gender"
              {...register("gender", { required: "Le sexe est requis" })}
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] ${errors.gender ? "border-red-500" : "border-[#D2E8E8]"}`}
            >
              <option value="">Sélectionnez le sexe</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
          </div>
        </div>

        {/* Professional Info - Spécialité */}
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-[#647788]">
            Spécialité
          </label>
          <Select
            id="specialty"
            options={specialties}
            isClearable
            isSearchable
            placeholder="Tapez ou sélectionnez une spécialité"
            value={selectedSpecialty}
            onChange={(option) => {
              const value = option ? option.value : "";
              setSelectedSpecialty(option);
              setValue("specialty", value);
            }}
            onInputChange={(input) => {
              if (input) {
                setSelectedSpecialty({ value: input, label: input });
                setValue("specialty", input);
              }
            }}
            className="mt-1"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: errors.specialty ? "#f56565" : "#D2E8E8",
                "&:hover": { borderColor: "#A0D755" },
                boxShadow: errors.specialty ? "0 0 0 1px #f56565" : "none",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
                backgroundColor: "white",
                border: "1px solid #D2E8E8",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }),
              option: (base, { isFocused }) => ({
                ...base,
                backgroundColor: isFocused ? "#E6F3D2" : "white",
                color: "#647788",
                cursor: "pointer",
              }),
            }}
          />
          {errors.specialty && <p className="mt-1 text-sm text-red-600">{errors.specialty.message}</p>}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#647788]">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", { required: "L'email est requis", pattern: { value: /^\S+@\S+$/i, message: "Email invalide" } })}
              placeholder="Email"
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] ${errors.email ? "border-red-500" : "border-[#D2E8E8]"}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#647788]">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              {...register("phone", { required: "Le numéro de téléphone est requis" })}
              placeholder="Numéro de téléphone"
              className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] ${errors.phone ? "border-red-500" : "border-[#D2E8E8]"}`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-[#647788]">
            Adresse
          </label>
          <textarea
            id="address"
            {...register("address")}
            placeholder="Adresse"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-[#A0D755] focus:border-[#A0D755] border-[#D2E8E8]"
            rows="3"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0E8B8B] text-white py-2 px-4 rounded-md hover:bg-[#A0D755] focus:outline-none focus:ring-2 focus:ring-[#A0D755] focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}