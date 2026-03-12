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

        // Check for Auto-Play ID in URL
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

  // 2. PRO SEARCH LOGIC: Filters the list as you type
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
        className="flex items-center text-gray-400 hover:text-geoCyan transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Explore
      </button>

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-4 flex items-center gap-3">
            <PlayCircle className="w-10 h-10" />
            Video Library
          </h1>
          <p className="text-gray-300 text-lg">
            {loading ? "Syncing..." : `Showing ${filteredVideos.length} geographic mysteries.`}
          </p>
        </div>

        {/* --- LIVE SEARCH BAR --- */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-geoCyan transition-colors" />
          <input 
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-geoCyan/50 focus:ring-1 focus:ring-geoCyan/20 transition-all"
          />
        </div>
      </header>

      {/* Video Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVideos.map((video) => (
            <motion.div 
              layout
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {!loading && filteredVideos.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No videos match "{searchTerm}"</p>
          <button onClick={() => setSearchTerm("")} className="text-geoCyan mt-2 hover:underline">
