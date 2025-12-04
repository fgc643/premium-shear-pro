import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Calendar } from 'lucide-react';
import { Service } from '@/lib/supabase';
import BookingModal from './BookingModal';

interface ServiceCardProps {
  service: Service;
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <>
      <div 
        className="group bg-gradient-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-gold animate-fade-in-up"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={service.image_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800'}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
              {service.category}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-4 py-2 bg-card/90 backdrop-blur-sm text-foreground font-display text-xl font-bold rounded-lg border border-primary/30">
              {formatPrice(service.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {service.description}
          </p>

          {/* Duration */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span>{service.duration_minutes} minutos</span>
          </div>

          {/* CTA Button */}
          <Button 
            variant="gold" 
            className="w-full group-hover:shadow-gold-strong"
            onClick={() => setIsBookingOpen(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Agora
          </Button>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        service={service}
      />
    </>
  );
};

export default ServiceCard;
