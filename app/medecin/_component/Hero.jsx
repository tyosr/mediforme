"use client"; 

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaRobot, FaPencilAlt, FaCalendarCheck } from 'react-icons/fa';
import { useEffect, useState } from 'react';

function Hero() {
  const { isSignedIn } = useUser();
  const router = useRouter();

 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartClick = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen items-center max-w-screen-xl mx-auto px-6 lg:px-8">
        
        {/* les titres */}
        <div className="text-center lg:text-left space-y-6">
          <h1 className="text-5xl font-bold text-[#1A73E8] sm:text-6xl">
            Simplifiez votre <span className="text-[#FFC107]"></span>
          </h1>

          <p className="mt-4 max-w-md text-gray-700 sm:text-lg">
            Créez, personnalisez et partagez facilement vos formulaires médicaux en toute sécurité.
          </p>

         
          <div className="mt-6 flex gap-4">
            {isClient && (
              <button
                onClick={handleStartClick}
                className="px-8 py-3 rounded-md text-white text-lg font-semibold bg-[#3CB371] hover:bg-[#2E8B57] shadow-md"
              >
                Commencer
              </button>
            )}

            <a
              href="#fonctionnalites"
              className="px-8 py-3 rounded-md text-[#3CB371] border border-[#3CB371] text-lg font-semibold hover:bg-[#3CB371] hover:text-white shadow-md transition"
            >
              En savoir plus
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="hidden lg:flex justify-center items-center">
          <Image 
            src="/front1.png"
            alt="image formulaire" 
            width={900} 
            height={800} 
            className="rounded-lg object-contain"
          />
        </div>

      </div>

      {/* section fonctionnaites */}
      <div id="fonctionnalites" className="py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#1A73E8]">Découvrez nos fonctionnalités</h2>
          <p className="text-gray-700 text-center mt-4 max-w-2xl mx-auto">
            Simplifiez votre travail et gagnez en efficacité avec MediForm. 
            Notre plateforme vous offre des outils innovants pour optimiser votre gestion médicale. 
            Explorez nos fonctionnalités et transformez votre façon de travailler dès aujourd’hui !
          </p>
        </div>

        {/*les 3 champs*/}
        <div className="mt-10 max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          
          {/* champ 1*/}
          <div className="rounded-lg p-6 text-center shadow-md border border-gray-200">
            <FaRobot className="text-4xl text-[#1A73E8] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1A73E8]">Générez votre formulaire avec l’IA</h3>
            <p className="text-gray-700 mt-2">
              Créez un formulaire médical sur mesure en quelques clics grâce à l’intelligence artificielle. 
              Adapté à votre spécialité, il simplifie la collecte des informations essentielles.
            </p>
          </div>

          {/* Champ 2  */}
          <div className="rounded-lg p-6 text-center shadow-md border border-gray-200">
            <FaPencilAlt className="text-4xl text-[#FFC107] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#FFC107]">Personnalisez et partagez</h3>
            <p className="text-gray-700 mt-2">
              Modifiez facilement vos formulaires pour les adapter à vos besoins. 
              Partagez-les en toute sécurité avec vos patients ou collègues.
            </p>
          </div>

          {/* Champ 3  */}
          <div className="rounded-lg p-6 text-center shadow-md border border-gray-200">
            <FaCalendarCheck className="text-4xl text-[#3CB371] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#3CB371]">Gérez vos rendez-vous intelligemment</h3>
            <p className="text-gray-700 mt-2">
              Organisez vos consultations sans effort grâce à un chatbot dédié. 
              Planifiez, ajustez et suivez vos rendez-vous en toute simplicité.
            </p>
          </div>

        </div>
      </div>

    </section>
  );
}

export default Hero;
