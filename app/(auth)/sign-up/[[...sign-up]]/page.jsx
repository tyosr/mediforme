"use client";
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";

export default function Page() {
  const [role, setRole] = useState("medecin");

  return (
    <section className="bg-white relative overflow-hidden min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
      {/* Wavy background identical to sign-in */}
      <div className="absolute inset-0 w-full h-full z-0">
        <svg
          className="w-full h-full fixed"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1200"
          preserveAspectRatio="none"
        >
          <path
            fill="#6DCCE7"
            fillOpacity="0.7"
            d="M500,0 C400,150 600,350 500,550 C400,750 600,850 500,1200 L0,1200 L0,0 Z"
          />
          <path
            fill="#FFDBBC"
            fillOpacity="0.4"
            d="M550,0 C450,200 650,400 550,600 C450,800 650,900 550,1200 L0,1200 L0,0 Z"
          />
        </svg>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 max-w-screen-xl mx-auto items-center z-10">
        {/* Left image */}
        <div className="flex justify-center lg:justify-start">
          <Image
            src="/front-ff.png"
            alt="MediForm"
            width={600}
            height={800}
            className="max-w-[85%] h-auto object-contain"
          />
        </div>

        {/* Right form */}
        <div className="flex flex-col justify-center items-center lg:items-start mt-10 lg:mt-4">
          <div className="w-full max-w-md ml-40">
            
            {/* Clerk SignUp */}
            <div className="scale-[0.95]">
              <SignUp
                signInUrl="/sign-in"
                afterSignUpUrl="/after-signup"
                unsafeMetadata={{ role }}
                appearance={{
                  elements: {
                    formFieldInput: "border p-2 rounded",
                  },
                }}
                additionalFields={[
                  { name: "first_name", label: "Prénom", type: "text", required: true },
                  { name: "last_name", label: "Nom", type: "text", required: true },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
