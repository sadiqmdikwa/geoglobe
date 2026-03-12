import { useState } from 'react';

export default function SuggestionForm() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    // 1. Gather all the data from the input boxes
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      // 2. The secret URL to your Google Apps Script
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec'; 
      
      // 3. Send the data to Google
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', // This is required so Google doesn't block the request
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // 4. Update the button to show it worked!
      setStatus('success');
      e.currentTarget.reset(); // Clears the form for the next entry
      
      // Reset the button text after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (error) {
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
