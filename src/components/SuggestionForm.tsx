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
          mode: 'no-cors', // CRITICAL: This stops the Red CORS Error
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(p)
        });
      }
      
      // Since 'no-cors' mode can't read the server response, 
      // we wait 1.5 seconds to ensure the data hits the sheet
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
