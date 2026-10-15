import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2, AlertCircle, Loader2, Compass, ArrowRight } from "lucide-react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxYhRfD4jSTFm1b_cAmPDtq_NYuNi0NxoqMN-ciY5VyJ2Idc8ojGqhyf6sJvFjxrzHsg/exec";

export default function AboutContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Feedback",
    message: ""
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim()
        }),
      });

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "General Feedback",
        message: ""
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      setStatus("error");
      setErrorMessage("Unable to send message at this moment. Please try again or reach out directly via email.");
    }
  };

  const socialLinks = [
    {
      name: "Email",
      url: "mailto:sadiqmdikwa@gmail.com",
      iconClass: "fa-solid fa-envelope"
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/sadiq-muhammad-mustapha-90442b314",
      iconClass: "fa-brands fa-linkedin"
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/sadiq_m_dkw",
      iconClass: "fa-brands fa-x-twitter"
    },
    {
      name: "Substack",
      url: "https://substack.com/@sadiqmdikwa",
      iconClass: "fa-solid fa-bookmark"
    },
    {
      name: "Instagram",
      url: "https://instagram.com/sadiq_m_dikwa",
      iconClass: "fa-brands fa-instagram"
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@sadiq_m_dikwa",
      iconClass: "fa-brands fa-tiktok"
    },
    {
      name: "Snapchat",
      url: "https://snapchat.com/add/sadiqmdkw",
      iconClass: "fa-brands fa-snapchat"
    },
    {
      name: "Pinterest",
      url: "https://pinterest.com/sadiq_m_dikwa",
      iconClass: "fa-brands fa-pinterest"
    },
    {
      name: "Reddit",
      url: "https://reddit.com/user/sadiq_m_dikwa",
      iconClass: "fa-brands fa-reddit"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full pb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: About GeoGlobe & Founder Bio */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-6 tracking-tight">
            About GeoGlobe
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
            GeoGlobe is a digital cartography and spatial storytelling platform that transforms complex geopolitical data into clear, visual narratives. Through coordinate-mapped documentaries, interactive web mapping, and dynamic trivia challenges, we make global geography both accessible and deeply engaging. From disputed borders and territorial anomalies to regional insights, GeoGlobe offers a modern lens for exploring our world.
          </p>

          <h2 className="text-geoYellow font-bold text-xl md:text-2xl mb-3">
            Meet the Founder
          </h2>
          <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
            GeoGlobe was founded by Sadiq Muhammad Mustapha (Arshavin), a GIS Specialist, CAD Drafter, and Map Animator. Blending technical precision in spatial analysis, architectural drafting, and modern web development with cinematic motion design, Sadiq built GeoGlobe to turn intricate geographical data into an interactive experience for global explorers.
          </p>

          <div className="mb-8">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-geoCyan/10 border border-geoCyan/30 text-geoCyan hover:bg-geoCyan hover:text-gray-950 transition-all text-xs font-semibold"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Sadiq's GIS, CAD & Animation Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Social Pill Buttons (All 9 Links) */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
              Connect with Sadiq
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/40 border border-white/5 hover:border-geoCyan/40 hover:bg-white/5 text-gray-400 hover:text-white transition-all px-5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2.5 shadow-sm"
                >
                  <i className={`${link.iconClass} text-geoCyan text-base`}></i>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Professional Glassmorphic Contact Form */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl w-full">
          {status === "success" ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[360px] flex flex-col items-center justify-center text-center p-6 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
              <p className="text-gray-300 text-sm max-w-sm leading-relaxed">
                Thank you for reaching out. Sadiq has received your message and will review it shortly.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-8 py-3 rounded-full transition-all text-sm mt-4 shadow-md"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-geoCyan block mb-1">
                  Inquiries & Suggestions
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Get in Touch
                </h2>
              </div>

              {status === "error" && (
                <div className="mb-6 p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-200 text-xs md:text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{errorMessage || "An error occurred while submitting."}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Your Name <span className="text-geoCyan">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Your Email <span className="text-geoCyan">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all text-sm cursor-pointer shadow-inner"
                  >
                    <option value="General Feedback">General Feedback</option>
                    <option value="Topic Suggestion">Topic Suggestion</option>
                    <option value="Business Inquiry">Business Inquiry</option>
                    <option value="Bug Report">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Message <span className="text-geoCyan">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind or suggest a topic..."
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white p-5 rounded-3xl transition-all placeholder-gray-500 resize-none text-sm shadow-inner video-preview-scroll"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold text-sm md:text-base py-4 rounded-full transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-geoCyan/20 disabled:opacity-50 cursor-pointer"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
