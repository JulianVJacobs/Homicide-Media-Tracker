import React, { useState } from 'react';

const CheckArchive = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');

  const handleCheckArchive = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Make a POST request to your backend API
    const response = await fetch('http://localhost:5000/checkArchivalStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      const data = await response.json();
      setResult(data.isArchived ? 'Webpage archived!' : 'Cannot find archive');
    } else {
      setResult('Error checking archive status');
    }
  };

  return (
    <div className='bg-gray-300'>
      <form className=' text-black font-medium ml-5'>
        <input 
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className='bg-yellow-300 hover:bg-yellow-500 active:bg-yellow-700 text-black font-medium px-4 py-2 rounded' onClick={handleCheckArchive}>
          Check if archived
        </button>
      </form>
      <div className='font-xl font-bold text-black'>{result}</div>
    </div>
  );
};

export default CheckArchive;
