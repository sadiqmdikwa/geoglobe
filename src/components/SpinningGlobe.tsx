import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Globe, { GlobeInstance } from "globe.gl";
import { Sparkles } from "lucide-react";

export default function SpinningGlobe() {
  const navigate = useNavigate();
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<GlobeInstance | null>(null);

  useEffect(() => {
    if (!globeRef.current) return;

    const globe = Globe()(globeRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#42C2CB")
      .atmosphereAltitude(0.2)
      .width(320)
      .height(320);

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enableZoom = false;
    controls.enableRotate = false;

    globeInstance.current = globe;

    return () => {
      try {
        if (globeRef.current) globeRef.current.innerHTML = "";
      } catch (e) {
        // cleanup
      }
    };
  }, []);

  return (
    <div
      className="relative w-full aspect-square max-w-[360px] mx-auto flex items-center justify-center cursor-pointer group"
      onClick={() => navigate("/explorer")}
      title="Click to open 3D Globe Explorer"
    >
      {/* Outer Rotating Star/Text Ring */}
      <div className="absolute inset-0 animate-[spin_35s_linear_infinite] pointer-events-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 400">
          <defs>
            <path id="globePath" d="M 50, 200 a 150,150 0 1,1 300,0 a 150,150 0 1,1 -300,0" />
          </defs>
          <text className="text-[11px] font-mono tracking-[0.3em] uppercase opacity-90" fill="#F4D03F">
            <textPath href="#globePath" startOffset="0%">
              ★ GEO-GLOBE ★ 3D WORLD ATLAS ★ EXPLORE COUNTRIES ★
            </textPath>
          </text>
        </svg>
      </div>

      {/* 3D Globe Container */}
      <div className="relative rounded-full overflow-hidden shadow-[0_0_50px_rgba(66,194,203,0.3)] border-2 border-geoCyan/40 group-hover:scale-105 transition-transform duration-300">
        <div ref={globeRef} className="w-[280px] h-[280px] md:w-[320px] md:h-[320px]" />
      </div>

      {/* Explore Hint Badge */}
      <div className="absolute -bottom-2 bg-gray-950/90 border border-geoCyan/40 text-geoCyan px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-3 h-3 text-geoYellow animate-spin" />
        <span>Click to Open 3D Globe</span>
      </div>
    </div>
  );
}
