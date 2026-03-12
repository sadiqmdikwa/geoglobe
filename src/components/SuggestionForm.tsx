import { useState } from 'react';

export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<'video' | 'game'>('video');
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [status, setStatus] = useState('idle');

  // PRO ALGO: Fetches coordinates from a location name
  const getCoordinates = async (locationName: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: data[0].lat, lng: data[0].lon };
      }
    } catch (error) {
      console.error("Geocoding failed for:", locationName);
    }
    return { lat: 0, lng: 0 };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    let payloads: any[] = [];

    if (activeTab === 'game' && mode === 'bulk') {
      const bulkText = data.bulkData as string;
      const lines = bulkText.split(',');
      
      for (const line of lines) {
        // Format expected: Question:Answer:SearchLocation
        const [q, a, loc] = line.split(':');
        let coords = { lat: 0, lng: 0 };
        
        if (loc) {
          setStatus(`Geocoding: ${loc.trim()}...`);
          coords = await getCoordinates(loc.trim());
        }

        payloads.push({ 
          ...data, 
          title: q?.trim(), 
          correctAnswer: a?.trim(),
          lat: coords.lat,
          lng: coords.lng 
        });
      }
    } else {
      payloads = [data];
    }

    try {
      const scriptUrl = 'YOUR_APPS_SCRIPT_URL_HERE'; 
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
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-900/90 border border-white/10 p-8 rounded-[2rem] max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
      <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8">
        <button onClick={() => {setActiveTab('video'); setMode('single')}} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>
          Video & Pin
        </button>
        <button onClick={() => setActiveTab('game')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'game' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>
          Game Question
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <select name="category" className="p-3 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan">
            <option value="General">General Category</option>
            <option value="Borders">Borders</option>
            <option value="Flags">Flags</option>
            <option value="Anomalies">Anomalies</option>
          </select>
          <select name="region" className="p-3 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan">
            <option value="Global">Global Region</option>
            <option value="Africa">Africa</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
          </select>
        </div>

        {activeTab === 'game' && (
          <div className="flex justify-center gap-6 py-2 border-y border-white/5">
            <button type="button" onClick={() => setMode('single')} className={`text-sm ${mode === 'single' ? 'text-geoCyan font-bold' : 'text-gray-500'}`}>Single</button>
            <button type="button" onClick={() => setMode('bulk')} className={`text-sm ${mode === 'bulk' ? 'text-geoCyan font-bold' : 'text-gray-500'}`}>Bulk + Auto-Geo</button>
          </div>
        )}

        {mode === 'single' ? (
          <div className="space-y-4">
            <input name="title" placeholder="Question Title" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan" />
            <div className="flex gap-4">
              <input name="lat" placeholder="Latitude" className="flex-1 p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
              <input name="lng" placeholder="Longitude" className="flex-1 p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
            </div>
            {activeTab === 'video' && <input name="youtubeId" placeholder="YouTube ID" className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />}
            <input name="correctAnswer" placeholder="Correct Country Name" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoYellow" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-geoCyan italic uppercase">Format: Question:Answer:SearchLocationName</p>
            <textarea name="bulkData" rows={6} placeholder="Pyramids:Egypt:Giza, Eiffel Tower:France:Paris" className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan" />
          </div>
        )}

        <button type="submit" disabled={status.includes('...')} className="w-full py-5 bg-geoCyan text-black font-bold rounded-2xl hover:scale-[1.01] transition-all disabled:opacity-50">
          {status === 'idle' ? 'UPLOAD TO DATABASE' : status}
        </button>
      </form>
    </div>
  );
}
