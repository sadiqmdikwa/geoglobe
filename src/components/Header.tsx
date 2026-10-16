import { Menu, X, Search, Compass, MapPin, PlayCircle, Trophy, ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Videos", path: "/videos" },
    { name: "Map", path: "/map" },
    { name: "Game", path: "/game" },
    { name: "Portfolio", path: "/portfolio" },
  ];

  const quickLinks = [
    { name: "Interactive World Atlas Map", path: "/map", icon: MapPin, desc: "Explore coordinate pins & border anomalies" },
    { name: "Documentary Video Library", path: "/videos", icon: PlayCircle, desc: "Watch high-production map animations" },
    { name: "Geography Trivia Challenge", path: "/game", icon: Trophy, desc: "Test your skills in flags, borders & anomalies" },
    { name: "GIS, CAD & Animation Portfolio", path: "/portfolio", icon: Compass, desc: "Sadiq Muhammad Mustapha's projects" },
    { name: "Admin Portal", path: "/admin-portal-xyz", icon: ShieldCheck, desc: "Add video pins & AI bulk game questions" },
  ];

  const filteredQuickLinks = quickLinks.filter(item =>
    searchQuery.trim() === "" ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
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

        {/* Desktop Navigation Links + Search Pill */}
        <div className="hidden md:flex items-center gap-x-6">
          <nav className="flex items-center gap-x-6">
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

          {/* Quick Command Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-black/40 hover:bg-white/10 text-gray-400 hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 text-xs transition-all cursor-pointer"
            title="Search GeoGlobe (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-geoCyan" />
            <span>Search</span>
            <kbd className="hidden lg:inline-block bg-white/10 text-[10px] px-1.5 py-0.5 rounded font-mono text-gray-400">Ctrl K</kbd>
          </button>
        </div>

        {/* Mobile Right: Search + Hamburger Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-gray-300 hover:text-white p-2"
            aria-label="Open search palette"
          >
            <Search className="w-5 h-5 text-geoCyan" />
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-gray-300 hover:text-white transition-colors p-1"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Command Palette Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-start justify-center pt-16 md:pt-24 p-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-[#080d17] border border-white/15 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-geoCyan shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, map locations, or game categories..."
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm md:text-base font-medium"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto video-preview-scroll space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 block mb-1">
                Quick Navigation
              </span>
              {filteredQuickLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-geoCyan/15 border border-white/5 hover:border-geoCyan/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-geoCyan/10 text-geoCyan flex items-center justify-center shrink-0 border border-geoCyan/20 group-hover:bg-geoCyan group-hover:text-gray-950 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white group-hover:text-geoCyan transition-colors truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-geoCyan group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-black/40 border-t border-white/5 text-[11px] text-gray-500 flex justify-between items-center px-5">
              <span>Press <kbd className="bg-white/10 px-1 rounded text-gray-300">Esc</kbd> to close</span>
              <span>GeoGlobe Spatial Search</span>
            </div>
          </div>
        </div>
      )}

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
