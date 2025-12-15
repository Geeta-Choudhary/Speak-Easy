// audioRecorder.js
// Utility to record audio from the user's microphone and export as .wav

// Helper: Convert Float32Array PCM to WAV Blob
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

export async function recordAudio(durationSeconds = 15) {
  if (!navigator.mediaDevices || !window.AudioContext) {
    throw new Error('Microphone not supported');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new window.AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  let audioData = [];

  processor.onaudioprocess = (e) => {
    audioData.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      // Flatten audioData
      let samples = new Float32Array(audioData.reduce((acc, cur) => acc + cur.length, 0));
      let offset = 0;
      for (let arr of audioData) {
        samples.set(arr, offset);
        offset += arr.length;
      }
      // Encode to WAV
      const wavBlob = encodeWAV(samples, audioContext.sampleRate);
      audioContext.close();
      resolve(wavBlob);
    }, durationSeconds * 1000);
    processor.onerror = (e) => {
      reject(e.error);
      stream.getTracks().forEach((track) => track.stop());
      audioContext.close();
    };
  });
}
