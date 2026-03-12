import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, PlayCircle, ExternalLink, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VideoLibrary({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. PASTE YOUR GOOGLE SHEET CSV LINK HERE 👇
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?output=csv";

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        
        // Parse CSV Rows
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
            description: "Live discovery from the GeoGlobe database."
          };
        }).filter(v => v !== null);

        // Reverse so newest videos appear first!
        setVideos(parsedVideos.reverse());
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
        className="flex items-center text-gray-400 hover:text-geoCyan transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Explore
      </button>

      <header className="mb-10">
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-4 flex items-center gap-3">
          <PlayCircle className="w-10 h-10" />
          Video Library
        </h1>
        <p className="text-gray-300 text-lg">
          {loading ? "Syncing with live database..." : "Explore our collection of geographic mysteries."}
        </p>
      </header>

      {/* Video Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <motion.div 
            key={video.id}
            whileHover={{ y: -5 }}
            className="bg-gray-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-geoCyan/30 transition-all group cursor-pointer flex flex-col"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video relative overflow-hidden bg-black">
              <img 
                src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-geoCyan/90 w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-[0_0_20px_rgba(0,255,255,0.5)]">
                  <PlayCircle className="text-gray-900 w-8 h-8 ml-1" />
                </div>
              </div>
            </div>

            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-geoCyan transition-colors">
                {video.title}
              </h3>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-gray-500 text-xs gap-1">
                  <MapPin className="w-3 h-3" />
                  {video.lat.toFixed(1)}, {video.lng.toFixed(1)}
                </div>
                
                <a 
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setSelectedVideo(null)}
            ></div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full relative z-10"
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
