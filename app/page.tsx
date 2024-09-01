'use client'

import { createTheme, MantineProvider} from '@mantine/core'
import { redirect } from "next/navigation";
import { HeroSection } from "@/components/ui/HeroSection";
import { FaqSimple } from "@/components/ui/faq";
import CustomerInsight from '@/components/ui/FeaturesGrid';
import { HeaderMegaMenu } from "@/components/ui/header";
import React from 'react';
import ProductFeatures from '@/components/ui/afterfeature'; 
import PricingPage from "@/components/ui/pricing";
import { FooterLinks } from '@/components/FooterLinks';
import { Timeline } from '@/components/ui/timeline';
import SignupPage from './signup/page';
import SignInPage from './api/auth/signin/page';




const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  primaryColor: 'cyan',
});





// eslint-disable-next-line @next/next/no-async-client-component
export default function Home() {
  // const {isAuthenticated} = getKindeServerSession()

  // if (await isAuthenticated()){
  //   return redirect("/dashboard")
  // }
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
    <div>
      <SignupPage/>
      <SignInPage/>
      <HeaderMegaMenu/>
        <HeroSection/>
        <CustomerInsight/>
        <Timeline data={[]}/>
        {/* <FeaturesCards/> */}
        <ProductFeatures/>
        <PricingPage/>
        <FaqSimple/>
       <FooterLinks/>
    </div>
  </MantineProvider>

  );
}