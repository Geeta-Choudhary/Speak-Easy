import React, { useState, useRef } from 'react';

const FileUploader = ({ onTranscription }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const fileInputRef = useRef(null);

  const supportedFormats = ['wav', 'mp3', 'm4a', 'flac', 'webm', 'ogg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!supportedFormats.includes(fileExtension)) {
      throw new Error(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
    }
    
    if (file.size > maxFileSize) {
      throw new Error(`File too large. Maximum size: ${maxFileSize / (1024 * 1024)}MB`);
    }
    
    return true;
  };

  const handleFileSelect = (file) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    console.log('File input changed:', e.target.files);
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      handleFileSelect(file);
    } else {
      console.log('No file selected');
    }
  };

  const handleTranscribe = () => {
    if (selectedFile) {
      onTranscription(selectedFile, selectedFile.name);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#495057' }}>
        Upload Audio File
      </h2>

      {!selectedFile ? (
        <div
          className={`file-upload-area ${isDragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h3 style={{ marginBottom: '8px', color: '#495057' }}>
            Drop your audio file here
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '16px' }}>
            or click to browse files
          </p>
          <button 
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Button clicked, opening file dialog...');
              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                console.error('File input ref is null');
              }
            }}
          >
            📄 Choose File
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a,.flac,.webm,.ogg"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div>
          <div className="success-message" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '24px' }}>📄</div>
                <div>
                  <strong>{selectedFile.name}</strong>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={clearFile}
                style={{ padding: '8px' }}
                title="Delete file"
              >
                ❌
              </button>
            </div>
          </div>

          <div className="audio-player">
            <audio controls src={audioUrl} style={{ width: '100%' }}>
              Your browser does not support the audio element.
            </audio>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              className="btn btn-success"
              onClick={handleTranscribe}
            >
              ▶️ Transcribe Audio
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={clearFile}
            >
              🔄 Choose Different File
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6c757d',
        marginTop: '20px'
      }}>
        <strong>Supported formats:</strong> {supportedFormats.join(', ').toUpperCase()}
        <br />
        <strong>Maximum file size:</strong> {maxFileSize / (1024 * 1024)}MB
        <br />
        <strong>Recommended:</strong> Clear audio with minimal background noise for best results
      </div>
    </div>
  );
};

export default FileUploader;
