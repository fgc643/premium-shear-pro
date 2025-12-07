import { Button } from '@/components/ui/button';
import { Scissors, Clock, Award, Star } from 'lucide-react';

const Hero = () => {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-primary/20 rounded-full animate-float opacity-40" />
      <div className="absolute bottom-40 right-20 w-24 h-24 border border-primary/30 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-primary/5 rounded-full animate-pulse-gold" />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
              <Star className="w-4 h-4 text-primary" fill="currentColor" />
              <span className="text-sm text-muted-foreground">Barbearia Premium desde 2018</span>
            </div>

            {/* Main Title */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <span className="text-foreground">ELITE</span>
              <br />
              <span className="text-gradient-gold">BARBER STUDIO</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Experiência premium em cortes masculinos. Tradição e modernidade 
              em um ambiente exclusivo para o homem que valoriza seu estilo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button variant="gold" size="xl" onClick={scrollToServices}>
                <Scissors className="w-5 h-5 mr-2" />
                Agendar Agora
              </Button>
              <Button variant="outline" size="xl" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Ver Serviços
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              {[
                { icon: Scissors, value: '5000+', label: 'Cortes Realizados' },
                { icon: Clock, value: '6 Anos', label: 'De Experiência' },
                { icon: Star, value: '4.9', label: 'Avaliação Google' },
                { icon: Award, value: 'Top 10', label: 'Melhor da Cidade' },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <stat.icon className="w-5 h-5 text-primary mx-auto lg:mx-0 mb-2" />
                  <div className="text-xl md:text-2xl font-display font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=1000&fit=crop&crop=center"
                  alt="Barbeiro profissional trabalhando"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-gold border border-border animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-gradient-gold">#1</div>
                    <div className="text-xs text-muted-foreground">Da Região</div>
                  </div>
                </div>
              </div>

              {/* Decorative border */}
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-primary/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
