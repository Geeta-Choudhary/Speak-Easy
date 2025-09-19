const API_URL = process.env.REACT_APP_API_URL;

export const speechAPI = {
  testConnection: async (duration = 5) => {
    try {
      const response = await fetch(`${API_URL}/api/test-connection-mic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duration }),
      })
      return await response.json()
    } catch (error) {
      throw new Error("Failed to connect to backend")
    }
  },

  transcribeAudio: async (duration = 10, language = "en-US") => {
    try {
      const response = await fetch(`${API_URL}/api/simple-realtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duration, language }),
      })
      return await response.json()
    } catch (error) {
      throw new Error("Transcription failed")
    }
  },

  startContinuousTranscription: async (language = "en-US", sessionId = null) => {
    try {
      const body = { language }
      if (sessionId) body.session_id = sessionId

      const response = await fetch(`${API_URL}/api/continuous/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      return await response.json()
    } catch (error) {
      throw new Error("Continuous transcription failed")
    }
  },

  // Stop continuous transcription
  stopContinuousTranscription: async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/continuous/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      })
      return await response.json()
    } catch (error) {
      throw new Error("Failed to stop continuous transcription")
    }
  },

  getContinuousResults: async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/api/continuous/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId }),
      })
      return await response.json()
    } catch (error) {
      throw new Error("Failed to get continuous results")
    }
  },

  transcribeMultiLanguage: async (duration = 5, language = "hi") => {
    try {
      const response = await fetch(`${API_URL}/api/multilanguage-transcription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ duration, language }),
      })
      return await response.json()
    } catch (error) {
      throw new Error("Multi-language transcription failed")
    }
  },

  transcribeFile: async (file, language = "en-US") => {
    try {
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("language", language)

      const response = await fetch(`${API_URL}/api/file-transcription`, {
        method: "POST",
        body: formData,
      })
      return await response.json()
    } catch (error) {
      throw new Error("File transcription failed")
    }
  },

  downloadTranscription: async (transcriptionText) => {
  const response = await fetch(`${API_URL}/api/download-transcription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transcription: transcriptionText,
    }),
  });
  return response; // Let the component handle .blob() and errors
},

  getSupportedLanguages: async () => {
    try {
      const response = await fetch(`${API_URL}/api/supported-languages`)
      return await response.json()
    } catch (error) {
      throw new Error("Failed to fetch supported languages")
    }
  },

  getActiveSessions: async () => {
    try {
      const response = await fetch(`${API_URL}/api/active-sessions`)
      return await response.json()
    } catch (error) {
      throw new Error("Failed to fetch active sessions")
    }
  },
}

export async function simpleRealtimeTranscribe(duration, language = "en-US") {
  const res = await fetch(`${API_URL}/api/simple-realtime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ duration, language }),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
