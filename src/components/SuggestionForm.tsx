import { useState } from 'react';

export default function SuggestionForm() {
  const [mode, setMode] = useState<'video' | 'game'>('video');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec'; 
      
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      setStatus('success');
      form.reset(); 
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (error) {
      console.error("Fetch Error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-900/80 border border-white/10 p-8 rounded-3xl max-w-lg mx-auto shadow-2xl backdrop-blur-md">
      <div className="flex gap-4 mb-8 p-1 bg-black/40 rounded-2xl">
        <button 
          onClick={() => setMode('video')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'video' ? 'bg-geoCyan text-black' : 'text-gray-500 hover:text-white'}`}
        >
          Add Video
        </button>
        <button 
          onClick={() => setMode('game')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${mode === 'game' ? 'bg-geoCyan text-black' : 'text-gray-500 hover:text-white'}`}
        >
          Add Game
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">
        {mode === 'video' ? 'New Map Discovery' : 'New Game Challenge'}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-geoCyan uppercase tracking-widest ml-1">Location Title</label>
          <input name="title" placeholder="e.g. The Great Rift Valley" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 focus:border-geoCyan outline-none transition-all" />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-geoCyan uppercase tracking-widest ml-1">Latitude</label>
            <input name="lat" type="number" step="any" placeholder="4.9" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 focus:border-geoCyan outline-none" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-geoCyan uppercase tracking-widest ml-1">Longitude</label>
            <input name="lng" type="number" step="any" placeholder="35.3" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 focus:border-geoCyan outline-none" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-geoCyan uppercase tracking-widest ml-1">YouTube Video ID</label>
          <input name="youtubeId" placeholder="z7Xr00C9LY0" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 focus:border-geoCyan outline-none" />
        </div>

        {/* --- THIS IS THE NEW GAME ANSWER FIELD --- */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-geoYellow uppercase tracking-widest ml-1">Game Answer (Correct Country)</label>
          <input name="correctAnswer" placeholder="e.g. Kenya" required={mode === 'game'} className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 focus:border-geoYellow outline-none transition-all" />
        </div>
        
        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className={`font-bold py-4 rounded-xl mt-4 transition-all shadow-lg ${
            status === 'success' ? 'bg-green-500 text-white' : 
            status === 'error' ? 'bg-red-500 text-white' : 
            'bg-geoCyan text-black hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {status === 'loading' ? 'Encrypting & Sending...' : 
           status === 'success' ? 'Data Deployed! ✓' : 
           status === 'error' ? 'System Error' : 
           `Save to GeoGlobe ${mode === 'video' ? 'Map' : 'Game'}`}
        </button>
      </form>
    </div>
  );
}
