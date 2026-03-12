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
      className="w-full pb-20 pt-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Column: Mission & Identity */}
        <div className="text-center md:text-left space-y-12">
          <section className="space-y-6">
            <h1 className="text-5xl md:text-7xl text-white font-black tracking-tighter italic uppercase leading-none">
              ABOUT <span className="text-geoCyan">GEOGLOBE</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-2xl leading-relaxed font-light max-w-xl">
              Deconstructing international borders and terrestrial mysteries through cartographic storytelling. Our mission is to transform global data into immersive visual intelligence.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/5">
            <h2 className="text-geoYellow font-black text-2xl md:text-3xl uppercase italic tracking-tighter">
              The Architect
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-lg">
              GeoGlobe was conceptualized and engineered by <span className="text-white font-bold underline decoration-geoCyan">Sadiq Muhammad Mustapha (Arshavin)</span>. A specialist in geopolitical anomalies and cartographic design, dedicated to chronicling the stories written in our world's borders.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.5em] opacity-50">
              DIRECT CHANNELS
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {[
                { name: 'Email', icon: 'fa-envelope', link: 'mailto:sadeeqmuhammad2320@gmail.com' },
                { name: 'LinkedIn', icon: 'fa-linkedin', link: 'https://linkedin.com/in/sadiq-muhammad-mustapha-90442b314' },
                { name: 'X-Twitter', icon: 'fa-x-twitter', link: 'https://x.com/sadiq_m_dkw' },
                { name: 'Substack', icon: 'fa-bookmark', link: 'https://substack.com/@sadiqmdikwa' },
                { name: 'Instagram', icon: 'fa-instagram', link: 'https://instagram.com/sadiq_m_dikwa' },
                { name: 'TikTok', icon: 'fa-tiktok', link: 'https://www.tiktok.com/@geoglobe23' },
                { name: 'YouTube', icon: 'fa-youtube', link: 'https://youtube.com/@geoglobe23' }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-black/50 border border-white/5 hover:border-geoCyan text-gray-400 hover:text-white transition-all px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 group shadow-xl hover:shadow-geoCyan/10"
                >
                  <i className={`fa-brands ${social.icon} ${social.icon === 'fa-envelope' || social.icon === 'fa-bookmark' ? 'fa-solid' : ''} group-hover:scale-110 transition-transform`}></i> 
                  {social.name}
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Encrypted Form */}
        <div className="relative">
          <div className="bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/5 w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-geoCyan to-transparent opacity-50" />
            
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 min-h-[450px] flex flex-col items-center justify-center text-center space-y-6"
                >
                  <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Transmission Successful</h2>
                  <p className="text-gray-500 text-sm max-w-[280px]">Intelligence received. Sadiq will review your communication shortly.</p>
                  <button onClick={() => setStatus('idle')} className="text-geoCyan text-xs font-black uppercase tracking-[0.4em] pt-10 hover:text-white transition-colors">Initiate New Sequence</button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-3xl text-white font-black mb-10 italic tracking-tighter uppercase">Direct Transmission</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Origin Identity</label>
                        <input name="name" type="text" placeholder="FULL NAME" required className="w-full bg-black/60 border border-white/5 focus:border-geoCyan outline-none text-white p-5 rounded-2xl transition-all text-sm font-medium placeholder-gray-800" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Digital Address</label>
                        <input name="email" type="email" placeholder="EMAIL@HOST.COM" required className="w-full bg-black/60 border border-white/5 focus:border-geoCyan outline-none text-white p-5 rounded-2xl transition-all text-sm font-medium placeholder-gray-800" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Subject Classification</label>
                      <select name="subject" className="w-full bg-black/60 border border-white/5 focus:border-geoCyan outline-none text-white p-5 rounded-2xl text-sm appearance-none cursor-pointer font-bold italic">
                        <option value="Topic Suggestion">Topic Suggestion</option>
                        <option value="Business Inquiry">Business Inquiry</option>
                        <option value="General Feedback">General Feedback</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Intelligence Content</label>
                      <textarea name="message" rows={5} placeholder="ENTER MESSAGE CONTENT..." required className="w-full bg-black/60 border border-white/5 focus:border-geoCyan outline-none text-white p-5 rounded-2xl resize-none text-sm font-medium placeholder-gray-800" />
                    </div>
                    <button type="submit" disabled={status === 'sending'} className="w-full bg-geoCyan disabled:opacity-50 text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all uppercase italic tracking-tighter text-lg shadow-[0_10px_30px_rgba(66,194,203,0.2)]">
                      {status === 'sending' ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
                      Dispatch Transmission
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
