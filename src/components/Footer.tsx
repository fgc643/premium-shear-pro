import { Scissors, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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

          {/* Copyright */}
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Feito com <Heart className="w-4 h-4 text-primary" fill="currentColor" /> © 2024 Elite Barber Studio
          </p>

          {/* Links */}
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </a>
            <Link to="/admin" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
              Painel Administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
