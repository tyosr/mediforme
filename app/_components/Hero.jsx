"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaHeartbeat, FaChartLine, FaCalendarCheck } from 'react-icons/fa';
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
    <section className="bg-white relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Wavy background using two light colors from the palette, adjustable later */}
        {/* Colors:beige:#FFDBBC// #E6F3D2 // #6DCCE7 (Bleu clair/turquoise) and #A0D755 (Vert clair/lime) */}
         {/* Wavy background with the larger part in beige (#FFDBBC) and a smaller part in turquoise (#6DCCE7) */}
         <svg className="w-full h-full fixed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1420 1200" preserveAspectRatio="none">
          <path fill="#6DCCE7" fillOpacity="0.7" d="M720,0 C820,150 620,350 720,550 C820,750 620,850 720,1200 L1440,1200 L1440,0 Z" />
          <path fill="#FFDBBC" fillOpacity="0.4" d="M670,0 C770,200 570,400 670,600 C770,800 570,900 670,1200 L1440,1200 L1440,0 Z" />
        </svg>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-screen items-center max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 z-10 pt-20 lg:pt-0">
        <div className="text-center lg:text-left space-y-6 lg:pt-0 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0E8B8B] leading-tight">
            Simplifiez votre <span className="text-[#A0D755]">pratique médicale</span>
          </h1>
          
          <p className="mt-4 max-w-md text-[#647788] sm:text-lg font-medium">
            Créez, personnalisez et partagez facilement vos formulaires médicaux en toute sécurité.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {isClient && (
              <button
                onClick={handleStartClick}
                className="px-6 py-3 rounded-lg bg-[#0E8B8B] text-white font-medium hover:bg-[#A0D755] shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Commencer
              </button>
            )}
            <a
              href="#fonctionnalites"
              className="px-6 py-3 rounded-lg border-2 border-[#0E8B8B] text-[#0E8B8B] font-medium hover:bg-[#A0D755] transition-all duration-300 transform hover:-translate-y-1"
            >
              En savoir plus
            </a>
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center relative z-10 pt-16">
          <Image 
            src="/front-ee.png" 
            alt="interface MediForm" 
            width={500} 
            height={800} 
            className="rounded-lg object-contain" 
          />
        </div>
      </div>

      <div id="fonctionnalites" className="py-16 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#0E8B8B] mb-3">Votre assistant médical intelligent</h2>
          <div className="w-24 h-1 bg-[#A0D755] mx-auto mb-6"></div>
          <p className="text-[#647788] text-center mt-4 max-w-2xl mx-auto">
            MediForm révolutionne votre quotidien avec des solutions innovantes adaptées aux besoins des professionnels de santé. 
            Une plateforme tout-en-un conçue par et pour les médecins.
          </p>
        </div>
        
        <div className="mt-12 max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl p-6 text-center bg-white shadow-md border-t-4 border-t-[#A0D755] hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#E6F3D2] flex items-center justify-center">
              <FaHeartbeat className="text-2xl text-[#0E8B8B]" />
            </div>
            <h3 className="text-xl font-bold text-[#0E8B8B] mb-3">Formulaires médicaux intelligents</h3>
            <p className="text-[#647788]">
              Créez des formulaires personnalisés en secondes grâce à notre IA spécialisée en médecine. Adaptez-les parfaitement à votre spécialité.
            </p>
          </div>
          
          <div className="rounded-xl p-6 text-center bg-white shadow-md border-t-4 border-t-[#0E8B8B] hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#D2E8E8] flex items-center justify-center">
              <FaChartLine className="text-2xl text-[#A0D755]" />
            </div>
            <h3 className="text-xl font-bold text-[#0E8B8B] mb-3">Tableaux de bord analytiques</h3>
            <p className="text-[#647788]">
              Visualisez instantanément les tendances de votre patientèle avec des statistiques détaillées et prenez des décisions éclairées.
            </p>
          </div>
          
          <div className="rounded-xl p-6 text-center bg-white shadow-md border-t-4 border-t-[#A0D755] hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#E6F3D2] flex items-center justify-center">
              <FaCalendarCheck className="text-2xl text-[#0E8B8B]" />
            </div>
            <h3 className="text-xl font-bold text-[#0E8B8B] mb-3">Gestion intelligente des rendez-vous</h3>
            <p className="text-[#647788]">
              Optimisez votre planning grâce à notre chatbot dédié. Gérez automatiquement vos rendez-vous et envoyez des rappels.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;