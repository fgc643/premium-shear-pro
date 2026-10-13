import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Service, supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Clock, User, Phone, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { z } from 'zod';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
}

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  customerPhone: z.string().min(10, 'Telefone inválido').max(20),
});

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

const BookingModal = ({ isOpen, onClose, service }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleSubmit = async () => {
    try {
      const validation = bookingSchema.safeParse({ customerName, customerPhone });
      
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      if (!safeDate || !time) {
        toast({
          title: 'Erro',
          description: 'Selecione uma data e horário',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setErrors({});

      const { error } = await supabase.from('bookings').insert({
        service_id: service.id,
        user_id: user?.id || null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        booking_date: format(safeDate, 'yyyy-MM-dd'),
        booking_time: time,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);
      
      toast({
        title: 'Agendamento realizado!',
        description: 'Você receberá uma confirmação em breve.',
      });

    } catch (error) {
      toast({
        title: 'Erro ao agendar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setStep(1);
    setDate(undefined);
    setTime('');
    setCustomerName('');
    setCustomerPhone('');
    setIsSuccess(false);
    setErrors({});
    onClose();
  };

  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : undefined;

  const successView = (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Agendamento Confirmado!
            </h2>
            <p className="text-muted-foreground mb-6">
              {service.name} em {safeDate && format(safeDate, "dd 'de' MMMM", { locale: ptBR })} às {time}
            </p>
            <Button variant="gold" onClick={handleClose}>
              Fechar
            </Button>
          </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {isSuccess ? successView : (<>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            Agendar {service.name}
          </DialogTitle>
        </DialogHeader>

        {/* Service Summary */}
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg mb-4">
          <img 
            src={service.image_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200'}
            alt={service.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h4 className="font-semibold text-foreground">{service.name}</h4>
            <p className="text-primary font-bold">{formatPrice(service.price)}</p>
            <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
          </div>
        </div>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label className="flex items-center gap-2 mb-3 text-foreground">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Escolha a Data
              </Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => setDate(d ?? undefined)}
                locale={ptBR}
                disabled={(d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t || d.getDay() === 0; }}
                className="rounded-lg border border-border bg-secondary mx-auto w-fit max-w-full"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                Escolha o Horário
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={time === slot ? 'gold' : 'outline'}
                    size="sm"
                    onClick={() => setTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              variant="gold" 
              className="w-full"
              disabled={!date || !time}
              type="button"
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
              📅 {safeDate && format(safeDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {time}
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2 text-foreground">
                <User className="w-4 h-4 text-primary" />
                Seu Nome
              </Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="bg-secondary border-border"
              />
              {errors.customerName && (
                <p className="text-destructive text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2 text-foreground">
                <Phone className="w-4 h-4 text-primary" />
                Telefone / WhatsApp
              </Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="bg-secondary border-border"
              />
              {errors.customerPhone && (
                <p className="text-destructive text-sm mt-1">{errors.customerPhone}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
              <Button 
                variant="gold" 
                className="flex-1"
                disabled={isLoading}
                type="button"
                onClick={handleSubmit}
              >
                {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
              </Button>
            </div>
          </div>
        )}
        </>)}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
