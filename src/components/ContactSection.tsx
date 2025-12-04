import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactSection = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço',
      info: 'Rua das Barbas, 123 - Centro',
      detail: 'São Paulo - SP',
    },
    {
      icon: Phone,
      title: 'Telefone',
      info: '(11) 99999-9999',
      detail: 'WhatsApp disponível',
    },
    {
      icon: Clock,
      title: 'Horário',
      info: 'Seg - Sáb: 9h às 20h',
      detail: 'Domingo: Fechado',
    },
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: MessageCircle, label: 'WhatsApp', href: '#' },
  ];

  return (
    <section id="contact" className="py-24 bg-background relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
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
            <div className="space-y-4 mb-10">
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
          </div>

          {/* Map */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-border shadow-elevated h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975636559963!2d-46.65390532467401!3d-23.56394766104065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1699000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Elite Barber Studio"
              />
            </div>

            {/* Floating CTA */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
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
