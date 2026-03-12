import { useState } from 'react';

export default function SuggestionForm() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let payloads: any[] = [];

    if (mode === 'bulk') {
      // Logic to split bulk text: "Country:Answer, Country:Answer"
      const bulkText = data.bulkData as string;
      const pairs = bulkText.split(',');
      payloads = pairs.map(pair => {
        const [q, a] = pair.split(':');
        return { ...data, title: q?.trim(), correctAnswer: a?.trim() };
      });
    } else {
      payloads = [data];
    }

    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec'; 
      
      // We send all questions in the loop
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
    <div className="bg-gray-900/90 border border-white/10 p-8 rounded-3xl max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
      <div className="flex gap-4 mb-8 p-1 bg-black/40 rounded-2xl">
        <button onClick={() => setMode('single')} className={`flex-1 py-2 rounded-xl font-bold transition-all ${mode === 'single' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>Single Entry</button>
        <button onClick={() => setMode('bulk')} className={`flex-1 py-2 rounded-xl font-bold transition-all ${mode === 'bulk' ? 'bg-geoCyan text-black' : 'text-gray-500'}`}>Bulk Upload</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-geoCyan uppercase tracking-widest">Category</label>
            <select name="category" className="w-full p-3 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan">
              <option value="Borders">Borders</option>
              <option value="Flags">Flags</option>
              <option value="Anomalies">Anomalies</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-geoCyan uppercase tracking-widest">Region</label>
            <select name="region" className="w-full p-3 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan">
              <option value="Global">Global</option>
              <option value="Africa">Africa</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
            </select>
          </div>
        </div>

        {mode === 'single' ? (
          <div className="space-y-4">
            <input name="title" placeholder="Question or Location Name" required className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan" />
            <div className="flex gap-4">
              <input name="lat" placeholder="Lat" className="flex-1 p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
              <input name="lng" placeholder="Lng" className="flex-1 p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
            </div>
            <input name="youtubeId" placeholder="YouTube ID" className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none" />
            <input name="correctAnswer" placeholder="Correct Answer (Country)" className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoYellow" />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Format: Question:Answer, Question:Answer</label>
            <textarea name="bulkData" rows={6} placeholder="Nigeria:Abuja, France:Paris..." className="w-full p-4 bg-black/50 text-white rounded-xl border border-white/10 outline-none focus:border-geoCyan" />
          </div>
        )}

        <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-geoCyan text-black font-bold rounded-xl hover:scale-[1.01] transition-all disabled:opacity-50">
          {status === 'loading' ? 'Processing...' : status === 'success' ? 'Deployed! ✓' : 'Upload to Database'}
        </button>
      </form>
    </div>
  );
}
