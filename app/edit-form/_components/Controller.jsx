"use client";

import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Themes from "../../_data/Themes";
import GradientBg from "../../_data/GradientBg";
import { Button } from "@/components/ui/button";
import Styles from "../../_data/Styles";
import { Checkbox } from "@/components/ui/checkbox";

function Controller({ selectedTheme, selectedBackground, currentTheme, selectedStyle, setSignInEnabled }) {
    const [indexLimit, setIndexLimit] = useState(6);

    // Calcul de la limite pour le bouton "Afficher plus"
    const nearestMultiple = (Math.floor(GradientBg.length / 6) * 6) + 1;

    const clickHandlerShowMore = () => setIndexLimit(indexLimit + 6);
    const clickHandlerShowLess = () => setIndexLimit(indexLimit - 6);

    return (
        <section className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            {/* Sélection du thème */}
            <h2 className="my-2 text-base font-semibold text-[#1A73E8] leading-tight">🎨 Thème</h2>
            <Select onValueChange={selectedTheme} {...(currentTheme ? { value: currentTheme } : {})}>
                <SelectTrigger className="w-full border-gray-300 rounded-lg shadow-sm">
                    <SelectValue placeholder="Sélectionner un thème" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-md">
                    {Themes.map((theme, index) => (
                        <SelectItem value={theme.theme} key={index} className="hover:bg-gray-100 transition-all">
                            <div className="flex gap-3 items-center">
                                <div className="flex">
                                    <div className="h-5 w-5 rounded-l-md" style={{ backgroundColor: theme.primary }}></div>
                                    <div className="h-5 w-5" style={{ backgroundColor: theme.secondary }}></div>
                                    <div className="h-5 w-5" style={{ backgroundColor: theme.accent }}></div>
                                    <div className="h-5 w-5 rounded-r-md" style={{ backgroundColor: theme.neutral }}></div>
                                </div>
                                {theme.theme}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Sélection de l'arrière-plan */}
            <h2 className="mt-8 my-2 text-base font-semibold text-[#1A73E8] leading-tight">🌄 Arrière-plan</h2>
            <div className="grid grid-cols-3 gap-4">
                {GradientBg.map((bg, index) =>
                    index < indexLimit && (
                        <div 
                            key={index}
                            onClick={() => selectedBackground(bg.gradient)}
                            className="w-full h-[4.5rem] rounded-lg shadow-sm border border-gray-300 hover:border-2 hover:border-[#1A73E8] flex items-center justify-center cursor-pointer transition-all"
                            style={{ background: bg.gradient }}
                        >
                            {index === 0 && "Aucun"}
                        </div>
                    )
                )}
            </div>

            {GradientBg.length > 6 && (
    <div className="w-full my-3 flex justify-center">
        {indexLimit > 6 && (
            <Button
                variant="outline"
                size="sm"
                className="mx-0.5 border-gray-300 hover:bg-gray-100 transition-all px-2 py-0.5 text-xs"
                onClick={clickHandlerShowLess}
            >
                Afficher moins
            </Button>
        )}
        {indexLimit < nearestMultiple && (
            <Button
                variant="outline"
                size="sm"
                className="mx-0.5 border-gray-300 hover:bg-gray-100 transition-all px-2 py-0.5 text-xs"
                onClick={clickHandlerShowMore}
            >
                Afficher plus
            </Button>
        )}
    </div>
)}

            {/* Sélection du style */}
            <h2 className="mt-8 my-2 text-base font-semibold text-[#1A73E8] leading-tight">🖌️ Style</h2>
            <div className="grid grid-cols-3 gap-4">
                {Styles.map((item, index) => (
                    <div key={index} className="text-center">
                        <div 
                            className="cursor-pointer hover:border-2 hover:border-[#1A73E8] rounded-lg transition-all"
                            onClick={() => selectedStyle(item)}
                        >
                            <img src={item.img} width={600} height={80} className="rounded-lg shadow-md border border-gray-300" />
                        </div>
                        <h2 className="text-sm text-gray-700 mt-1">{item.name}</h2>
                    </div>
                ))}
            </div>

            {/* Option d'authentification 
            <div className="flex gap-2 my-6 items-center">
                <Checkbox onCheckedChange={setSignInEnabled} />
                <h2 className="text-gray-700">🔒 Exiger une authentification sociale (Facebook/Google) avant de soumettre le formulaire</h2>
            </div>
            */}
        </section>
    );
}

export default Controller;