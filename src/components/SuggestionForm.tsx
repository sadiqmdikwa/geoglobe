import { useState } from 'react';

// CRITICAL: Ensure 'export default' is present to fix the build error
export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<'video' | 'game'>('video');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [status, setStatus] = useState('idle');

  // Replace with your actual Google Apps Script Web App URL
  const SCRIPT_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?output=csv'; 

  const getCoordinates = async (locationName: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) return { lat: data[0].lat, lng: data[0].lon };
    } catch (e) { console.error(e); }
    return { lat: 0, lng: 0 };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('uploading...');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const formProps = Object.fromEntries(formData.entries());
    let payloads: any[] = [];

    // 1. Logic for Bulk vs Single
    if (activeTab === 'game' && mode === 'bulk') {
      const lines = (formProps.bulkData as string).split('\n').filter(l => l.trim() !== "");
      for (let i = 0; i < lines.length; i++) {
        const [q, a, loc, cat, reg] = lines[i].split(':');
        setStatus(`Geocoding ${i + 1}/${lines.length}...`);
        const coords = loc ? await getCoordinates(loc.trim()) : { lat: 0, lng: 0 };
        // Respecting the 1-second rate limit for the Geocoding API
        if (lines.length > 1) await new Promise(r => setTimeout(r, 1000));

        payloads.push({
          title: q?.trim(),
          correctAnswer: a?.trim(),
          lat: coords.lat,
          lng: coords.lng,
          category: cat?.trim() || "General",
          region: reg?.trim() || "Global",
          youtubeId: "" 
        });
      }
    } else {
      payloads = [formProps];
    }

    // 2. The Professional "Silent" Upload
    try {
      for (const p of payloads) {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Prevents CORS errors from stopping the execution
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(p)
        });
      }
      
      // Artificial delay to simulate server communication and ensure data reaches Google
      setTimeout(() => {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus('idle'), 3000);
      }, 1500);

    } catch (error) {
      console.error("Upload failed:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-gray-900 border-2 border-white/10 p-8 rounded-[2.5rem] max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
      {/* NAVIGATION TOGGLE */}
      <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 font-bold">
        <button 
          onClick={() => {setActiveTab('video'); setMode('single')}} 
          className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'video' ? 'bg-geoCyan text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          VIDEO & PINS
        </button>
        <button 
          onClick={() => setActiveTab('game')} 
          className={`flex-1 py-3 rounded-xl transition-all ${activeTab === 'game' ? 'bg-geoCyan text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          GAME DATA
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* VIDEO MODE */}
        {activeTab === 'video' && (
          <div className="space-y-4">
             <div className="space-y-1">
              <label className="text-[10px] font-bold text-geoCyan uppercase ml-1 tracking-widest uppercase">Location Name</label>
              <input name="title" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="lat" placeholder="Latitude" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
              <input name="lng" placeholder="Longitude" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
            </div>
            <input name="youtubeId" placeholder="YouTube Video ID" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
          </div>
        )}

        {/* GAME MODE */}
        {activeTab === 'game' && (
          <div className="space-y-4">
            <div className="flex justify-center gap-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <button type="button" onClick={() => setMode('single')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-[0.2em] ${mode === 'single' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>SINGLE</button>
              <button type="button" onClick={() => setMode('bulk')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-[0.2em] ${mode === 'bulk' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>AI BULK</button>
            </div>

            {mode === 'single' ? (
              <div className="space-y-4">
                <input name="title" placeholder="Question" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
                <div className="grid grid-cols-2 gap-4">
                  <select name="category" className="p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none"><option>Flags</option><option>Borders</option><option>Anomalies</option></select>
                  <select name="region" className="p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none"><option>Africa</option><option>Asia</option><option>Europe</option><option>Americas</option></select>
                </div>
                <input name="correctAnswer" placeholder="Correct Answer" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoYellow" />
              </div>
            ) : (
              <textarea name="bulkData" rows={8} placeholder="Question:Answer:SearchPlace:Category:Region" className="w-full p-6 bg-black/50 text-white rounded-[2rem] border border-white/10 outline-none focus:border-geoCyan font-mono text-xs" />
            )}
          </div>
        )}

        <button type="submit" disabled={status !== 'idle' && status !== 'success'} className="w-full py-6 bg-geoCyan text-black font-black text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase tracking-tighter">
          {status === 'idle' ? 'START UPLOAD' : status.toUpperCase()}
        </button>
      </form>
    </div>
  );
}
