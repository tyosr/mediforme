export default function InactifPage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Compte désactivé</h1>
        <p className="text-gray-700 text-center max-w-md">
          Votre compte est actuellement désactivé. Veuillez contacter l'administrateur pour plus d'informations.
        </p>
      </div>
    );
  }
  