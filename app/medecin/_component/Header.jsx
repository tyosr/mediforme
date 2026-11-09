"use client";
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

function Header() {
    const { user, isSignedIn } = useUser();
    const path = usePathname();

    return !path.includes('ai-form') && (
        <nav className="p-5 shadow-md bg-white border-b border-gray-200">
            <div className="flex items-center justify-between max-w-screen-xl mx-auto">

                {/* logo et nom */}
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logo-medif.png" width={60} height={40} alt="logo" />
                    <span className="text-xl font-bold text-[#1A73E8]">MediForm</span>
                </Link>

                {/* les liens */}
                <div className="hidden md:flex gap-6 items-center">

                    <Link 
                        href="/" 
                        className={`font-medium px-3 py-2 rounded-md transition ${
                            path === '/' ? "text-[#1A73E8] font-bold" : "text-gray-700 hover:text-[#FFC107]"
                        }`}
                    >
                        Accueil
                    </Link>

                    

                    {/* Si connecté → Affiche Dashboard + Bouton Compte */}
                    {isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="outline" className="text-[#1A73E8] border-[#1A73E8] hover:bg-[#1A73E8] hover:text-white">
                                    Dashboard
                                </Button>
                            </Link>
                            <UserButton />
                        </div>
                    ) : (
                        <SignInButton>
                            <Button className="bg-[#3CB371] hover:bg-[#2E8B57] text-white font-semibold px-6 py-2 rounded-md">
                                Connexion
                            </Button>
                        </SignInButton>
                    )}

                </div>
            </div>
        </nav>
    );
}

export default Header;
