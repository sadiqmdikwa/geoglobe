import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Send, Loader2 } from "lucide-react";

export default function AboutContact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxYhRfD4jSTFm1b_cAmPDtq_NYuNi0NxoqMN-ciY5VyJ2Idc8ojGqhyf6sJvFjxrzHsg/exec";

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(data), 
      });

      setTimeout(() => {
        setStatus('success');
        form.reset();
      }, 1500);
      
    } catch (error) {
      console.error("Transmission error:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full pb-20 pt-8 max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: About Information */}
        <div className="space-y-10">
          <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl text-white font-bold tracking-tight">
              About GeoGlobe
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              GeoGlobe is an interactive educational platform designed to make geography accessible, visual, and engaging. By combining interactive maps, curated video content, and gamified learning experiences, we aim to bridge the gap between complex geopolitical data and everyday curiosity. Whether you are exploring border anomalies or testing your knowledge, GeoGlobe provides a modern approach to learning about our world.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Meet the Founder
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              GeoGlobe was founded by <span className="text-white font-medium">Sadiq Muhammad Mustapha</span>, a software developer and geography enthusiast. Combining technical expertise in modern web development with a deep passion for cartography and global cultures, Sadiq built GeoGlobe to provide a clean, user-friendly interface for geography lovers to explore the world's stories.
            </p>
          </section>

          <section className="space-y-5 pt-4">
            <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">
              Connect
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Email', icon: 'fa-envelope', link: 'mailto:sadiqmdikwa@gmail.com' },
                { name: 'LinkedIn', icon: 'fa-linkedin', link: 'https://linkedin.com/in/sadiq-muhammad-mustapha-90442b314' },
                { name: 'X (Twitter)', icon: 'fa-x-twitter', link: 'https://x.com/sadiq_m_dkw' },
                { name: 'Instagram', icon: 'fa-instagram', link: 'https://instagram.com/sadiq_m_dikwa' },
                { name: 'TikTok', icon: 'fa-tiktok', link: 'https://tiktok.com/@sadiq_m_dikwa' },
                { name: 'Snapchat', icon: 'fa-snapchat', link: 'https://snapchat.com/add/sadiqmdkw' },
                { name: 'Pinterest', icon: 'fa-pinterest', link: 'https://pinterest.com/sadiq_m_dikwa' },
                { name: 'Reddit', icon: 'fa-reddit', link: 'https://reddit.com/user/sadiq_m_dikwa' },
                { name: 'Substack', icon: 'fa-bookmark', link: 'https://substack.com/@sadiqmdikwa' }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800/50 border border-gray-700 hover:border-geoCyan hover:bg-gray-800 text-gray-300 hover:text-white transition-all px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <i className={`${social.icon === 'fa-envelope' || social.icon === 'fa-bookmark' ? 'fa-solid' : 'fa-brands'} ${social.icon} text-base`}></i> 
                  {social.name}
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-800 shadow-xl w-full">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 min-h-[350px] flex flex-col items-center justify-center text-center space-y-4"
              >
                <CheckCircle2 className="w-12 h-12 text-geoCyan mx-auto mb-2" />
                <h2 className="text-2xl font-semibold text-white tracking-tight">Message Sent</h2>
                <p className="text-gray-400 text-base">Thank you for reaching out. I will get back to you shortly.</p>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="mt-6 text-sm font-medium text-geoCyan hover:text-white transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl text-white font-semibold mb-6 tracking-tight">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Name</label>
                      <input name="name" type="text" placeholder="John Doe" required className="w-full bg-gray-800/50 border border-gray-700 focus:border-geoCyan focus:ring-1 focus:ring-geoCyan outline-none text-white px-4 py-2.5 rounded-lg transition-all text-sm placeholder-gray-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">Email Address</label>
                      <input name="email" type="email" placeholder="john@example.com" required className="w-full bg-gray-800/50 border border-gray-700 focus:border-geoCyan focus:ring-1 focus:ring-geoCyan outline-none text-white px-4 py-2.5 rounded-lg transition-all text-sm placeholder-gray-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Subject</label>
                    <select name="subject" className="w-full bg-gray-800/50 border border-gray-700 focus:border-geoCyan focus:ring-1 focus:ring-geoCyan outline-none text-white px-4 py-2.5 rounded-lg text-sm appearance-none cursor-pointer">
                      <option value="General Feedback">General Feedback</option>
                      <option value="Topic Suggestion">Topic Suggestion</option>
                      <option value="Business Inquiry">Business Inquiry</option>
                      <option value="Bug Report">Bug Report</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Message</label>
                    <textarea name="message" rows={5} placeholder="How can we help you?" required className="w-full bg-gray-800/50 border border-gray-700 focus:border-geoCyan focus:ring-1 focus:ring-geoCyan outline-none text-white px-4 py-2.5 rounded-lg resize-none text-sm placeholder-gray-500" />
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'sending'} 
                    className="w-full bg-geoCyan hover:bg-geoCyan/90 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-2"
                  >
                    {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
