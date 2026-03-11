import { motion } from "motion/react";
import { Menu, X, Youtube, Instagram, Facebook } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  onNavigate: (view: "home" | "videos" | "map" | "game" | "contact") => void;
  currentView: "home" | "videos" | "map" | "game" | "contact";
}

export default function Header({ onNavigate, currentView }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", view: "home" as const },
    { name: "Videos", view: "videos" as const },
    { name: "Map", view: "map" as const },
    { name: "Game", view: "game" as const },
    { name: "Contact", view: "contact" as const },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${
          isScrolled ? "bg-gray-900/95 backdrop-blur-md shadow-lg py-3" : "bg-gray-900/80 backdrop-blur-sm py-4"
        } px-4 md:px-8 flex justify-between items-center`}
      >
        {/* Left: Logo */}
        <div 
          className="flex items-center space-x-1 cursor-pointer group"
          onClick={() => onNavigate("home")}
        >
          <motion.img 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            src="https://lh3.googleusercontent.com/d/1rVa6ZpCFASDIAkgKEwaUtbb7qKhQROsX" 
            alt="GeoGlobe Logo" 
            className="h-14 w-14 md:h-20 md:w-20 object-contain"
          />
          <span className="geoglobe-text text-geoCyan font-bold text-xl md:text-3xl tracking-tight group-hover:text-geoYellow transition-colors">
            GeoGlobe
          </span>
        </div>

        {/* Desktop Right: Navigation Links */}
        <nav className="hidden md:flex items-center gap-x-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => onNavigate(link.view)}
              className={`text-sm font-semibold uppercase tracking-widest transition-all relative group ${
                currentView === link.view ? "text-geoCyan" : "text-white hover:text-geoYellow"
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-geoCyan transition-all duration-300 group-hover:w-full ${
                currentView === link.view ? "w-full" : ""
              }`}></span>
            </button>
          ))}
        </nav>

        {/* Mobile Right: Hamburger Menu */}
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="md:hidden text-white hover:text-geoCyan transition-colors"
        >
          <Menu className="w-8 h-8" />
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-gray-900 z-50 transition-transform duration-300 md:hidden flex flex-col shadow-2xl border-l border-white/10 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div className="flex items-center space-x-1">
            <img src="https://lh3.googleusercontent.com/d/1rVa6ZpCFASDIAkgKEwaUtbb7qKhQROsX" alt="GeoGlobe" className="h-12 w-12 object-contain" />
            <span className="geoglobe-text text-geoCyan font-bold text-xl">GeoGlobe</span>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="text-white/70 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <nav className="flex-grow flex flex-col p-8 gap-y-6">
          {navLinks.map((link, index) => (
            <button
              key={link.name}
              onClick={() => {
                onNavigate(link.view);
                setIsDrawerOpen(false);
              }}
              className="text-left text-xl text-white hover:text-geoCyan transition-colors font-semibold tracking-wide"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link.name}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Connect with us</p>
          <div className="flex justify-between items-center">
            <a href="https://youtube.com/@geoglobe23?si=05p8Xhx0ZrjFezJe" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-geoCyan transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
            <a href="https://www.tiktok.com/@geoglobe23?_r=1&_t=ZS-94aKE23usMi" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-geoCyan transition-colors">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            </a>
            <a href="https://x.com/GeoGlobe23" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-geoCyan transition-colors">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.instagram.com/geoglobe23?igsh=ZmE0aG16aXV2NzJq" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-geoCyan transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://www.facebook.com/share/1CRAgwF8TH/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-geoCyan transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
