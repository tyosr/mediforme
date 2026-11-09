"use client";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <section className="bg-white relative overflow-hidden min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Mirrored wavy background using beige (#FFDBBC) and turquoise (#6DCCE7), starting from left, reduced width */}
        <svg className="w-full h-full fixed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1200" preserveAspectRatio="none">
          <path fill="#6DCCE7" fillOpacity="0.7" d="M500,0 C400,150 600,350 500,550 C400,750 600,850 500,1200 L0,1200 L0,0 Z" />
          <path fill="#FFDBBC" fillOpacity="0.4" d="M550,0 C450,200 650,400 550,600 C450,800 650,900 550,1200 L0,1200 L0,0 Z" />
        </svg>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 max-w-screen-xl mx-auto items-center z-10">
        <div className="flex justify-center lg:justify-start">
          <Image
            src="/front-ff.png"
            alt="MediForm"
            width={600}
            height={800}
            className="max-w-[85%] h-auto object-contain"
          />
        </div>

        <div className="flex flex-col justify-center items-center lg:items-start mt-10 lg:mt-0">
          {/* Adjust the max-w-sm class to change form width (e.g., max-w-xs for smaller, max-w-md for larger) */}
          <div className="w-full max-w-md ml-40">

            <SignIn layout="none" afterSignInUrl="/after-signin" />
          </div>
        </div>
      </div>
    </section>
  );
}