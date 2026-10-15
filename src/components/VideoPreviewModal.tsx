import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, ExternalLink, MapPin, Play, Share2, X } from "lucide-react";
import { VideoItem } from "../data/videos";

interface VideoPreviewModalProps {
  video: VideoItem;
  onClose: () => void;
  onViewMap: () => void;
}

export default function VideoPreviewModal({ video, onClose, onViewMap }: VideoPreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}?preview=${video.id}`;
  const shareText = `${video.title} ${shareUrl}`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isShareOpen) setIsShareOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isShareOpen, onClose]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const openShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, text: video.description, url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setIsShareOpen(true);
  };

  const content = (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={video.title}
        className="video-preview-dialog video-preview-scroll relative my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/15 bg-[#080d17] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-full border border-geoCyan/30 bg-geoCyan/10 px-2.5 py-1 text-[10px] font-bold uppercase text-geoCyan">
              {video.category}
            </span>
            <span className="truncate text-xs font-medium text-gray-400">{video.region}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-white"
              title="Open on YouTube"
              aria-label="Open on YouTube"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white" aria-label="Close preview">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="video-preview-media relative aspect-video w-full bg-black">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt={video.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center"
                aria-label={`Play ${video.title}`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-geoCyan text-gray-950 shadow-xl transition-transform hover:scale-110">
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </span>
              </button>
            </>
          )}
        </div>

        <div className="video-preview-details p-4 sm:p-6">
          <h2 className="mb-2 text-lg font-bold text-white sm:text-xl">{video.title}</h2>
          <div className="mb-5 max-h-36 overflow-y-auto pr-1 video-preview-scroll">
            <p className="text-sm leading-relaxed text-gray-400">{video.description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
            <span className="flex items-center gap-2 font-mono text-xs text-gray-400">
              <MapPin className="h-3.5 w-3.5 text-geoCyan" />
              Coordinates: {video.lat.toFixed(3)}°, {video.lng.toFixed(3)}°
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={openShare}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share Link
              </button>
              <button
                onClick={onViewMap}
                className="flex items-center gap-1.5 rounded-full bg-geoCyan px-4 py-2 text-xs font-bold text-gray-950 transition-colors hover:bg-geoYellow"
              >
                <MapPin className="h-3.5 w-3.5" />
                View on Map
              </button>
            </div>
          </div>
        </div>

        {isShareOpen && (
          <div
            className="fixed inset-0 z-[10002] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onClick={() => setIsShareOpen(false)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Share video"
              className="w-full max-w-xl rounded-t-2xl border border-white/10 bg-[#202020] p-5 text-white shadow-2xl sm:rounded-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Share video</h3>
                <button onClick={() => setIsShareOpen(false)} aria-label="Close share dialog">
                  <X className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="mb-6 grid grid-cols-5 gap-2 text-center text-[11px]">
                <button onClick={() => copyText(`<iframe src="https://www.youtube.com/embed/${video.youtubeId}" allowfullscreen></iframe>`)} className="flex flex-col items-center gap-2 text-gray-300 hover:text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-700">&lt;&gt;</span>
                  Embed
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-gray-300 hover:text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20c966] text-xl font-bold">W</span>
                  WhatsApp
                </a>
                <a href={`sms:?body=${encodeURIComponent(shareText)}`} className="flex flex-col items-center gap-2 text-gray-300 hover:text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-blue-700">M</span>
                  Messages
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-gray-300 hover:text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4267b2] text-2xl font-bold">f</span>
                  Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-gray-300 hover:text-white">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-xl font-bold">X</span>
                  X
                </a>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111] p-2 pl-3">
                <input value={shareUrl} readOnly aria-label="Share link" className="min-w-0 flex-1 bg-transparent text-sm text-gray-200 outline-none" />
                <button onClick={() => copyText(shareUrl)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold hover:bg-white/10">
                  {copied ? <Check className="h-3.5 w-3.5 text-geoCyan" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );

  return createPortal(content, document.body);
}