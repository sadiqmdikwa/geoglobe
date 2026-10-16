import { useEffect } from "react";

interface AdBannerProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

export default function AdBanner({ slotId = "1234567890", format = "auto", className = "" }: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      // AdSense script will load once approved
    }
  }, []);

  return (
    <div className={`w-full max-w-lg mx-auto bg-gray-900/60 backdrop-blur-xl rounded-3xl p-3 border border-white/10 shadow-lg text-center overflow-hidden my-6 ${className}`}>
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
        ADVERTISEMENT
      </span>
      {/* Google AdSense Unit Container */}
      <div className="min-h-[90px] flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 p-2">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client="ca-pub-0000000000000000"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
}
