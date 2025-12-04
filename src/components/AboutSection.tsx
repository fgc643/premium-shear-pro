import { Award, Users, Heart, Sparkles } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: 'Profissionais Elite',
      description: 'Nossa equipe é treinada nas melhores técnicas internacionais de barbearia.',
    },
    {
      icon: Sparkles,
      title: 'Produtos Premium',
      description: 'Utilizamos apenas produtos de alta qualidade para cuidar do seu visual.',
    },
    {
      icon: Users,
      title: 'Atendimento VIP',
      description: 'Cada cliente recebe atenção personalizada em um ambiente exclusivo.',
    },
    {
      icon: Heart,
      title: 'Satisfação Garantida',
      description: 'Nosso compromisso é sua total satisfação com o resultado final.',
    },
  ];

  return (
    <section id="about" className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80"
                alt="Interior da Barbearia Elite"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-2xl shadow-gold border border-border animate-float">
              <div className="text-5xl font-display font-bold text-gradient-gold mb-1">6+</div>
              <div className="text-sm text-muted-foreground">Anos de Experiência</div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-primary/30 rounded-2xl" />
          </div>

          {/* Content Side */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Sobre Nós</span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              A Arte da <span className="text-gradient-gold">Barbearia</span> Premium
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Desde 2018, a Elite Barber Studio tem sido referência em cortes masculinos 
              premium. Nossa missão é proporcionar uma experiência única, onde tradição 
              e modernidade se encontram para realçar o melhor de cada cliente.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
