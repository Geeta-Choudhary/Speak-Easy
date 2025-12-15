from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import time
import tempfile
import threading
from datetime import datetime
from dotenv import load_dotenv
import logging
from werkzeug.exceptions import BadRequest, InternalServerError

from services.azure_speech_service import AzureSpeechService
from utils.audio_validator import AudioValidator
from utils.response_formatter import ResponseFormatter

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
azure_service = AzureSpeechService()
audio_validator = AudioValidator()
response_formatter = ResponseFormatter()

# Store active sessions for continuous transcription
active_sessions = {}


@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Speech-to-Text API',
        'version': '2.0.0',
        'available_apis': [
            '/api/test-connection-mic',
            '/api/simple-realtime',
            '/api/multilanguage-transcription',
            '/api/continuous/start',
            '/api/continuous/stop',
            '/api/continuous/results',
            '/api/file-transcription',
            '/api/download-transcription'
        ]
    })


@app.route('/api/test-connection-mic', methods=['POST'])
def test_connection_and_microphone():
    """
    API 1: Test connection and microphone functionality
    Tests Azure connection and microphone for 5 seconds
    """
    try:
        data = request.get_json() or {}
        duration = data.get('duration', 5)

        if duration < 1 or duration > 30:
            raise BadRequest('Duration must be between 1 and 30 seconds')

        logger.info(f"Testing connection and microphone for {duration} seconds")

        result = azure_service.test_connection_and_microphone(duration_seconds=duration)

        if result['success']:
            logger.info("Connection and microphone test successful")
            return jsonify({
                'success': True,
                'connection_status': result['connection_status'],
                'microphone_status': result['microphone_status'],
                'transcription': result['transcription'],
                'duration': result['duration'],
                'word_count': result['word_count'],
                'message': 'Connection and microphone test completed successfully'
            })
        else:
            logger.warning(f"Connection or microphone test failed: {result['error']}")
            return jsonify({
                'success': False,
                'connection_status': result['connection_status'],
                'microphone_status': result['microphone_status'],
                'error': result['error'],
                'transcription': result.get('transcription', '')
            }), 400

    except BadRequest as e:
        logger.warning(f"Bad request in test connection: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in test connection: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/simple-realtime', methods=['POST'])
def simple_realtime_transcription():
    """
    API 2: Simple Real-time transcription
    Transcribes speech for specified duration (default: 10 seconds)
    Returns transcription once at the end
    """
    try:
        data = request.get_json() or {}
        duration = data.get('duration', 10)
        language = data.get('language', 'en-US')

        if duration < 1 or duration > 120:
            raise BadRequest('Duration must be between 1 and 120 seconds')

        logger.info(f"Starting simple real-time transcription for {duration} seconds in {language}")

        result = azure_service.convert_speech_to_text_simple_realtime(
            duration_seconds=duration,
            language=language
        )

        if result['success']:
            logger.info("Simple real-time transcription successful")
            return jsonify({
                'success': True,
                'transcription': result['combined_text'],
                'duration': result['duration'],
                'language': result['language'],
                'word_count': len(result['combined_text'].split()) if result['combined_text'] else 0,
                'segments': len(result['transcriptions']),
                'message': 'Real-time transcription completed successfully'
            })
        else:
            logger.warning(f"Simple real-time transcription failed: {result['error']}")
            return jsonify({
                'success': False,
                'transcription': '',
                'duration': result['duration'],
                'language': result['language'],
                'error': result['error']
            }), 400

    except BadRequest as e:
        logger.warning(f"Bad request in simple real-time: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in simple real-time: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/multilanguage-transcription', methods=['POST'])
def multilanguage_transcription():
    """
    API 3: Multi-language transcription
    Transcribes speech in specified language for specified duration (default: 5 seconds)
    Returns full transcription once at the end
    """
    try:
        data = request.get_json() or {}
        duration = data.get('duration', 5)
        language = data.get('language', 'en-US')

        if duration < 1 or duration > 60:
            raise BadRequest('Duration must be between 1 and 60 seconds')

        # Validate language code
        supported_languages = azure_service.get_supported_languages()
        valid_languages = [lang['code'] for lang in supported_languages]

        if language not in valid_languages:
            raise BadRequest(
                f'Unsupported language code: {language}. Supported languages: {", ".join(valid_languages)}')

        logger.info(f"Starting multi-language transcription for {duration} seconds in {language}")

        result = azure_service.convert_speech_to_text_multilanguage(
            duration_seconds=duration,
            language=language
        )

        if result['success']:
            logger.info("Multi-language transcription successful")
            return jsonify({
                'success': True,
                'transcription': result['combined_text'],
                'duration': result['duration'],
                'language': result['language'],
                'word_count': len(result['combined_text'].split()) if result['combined_text'] else 0,
                'segments': len(result['transcriptions']),
                'message': f'Multi-language transcription in {language} completed successfully'
            })
        else:
            logger.warning(f"Multi-language transcription failed: {result['error']}")
            return jsonify({
                'success': False,
                'transcription': '',
                'duration': result['duration'],
                'language': result['language'],
                'error': result['error']
            }), 400

    except BadRequest as e:
        logger.warning(f"Bad request in multi-language: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in multi-language: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/continuous/start', methods=['POST'])
def start_continuous_transcription():
    """
    API 4a: Start continuous real-time transcription (No Diarization)
    Starts a session that can be stopped later
    """
    try:
        data = request.get_json() or {}
        language = data.get('language', 'en-US')
        session_id = data.get('session_id', f"session_{int(time.time())}")

        # Validate language code
        supported_languages = azure_service.get_supported_languages()
        valid_languages = [lang['code'] for lang in supported_languages]

        if language not in valid_languages:
            raise BadRequest(f'Unsupported language code: {language}')

        # Check if session already exists
        if session_id in active_sessions:
            raise BadRequest(f'Session {session_id} already exists')

        logger.info(f"Starting continuous transcription session: {session_id} in {language}")

        # Create session
        session = azure_service.start_continuous_transcription_session(language=language)

        if session['success']:
            # Start recognition
            if azure_service.start_continuous_recognition(session):
                active_sessions[session_id] = session
                logger.info(f"Continuous transcription started for session: {session_id}")

                return jsonify({
                    'success': True,
                    'session_id': session_id,
                    'language': language,
                    'status': 'recording',
                    'message': 'Continuous transcription started successfully'
                })
            else:
                logger.error(f"Failed to start recognition for session: {session_id}")
                return jsonify({
                    'success': False,
                    'session_id': session_id,
                    'error': 'Failed to start continuous recognition'
                }), 500
        else:
            logger.error(f"Failed to create session: {session['error']}")
            return jsonify({
                'success': False,
                'session_id': session_id,
                'error': session['error']
            }), 500

    except BadRequest as e:
        logger.warning(f"Bad request in start continuous: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in start continuous: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/continuous/stop', methods=['POST'])
def stop_continuous_transcription():
    """
    API 4b: Stop continuous real-time transcription
    Stops the session and returns final transcription
    """
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')

        if not session_id:
            raise BadRequest('session_id is required')

        if session_id not in active_sessions:
            raise BadRequest(f'Session {session_id} not found')

        logger.info(f"Stopping continuous transcription session: {session_id}")

        session = active_sessions[session_id]
        result = azure_service.stop_continuous_recognition(session)

        # Remove session from active sessions
        del active_sessions[session_id]

        if result['success']:
            logger.info(f"Continuous transcription stopped for session: {session_id}")
            return jsonify({
                'success': True,
                'session_id': session_id,
                'status': 'stopped',
                'transcription': result['combined_text'],
                'session_duration': result['session_duration'],
                'word_count': result['word_count'],
                'segments': len(result['transcriptions']),
                'message': 'Continuous transcription stopped successfully'
            })
        else:
            logger.error(f"Failed to stop session {session_id}: {result['error']}")
            return jsonify({
                'success': False,
                'session_id': session_id,
                'error': result['error']
            }), 500

    except BadRequest as e:
        logger.warning(f"Bad request in stop continuous: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in stop continuous: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/continuous/results', methods=['POST'])
def get_continuous_transcription_results():
    """
    API 4c: Get current results from continuous transcription session
    Returns transcription results every 3 seconds or as requested
    """
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')

        if not session_id:
            raise BadRequest('session_id is required')

        if session_id not in active_sessions:
            raise BadRequest(f'Session {session_id} not found or stopped')

        session = active_sessions[session_id]
        result = azure_service.get_session_results_periodic(session)

        if result['success']:
            return jsonify({
                'success': True,
                'session_id': session_id,
                'status': 'active' if result['is_active'] else 'inactive',
                'transcription': result['combined_text'],
                'session_duration': result['session_duration'],
                'word_count': result['word_count'],
                'segments': len(result['transcriptions']),
                'is_active': result['is_active']
            })
        else:
            return jsonify({
                'success': False,
                'session_id': session_id,
                'error': result['error']
            }), 500

    except BadRequest as e:
        logger.warning(f"Bad request in get continuous results: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in get continuous results: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/file-transcription', methods=['POST'])
def file_transcription():
    """
    API 5: File transcription
    Accepts a WAV file and returns full transcription
    """
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            raise BadRequest('No audio file provided')

        audio_file = request.files['audio']

        if audio_file.filename == '':
            raise BadRequest('No audio file selected')

        # Get language from form data
        language = request.form.get('language', 'en-US')

        # Validate language code
        supported_languages = azure_service.get_supported_languages()
        valid_languages = [lang['code'] for lang in supported_languages]

        if language not in valid_languages:
            raise BadRequest(f'Unsupported language code: {language}')

        # Validate audio file
        if not audio_validator.is_valid_audio_file(audio_file):
            raise BadRequest('Invalid audio file format. Supported formats: wav, mp3, m4a, flac')

        # Read audio data
        audio_data = audio_file.read()

        # Validate audio size (max 50MB for file processing)
        if not audio_validator.is_valid_audio_size(audio_data):
            raise BadRequest('Audio file too large. Maximum size: 50MB')

        logger.info(f"Processing audio file: {audio_file.filename} in {language}")

        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name

        try:
            # Convert speech to text
            result = azure_service.convert_speech_to_text_from_file(
                audio_file_path=temp_file_path,
                language=language
            )

            # Clean up temporary file
            os.unlink(temp_file_path)

            if result['success']:
                logger.info("File transcription successful")
                return jsonify({
                    'success': True,
                    'transcription': result['combined_text'],
                    'filename': audio_file.filename,
                    'language': result['language'],
                    'word_count': len(result['combined_text'].split()) if result['combined_text'] else 0,
                    'segments': len(result['transcriptions']),
                    'message': 'File transcription completed successfully'
                })
            else:
                logger.warning(f"File transcription failed: {result['error']}")
                return jsonify({
                    'success': False,
                    'transcription': '',
                    'filename': audio_file.filename,
                    'language': language,
                    'error': result['error']
                }), 400

        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e

    except BadRequest as e:
        logger.warning(f"Bad request in file transcription: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in file transcription: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/download-transcription', methods=['POST'])
def download_transcription():
    """
    API 6: Download transcription as text file
    Accepts transcription text and returns a downloadable text file
    """
    try:
        data = request.get_json()

        if not data or 'transcription' not in data:
            raise BadRequest('Transcription text is required')

        transcription_text = data.get('transcription', '').strip()

        if not transcription_text:
            raise BadRequest('Transcription text cannot be empty')

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"speak_easy_transcription_{timestamp}.txt"

        # Create temporary file with transcription
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8')

        # Write header with metadata
        temp_file.write("SpeakEasy Transcription\n")
        temp_file.write("=" * 50 + "\n")
        temp_file.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        temp_file.write(f"Word count: {len(transcription_text.split())}\n")
        temp_file.write(f"Character count: {len(transcription_text)}\n")
        temp_file.write("=" * 50 + "\n\n")

        # Write transcription content
        temp_file.write(transcription_text)
        temp_file.write("\n\n")
        temp_file.write("=" * 50 + "\n")
        temp_file.write("Generated by SpeakEasy API\n")

        temp_file.close()

        logger.info(f"Generated transcription file: {filename}")

        def remove_file(response):
            """Clean up temporary file after sending"""
            try:
                os.unlink(temp_file.name)
            except:
                pass
            return response

        # Return file as download
        response = send_file(
            temp_file.name,
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain'
        )

        # Add callback to remove temporary file after response
        response.call_on_close(lambda: os.unlink(temp_file.name) if os.path.exists(temp_file.name) else None)

        return response

    except BadRequest as e:
        logger.warning(f"Bad request in download transcription: {str(e)}")
        return jsonify(response_formatter.format_error_response(str(e), 400)), 400
    except Exception as e:
        logger.error(f"Internal error in download transcription: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Internal server error occurred"
        )), 500


@app.route('/api/supported-languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages for speech recognition"""
    try:
        languages = azure_service.get_supported_languages()
        return jsonify({
            'success': True,
            'languages': languages,
            'count': len(languages)
        })
    except Exception as e:
        logger.error(f"Error fetching supported languages: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Failed to fetch supported languages"
        )), 500


@app.route('/api/active-sessions', methods=['GET'])
def get_active_sessions():
    """Get list of active continuous transcription sessions"""
    try:
        sessions_info = []
        for session_id, session in active_sessions.items():
            session_info = {
                'session_id': session_id,
                'language': session['session'].get('language', 'unknown'),
                'is_active': session['session'].get('is_active', False),
                'start_time': session['session'].get('start_time', 0),
                'duration': time.time() - session['session'].get('start_time', time.time())
            }
            sessions_info.append(session_info)

        return jsonify({
            'success': True,
            'active_sessions': sessions_info,
            'count': len(sessions_info)
        })
    except Exception as e:
        logger.error(f"Error fetching active sessions: {str(e)}")
        return jsonify(response_formatter.format_error_response(
            "Failed to fetch active sessions"
        )), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify(response_formatter.format_error_response(
        "Endpoint not found", 404
    )), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify(response_formatter.format_error_response(
        "Internal server error", 500
    )), 500


if __name__ == '__main__':
    # Validate environment variables on startup
    required_env_vars = ['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]

    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please check your .env file and ensure all required variables are set")
        exit(1)

    logger.info("Starting Enhanced Speech-to-Text API server...")
    logger.info("Available APIs:")
    logger.info("  1. POST /api/test-connection-mic - Test connection and microphone")
    logger.info("  2. POST /api/simple-realtime - Simple real-time transcription")
    logger.info("  3. POST /api/multilanguage-transcription - Multi-language transcription")
    logger.info("  4a. POST /api/continuous/start - Start continuous transcription")
    logger.info("  4b. POST /api/continuous/stop - Stop continuous transcription")
    logger.info("  4c. POST /api/continuous/results - Get continuous transcription results")
    logger.info("  5. POST /api/file-transcription - File transcription")
    logger.info("  6. POST /api/download-transcription - Download transcription file")
    logger.info("  Additional: GET /api/supported-languages - Get supported languages")
    logger.info("  Additional: GET /api/active-sessions - Get active sessions")

    app.run(debug=True, host='0.0.0.0', port=5000)