import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import StyleConsultant from '@/components/StyleConsultant';
import AiConcierge from '@/components/AiConcierge';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Elite Barber Studio | Demonstração de agendamento com IA</title>
        <meta name="description" content="Demonstração de sistema de agendamento online com atendente de IA para barbearias." />
        <meta name="keywords" content="barbearia, corte masculino, barba, degradê, São Paulo, premium" />
        <link rel="canonical" href="https://elitebarberstudio.com" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <ServicesSection />
          <StyleConsultant />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
        <AiConcierge />
      </div>
    </>
  );
};

export default Index;
