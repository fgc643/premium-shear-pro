import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase, Booking } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Scissors, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Phone,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: AlertCircle },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: CheckCircle },
  completed: { label: 'Concluído', color: 'bg-green-500/20 text-green-500 border-green-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircle },
};

const Admin = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchBookings();
      
      // Setup realtime subscription
      const channel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          (payload) => {
            console.log('Realtime update:', payload);
            fetchBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            name,
            price,
            duration_minutes
          )
        `)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Agendamento marcado como ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Caixa: agendamentos confirmados (e concluídos) agrupados por dia
  const paidBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  );

  const bookingValue = (b: any) => Number(b.services?.price || 0);

  const cashByDay = Object.values(
    paidBookings.reduce((acc: Record<string, { date: string; total: number; count: number }>, b) => {
      const key = b.booking_date;
      if (!acc[key]) acc[key] = { date: key, total: 0, count: 0 };
      acc[key].total += bookingValue(b);
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayTotal = cashByDay.find((d) => d.date === todayKey)?.total || 0;
  const totalGeral = paidBookings.reduce((sum, b) => sum + bookingValue(b), 0);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Painel Admin | Elite Barber Studio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-display text-xl font-bold text-foreground">Painel Admin</h1>
                    <p className="text-sm text-muted-foreground">Gerenciar Agendamentos</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={fetchBookings}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: bookings.length, color: 'text-foreground' },
              { label: 'Pendentes', value: bookings.filter(b => b.status === 'pending').length, color: 'text-yellow-500' },
              { label: 'Confirmados', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-blue-500' },
              { label: 'Concluídos', value: bookings.filter(b => b.status === 'completed').length, color: 'text-green-500' },
            ].map((stat, index) => (
              <div key={index} className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Caixa */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Caixa</h2>
                  <p className="text-sm text-muted-foreground">
                    Soma diária dos agendamentos confirmados
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-display font-bold text-primary">
                    {formatPrice(todayTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total geral</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {formatPrice(totalGeral)}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-secondary/50">
                    <TableHead className="text-muted-foreground">Dia</TableHead>
                    <TableHead className="text-muted-foreground">Atendimentos</TableHead>
                    <TableHead className="text-muted-foreground text-right">Total do dia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashByDay.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        Nenhum agendamento confirmado ainda
                      </TableCell>
                    </TableRow>
                  ) : (
                    cashByDay.map((day) => (
                      <TableRow key={day.date} className="border-border hover:bg-secondary/30">
                        <TableCell className="font-medium text-foreground">
                          {format(parseISO(day.date), "EEEE, dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{day.count}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatPrice(day.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Agendamentos</h2>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-secondary/50">
                    <TableHead className="text-muted-foreground">Cliente</TableHead>
                    <TableHead className="text-muted-foreground">Serviço</TableHead>
                    <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                    <TableHead className="text-muted-foreground">Valor</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Nenhum agendamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => {
                      const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow key={booking.id} className="border-border hover:bg-secondary/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{booking.customer_name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {booking.customer_phone}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-foreground">
                              {(booking as any).services?.name || 'Serviço'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(booking as any).services?.duration_minutes || 30} min
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-foreground">
                              <Calendar className="w-4 h-4 text-primary" />
                              {format(parseISO(booking.booking_date), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {booking.booking_time.slice(0, 5)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {formatPrice((booking as any).services?.price || 0)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={booking.status || 'pending'}
                              onValueChange={(value) => updateBookingStatus(booking.id, value)}
                            >
                              <SelectTrigger className="w-36 h-8 bg-secondary border-border text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="confirmed">Confirmar</SelectItem>
                                <SelectItem value="completed">Concluir</SelectItem>
                                <SelectItem value="cancelled">Cancelar</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;
