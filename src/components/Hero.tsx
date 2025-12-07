import { Button } from '@/components/ui/button';
import { Scissors, Clock, Award, Star } from 'lucide-react';

const Hero = () => {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-dark">
      {/* Background Image - Dark luxury barbershop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop&crop=center')`,
          backgroundPosition: 'center center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, hsl(20 14% 4% / 0.6) 0%, hsl(20 14% 4% / 0.85) 70%, hsl(20 14% 4% / 0.95) 100%)' }} />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-primary/30 rounded-full animate-float opacity-40" />
      <div className="absolute bottom-40 right-20 w-24 h-24 border border-primary/40 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="text-sm text-white/80">Barbearia Premium desde 2018</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="text-white">ELITE</span>
            <br />
            <span className="text-gradient-gold">BARBER STUDIO</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Experiência premium em cortes masculinos. Tradição e modernidade 
            em um ambiente exclusivo para o homem que valoriza seu estilo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button variant="hero" size="xl" onClick={scrollToServices}>
              <Scissors className="w-5 h-5 mr-2" />
              Agendar Agora
            </Button>
            <Button variant="goldOutline" size="xl">
              Ver Serviços
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            {[
              { icon: Scissors, value: '5000+', label: 'Cortes Realizados' },
              { icon: Clock, value: '6 Anos', label: 'De Experiência' },
              { icon: Star, value: '4.9', label: 'Avaliação Google' },
              { icon: Award, value: 'Top 10', label: 'Melhor da Cidade' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
