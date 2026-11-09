import MedecinProfileForm from "../_compo/MedecinProfileForm";

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl text-[#0E8B8B] font-bold mb-6 mt-16 text-center">Mon Profil</h1>
        <MedecinProfileForm />
      </div>
    </div>
  );
}