import { Compass, Loader2 } from "lucide-react";

export default function MapSkeleton() {
  return (
    <div className="w-full relative">
      <div className="rounded-[2.5rem] border border-white/10 p-4 bg-gray-900/60 shadow-2xl backdrop-blur-xl">
        <div className="w-full h-[450px] md:h-[620px] rounded-[2rem] overflow-hidden bg-slate-950 relative flex items-center justify-center border border-white/5 shadow-inner">
          {/* Subtle Cartographic Grid Background */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#42C2CB_1px,transparent_1px),linear-gradient(to_bottom,#42C2CB_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-geoCyan/5 to-transparent animate-[shimmer_3s_infinite] -translate-x-full"></div>

          {/* Simulated Continents / Elevation Silhouette Glows */}
          <div className="absolute w-72 h-72 rounded-full bg-geoCyan/10 blur-[90px] top-1/4 left-1/4 animate-pulse"></div>
          <div className="absolute w-64 h-64 rounded-full bg-geoYellow/5 blur-[80px] bottom-1/4 right-1/4 animate-pulse" style={{ animationDelay: "1s" }}></div>

          {/* Simulated Pulsing Pins */}
          <div className="absolute top-1/3 left-1/3 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-geoCyan/20 animate-ping absolute"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-geoCyan border-2 border-slate-900 shadow-[0_0_12px_#42C2CB]"></div>
          </div>
          <div className="absolute top-1/2 right-1/3 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-geoCyan/20 animate-ping absolute" style={{ animationDelay: "0.6s" }}></div>
            <div className="w-3.5 h-3.5 rounded-full bg-geoCyan border-2 border-slate-900 shadow-[0_0_12px_#42C2CB]"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/2 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-geoYellow/20 animate-ping absolute" style={{ animationDelay: "1.2s" }}></div>
            <div className="w-3.5 h-3.5 rounded-full bg-geoYellow border-2 border-slate-900 shadow-[0_0_12px_#F4D03F]"></div>
          </div>

          {/* Top-Right Simulated Map Controls Skeleton */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            <div className="w-9 h-9 bg-gray-900/80 border border-white/10 rounded-xl animate-pulse"></div>
            <div className="w-9 h-9 bg-gray-900/80 border border-white/10 rounded-xl animate-pulse"></div>
          </div>

          {/* Bottom-Left Simulated Coordinates HUD */}
          <div className="absolute bottom-6 left-6 z-10 bg-gray-900/80 border border-white/10 px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-gray-400 flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-geoCyan animate-ping"></span>
            <span>GPS: 20.0000° N, 15.0000° E</span>
          </div>

          {/* Center Loading Status Badge */}
          <div className="relative z-10 flex flex-col items-center bg-gray-900/90 border border-geoCyan/30 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl max-w-xs text-center">
            <div className="relative mb-3">
              <Compass className="w-10 h-10 text-geoCyan animate-[spin_8s_linear_infinite]" />
              <Loader2 className="w-4 h-4 text-geoYellow animate-spin absolute -bottom-1 -right-1" />
            </div>
            <h4 className="text-white font-bold text-sm tracking-wide">
              Loading Interactive Map
            </h4>
            <p className="text-gray-400 text-xs mt-1">
              Plotting global coordinate pins...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
