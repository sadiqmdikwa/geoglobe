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
      // 🛡️ Use your Triple-Router Apps Script URL here
      const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxYhRfD4jSTFm1b_cAmPDtq_NYuNi0NxoqMN-ciY5VyJ2Idc8ojGqhyf6sJvFjxrzHsg/exec";

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Keeps the browser from blocking the redirect
        body: JSON.stringify(data),
      });

      // Artificial delay for UX "Transmission" feel
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
      className="w-full pb-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Column: About the Creator */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl text-geoCyan font-bold mb-6 italic tracking-tighter uppercase">ABOUT GEOGLOBE</h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
            Exploring borders, countries, and geography through maps. Our mission is to make global knowledge accessible and visually engaging.
          </p>

          <h2 className="text-geoYellow font-black text-lg md:text-xl mb-3 uppercase tracking-widest">Meet the Creator</h2>
          <p className="text-gray-300 text-sm md:text-base mb-10 leading-relaxed">
            GeoGlobe was founded by Sadiq Muhammad Mustapha (Arshavin), a geography enthusiast passionate about borders, maps, and global stories.
          </p>

          <div className="space-y-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Direct Comms:</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {[
                { name: 'Email', icon: 'fa-envelope', link: 'mailto:sadeeqmuhammad2320@gmail.com' },
                { name: 'LinkedIn', icon: 'fa-linkedin', link: 'https://linkedin.com/in/sadiq-muhammad-mustapha-90442b314' },
                { name: 'X', icon: 'fa-x-twitter', link: 'https://x.com/sadiq_m_dkw' },
                { name: 'Substack', icon: 'fa-bookmark', link: 'https://substack.com/@sadiqmdikwa' },
                { name: 'Instagram', icon: 'fa-instagram', link: 'https://instagram.com/sadiq_m_dikwa' }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-900 border border-white/5 hover:border-geoCyan text-gray-400 hover:text-white transition-all px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                >
                  <i className={`fa-brands ${social.icon} ${social.icon === 'fa-envelope' || social.icon === 'fa-bookmark' ? 'fa-solid' : ''}`}></i> 
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="relative">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/5 w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-geoCyan/30 to-transparent" />
            
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-20 text-center space-y-4"
                >
                  <div className="relative inline-block">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <motion.div 
                      initial={{ scale: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 border-2 border-green-500 rounded-full"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter italic">Transmission Sent</h2>
                  <p className="text-gray-500 text-sm">Target reached. Sadiq will review your intel shortly.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-geoCyan text-[10px] font-black uppercase tracking-[0.3em] pt-6 hover:text-white transition-colors"
                  >
                    New Transmission?
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-2xl text-white font-black mb-8 italic tracking-tighter uppercase">Direct Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Identity</label>
                        <input name="name" type="text" placeholder="Your Name" required className="w-full bg-black/40 border border-white/5 focus:border-geoCyan outline-none text-white p-4 rounded-2xl transition-all placeholder-gray-800 text-sm shadow-inner" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Email</label>
                        <input name="email" type="email" placeholder="Email Address" required className="w-full bg-black/40 border border-white/5 focus:border-geoCyan outline-none text-white p-4 rounded-2xl transition-all placeholder-gray-800 text-sm shadow-inner" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Subject</label>
                      <div className="relative">
                        <select name="subject" className="w-full bg-black/40 border border-white/5 focus:border-geoCyan outline-none text-white p-4 rounded-2xl transition-all text-sm appearance-none cursor-pointer shadow-inner">
                          <option value="Topic Suggestion">Topic Suggestion</option>
                          <option value="Business Inquiry">Business Inquiry</option>
                          <option value="General Feedback">General Feedback</option>
                          <option value="Bug Report">Bug Report</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Message</label>
                      <textarea name="message" rows={4} placeholder="Type your message..." required className="w-full bg-black/40 border border-white/5 focus:border-geoCyan outline-none text-white p-4 rounded-2xl transition-all placeholder-gray-800 resize-none text-sm shadow-inner" />
                    </div>

                    <button 
                      type="submit" 
                      disabled={status === 'sending'}
                      className="w-full bg-geoCyan disabled:opacity-50 text-black font-black py-5 rounded-2xl transition-all mt-4 flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                    >
                      {status === 'sending' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          ENCRYPTING...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          SEND TRANSMISSION
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
