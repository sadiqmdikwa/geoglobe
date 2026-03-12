const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    // 👇 WE SAVE THE FORM HERE BEFORE WAITING FOR GOOGLE 👇
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
      
      // 👇 AND WE USE THE SAVED FORM TO CLEAR THE BOXES HERE 👇
      form.reset(); 
      
      setTimeout(() => setStatus('idle'), 3000);
      
    } catch (error) {
      console.error("THE FETCH ERROR IS:", error);
      setStatus('error');
    }
  };
