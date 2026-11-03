import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Scissors, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-foreground">ELITE</span>
              <span className="font-display text-xl font-bold text-gradient-gold ml-1">BARBER</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('services')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollToSection('consultor')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Consultor IA
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Sobre
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contato
            </button>
            
            {isAdmin && (
              <Link to="/admin" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}

            <Button variant="gold" onClick={handleAuthClick}>
              {user ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button 
              onClick={() => scrollToSection('services')} 
              className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollToSection('consultor')} 
              className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Consultor IA
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Sobre
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-left text-muted-foreground hover:text-primary transition-colors py-2"
            >
              Contato
            </button>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-primary hover:text-primary/80 transition-colors py-2 flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Painel Admin
              </Link>
            )}

            <Button variant="gold" className="w-full" onClick={handleAuthClick}>
              {user ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
