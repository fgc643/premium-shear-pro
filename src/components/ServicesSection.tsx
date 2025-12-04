import { useState, useEffect } from 'react';
import { supabase, Service } from '@/lib/supabase';
import ServiceCard from './ServiceCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scissors, Sparkles } from 'lucide-react';

const ServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'corte', label: 'Cortes' },
    { id: 'barba', label: 'Barba' },
    { id: 'combo', label: 'Combos' },
    { id: 'tratamento', label: 'Tratamentos' },
    { id: 'acabamento', label: 'Acabamentos' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (activeCategory === 'todos') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(s => s.category === activeCategory));
    }
  }, [activeCategory, services]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-6">
            <Scissors className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Nossos Serviços Premium</span>
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Menu de <span className="text-gradient-gold">Serviços</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha entre nossa seleção de serviços premium. Cada atendimento é 
            personalizado para realçar seu estilo único.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-secondary/50 border border-border flex-wrap h-auto gap-1 p-1">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-secondary rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredServices.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum serviço encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
