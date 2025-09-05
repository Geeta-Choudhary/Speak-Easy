import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check for microphone permission
    checkMicrophonePermission();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Stop the stream immediately as we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      console.error('Microphone permission denied:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTranscribe = () => {
    if (audioBlob) {
      onTranscription(audioBlob, `recording_${Date.now()}.webm`);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="error-message">
        <h3>Microphone Access Required</h3>
        <p>
          Please allow microphone access to use the recording feature. 
          You can enable it in your browser settings and refresh the page.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={checkMicrophonePermission}
        >
          Check Permission Again
        </button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Checking microphone permissions...</span>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#495057' }}>
        Record Your Voice
      </h2>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {!isRecording && !audioBlob && (
          <button 
            className="btn btn-primary"
            onClick={startRecording}
            style={{ fontSize: '18px', padding: '15px 30px' }}
          >
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <div>
            <div className="recording-indicator" style={{ marginBottom: '20px' }}>
              <div className="recording-dot"></div>
              <span>
                {isPaused ? 'Recording Paused' : 'Recording...'} 
                ({formatTime(recordingTime)})
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={pauseRecording}
              >
                {isPaused ? '▶️' : '⏸️'}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={stopRecording}
              >
                ⏹️ Stop Recording
              </button>
            </div>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div>
            <div className="success-message" style={{ marginBottom: '20px' }}>
              <strong>Recording Complete!</strong> Duration: {formatTime(recordingTime)}
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
                🎯 Transcribe Audio
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={resetRecording}
              >
                🔄 Record Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <strong>Tips for better transcription:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Speak clearly and at a moderate pace</li>
          <li>Minimize background noise</li>
          <li>Keep the microphone close to your mouth</li>
          <li>Use a quiet environment for best results</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioRecorder;
