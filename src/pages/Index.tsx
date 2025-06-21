
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import PricingWithOrder from '@/components/PricingWithOrder';
import Footer from '@/components/Footer';
import GDPRConsent from '@/components/GDPRConsent';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <Features />
        <Testimonials />
        <PricingWithOrder />
      </main>
      <Footer />
      <GDPRConsent />
    </div>
  );
};

export default Index;
