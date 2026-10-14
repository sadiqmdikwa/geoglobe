import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Videos", path: "/videos" },
    { name: "Map", path: "/map" },
    { name: "Game", path: "/game" },
    { name: "Portfolio", path: "/portfolio" },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
  };

  const isCurrent = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header 
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${
          isScrolled ? "bg-[#090d16]/95 backdrop-blur-md shadow-md py-3" : "bg-[#090d16]/80 backdrop-blur-sm py-4"
        } px-4 md:px-8 flex justify-between items-center border-b border-white/5`}
      >
        {/* Left: Logo + Brand Name */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer group"
          onClick={() => handleNavClick("/")}
        >
          <img 
            src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w" 
            alt="GeoGlobe Logo" 
            className="h-9 w-9 object-contain group-hover:scale-105 transition-transform"
          />
          <span className="geoglobe-text text-geoCyan font-bold text-xl tracking-tight group-hover:text-geoYellow transition-colors">
            GeoGlobe
          </span>
        </div>

        {/* Desktop Right: Navigation Links */}
        <nav className="hidden md:flex items-center gap-x-7">
          {navLinks.map((link) => {
            const active = isCurrent(link.path);
            return (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`text-xs font-semibold uppercase tracking-wider transition-all relative py-1 ${
                  active ? "text-geoCyan" : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-geoCyan rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Right: Hamburger Menu */}
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-[#090d16] z-50 transition-transform duration-300 md:hidden flex flex-col shadow-2xl border-l border-white/10 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <img src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w" alt="GeoGlobe" className="h-8 w-8 object-contain" />
            <span className="geoglobe-text text-geoCyan font-bold text-lg">GeoGlobe</span>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)} 
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-grow flex flex-col p-6 gap-y-4">
          {navLinks.map((link) => {
            const active = isCurrent(link.path);
            return (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path)}
                className={`text-left text-lg transition-colors font-medium py-1 ${
                  active ? "text-geoCyan font-semibold" : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-4">Connect with us</p>
          <div className="flex justify-between items-center">
            <a 
              href="https://youtube.com/@geoglobe23" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube text-lg"></i>
            </a>
            <a 
              href="https://www.tiktok.com/@geoglobe23" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="TikTok"
            >
              <i className="fa-brands fa-tiktok text-lg"></i>
            </a>
            <a 
              href="https://x.com/GeoGlobe23" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="X Twitter"
            >
              <i className="fa-brands fa-x-twitter text-lg"></i>
            </a>
            <a 
              href="https://www.instagram.com/geoglobe23" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram text-lg"></i>
            </a>
            <a 
              href="https://www.facebook.com/share/1CRAgwF8TH/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
