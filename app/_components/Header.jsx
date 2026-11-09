"use client";
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

function Header() {
  const { user, isSignedIn } = useUser();
  const path = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (path.includes('ai-form')) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-screen-xl mx-auto px-6 relative">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFDBBC]/70 rounded-full blur-sm"></div>
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-[#0E8B8B]' : 'text-[#0E8B8B]'
            }`}>MediForm</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="border-[#A0D755] text-[#0D4A6D] hover:bg-[#A0D755] hover:text-white rounded-full px-6 transition-all duration-300">
                    Dashboard
                  </Button>
                </Link>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#6DCCE7] rounded-full blur"></div>
                  <UserButton />
                </div>
              </div>
            ) : (
              <SignInButton>
                <Button className="bg-gradient-to-r from-[#0E8B8B] to-[#A0D755] hover:shadow-lg text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105">
                  Connexion
                </Button>
              </SignInButton>
            )}
          </nav>

          <button
            className="md:hidden text-[#0E8B8B] p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white absolute top-full left-0 right-0 shadow-lg rounded-b-lg py-4 px-6 z-50 border-t border-[#FFBB55] flex flex-col gap-4">
            <div className="pt-2 border-t border-[#FFBB55]">
              {isSignedIn ? (
                <div className="flex flex-col gap-4">
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-[#A0D755] text-[#0E8B8B] hover:bg-[#A0D755] hover:text-white">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex justify-center">
                    <UserButton />
                  </div>
                </div>
              ) : (
                <SignInButton>
                  <Button className="w-full bg-gradient-to-r from-[#0E8B8B] to-[#A0D755] text-white font-semibold">
                    Connexion
                  </Button>
                </SignInButton>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;