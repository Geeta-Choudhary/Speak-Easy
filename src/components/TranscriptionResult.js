import React, { useState } from 'react';

const TranscriptionResult = ({ transcription, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = transcription.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([transcription.text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcription_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="result-area">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#28a745', margin: 0 }}>
          ✅ Transcription Complete
        </h3>
        <button 
          className="btn btn-secondary"
          onClick={onClear}
          style={{ padding: '8px' }}
        >
          ❌
        </button>
      </div>

      {transcription.filename && (
        <div style={{ 
          marginBottom: '15px', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          <strong>File:</strong> {transcription.filename}
        </div>
      )}

      {transcription.timestamp && (
        <div style={{ 
          marginBottom: '15px', 
          fontSize: '14px', 
          color: '#6c757d' 
        }}>
          <strong>Processed:</strong> {formatTimestamp(transcription.timestamp)}
        </div>
      )}

      <div style={{ 
        background: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        minHeight: '150px',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#495057'
      }}>
        {transcription.text || 'No transcription text available'}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          className="btn btn-primary"
          onClick={handleCopy}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}
        >
          {copied ? '✅' : '📋'}
          {copied ? 'Copied!' : 'Copy Text'}
        </button>

        <button 
          className="btn btn-secondary"
          onClick={handleDownload}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}
        >
          💾 Download as TXT
        </button>
      </div>

      {transcription.confidence && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#495057'
        }}>
          <strong>Confidence Score:</strong> {Math.round(transcription.confidence * 100)}%
          <div style={{ 
            marginTop: '8px',
            background: '#e9ecef',
            borderRadius: '4px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '100%',
              width: `${transcription.confidence * 100}%`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}

      {transcription.language && (
        <div style={{ 
          marginTop: '15px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <strong>Detected Language:</strong> {transcription.language}
        </div>
      )}
    </div>
  );
};

export default TranscriptionResult;

