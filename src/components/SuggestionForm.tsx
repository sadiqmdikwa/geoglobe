import { useState } from 'react';

export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<'video' | 'game'>('video');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [status, setStatus] = useState('idle');

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
    setStatus('processing...');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    let payloads: any[] = [];

    if (activeTab === 'game' && mode === 'bulk') {
      const lines = (data.bulkData as string).split('\n').filter(line => line.trim() !== "");
      for (let i = 0; i < lines.length; i++) {
        const [q, a, loc, cat, reg] = lines[i].split(':');
        setStatus(`Geocoding ${i + 1}/${lines.length}...`);
        const coords = loc ? await getCoordinates(loc.trim()) : { lat: 0, lng: 0 };
        if (lines.length > 1) await new Promise(r => setTimeout(r, 1000)); // Respect API limits

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
      payloads = [data];
    }

    try {
      // THE URL YOU PROVIDED
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec'; 
      
      for (const item of payloads) {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(item)
        });
      }
      setStatus('success');
      form.reset(); 
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) { setStatus('error'); }
  };

  return (
    <div className="bg-gray-900 border-2 border-white/10 p-8 rounded-[2.5rem] max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
      {/* PROFESSIONAL TOGGLE */}
      <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
        <button 
          onClick={() => {setActiveTab('video'); setMode('single')}} 
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-geoCyan text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          VIDEO & PINS
        </button>
        <button 
          onClick={() => setActiveTab('game')} 
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'game' ? 'bg-geoCyan text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          GAME DATA
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'game' && (
          <div className="flex justify-center gap-4 py-2 bg-white/5 rounded-xl border border-white/5">
            <button type="button" onClick={() => setMode('single')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-[0.2em] ${mode === 'single' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>SINGLE</button>
            <button type="button" onClick={() => setMode('bulk')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-[0.2em] ${mode === 'bulk' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>AI BULK</button>
          </div>
        )}

        {mode === 'single' ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-geoCyan uppercase ml-1 tracking-widest">{activeTab === 'video' ? 'Location Name' : 'Question'}</label>
              <input name="title" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Lat</label>
                <input name="lat" className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Lng</label>
                <input name="lng" className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
              </div>
            </div>

            {activeTab === 'video' ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-geoCyan uppercase ml-1 tracking-widest">YouTube Video ID</label>
                <input name="youtubeId" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoCyan" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <select name="category" className="p-4 bg-black/50 text-white rounded-2xl border border-white/10"><option>Flags</option><option>Borders</option><option>Anomalies</option></select>
                  <select name="region" className="p-4 bg-black/50 text-white rounded-2xl border border-white/10"><option>Africa</option><option>Asia</option><option>Europe</option><option>Americas</option></select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-geoYellow uppercase ml-1 tracking-widest">Correct Answer</label>
                  <input name="correctAnswer" required className="w-full p-4 bg-black/50 text-white rounded-2xl border border-white/10 outline-none focus:border-geoYellow" />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <textarea name="bulkData" rows={8} placeholder="Question:Answer:SearchPlace:Category:Region" className="w-full p-6 bg-black/50 text-white rounded-[2rem] border border-white/10 outline-none focus:border-geoCyan font-mono text-xs" />
          </div>
        )}

        <button type="submit" disabled={status !== 'idle' && status !== 'success'} className="w-full py-5 bg-geoCyan text-black font-black text-lg rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all active:scale-95 disabled:opacity-50">
          {status === 'idle' ? 'START UPLOAD' : status.toUpperCase()}
        </button>
      </form>
    </div>
  );
}
