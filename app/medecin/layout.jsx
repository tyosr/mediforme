"use client"
import { SignedIn } from '@clerk/nextjs'
import React from 'react'
import SideNav from './_compo/SideNav'
import Chatbot from './_component/Chatbot'

function MedecinLayout({ children }) {
    return (
        <SignedIn>
            <div>
                <div className='md:w-64 fixed'>
                    <SideNav />
                </div>
                <div className='md:ml-64'>
                    {children}
                </div>
                {/* Chatbot intégré dans le layout */}
                <Chatbot />
            </div>
        </SignedIn>
    )
}

export default MedecinLayout