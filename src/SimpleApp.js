import React, { useState } from 'react';

function SimpleApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    console.log('File input changed!', e.target.files);
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      setSelectedFile(file);
      setMessage(`File selected: ${file.name} (${file.size} bytes)`);
    }
  };

  const handleButtonClick = () => {
    console.log('Button clicked!');
    setMessage('Button clicked successfully!');
  };

  const clearFile = () => {
    setSelectedFile(null);
    setMessage('');
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        🎤 Speak Easy - Simple Test
      </h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h2>Test File Upload</h2>
        
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={handleButtonClick}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px'
            }}
          >
            Test Button Click
          </button>
        </div>

        <div style={{ margin: '20px 0' }}>
          <input
            id="fileInput"
            type="file"
            accept=".wav,.mp3,.m4a,.flac,.webm,.ogg"
            onChange={handleFileChange}
            style={{ margin: '10px' }}
          />
          <br />
          <small>Click to select an audio file</small>
        </div>

        {selectedFile && (
          <div style={{ 
            background: '#d4edda', 
            padding: '15px', 
            borderRadius: '5px',
            margin: '20px 0',
            border: '1px solid #c3e6cb'
          }}>
            <h3>Selected File:</h3>
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {selectedFile.size} bytes</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
            <button 
              onClick={clearFile}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Remove File
            </button>
          </div>
        )}

        {message && (
          <div style={{ 
            background: '#d1ecf1', 
            padding: '10px', 
            borderRadius: '5px',
            margin: '10px 0',
            border: '1px solid #bee5eb'
          }}>
            <strong>Status:</strong> {message}
          </div>
        )}
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '5px',
        margin: '20px 0',
        border: '1px solid #ffeaa7'
      }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Button Click" - you should see a status message</li>
          <li>Click "Choose File" - your file manager should open</li>
          <li>Select an audio file - you should see file details</li>
          <li>Click "Remove File" to clear the selection</li>
        </ol>
      </div>

      <div style={{ 
        background: '#f8d7da', 
        padding: '15px', 
        borderRadius: '5px',
        margin: '20px 0',
        border: '1px solid #f5c6cb'
      }}>
        <h3>Debug Info:</h3>
        <p>Open browser console (F12) to see console.log messages</p>
        <p>If nothing appears in console, there might be a React loading issue</p>
      </div>
    </div>
  );
}

export default SimpleApp;

