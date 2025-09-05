# Speak Easy - Frontend

A modern React frontend for the Speech-to-Text conversion application using Azure Cognitive Services.

## Features

- 🎤 **Real-time Audio Recording**: Record audio directly in the browser with pause/resume functionality
- 📁 **File Upload**: Drag and drop or browse to upload audio files
- 🎯 **Speech-to-Text**: Convert audio to text using Azure Cognitive Services
- 📋 **Copy & Download**: Copy transcription text or download as TXT file
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Feedback**: Loading states, progress indicators, and error handling

## Supported Audio Formats

- WAV
- MP3
- M4A
- FLAC
- WEBM
- OGG

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on port 5000

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend/Speak-Easy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file (optional):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
```

## Usage

### Recording Audio

1. Click on the "🎤 Record Audio" tab
2. Allow microphone permissions when prompted
3. Click "Start Recording" to begin
4. Use "Pause" and "Resume" buttons as needed
5. Click "Stop Recording" when finished
6. Click "🎯 Transcribe Audio" to convert to text

### Uploading Files

1. Click on the "📁 Upload File" tab
2. Drag and drop an audio file or click "Choose File"
3. Preview the audio using the built-in player
4. Click "Transcribe Audio" to convert to text

### Viewing Results

- View the transcribed text in the results area
- Copy text to clipboard using the "Copy Text" button
- Download as a TXT file using the "Download as TXT" button
- View confidence score and detected language

## Connecting to Backend

The frontend is configured to connect to the backend API running on `http://localhost:5000` by default. The connection is established through:

1. **Proxy Configuration**: The `package.json` includes a proxy setting for development
2. **API Service**: The `src/services/api.js` file handles all API communications
3. **Environment Variables**: Custom API URLs can be set via environment variables

### Backend API Endpoints Used

- `POST /api/speech-to-text` - Convert audio to text
- `GET /api/supported-languages` - Get supported languages
- `GET /` - Health check

## Project Structure

```
src/
├── components/
│   ├── Header.js              # Application header
│   ├── AudioRecorder.js       # Microphone recording component
│   ├── FileUploader.js        # File upload component
│   └── TranscriptionResult.js # Results display component
├── services/
│   └── api.js                 # API service for backend communication
├── App.js                     # Main application component
├── index.js                   # Application entry point
└── index.css                  # Global styles
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: Microphone recording requires HTTPS in production environments.

## Troubleshooting

### Microphone Issues

1. Ensure microphone permissions are granted
2. Check if microphone is working in other applications
3. Try refreshing the page and granting permissions again

### File Upload Issues

1. Check file format is supported
2. Ensure file size is under 10MB
3. Try a different audio file

### API Connection Issues

1. Verify backend is running on port 5000
2. Check browser console for error messages
3. Ensure CORS is properly configured in backend

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

3. Update the `REACT_APP_API_URL` environment variable to point to your production API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Speak Easy Speech-to-Text application.


