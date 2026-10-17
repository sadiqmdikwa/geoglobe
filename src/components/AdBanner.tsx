import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, PlayCircle, Globe, Sparkles } from "lucide-react";

interface AdBannerProps {
  slotId?: string;
  adClient?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

const HOUSE_ADS = [
  {
    id: "quiz-promo",
    badge: "FEATURED CHALLENGE",
    title: "Test Your Geography IQ!",
    subtitle: "Can you locate 10 mystery border anomalies & nations on the coordinate map?",
    cta: "Start Trivia Quiz ➔",
    icon: Trophy,
    route: "/game",
    color: "from-geoYellow/20 via-amber-500/10 to-transparent",
    accent: "text-geoYellow",
    border: "border-geoYellow/30"
  },
  {
    id: "video-promo",
    badge: "DOCUMENTARY VAULT",
    title: "Uncover Enclaves & Frontier Anomalies",
    subtitle: "Watch high-definition documentary deep-dives on the world's most unique borders.",
    cta: "Browse Video Library ➔",
    icon: PlayCircle,
    route: "/videos",
    color: "from-geoCyan/20 via-sky-500/10 to-transparent",
    accent: "text-geoCyan",
    border: "border-geoCyan/30"
  },
  {
    id: "globe-promo",
    badge: "3D VECTOR ATLAS",
    title: "Spin the Interactive 3D World Globe",
    subtitle: "Inspect 197 sovereign nations with deep vector zoom, capitals, and live statistics.",
    cta: "Explore 3D Globe ➔",
    icon: Globe,
    route: "/explorer",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    accent: "text-emerald-400",
    border: "border-emerald-500/30"
  }
];

export default function AdBanner({
  slotId = "1234567890",
  adClient = "ca-pub-7053832075827963",
  format = "auto",
  className = ""
}: AdBannerProps) {
  const navigate = useNavigate();
  const [adIndex, setAdIndex] = useState(0);
  const [isAdSenseLoaded, setIsAdSenseLoaded] = useState(false);

  useEffect(() => {
    setAdIndex(Math.floor(Math.random() * HOUSE_ADS.length));

    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setIsAdSenseLoaded(true);
      }
    } catch (e) {
      setIsAdSenseLoaded(false);
    }
  }, [adClient]);

  const currentAd = HOUSE_ADS[adIndex];
  const IconComponent = currentAd.icon;

  return (
    <div className={`w-full max-w-lg mx-auto bg-gray-950/80 backdrop-blur-2xl rounded-[2rem] p-4 border border-white/10 shadow-2xl overflow-hidden my-4 text-left transition-all ${className}`}>
      {/* Top Header Label */}
      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-geoYellow animate-pulse" />
          <span>Sponsoring Partner</span>
        </span>
        <span className="text-gray-600">Google AdSense</span>
      </div>

      {isAdSenseLoaded ? (
        /* Official Google AdSense Unit Container */
        <div className="min-h-[90px] flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 p-2">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={adClient}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          ></ins>
        </div>
      ) : (
        /* Fallback Functional Interactive Sponsor Card */
        <div
          onClick={() => navigate(currentAd.route)}
          className={`relative rounded-2xl p-4 bg-gradient-to-r ${currentAd.color} border ${currentAd.border} flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] transition-all group shadow-inner`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center shrink-0 ${currentAd.accent} group-hover:scale-110 transition-transform shadow-md`}>
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block mb-0.5 ${currentAd.accent}`}>
                {currentAd.badge}
              </span>
              <h4 className="text-xs md:text-sm font-extrabold text-white truncate group-hover:text-geoYellow transition-colors">
                {currentAd.title}
              </h4>
              <p className="text-[11px] text-gray-300 leading-snug line-clamp-1 mt-0.5 font-normal">
                {currentAd.subtitle}
              </p>
            </div>
          </div>

          <button
            className={`shrink-0 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all border border-white/20 flex items-center gap-1 active:scale-95 shadow-md ${currentAd.accent}`}
          >
            <span>{currentAd.cta}</span>
          </button>
        </div>
      )}
    </div>
  );
}
