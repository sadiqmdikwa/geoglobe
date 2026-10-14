import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  ArrowLeft, 
  X, 
  ExternalLink, 
  Search, 
  Share2, 
  Check, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  SlidersHorizontal,
  Film,
  MapPin,
  Compass
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { initialVideos, VideoItem } from "../data/videos";
import { VideoLibrarySkeleton } from "./skeletons/VideoCardSkeleton";

interface VideoLibraryProps {
  onBack: () => void;
}

const ITEMS_PER_PAGE = 12; // 4 rows x 3 cols on desktop, 6 rows x 2 cols on mobile

export default function VideoLibrary({ onBack }: VideoLibraryProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Extract unique categories & regions
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(initialVideos.map((v) => v.category)))];
  }, []);

  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(initialVideos.map((v) => v.region)))];
  }, []);

  // Handle URL Deep-Linking for auto-opening modal
  useEffect(() => {
    const playId = searchParams.get("play");
    if (playId) {
      const matched = initialVideos.find((v) => v.youtubeId === playId);
      if (matched) {
        setActiveVideo(matched);
      }
    }
  }, [searchParams]);

  // Simulate ultra-smooth initial fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    let result = initialVideos.filter((video) => {
      const matchesSearch =
        q === "" ||
        video.title.toLowerCase().includes(q) ||
        video.description.toLowerCase().includes(q) ||
        video.region.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" || video.category === selectedCategory;

      const matchesRegion =
        selectedRegion === "All" || video.region === selectedRegion;

      return matchesSearch && matchesCategory && matchesRegion;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "title-desc") return b.title.localeCompare(a.title);
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id); // "newest" by default
    });

    return result;
  }, [searchTerm, selectedCategory, selectedRegion, sortBy]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedRegion, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVideos = useMemo(() => {
    return filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVideos, startIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (catalogTopRef.current) {
        catalogTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedRegion("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveDropdownFilters = selectedCategory !== "All" || selectedRegion !== "All";
  const isFiltered = searchTerm !== "" || selectedCategory !== "All" || selectedRegion !== "All" || sortBy !== "newest";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20"
    >
      {/* Toast Notification on Share Link Copy */}
      <AnimatePresence>
        {copiedVideoId && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-geoCyan text-gray-950 font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Direct Video Link Copied to Clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Navigation: Sleek Circular Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/15 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/50 active:scale-95 shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="text-xs text-gray-400 bg-gray-900/40 px-4 py-2 rounded-full border border-white/15 backdrop-blur-xl hidden sm:flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-geoYellow" />
          <span>Curated Cartographic Documentaries</span>
        </div>
      </div>

      {/* Page Title Header */}
      <header className="mb-6 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-2 tracking-tight">
          Video Library
        </h1>
        <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
          High-production map animations, frontier documentaries, and geopolitical deep-dives. Filter by region, topic, or search directly.
        </p>
      </header>

      {/* Google-Style Circular & Transparent Search & Filter Bar */}
      <div className="mb-8">
        {/* Row 1: Search Box + Search Button + Filter Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Circular Google-Style Transparent Search Box */}
          <div className="relative flex-1 flex items-center bg-gray-900/30 hover:bg-gray-900/50 focus-within:bg-gray-900/65 border border-white/15 focus-within:border-geoCyan/60 focus-within:ring-2 focus-within:ring-geoCyan/20 rounded-full transition-all backdrop-blur-xl shadow-lg px-4 py-2 sm:py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0 mr-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, region, country, or topic..."
              className="w-full bg-transparent outline-none text-white text-xs sm:text-sm placeholder-gray-400/70"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-white transition-colors p-1 ml-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Action Button (Circular Pill) */}
          <button
            onClick={() => {
              if (catalogTopRef.current) {
                catalogTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Filter Toggle Button (Circular Pill) */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs font-semibold border backdrop-blur-xl transition-all shrink-0 ${
              isFilterOpen || hasActiveDropdownFilters
                ? "bg-geoCyan/15 border-geoCyan text-geoCyan"
                : "bg-gray-900/30 border-white/15 text-gray-300 hover:text-white hover:border-white/30"
            }`}
            title="Toggle Region and Category Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveDropdownFilters && (
              <span className="w-2 h-2 rounded-full bg-geoYellow"></span>
            )}
          </button>

          {/* Reset Filters when active (Circular Pill) */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="bg-gray-900/30 hover:bg-white/10 text-gray-300 hover:text-white border border-white/15 w-10 h-10 rounded-full transition-colors flex items-center justify-center shrink-0 backdrop-blur-xl"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Animated Expandable Filter Row (Region & Category) */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 pb-1">
                {/* Category Dropdown */}
                <div className="flex items-center gap-2 bg-gray-900/40 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                    Category:
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent text-white text-xs md:text-sm outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-[#0f172a] text-white">All Categories</option>
                    {categories.filter(c => c !== "All").map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0f172a] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region Dropdown */}
                <div className="flex items-center gap-2 bg-gray-900/40 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                    Region:
                  </span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-transparent text-white text-xs md:text-sm outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-[#0f172a] text-white">All Regions</option>
                    {regions.filter(r => r !== "All").map((reg) => (
                      <option key={reg} value={reg} className="bg-[#0f172a] text-white">
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: Archive Index + Sort By */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-geoCyan" />
            <span>Archive Index: <strong className="text-white font-mono">{filteredVideos.length}</strong> documentaries found</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900/40 border border-white/15 text-gray-200 text-xs px-3 py-1 rounded-full focus:border-geoCyan outline-none cursor-pointer backdrop-blur-xl"
            >
              <option value="newest" className="bg-[#0f172a] text-white">Newest First</option>
              <option value="oldest" className="bg-[#0f172a] text-white">Oldest First</option>
              <option value="title-asc" className="bg-[#0f172a] text-white">Title (A–Z)</option>
              <option value="title-desc" className="bg-[#0f172a] text-white">Title (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      <div ref={catalogTopRef} className="scroll-mt-24" />

      {/* Summary Header & Top Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-1 mb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Video Archive
          </h2>
          <span className="text-xs font-mono bg-white/5 text-geoCyan px-3 py-1 rounded-full border border-white/10">
            {filteredVideos.length === 0 ? "0 items" : `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filteredVideos.length)} of ${filteredVideos.length}`}
          </span>
        </div>

        {/* Top Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-full bg-gray-900/40 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors backdrop-blur-md"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-geoCyan text-gray-950 shadow-md"
                    : "bg-gray-900/40 text-gray-400 hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-full bg-gray-900/40 text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors backdrop-blur-md"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeletons vs Real Video Grid */}
      {isLoading ? (
        <VideoLibrarySkeleton count={ITEMS_PER_PAGE} />
      ) : paginatedVideos.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-gray-900/30 backdrop-blur-md">
          <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">No Documentaries Match Your Filter</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-5">
            Try adjusting your search query, or clear filters to browse all cartographic expeditions.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 bg-geoCyan text-gray-950 font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider hover:bg-geoYellow transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      ) : (
        /* 4 rows x 3 columns on desktop (12 items) / 2 columns on mobile */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6"
        >
          {paginatedVideos.map((video) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              className="group bg-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-geoCyan/50 hover:shadow-[0_0_25px_rgba(66,194,203,0.15)] flex flex-col transition-all duration-300"
            >
              {/* Thumbnail Area with 16:9 Aspect Ratio */}
              <div
                onClick={() => {
                  setActiveVideo(video);
                  setSearchParams({ play: video.youtubeId });
                }}
                className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/30 pointer-events-none" />

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="w-11 h-11 md:w-13 md:h-13 bg-geoCyan/90 text-gray-950 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Category & Region Badge */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="bg-gray-950/85 text-geoCyan border border-geoCyan/30 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm">
                    {video.category}
                  </span>
                  <span className="hidden sm:inline bg-gray-950/85 text-gray-300 border border-white/10 text-[9px] md:text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-md">
                    {video.region}
                  </span>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2.5 right-2.5 bg-black/85 text-gray-200 text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-3.5 md:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => {
                      setActiveVideo(video);
                      setSearchParams({ play: video.youtubeId });
                    }}
                    className="text-white text-xs sm:text-sm md:text-base font-bold line-clamp-2 leading-snug group-hover:text-geoCyan transition-colors cursor-pointer mb-1.5"
                    title={video.title}
                  >
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-[11px] md:text-xs line-clamp-2 leading-relaxed mb-3">
                    {video.description}
                  </p>
                </div>

                {/* Footer Controls: Watch + View on Map + Quick Share */}
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-1.5 sm:gap-2 mt-auto">
                  <button
                    onClick={() => {
                      setActiveVideo(video);
                      setSearchParams({ play: video.youtubeId });
                    }}
                    className="flex-1 bg-white/5 hover:bg-geoCyan hover:text-gray-950 text-white font-semibold text-[11px] md:text-xs py-1.5 px-3 rounded-full border border-white/10 hover:border-geoCyan transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch</span>
                  </button>

                  {/* Jump directly to map with coordinates */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/map?lat=${video.lat}&lng=${video.lng}&id=${video.id}&title=${encodeURIComponent(video.title)}&from=videos`);
                    }}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-geoCyan hover:text-gray-950 text-gray-400 border border-white/10 transition-colors"
                    title="View location on map"
                    aria-label="View on map"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareUrl = `${window.location.origin}${window.location.pathname}#/videos?play=${video.youtubeId}`;
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedVideoId(video.id);
                      setTimeout(() => setCopiedVideoId(null), 2500);
                    }}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                    title="Copy direct share link"
                    aria-label="Share video link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Bottom Pagination Bar - Frameless border-free styling */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-full bg-gray-900/40 backdrop-blur-xl">
          <div className="text-xs text-gray-400 px-3">
            Showing <strong className="text-white font-mono">{startIndex + 1}</strong> to{" "}
            <strong className="text-white font-mono">{Math.min(startIndex + ITEMS_PER_PAGE, filteredVideos.length)}</strong> of{" "}
            <strong className="text-white font-mono">{filteredVideos.length}</strong> documentaries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gray-900/50 text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-geoCyan text-gray-950 shadow-md"
                    : "bg-gray-900/50 text-gray-400 hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gray-900/50 text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen HD Video Player Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
            onClick={() => {
              setActiveVideo(null);
              setSearchParams({});
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-4xl bg-gray-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-gray-950/80">
                <div className="flex items-center gap-2">
                  <span className="bg-geoCyan/20 text-geoCyan border border-geoCyan/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {activeVideo.category}
                  </span>
                  <span className="text-gray-400 text-xs font-medium hidden sm:inline">
                    {activeVideo.region}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-geoCyan transition-colors p-1"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setActiveVideo(null);
                      setSearchParams({});
                    }}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Responsive 16:9 Video Embed */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Details Footer */}
              <div className="p-4 sm:p-6 bg-gray-950">
                <h2 className="text-white text-base sm:text-xl font-bold mb-2">
                  {activeVideo.title}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                  {activeVideo.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
                  {/* Clickable Coordinates leading to map */}
                  <button
                    onClick={() => {
                      const v = activeVideo;
                      setActiveVideo(null);
                      setSearchParams({});
                      navigate(`/map?lat=${v.lat}&lng=${v.lng}&id=${v.id}&title=${encodeURIComponent(v.title)}&from=videos`);
                    }}
                    className="text-gray-400 hover:text-geoCyan font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="View coordinates on map"
                  >
                    <Compass className="w-3.5 h-3.5 text-geoCyan" />
                    <span>Coordinates: {activeVideo.lat.toFixed(3)}°, {activeVideo.lng.toFixed(3)}°</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}${window.location.pathname}#/videos?play=${activeVideo.youtubeId}`;
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedVideoId(activeVideo.id);
                        setTimeout(() => setCopiedVideoId(null), 2500);
                      }}
                      className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/15 text-white px-3.5 py-1.5 rounded-full border border-white/10 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </button>

                    {/* View on Map Button */}
                    <button
                      onClick={() => {
                        const v = activeVideo;
                        setActiveVideo(null);
                        setSearchParams({});
                        navigate(`/map?lat=${v.lat}&lng=${v.lng}&id=${v.id}&title=${encodeURIComponent(v.title)}&from=videos`);
                      }}
                      className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-4 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
