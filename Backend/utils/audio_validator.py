import os
import logging
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)


class AudioValidator:
    """Utility class for validating audio files"""

    # Supported audio file extensions
    SUPPORTED_EXTENSIONS = {'.wav', '.mp3', '.m4a', '.flac', '.ogg', '.webm'}

    # Maximum file size (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes

    def __init__(self):
        pass

    def is_valid_audio_file(self, file: FileStorage) -> bool:
        """
        Validate if the uploaded file is a supported audio format

        Args:
            file: Uploaded file object

        Returns:
            True if valid audio file, False otherwise
        """
        if not file or not file.filename:
            logger.warning("No file or filename provided")
            return False

        # Check file extension
        file_extension = os.path.splitext(file.filename.lower())[1]

        if file_extension not in self.SUPPORTED_EXTENSIONS:
            logger.warning(f"Unsupported file extension: {file_extension}")
            return False

        return True

    def is_valid_audio_size(self, audio_data: bytes) -> bool:
        """
        Validate if the audio file size is within limits

        Args:
            audio_data: Audio file data in bytes

        Returns:
            True if size is valid, False otherwise
        """
        file_size = len(audio_data)

        if file_size == 0:
            logger.warning("Empty audio file")
            return False

        if file_size > self.MAX_FILE_SIZE:
            logger.warning(f"File size {file_size} exceeds maximum {self.MAX_FILE_SIZE}")
            return False

        logger.info(f"Audio file size: {file_size} bytes")
        return True

    def get_file_info(self, file: FileStorage, audio_data: bytes = None) -> dict:
        """
        Get information about the uploaded audio file

        Args:
            file: Uploaded file object
            audio_data: Optional audio data for size calculation

        Returns:
            Dictionary containing file information
        """
        file_info = {
            'filename': file.filename if file else 'Unknown',
            'content_type': file.content_type if file else 'Unknown',
            'extension': os.path.splitext(file.filename.lower())[1] if file and file.filename else 'Unknown'
        }

        if audio_data:
            file_info['size_bytes'] = len(audio_data)
            file_info['size_mb'] = round(len(audio_data) / (1024 * 1024), 2)

        return file_info

    @classmethod
    def get_supported_formats(cls) -> list:
        """
        Get list of supported audio formats

        Returns:
            List of supported file extensions
        """
        return list(cls.SUPPORTED_EXTENSIONS)

    @classmethod
    def get_max_file_size_mb(cls) -> float:
        """
        Get maximum file size in MB

        Returns:
            Maximum file size in megabytes
        """
        return cls.MAX_FILE_SIZE / (1024 * 1024)