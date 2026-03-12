import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, PlayCircle, ExternalLink, X, MapPin, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VideoLibrary({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. PASTE YOUR GOOGLE SHEET CSV LINK HERE 👇
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?output=csv";

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        
        const parsedVideos = rows.map((row, index) => {
          const columns = row.split(',');
          if (columns.length < 5) return null;

          return {
            id: index,
            title: columns[1]?.replace(/"/g, ""),
            lat: parseFloat(columns[2]),
            lng: parseFloat(columns[3]),
            youtubeId: columns[4]?.replace(/"/g, "").trim(),
          };
        }).filter(v => v !== null);

        const reversedVideos = parsedVideos.reverse();
        setVideos(reversedVideos);

        const videoIdFromUrl = searchParams.get('id');
        if (videoIdFromUrl) {
          const autoVideo = reversedVideos.find(v => v.youtubeId === videoIdFromUrl);
          if (autoVideo) setSelectedVideo(autoVideo);
        }

      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchParams]);

  const filteredVideos = useMemo(() => {
    return videos.filter(video => 
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, videos]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-20 relative"
    >
      <button 
        onClick={handleBack}
        className="flex items-center text-gray-400 hover:text-geoCyan transition-colors mb-8 group font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Explore
      </button>

      {/* --- PRO HEADER SECTION --- */}
      <header className="mb-12 border-b border-white/5 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl text-white font-bold tracking-tight flex items-center gap-4">
              <span className="p-2 bg-geoCyan/10 rounded-xl">
                <PlayCircle className="w-8 h-8 md:w-10 md:h-10 text-geoCyan" />
              </span>
              Video Library
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              {loading ? "Syncing database..." : `Exploring ${filteredVideos.length} geographical anomalies.`}
            </p>
          </div>

          {/* REFINED SEARCH BAR POSITION */}
          <div className="relative w-full lg:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500 group-focus-within:text-geoCyan transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-geoCyan/40 focus:bg-gray-900/60 transition-all shadow-inner"
            />
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredVideos.map((video) => (
            <motion.div 
              layout
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -8 }}
              className="bg-gray-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-geoCyan/20 transition-all group cursor-pointer flex flex-col shadow-lg"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                <img 
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-geoCyan w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                    <PlayCircle className="text-gray-900 w-8 h-8 ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-geoCyan transition-colors line-clamp-1">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center text-gray-500 text-xs font-mono tracking-wider gap-2">
                    <MapPin className="w-3 h-3 text-geoCyan/50" />
                    {video.lat.toFixed(2)}°N, {video.lng.toFixed(2)}°E
                  </div>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-geoCyan hover:text-black text-white rounded-lg transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty Search State */}
      {!loading && filteredVideos.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32"
        >
          <div className="inline-block p-6 rounded-full bg-gray-900/50 mb-4 text-gray-600">
            <Search className="w-12 h-12" />
          </div>
          <p className="text-xl text-gray-400 font-medium">No results found for "{searchTerm}"</p>
          <button 
            onClick={() => setSearchTerm("")} 
            className="text-geoCyan mt-3 hover:text-white transition-colors underline underline-offset-4"
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-10"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 z-20 bg-black/60 hover:bg-geoCyan hover:text-black text-white p-3 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
