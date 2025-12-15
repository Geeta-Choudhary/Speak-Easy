# VoiceTranscribe API - Enhanced Speech-to-Text Service

A comprehensive Flask-based REST API that provides multiple speech-to-text conversion methods using Azure Cognitive Services. This service offers real-time transcription, continuous recording sessions, file processing, and multi-language support for various use cases.

## Features

- 🎤 Multiple speech-to-text conversion methods
- 🔄 Real-time and continuous transcription capabilities
- 📁 Audio file upload and processing
- 🌍 Multi-language support (English & Hindi languages)
- 📊 Session management for long recordings
- 💾 Downloadable transcription files
- ⚡ Connection and microphone testing
- 🔒 CORS enabled for frontend integration
- 📈 Confidence scores and detailed results

## Prerequisites

- Python 3.8 or higher
- Azure account with Speech Service resource
- Microphone access for real-time transcription
- pip (Python package installer)

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/shireen-vir/voicetranscribe-api
cd voicetranscribe-api

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:
```bash
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=your_azure_region
```

### 3. Run the Application

```bash
flask run
```

API available at: `http://localhost:5000`

## API Endpoints Overview

The API provides 6 main speech-to-text methods plus utility endpoints:

1. **Connection Test** - Test Azure connection and microphone
2. **Simple Real-time** - Fixed duration real-time transcription
3. **Multi-language** - Language-specific transcription
4. **Continuous Session** - Start/stop/monitor long recordings
5. **File Transcription** - Process uploaded audio files
6. **Download Service** - Generate downloadable transcription files

---

## API Documentation

### 1. Test Connection and Microphone

**Endpoint:** `POST /api/test-connection-mic`

**Purpose:** Verify Azure Speech Service connection and test microphone functionality.

**When to use:** Before starting any transcription to ensure everything is working.

```bash
# Test for 5 seconds (default)
curl -X POST http://localhost:5000/api/test-connection-mic \
  -H "Content-Type: application/json" \
  -d '{}'

# Test for custom duration
curl -X POST http://localhost:5000/api/test-connection-mic \
  -H "Content-Type: application/json" \
  -d '{"duration": 10}'
```

**Request Body:**
```json
{
  "duration": 5  // Optional: 1-30 seconds, default: 5
}
```

**Response (Success):**
```json
{
  "success": true,
  "connection_status": "success",
  "microphone_status": "success",
  "transcription": "Hello, hello, mic testing.",
  "duration": 5,
  "word_count": 4,
  "message": "Connection and microphone test completed successfully"
}
```

---

### 2. Simple Real-time Transcription

**Endpoint:** `POST /api/simple-realtime`

**Purpose:** Record and transcribe speech for a fixed duration, returning results at the end.

**When to use:** For short recordings where you want the complete transcription after recording finishes.

```bash
# Default 10-second recording in English
curl -X POST http://localhost:5000/api/simple-realtime \
  -H "Content-Type: application/json" \
  -d '{}'

# Custom duration and language
curl -X POST http://localhost:5000/api/simple-realtime \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 15,
    "language": "en-US"
  }'
```

**Request Body:**
```json
{
  "duration": 10,      // Optional: 1-120 seconds, default: 10
  "language": "en-US"  // Optional: default: "en-US" can be "hi-IN" for Hindi
}
```

**Response (Success):**
```json
{
  "success": true,
  "transcription": "123456 Testing simple real time transcription for 15 seconds in English US transcription method. Away.",
  "duration": 15,
  "language": "en-US",
  "word_count": 16,
  "segments": 2,
  "message": "Real-time transcription completed successfully"
}
```

---

### 3. Multi-language Transcription

**Endpoint:** `POST /api/multilanguage-transcription`

**Purpose:** Language-specific speech transcription with validation.

**When to use:** When you need transcription in a specific language other than English.

```bash
# Hindi transcription
curl -X POST http://localhost:5000/api/multilanguage-transcription \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 5,
    "language": "hi-IN"
  }'

# Spanish transcription
curl -X POST http://localhost:5000/api/multilanguage-transcription \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 8,
    "language": "es-ES"
  }'
```

**Request Body:**
```json
{
  "duration": 5,       // Optional: 1-60 seconds, default: 5
  "language": "hi-IN"  // Required: must be supported language code
}
```

**Available Languages:** Use `GET /api/supported-languages` to get the complete list.

---

### 4. Continuous Transcription Session

**Purpose:** Long-duration recording with start/stop control and periodic result checking.

**When to use:** For meetings, interviews, or any long-form content where you need to control when recording starts/stops.

#### 4a. Start Continuous Session

```bash
curl -X POST http://localhost:5000/api/continuous/start \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "my_session",
    "language": "en-US"
  }'
```

**Request Body:**
```json
{
  "session_id": "my_session",  // Optional: auto-generated if not provided
  "language": "en-US"          // Optional: default: "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "my_session",
  "language": "en-US",
  "status": "recording",
  "message": "Continuous transcription started successfully"
}
```

#### 4b. Get Session Results (While Recording)

```bash
curl -X POST http://localhost:5000/api/continuous/results \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "my_session"
  }'
```

**Response:**
```json
{
  "success": true,
  "session_id": "my_session",
  "status": "active",
  "transcription": "Session started for transcription. You should receive. Continuous transcriptions. It will keep sending continuous transcriptions. Should work as expected.",
  "session_duration": 45.2,
  "word_count": 18,
  "segments": 5,
  "is_active": true
}
```

#### 4c. Stop Continuous Session

```bash
curl -X POST http://localhost:5000/api/continuous/stop \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "my_session"
  }'
```

**Response:**
```json
{
  "success": true,
  "session_id": "my_session",
  "status": "stopped",
  "transcription": "Complete final transcription of the entire session...",
  "session_duration": 127.5,
  "word_count": 45,
  "segments": 12,
  "message": "Continuous transcription stopped successfully"
}
```

---

### 5. File Transcription

**Endpoint:** `POST /api/file-transcription`

**Purpose:** Upload and transcribe audio files.

**When to use:** For pre-recorded audio files that need transcription.

```bash
# Upload WAV file
curl -X POST http://localhost:5000/api/file-transcription \
  -F "audio=@/path/to/your/audio.wav" \
  -F "language=en-US"

# Upload MP3 file with different language
curl -X POST http://localhost:5000/api/file-transcription \
  -F "audio=@/path/to/your/audio.mp3" \
  -F "language=hi-IN"
```

**Form Data:**
- `audio` (file): Audio file (WAV, MP3, M4A, FLAC, OGG, WebM)
- `language` (string): Language code (optional, default: "en-US")

**Response (Success):**
```json
{
  "success": true,
  "transcription": "Hello. Hello. Mic testing 1234. Hello. Hello.",
  "filename": "test_rec_2.wav",
  "language": "en-US",
  "word_count": 8,
  "segments": 2,
  "message": "File transcription completed successfully"
}
```

**File Limitations:**
- Maximum size: 50MB
- Supported formats: WAV (recommended), MP3, M4A, FLAC, OGG, WebM
- Recommended: 16kHz sample rate, PCM WAV, 16-bit, mono

---

### 6. Download Transcription

**Endpoint:** `POST /api/download-transcription`

**Purpose:** Generate and download transcription as a formatted text file.

**When to use:** After getting transcription results to save them as a file.

```bash
curl -X POST http://localhost:5000/api/download-transcription \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "Your complete transcription text here..."
  }' \
  --output "transcription.txt"
```

**Request Body:**
```json
{
  "transcription": "Complete transcription text to be saved..."
}
```

**Response:** Returns a formatted text file with metadata and transcription content.

**File Format:**
```
SpeakEasy Transcription
==================================================
Generated on: 2025-09-07 00:10:34
Word count: 45
Character count: 234
==================================================

[Your transcription content here]

==================================================
Generated by SpeakEasy API
```

---

## Utility Endpoints

### Get Supported Languages

```bash
curl -X GET http://localhost:5000/api/supported-languages
```

**Response:**
```json
{
  "success": true,
  "languages": [
    {"code": "en-US", "name": "English (United States)"},
    {"code": "hi-IN", "name": "Hindi (India)"},
    {"code": "es-ES", "name": "Spanish (Spain)"}
  ],
  "count": 15
}
```

### Get Active Sessions

```bash
curl -X GET http://localhost:5000/api/active-sessions
```

### Health Check

```bash
curl -X GET http://localhost:5000/
```

---

## Usage Workflows

### Workflow 1: Quick Voice Note
```bash
# 1. Test connection
curl -X POST http://localhost:5000/api/test-connection-mic -H "Content-Type: application/json" -d '{}'

# 2. Record for 10 seconds
curl -X POST http://localhost:5000/api/simple-realtime -H "Content-Type: application/json" -d '{"duration": 10}'
```

### Workflow 2: Long Meeting Recording
```bash
# 1. Start session
curl -X POST http://localhost:5000/api/continuous/start -H "Content-Type: application/json" -d '{"session_id": "meeting_001"}'

# 2. Check progress (call multiple times)
curl -X POST http://localhost:5000/api/continuous/results -H "Content-Type: application/json" -d '{"session_id": "meeting_001"}'

# 3. Stop when done
curl -X POST http://localhost:5000/api/continuous/stop -H "Content-Type: application/json" -d '{"session_id": "meeting_001"}'

# 4. Download transcription
curl -X POST http://localhost:5000/api/download-transcription -H "Content-Type: application/json" -d '{"transcription": "Final meeting transcription..."}' --output "meeting_001.txt"
```

### Workflow 3: File Processing
```bash
# Upload and process file
curl -X POST http://localhost:5000/api/file-transcription -F "audio=@recording.wav" -F "language=en-US"
```

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "timestamp": "2025-09-07T00:06:15Z",
  "error": {
    "code": 400,
    "message": "Session my_session not found or stopped"
  }
}
```

### Common Error Codes:
- `400` - Bad Request (invalid parameters, missing files)
- `404` - Not Found (invalid endpoint)
- `500` - Internal Server Error (Azure service issues)

### Common Issues:

1. **Session not found**: Session was already stopped or never started
2. **Invalid audio format**: Use supported formats (WAV, MP3, M4A, FLAC, OGG, WebM)
3. **File too large**: Maximum 50MB for file uploads
4. **Unsupported language**: Check `/api/supported-languages`
5. **Azure connection failed**: Verify credentials and internet connection

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AZURE_SPEECH_KEY` | Azure Speech Service API key | - | Yes |
| `AZURE_SPEECH_REGION` | Azure region | `centralindia` | Yes |
| `FLASK_ENV` | Flask environment | `development` | No |
| `FLASK_DEBUG` | Enable debug mode | `True` | No |

---

## Development Notes

- Sessions are stored in memory and will be lost on server restart
- Use continuous sessions for recordings longer than 2 minutes
- Test microphone before starting any real-time transcription
- WAV format provides the best transcription accuracy
- Monitor Azure usage to avoid unexpected charges

---

## Project Structure

```
voicetranscribe-api/
├── app.py                      # Main Flask application with 6 API endpoints
├── services/
│   └── azure_speech_service.py # Azure Speech Service integration
├── utils/
│   ├── audio_validator.py      # Audio file validation
│   └── response_formatter.py   # API response formatting
├── requirements.txt            # Dependencies
├── .env                        # Environment variables
└── README.md                  # This documentation
```

This API provides comprehensive speech-to-text capabilities for various use cases, from quick voice notes to long meeting recordings and file processing.