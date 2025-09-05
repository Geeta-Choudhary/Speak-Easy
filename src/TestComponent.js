import React from 'react';

const TestComponent = () => {
  const handleTestClick = () => {
    console.log('Test button clicked!');
    alert('Test button is working!');
  };

  const handleFileTest = (e) => {
    console.log('File input test:', e.target.files);
    if (e.target.files[0]) {
      alert(`File selected: ${e.target.files[0].name}`);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Test Component</h2>
      <button 
        onClick={handleTestClick}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button Click
      </button>
      
      <div style={{ margin: '20px' }}>
        <input
          type="file"
          accept=".wav,.mp3,.m4a,.flac,.webm,.ogg"
          onChange={handleFileTest}
          style={{ margin: '10px' }}
        />
        <br />
        <small>Test file input</small>
      </div>
    </div>
  );
};

export default TestComponent;

