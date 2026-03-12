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
    setStatus('processing');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    let payloads: any[] = [];

    if (activeTab === 'game' && mode === 'bulk') {
      const lines = (data.bulkData as string).split('\n').filter(line => line.trim() !== "");
      
      for (let i = 0; i < lines.length; i++) {
        const [q, a, loc, cat, reg] = lines[i].split(':');
        setStatus(`Geocoding ${i + 1}/${lines.length}: ${loc?.trim()}...`);
        
        const coords = loc ? await getCoordinates(loc.trim()) : { lat: 0, lng: 0 };
        // Wait 1 second between requests to respect OpenStreetMap rules
        await new Promise(r => setTimeout(r, 1000));

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
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec'; 
      for (let i = 0; i < payloads.length; i++) {
        setStatus(`Uploading ${i + 1}/${payloads.length}...`);
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payloads[i])
        });
      }
      setStatus('success');
      form.reset(); 
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) { setStatus('error'); }
  };

  return (
    <div className="bg-gray-900 border border-white/10 p-8 rounded-[2.5rem] max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
      <div className="flex bg-black/40 p-1 rounded-2xl mb-8 border border-white/5">
        <button onClick={() => {setActiveTab('video'); setMode('single')}} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>VIDEO & PINS</button>
        <button onClick={() => setActiveTab('game')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'game' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>GAME DATA</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'game' && (
          <div className="flex justify-center gap-4 py-2 bg-white/5 rounded-xl">
            <button type="button" onClick={() => setMode('single')} className={`px-6 py-2 rounded-lg text-xs font-black tracking-widest ${mode === 'single' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>SINGLE ENTRY</button>
            <button type="button" onClick={() => setMode('bulk')} className={`px-6 py-2 rounded-lg text-xs font-black tracking-widest ${mode === 'bulk' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>AI BULK PASTE</button>
          </div>
        )}

        {mode === 'single' ? (
          <div className="grid grid-cols-1 gap-4">
            <input name="title" placeholder="Title / Question" required className="p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan" />
            <div className="grid grid-cols-2 gap-4">
                <input name="lat" placeholder="Latitude" className="p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
                <input name="lng" placeholder="Longitude" className="p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <select name="category" className="p-4 bg-black/50 text-white rounded-xl border border-white/10"><option>Flags</option><option>Borders</option><option>General</option></select>
                <select name="region" className="p-4 bg-black/50 text-white rounded-xl border border-white/10"><option>Global</option><option>Africa</option><option>Asia</option><option>Europe</option></select>
            </div>
            <input name="correctAnswer" placeholder="Correct Answer" className="p-4 bg-black/50 text-white rounded-xl border border-white/10 focus:border-geoYellow" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-geoCyan font-black uppercase tracking-widest">AI Input Protocol</span>
                <span className="text-[10px] text-gray-600 italic">Format: Question:Answer:SearchPlace:Category:Region</span>
            </div>
            <textarea name="bulkData" rows={10} placeholder="Identify the flag with a star:Somalia:Mogadishu:Flags:Africa" className="w-full p-6 bg-black/50 text-white rounded-3xl border border-white/10 outline-none focus:border-geoCyan font-mono text-sm" />
          </div>
        )}

        <button type="submit" disabled={status !== 'idle' && status !== 'success' && status !== 'error'} className="w-full py-6 bg-geoCyan text-black font-black text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all disabled:opacity-50">
          {status === 'idle' ? 'START UPLOAD' : status.toUpperCase()}
        </button>
      </form>
    </div>
  );
}
