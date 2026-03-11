import { motion, AnimatePresence } from "motion/react";
import { Play, ArrowLeft, X, ExternalLink } from "lucide-react";
import { useState } from "react";

interface VideoLibraryProps {
  onBack: () => void;
}

interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  youtubeId: string;
}

export default function VideoLibrary({ onBack }: VideoLibraryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const videos: Video[] = [
    {
      id: "1",
      title: "The Truth About the Ilemi Triangle",
      category: "Border Mysteries",
      thumbnail: "https://img.youtube.com/vi/3Zp_vR6P6mI/maxresdefault.jpg",
      youtubeId: "3Zp_vR6P6mI",
    },
    {
      id: "2",
      title: "Why This Island is Shared by Two Countries",
      category: "Enclaves & Exclaves",
      thumbnail: "https://img.youtube.com/vi/qMkYlIA7mgw/maxresdefault.jpg",
      youtubeId: "qMkYlIA7mgw",
    },
    {
      id: "3",
      title: "The Most Complex Border in the World",
      category: "Map Explorations",
      thumbnail: "https://img.youtube.com/vi/gtLxZiiuaXs/maxresdefault.jpg",
      youtubeId: "gtLxZiiuaXs",
    },
    {
      id: "4",
      title: "The Disappearing Sea: A Geographic Tragedy",
      category: "Environmental",
      thumbnail: "https://img.youtube.com/vi/5N-_69785pM/maxresdefault.jpg",
      youtubeId: "5N-_69785pM",
    },
    {
      id: "5",
      title: "The Secret History of Bir Tawil",
      category: "No Man's Land",
      thumbnail: "https://img.youtube.com/vi/4A7NfS8X2X4/maxresdefault.jpg",
      youtubeId: "4A7NfS8X2X4",
    },
    {
      id: "6",
      title: "How Cartography Changed History",
      category: "History",
      thumbnail: "https://img.youtube.com/vi/fLpZ6S8-7Wc/maxresdefault.jpg",
      youtubeId: "fLpZ6S8-7Wc",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full pb-20"
    >
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-geoCyan transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-2">
          Latest Animations & Map Explorations
        </h1>
        <p className="text-gray-300 text-lg">
          Dive into our newest geographical deep-dives and border mysteries.
        </p>
      </header>

      {/* Video Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {videos.map((video) => (
          <motion.div 
            key={video.id}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setHoveredVideoId(video.id)}
            onMouseLeave={() => setHoveredVideoId(null)}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-geoCyan transition-colors duration-300 flex flex-col group"
          >
            {/* Thumbnail / Preview */}
            <div 
              className="relative h-48 overflow-hidden cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <AnimatePresence mode="wait">
                {hoveredVideoId === video.id ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 pointer-events-none"
                  >
                    <iframe 
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                      className="w-full h-full scale-[1.3]"
                      frameBorder="0"
                      allow="autoplay"
                    ></iframe>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center z-20">
                <div className="w-14 h-14 rounded-full bg-geoCyan/90 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-lg">
                  <Play className="w-6 h-6 text-gray-900 fill-current ml-1" />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
              <span className="text-xs text-geoYellow font-bold uppercase tracking-wider mb-2">
                {video.category}
              </span>
              <h3 
                className="text-white text-xl font-bold mb-3 line-clamp-2 group-hover:text-geoCyan transition-colors cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {video.title}
              </h3>
              
              <div className="mt-auto flex gap-2">
                <button 
                  onClick={() => setSelectedVideo(video)}
                  className="flex-grow inline-block text-center bg-geoCyan text-gray-900 py-2 rounded font-bold transition-all hover:bg-geoYellow flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play Now
                </button>
                <a 
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center transition-colors"
                  title="Watch on YouTube"
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
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
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
