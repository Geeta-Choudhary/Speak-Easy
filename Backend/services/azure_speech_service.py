import os
import logging
from typing import Dict, Any, List, Optional, Callable
import threading
import time
import tempfile
import platform

try:
    import azure.cognitiveservices.speech as speechsdk
except ImportError:
    raise ImportError("Azure Speech SDK not found. Install it with: pip install azure-cognitiveservices-speech")

logger = logging.getLogger(__name__)


class AzureSpeechService:
    """Service class for Azure Cognitive Services Speech-to-Text with Linux compatibility"""

    def __init__(self):
        self.subscription_key = os.getenv('AZURE_SPEECH_KEY')
        self.region = os.getenv('AZURE_SPEECH_REGION', 'centralindia')
        self.endpoint = f"https://{self.region}.api.cognitive.microsoft.com"

        if not self.subscription_key:
            raise ValueError("Azure Speech subscription key not found in environment variables")

        # Initialize speech config
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.subscription_key,
            endpoint=self.endpoint
        )

        # Detect if running on Linux and set appropriate audio configuration
        self.is_linux = platform.system().lower() == 'linux'
        logger.info(f"Running on {platform.system()}, Linux mode: {self.is_linux}")

    def _get_audio_config(self):
        """Get appropriate audio configuration based on platform"""
        try:
            if self.is_linux:
                # For Linux environments (especially Azure App Service),
                # we need to avoid using microphone directly
                logger.warning("Linux environment detected - microphone access may be limited")
                return None
            else:
                # For Windows/local development
                return speechsdk.audio.AudioConfig(use_default_microphone=True)
        except Exception as e:
            logger.error(f"Error creating audio config: {str(e)}")
            return None

    def test_connection_and_microphone(self, duration_seconds: int = 5) -> Dict[str, Any]:
        """
        Test connection to Azure Speech Service and microphone functionality
        Modified for Linux compatibility
        """
        try:
            # Test connection first
            connection_test = self.test_connection()
            if not connection_test['success']:
                return {
                    'success': False,
                    'connection_status': 'failed',
                    'microphone_status': 'not_tested',
                    'error': connection_test['error'],
                    'transcription': ''
                }

            # Check if we're on Linux - microphone test may not work
            if self.is_linux:
                return {
                    'success': True,
                    'connection_status': 'success',
                    'microphone_status': 'unavailable_on_linux',
                    'transcription': 'Microphone testing is not supported on Linux server environments. Please use file upload for transcription.',
                    'duration': duration_seconds,
                    'word_count': 0,
                    'platform': platform.system()
                }

            # Test microphone with speech recognition (Windows only)
            mic_result = self.convert_speech_to_text_simple_realtime(
                duration_seconds=duration_seconds,
                language="en-US"
            )

            return {
                'success': True,
                'connection_status': 'success',
                'microphone_status': 'success' if mic_result['success'] else 'failed',
                'transcription': mic_result['combined_text'],
                'duration': duration_seconds,
                'word_count': len(mic_result['combined_text'].split()) if mic_result['combined_text'] else 0,
                'platform': platform.system()
            }

        except Exception as e:
            logger.error(f"Error in connection and microphone test: {str(e)}")
            return {
                'success': False,
                'connection_status': 'failed',
                'microphone_status': 'error',
                'error': f'Test error: {str(e)}',
                'transcription': '',
                'platform': platform.system()
            }

    def convert_speech_to_text_simple_realtime(
            self,
            duration_seconds: int = 10,
            language: str = 'en-US'
    ) -> Dict[str, Any]:
        """
        Simple real-time speech-to-text - modified for Linux compatibility
        """
        try:
            # Check if we're on Linux
            if self.is_linux:
                return {
                    'success': False,
                    'transcriptions': [],
                    'combined_text': '',
                    'error': 'Real-time microphone transcription is not supported on Linux server environments. Please use file upload instead.',
                    'duration': duration_seconds,
                    'language': language,
                    'platform': platform.system()
                }

            # Configure speech recognition
            self.speech_config.speech_recognition_language = language

            # Create audio configuration
            audio_config = self._get_audio_config()
            if not audio_config:
                return {
                    'success': False,
                    'transcriptions': [],
                    'combined_text': '',
                    'error': 'Unable to initialize audio configuration',
                    'duration': duration_seconds,
                    'language': language
                }

            # Create speech recognizer
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            # Results storage
            results = {
                'success': False,
                'transcriptions': [],
                'combined_text': '',
                'error': None,
                'duration': duration_seconds,
                'language': language
            }

            # Event to track completion
            done = threading.Event()

            def recognized_cb(evt):
                """Callback for recognized speech"""
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    transcription = {
                        'text': evt.result.text,
                        'confidence': getattr(evt.result, 'confidence', 0.0),
                        'timestamp': time.time()
                    }
                    results['transcriptions'].append(transcription)
                    logger.info(f"Recognized: {evt.result.text}")

            def canceled_cb(evt):
                """Callback for canceled recognition"""
                if evt.reason == speechsdk.CancellationReason.Error:
                    results['error'] = f"Recognition error: {evt.error_details}"
                done.set()

            def session_stopped_cb(evt):
                """Callback for session stopped"""
                done.set()

            # Connect callbacks
            speech_recognizer.recognized.connect(recognized_cb)
            speech_recognizer.canceled.connect(canceled_cb)
            speech_recognizer.session_stopped.connect(session_stopped_cb)

            # Start recognition
            logger.info(f"Listening for {duration_seconds} seconds...")
            speech_recognizer.start_continuous_recognition()

            # Wait for specified duration or until stopped
            done.wait(timeout=duration_seconds)

            # Stop recognition
            speech_recognizer.stop_continuous_recognition()

            # Process results
            if results['transcriptions']:
                results['success'] = True
                results['combined_text'] = ' '.join([t['text'] for t in results['transcriptions']])
            elif not results['error']:
                results['error'] = 'No speech detected during the recording period'

            return results

        except Exception as e:
            logger.error(f"Error in simple real-time transcription: {str(e)}")
            return {
                'success': False,
                'transcriptions': [],
                'combined_text': '',
                'error': f'Recognition error: {str(e)}',
                'duration': duration_seconds,
                'language': language
            }

    def convert_speech_to_text_multilanguage(
            self,
            duration_seconds: int = 5,
            language: str = 'en-US'
    ) -> Dict[str, Any]:
        """
        Multi-language speech-to-text transcription - modified for Linux
        """
        if self.is_linux:
            return {
                'success': False,
                'transcriptions': [],
                'combined_text': '',
                'error': 'Real-time microphone transcription is not supported on Linux server environments. Please use file upload instead.',
                'duration': duration_seconds,
                'language': language,
                'platform': platform.system()
            }
        return self.convert_speech_to_text_simple_realtime(duration_seconds, language)

    def start_continuous_transcription_session(self, language: str = 'en-US') -> Dict[str, Any]:
        """
        Start a continuous transcription session - modified for Linux
        """
        try:
            if self.is_linux:
                return {
                    'success': False,
                    'error': 'Continuous microphone transcription is not supported on Linux server environments. Please use file upload instead.',
                    'platform': platform.system()
                }

            # Configure speech recognition
            self.speech_config.speech_recognition_language = language

            # Create audio configuration
            audio_config = self._get_audio_config()
            if not audio_config:
                return {
                    'success': False,
                    'error': 'Unable to initialize audio configuration'
                }

            # Create speech recognizer
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            # Session control
            session_control = {
                'recognizer': speech_recognizer,
                'is_active': False,
                'stop_event': threading.Event(),
                'session_id': None,
                'results': [],
                'language': language,
                'start_time': time.time()
            }

            def transcribed_cb(evt):
                """Callback for final transcription results"""
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    transcription_data = {
                        'text': evt.result.text,
                        'confidence': getattr(evt.result, 'confidence', 0.0),
                        'timestamp': time.time()
                    }
                    session_control['results'].append(transcription_data)
                    logger.info(f"TRANSCRIBED: Text={evt.result.text}")

            def session_started_cb(evt):
                """Callback for session start"""
                session_control['session_id'] = evt.session_id
                logger.info(f'Continuous session started: {evt.session_id}')

            def session_stopped_cb(evt):
                """Callback for session stop"""
                logger.info('Continuous session stopped')
                session_control['stop_event'].set()

            def canceled_cb(evt):
                """Callback for cancellation"""
                logger.error(f'Continuous session canceled: {evt}')
                session_control['stop_event'].set()

            # Connect callbacks to events
            speech_recognizer.recognized.connect(transcribed_cb)
            speech_recognizer.session_started.connect(session_started_cb)
            speech_recognizer.session_stopped.connect(session_stopped_cb)
            speech_recognizer.canceled.connect(canceled_cb)

            return {
                'success': True,
                'session': session_control,
                'message': 'Continuous transcription session created successfully'
            }

        except Exception as e:
            logger.error(f"Error creating continuous transcription session: {str(e)}")
            return {
                'success': False,
                'error': f'Session creation error: {str(e)}'
            }

    def start_continuous_recognition(self, session: Dict[str, Any]) -> bool:
        """Start continuous recognition for the session"""
        try:
            if session.get('success'):
                recognizer = session['session']['recognizer']
                recognizer.start_continuous_recognition_async()
                session['session']['is_active'] = True
                logger.info("Continuous recognition started")
                return True
            return False
        except Exception as e:
            logger.error(f"Error starting continuous recognition: {str(e)}")
            return False

    def stop_continuous_recognition(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Stop continuous recognition and return results"""
        try:
            if session.get('success') and session['session']['is_active']:
                recognizer = session['session']['recognizer']
                recognizer.stop_continuous_recognition_async()
                session['session']['is_active'] = False
                session['session']['stop_event'].set()

                # Get results
                results = session['session']['results'].copy()
                combined_text = ' '.join([r['text'] for r in results])

                logger.info("Continuous recognition stopped")

                return {
                    'success': True,
                    'transcriptions': results,
                    'combined_text': combined_text,
                    'session_duration': time.time() - session['session']['start_time'],
                    'word_count': len(combined_text.split()) if combined_text else 0
                }
            return {'success': False, 'error': 'Session not active'}
        except Exception as e:
            logger.error(f"Error stopping continuous recognition: {str(e)}")
            return {'success': False, 'error': f'Stop error: {str(e)}'}

    def get_session_results_periodic(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Get current session results without stopping"""
        try:
            if session.get('success'):
                results = session['session']['results'].copy()
                combined_text = ' '.join([r['text'] for r in results])

                return {
                    'success': True,
                    'transcriptions': results,
                    'combined_text': combined_text,
                    'is_active': session['session']['is_active'],
                    'session_duration': time.time() - session['session']['start_time'],
                    'word_count': len(combined_text.split()) if combined_text else 0
                }
            return {'success': False, 'error': 'Invalid session'}
        except Exception as e:
            logger.error(f"Error getting session results: {str(e)}")
            return {'success': False, 'error': f'Results error: {str(e)}'}

    def convert_speech_to_text_from_file(self, audio_file_path: str, language: str = 'en-US') -> Dict[str, Any]:
        """
        Convert audio file to text - This works on both Windows and Linux
        """
        try:
            # Configure speech recognition
            self.speech_config.speech_recognition_language = language

            # Create audio configuration from file
            audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)

            # Create speech recognizer
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            # Results storage
            results = {
                'success': False,
                'transcriptions': [],
                'combined_text': '',
                'error': None,
                'file_path': audio_file_path,
                'language': language
            }

            # Event to track completion
            done = threading.Event()

            def recognized_cb(evt):
                """Callback for recognized speech"""
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    transcription = {
                        'text': evt.result.text,
                        'confidence': getattr(evt.result, 'confidence', 0.0),
                        'offset': evt.result.offset,
                        'duration': evt.result.duration
                    }
                    results['transcriptions'].append(transcription)
                    logger.info(f"File transcribed: {evt.result.text}")

            def canceled_cb(evt):
                """Callback for canceled recognition"""
                if evt.reason == speechsdk.CancellationReason.Error:
                    results['error'] = f"Recognition error: {evt.error_details}"
                done.set()

            def session_stopped_cb(evt):
                """Callback for session stopped"""
                done.set()

            # Connect callbacks
            speech_recognizer.recognized.connect(recognized_cb)
            speech_recognizer.canceled.connect(canceled_cb)
            speech_recognizer.session_stopped.connect(session_stopped_cb)

            # Start recognition
            logger.info(f"Processing file: {audio_file_path}")
            speech_recognizer.start_continuous_recognition()

            # Wait for completion (increased timeout for file processing)
            done.wait(timeout=300)  # 5 minutes max

            # Stop recognition
            speech_recognizer.stop_continuous_recognition()

            # Process results
            if results['transcriptions']:
                results['success'] = True
                results['combined_text'] = ' '.join([t['text'] for t in results['transcriptions']])
            elif not results['error']:
                results['error'] = 'No speech recognized in audio file'

            return results

        except Exception as e:
            logger.error(f"Error in file transcription: {str(e)}")
            return {
                'success': False,
                'transcriptions': [],
                'combined_text': '',
                'error': f'File transcription error: {str(e)}',
                'file_path': audio_file_path,
                'language': language
            }

    def convert_speech_to_text(self, audio_data: bytes, language: str = 'en-US') -> Dict[str, Any]:
        """
        Legacy method for basic speech-to-text from audio data
        """
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name

            # Use the file transcription method
            result = self.convert_speech_to_text_from_file(temp_file_path, language)

            # Clean up temporary file
            os.unlink(temp_file_path)

            # Convert to legacy format
            if result['success']:
                return {
                    'success': True,
                    'transcription': result['combined_text'],
                    'confidence': 0.8,  # Default confidence
                }
            else:
                return {
                    'success': False,
                    'transcription': '',
                    'confidence': 0.0,
                    'error': result.get('error', 'Unknown error')
                }

        except Exception as e:
            logger.error(f"Error in legacy speech-to-text: {str(e)}")
            return {
                'success': False,
                'transcription': '',
                'confidence': 0.0,
                'error': f'Speech recognition error: {str(e)}'
            }

    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages for speech recognition"""
        return [
            {'code': 'en-US', 'name': 'English (United States)'},
            {'code': 'en-GB', 'name': 'English (United Kingdom)'},
            {'code': 'en-IN', 'name': 'English (India)'},
            {'code': 'hi-IN', 'name': 'Hindi (India)'},
            {'code': 'es-ES', 'name': 'Spanish (Spain)'},
            {'code': 'fr-FR', 'name': 'French (France)'},
            {'code': 'de-DE', 'name': 'German (Germany)'},
            {'code': 'ja-JP', 'name': 'Japanese (Japan)'},
            {'code': 'ko-KR', 'name': 'Korean (Korea)'},
            {'code': 'zh-CN', 'name': 'Chinese (Mandarin, China)'},
            {'code': 'pt-BR', 'name': 'Portuguese (Brazil)'},
            {'code': 'ru-RU', 'name': 'Russian (Russia)'},
            {'code': 'ar-SA', 'name': 'Arabic (Saudi Arabia)'},
            {'code': 'it-IT', 'name': 'Italian (Italy)'},
            {'code': 'nl-NL', 'name': 'Dutch (Netherlands)'}
        ]

    def test_connection(self) -> Dict[str, Any]:
        """Test connection to Azure Speech Service"""
        try:
            # Create a simple speech config to test authentication
            test_config = speechsdk.SpeechConfig(
                subscription=self.subscription_key,
                endpoint=self.endpoint
            )

            return {
                'success': True,
                'endpoint': self.endpoint,
                'region': self.region,
                'platform': platform.system(),
                'message': 'Connection configuration successful'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'endpoint': self.endpoint,
                'region': self.region,
                'platform': platform.system()
            }