
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Layanan', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Testimonial', href: '#testimonials' },
    { label: 'Kontak', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <div className="h-4 w-4 rounded-sm bg-primary-foreground"></div>
          </div>
          <span className="font-bold text-lg text-foreground">Digital Service</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/order')}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Pesan Sekarang
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            Admin
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate('/order');
                  setIsMenuOpen(false);
                }}
                className="w-full gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Pesan Sekarang
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/auth');
                  setIsMenuOpen(false);
                }}
                className="w-full gap-2"
              >
                <User className="h-4 w-4" />
                Admin
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
