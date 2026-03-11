import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export default function AboutContact() {
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
          <h1 className="text-2xl md:text-4xl text-geoCyan font-bold mb-6">About GeoGlobe</h1>
          <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed">
            Exploring borders, countries, and geography through maps. Our mission is to make global knowledge accessible and visually engaging.
          </p>

          <h2 className="text-geoYellow font-bold text-lg md:text-xl mb-3">Meet the Creator</h2>
          <p className="text-gray-300 text-sm md:text-base mb-6">
            GeoGlobe was founded by Sadiq Muhammad Mustapha (Arshavin), a geography enthusiast passionate about borders, maps, and global stories.
          </p>

          <div className="mb-8">
            <h3 className="text-white font-bold mb-4">Connect with Sadiq:</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <a href="mailto:sadeeqmuhammad2320@gmail.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fas fa-envelope"></i> Email
              </a>
              <a href="https://linkedin.com/in/sadiq-muhammad-mustapha-90442b314?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
              <a href="https://substack.com/@sadiqmdikwa?utm_source=share&utm_medium=android&r=36go18" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fas fa-bookmark"></i> Substack
              </a>
              <a href="https://reddit.com/u/sadiq_m_dikwa/s/kkx4i2nw6z" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-reddit"></i> Reddit
              </a>
              <a href="https://x.com/sadiq_m_dkw" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-twitter"></i> X
              </a>
              <a href="https://instagram.com/sadiq_m_dikwa" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a href="https://tiktok.com/@sadiq_m_dikwa" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-tiktok"></i> TikTok
              </a>
              <a href="https://pinterest.com/sadiq_m_dikwa" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-pinterest"></i> Pinterest
              </a>
              <a href="https://snapchat.com/add/sadiqmdkw" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-geoCyan transition-colors px-3 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 border border-gray-700">
                <i className="fab fa-snapchat"></i> Snapchat
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700 text-center max-w-lg mx-auto md:mx-0 w-full">
          <h2 className="text-lg md:text-2xl text-white font-bold mb-4 md:mb-6">Send a Direct Message</h2>
          
          <form action="#" method="POST" className="space-y-3 md:space-y-4 text-left">
            <div>
              <label className="block text-gray-400 text-[10px] md:text-sm mb-1 ml-1">Name</label>
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full bg-gray-900 border-2 border-gray-700 focus:border-geoCyan outline-none text-white p-2.5 md:p-3 rounded-xl transition-colors placeholder-gray-600 text-xs md:text-base"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] md:text-sm mb-1 ml-1">Email</label>
              <input 
                type="email" 
                placeholder="your@email.com"
                className="w-full bg-gray-900 border-2 border-gray-700 focus:border-geoCyan outline-none text-white p-2.5 md:p-3 rounded-xl transition-colors placeholder-gray-600 text-xs md:text-base"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] md:text-sm mb-1 ml-1">Subject</label>
              <select className="w-full bg-gray-900 border-2 border-gray-700 focus:border-geoCyan outline-none text-white p-2.5 md:p-3 rounded-xl transition-colors text-xs md:text-base">
                <option>Topic Suggestion</option>
                <option>Business Inquiry</option>
                <option>General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] md:text-sm mb-1 ml-1">Message</label>
              <textarea 
                rows={4} 
                placeholder="How can we help?"
                className="w-full bg-gray-900 border-2 border-gray-700 focus:border-geoCyan outline-none text-white p-2.5 md:p-3 rounded-xl transition-colors placeholder-gray-600 resize-none text-xs md:text-base"
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold text-sm md:text-lg py-2.5 md:py-3 rounded-xl transition-colors mt-2 md:mt-4">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
