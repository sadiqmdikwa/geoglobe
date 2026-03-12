import { useState } from 'react';

// 👇 This "export default" is what GitHub was complaining was missing!
export default function SuggestionForm() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    // We save the form here before waiting for Google
    const form = e.currentTarget;
    
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      // Your exact Google URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec'; 
      
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify(payload)
      });

      // Update the button to show it worked!
      setStatus('success');
      
      // And we use the saved form to clear the boxes here!
      form.reset(); 
      
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (error) {
      console.error("THE FETCH ERROR IS:", error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-900/50 border border-white/5 p-6 rounded-2xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-geoCyan mb-4">Add a Map Pin</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          name="title" 
          placeholder="Location Title (e.g. Ilemi Triangle)" 
          required 
          className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-geoCyan outline-none transition-colors" 
        />
        
        <div className="flex gap-4">
          <input 
            name="lat" 
            type="number" 
            step="any" 
            placeholder="Latitude" 
            required 
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-geoCyan outline-none transition-colors" 
          />
          <input 
            name="lng" 
            type="number" 
            step="any" 
            placeholder="Longitude" 
            required 
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-geoCyan outline-none transition-colors" 
          />
        </div>
        
        <input 
          name="youtubeId" 
          placeholder="YouTube ID (e.g. z7Xr00C9LY0)" 
          required 
          className="p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-geoCyan outline-none transition-colors" 
        />
        
        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className={`font-bold py-3 rounded-lg transition-all ${
            status === 'success' ? 'bg-green-500 text-white' : 
            status === 'error' ? 'bg-red-500 text-white' : 
            'bg-geoCyan text-black hover:bg-geoCyan/80'
          }`}
        >
          {status === 'loading' ? 'Sending...' : 
           status === 'success' ? 'Pin Added! ✓' : 
           status === 'error' ? 'Error! Try Again' : 
           'Submit to Database'}
        </button>
      </form>
    </div>
  );
}
