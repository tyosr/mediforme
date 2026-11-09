import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { frFR } from '@clerk/localizations'; // 🔹 Importation de la localisation française

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MediForm",
  description: "Application web médicale",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr"> {/* Changé de "en" à "fr" pour refléter la langue française */}
        <body className={inter.className}>
          <Header />
          <Toaster />
          {children}
          {/* Ajout du chatbot ici <Chatbot /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}