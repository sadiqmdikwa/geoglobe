import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function SpinningGlobe() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 15, y: 30 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative w-full aspect-square max-w-[420px] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing select-none group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onClick={() => navigate("/map")}
      title="Click or drag to spin the globe!"
    >
      {/* Outer Rotating Star/Text Ring */}
      <div className="absolute inset-0 animate-[spin_35s_linear_infinite] pointer-events-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 400">
          <defs>
            <path id="globePath" d="M 50, 200 a 150,150 0 1,1 300,0 a 150,150 0 1,1 -300,0" />
          </defs>
          <text className="text-[11px] font-mono tracking-[0.3em] uppercase opacity-85" fill="#F4D03F">
            <textPath href="#globePath" startOffset="0%">
              ★ GEO-GLOBE ★ EXPLORATION ★ DISCOVERY ★ MAPPING THE WORLD ★
            </textPath>
          </text>
        </svg>
      </div>

      {/* 3D Globe Sphere container */}
      <div
        className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] rounded-full bg-gradient-to-br from-[#122b39] via-[#0b1c28] to-[#060f16] border-2 border-geoCyan/30 shadow-[0_0_60px_rgba(66,194,203,0.25)] overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Latitude / Longitude Grid Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(66,194,203,0.18)_0,transparent_70%)]"></div>
        <div className="absolute inset-0 border border-geoCyan/25 rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-geoCyan/30 absolute"></div>
          <div className="h-full w-[1px] bg-geoCyan/30 absolute"></div>
          <div className="w-[85%] h-[85%] rounded-full border border-dashed border-geoCyan/20 absolute"></div>
          <div className="w-[60%] h-[60%] rounded-full border border-geoCyan/20 absolute"></div>
        </div>

        {/* Interactive Glowing Pins / Nodes */}
        <div className="absolute top-[30%] left-[45%] w-4 h-4 bg-geoYellow rounded-full shadow-[0_0_15px_#F4D03F] animate-ping"></div>
        <div className="absolute top-[30%] left-[45%] w-3.5 h-3.5 bg-geoYellow rounded-full shadow-[0_0_10px_#F4D03F]"></div>

        <div className="absolute top-[55%] left-[25%] w-4 h-4 bg-geoCyan rounded-full shadow-[0_0_15px_#42C2CB] animate-pulse"></div>
        <div className="absolute top-[55%] left-[25%] w-3 h-3 bg-geoCyan rounded-full shadow-[0_0_10px_#42C2CB]"></div>

        <div className="absolute top-[45%] left-[70%] w-3.5 h-3.5 bg-rose-400 rounded-full shadow-[0_0_12px_#fb7185]"></div>
        <div className="absolute top-[65%] left-[60%] w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_12px_#34d399]"></div>

        {/* Center Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-geoCyan/5 to-transparent pointer-events-none"></div>
      </div>

      {/* Explore Hint Badge */}
      <div className="absolute -bottom-3 bg-gray-950/90 border border-geoCyan/40 text-geoCyan px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-3 h-3 text-geoYellow animate-spin" />
        <span>Drag to Spin Globe</span>
      </div>
    </div>
  );
}
