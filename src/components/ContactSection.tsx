import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactSection = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      info: 'Dados de demonstração',
      detail: 'Endereço a definir',
    },
    {
      icon: Phone,
      title: 'Telefone',
      info: '(11) 94786-8207',
      detail: 'WhatsApp disponível',
    },
    {
      icon: Clock,
      title: 'Horário',
      info: 'Seg - Sáb: 9h às 20h',
      detail: 'Domingo: Fechado · dados de demonstração',
    },
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/5511947868207' },
  ];

  return (
    <section id="contact" className="py-24 bg-background relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div>
          {/* Contact Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Contato</span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Visite <span className="text-gradient-gold">Nossa Barbearia</span>
            </h2>
            
            <p className="text-muted-foreground text-lg mb-10">
              Estamos prontos para transformar seu visual. Entre em contato ou 
              venha nos visitar pessoalmente.
            </p>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {contactInfo.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-gold"
                >
                  <div className="w-14 h-14 bg-gradient-gold rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">{item.title}</h3>
                    <p className="font-semibold text-foreground">{item.info}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-muted-foreground mb-4">Siga-nos nas redes sociais</p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    asChild
                  >
                    <a href={social.href} aria-label={social.label}>
                      <social.icon className="w-5 h-5" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/5511947868207" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Agendar via WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
