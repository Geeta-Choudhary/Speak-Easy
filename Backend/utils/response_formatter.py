from datetime import datetime
from typing import Dict, Any


class ResponseFormatter:
    """Utility class for formatting API responses consistently"""

    def __init__(self):
        pass

    def format_success_response(self, transcription_result: Dict[str, Any], filename: str = None) -> Dict[str, Any]:
        """
        Format successful speech-to-text response

        Args:
            transcription_result: Result from Azure Speech Service
            filename: Original filename of the audio file

        Returns:
            Formatted success response
        """
        response = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'data': {
                'transcription': transcription_result.get('transcription', ''),
                'confidence': transcription_result.get('confidence', 0.0),
                'language': transcription_result.get('language', 'unknown'),
                'duration': transcription_result.get('duration', 0),
                'alternatives': transcription_result.get('alternatives', [])
            },
            'metadata': {
                'filename': filename,
                'processing_status': 'completed'
            }
        }

        # Add error info if transcription was not successful
        if not transcription_result.get('success', True):
            response['data']['error'] = transcription_result.get('error', 'Unknown error')
            response['metadata']['processing_status'] = 'failed'

        return response

    def format_error_response(self, error_message: str, error_code: int = 500) -> Dict[str, Any]:
        """
        Format error response

        Args:
            error_message: Error message to return
            error_code: HTTP error code

        Returns:
            Formatted error response
        """
        return {
            'success': False,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'error': {
                'code': error_code,
                'message': error_message
            }
        }

    def format_validation_error_response(self, validation_errors: list) -> Dict[str, Any]:
        """
        Format validation error response

        Args:
            validation_errors: List of validation error messages

        Returns:
            Formatted validation error response
        """
        return {
            'success': False,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'error': {
                'code': 400,
                'message': 'Validation failed',
                'details': validation_errors
            }
        }

    def format_health_check_response(self, service_status: str = 'healthy') -> Dict[str, Any]:
        """
        Format health check response

        Args:
            service_status: Status of the service

        Returns:
            Formatted health check response
        """
        return {
            'success': True,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'service': 'Speech-to-Text API',
            'status': service_status,
            'version': '1.0.0'
        }