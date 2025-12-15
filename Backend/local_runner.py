"""
Usage example for the updated Azure Speech Service with Real-time Speech-to-Text
"""

import os
import time
import threading

from services.azure_speech_service import AzureSpeechService


# Set environment variables (you should set these in your system)
# os.environ['AZURE_SPEECH_KEY'] = ''
# os.environ['AZURE_SPEECH_REGION'] = ''


def example_simple_realtime_transcription():
    """Example: Simple real-time transcription for a fixed duration"""

    print("\n" + "="*60)
    print("SIMPLE REAL-TIME TRANSCRIPTION (10 seconds)")
    print("="*60)

    speech_service = AzureSpeechService()

    print("🎤 Starting 10-second real-time transcription...")
    print("   Speak now!")

    result = speech_service.convert_speech_to_text_simple_realtime(
        duration_seconds=20,
        language="en-US"
    )

    if result['success']:
        print("\n✅ Transcription Complete!")
        print(f"Combined Text: {result['combined_text']}")
        print(f"Total Segments: {len(result['transcriptions'])}")
        print("\nDetailed Results:")
        for i, transcription in enumerate(result['transcriptions'], 1):
            print(f"  {i}. {transcription['text']} (Confidence: {transcription['confidence']:.2f})")
    else:
        print(f"❌ Transcription failed: {result['error']}")


def example_continuous_realtime_transcription():
    """Example: Continuous real-time transcription with manual control"""

    print("\n" + "="*60)
    print("CONTINUOUS REAL-TIME TRANSCRIPTION")
    print("="*60)

    speech_service = AzureSpeechService()

    # Define callback functions for real-time feedback
    def on_transcribed(transcription_data):
        timestamp = time.strftime("%H:%M:%S", time.localtime(transcription_data['timestamp']))
        print(f"[{timestamp}] ✓ FINAL: {transcription_data['text']}")
        if transcription_data.get('speaker_id', 'Unknown') != 'Unknown':
            print(f"              👤 Speaker: {transcription_data['speaker_id']}")

    def on_transcribing(transcription_data):
        if transcription_data['text'].strip():  # Only show non-empty intermediate results
            timestamp = time.strftime("%H:%M:%S", time.localtime(transcription_data['timestamp']))
            print(f"[{timestamp}] ... {transcription_data['text']}")

    # Create real-time session
    print("🎤 Creating real-time transcription session...")
    session = speech_service.start_realtime_transcription_from_microphone(
        language="en-US",
        transcribed_callback=on_transcribed,
        transcribing_callback=on_transcribing,
        enable_diarization=True  # Set to False if you don't need speaker identification
    )

    if session['success']:
        print("✅ Session created successfully!")

        # Start continuous recognition
        if speech_service.start_continuous_recognition(session):
            print("🔴 Recording started! Speak now...")
            print("   Press Enter to stop recording")

            # Wait for user input to stop
            try:
                input()
            except KeyboardInterrupt:
                print("\n⏹️  Stopping due to keyboard interrupt...")

            # Stop transcription
            if speech_service.stop_continuous_recognition(session):
                print("⏹️  Recording stopped!")

                # Get all results
                all_results = speech_service.get_session_results(session)

                print(f"\n📊 Session Summary:")
                print(f"   Total transcriptions: {len(all_results)}")
                print(f"   Session ID: {session['session']['session_id']}")

                if all_results:
                    print("\n📝 Full Transcript:")
                    combined_text = ' '.join([r['text'] for r in all_results])
                    print(f"   {combined_text}")

                    # Show speaker breakdown if diarization was enabled
                    if session['session']['enable_diarization']:
                        speakers = set([r.get('speaker_id', 'Unknown') for r in all_results])
                        speakers.discard('Unknown')
                        if speakers:
                            print(f"\n👥 Speakers detected: {', '.join(speakers)}")

            else:
                print("❌ Failed to stop recording")
        else:
            print("❌ Failed to start recording")
    else:
        print(f"❌ Failed to create session: {session['error']}")


def example_realtime_transcription_without_diarization():
    """Example: Real-time transcription without speaker diarization (faster)"""

    print("\n" + "="*60)
    print("REAL-TIME TRANSCRIPTION (NO DIARIZATION)")
    print("="*60)

    speech_service = AzureSpeechService()

    # Define callback functions
    def on_transcribed(transcription_data):
        timestamp = time.strftime("%H:%M:%S", time.localtime(transcription_data['timestamp']))
        print(f"[{timestamp}] ✓ {transcription_data['text']}")

    def on_transcribing(transcription_data):
        if transcription_data['text'].strip():
            print(f"... {transcription_data['text']}")

    # Create session without diarization for better performance
    session = speech_service.start_realtime_transcription_from_microphone(
        language="en-US",
        transcribed_callback=on_transcribed,
        transcribing_callback=on_transcribing,
        enable_diarization=False  # Disabled for better performance
    )

    if session['success']:
        print("✅ Fast transcription session created!")

        if speech_service.start_continuous_recognition(session):
            print("🔴 Recording started! Speak now...")
            print("   Press Enter to stop")

            try:
                input()
            except KeyboardInterrupt:
                pass

            speech_service.stop_continuous_recognition(session)
            print("⏹️  Recording stopped!")

            # Get results
            results = speech_service.get_session_results(session)
            if results:
                combined_text = ' '.join([r['text'] for r in results])
                print(f"\n📝 Final transcript: {combined_text}")
        else:
            print("❌ Failed to start recording")
    else:
        print(f"❌ Session creation failed: {session['error']}")


def example_file_transcription_with_diarization():
    """Example: Transcribe audio file with speaker diarization"""

    print("\n" + "="*60)
    print("FILE TRANSCRIPTION WITH DIARIZATION")
    print("="*60)

    speech_service = AzureSpeechService()

    # You need to provide a valid audio file path
    audio_file_path = "test_rec_2.wav"  # Replace with actual path

    # Check if file exists
    if not os.path.exists(audio_file_path):
        print(f"❌ Audio file not found: {audio_file_path}")
        print("   Please provide a valid .wav file path")
        return

    # Define callback functions for real-time feedback during processing
    def on_transcribed(transcription_data):
        print(f"✓ FINAL: [{transcription_data['speaker_id']}] {transcription_data['text']}")

    def on_transcribing(transcription_data):
        print(f"... INTERIM: [{transcription_data['speaker_id']}] {transcription_data['text']}")

    print(f"🎵 Processing file: {audio_file_path}")

    # Transcribe with diarization
    result = speech_service.convert_speech_to_text_with_diarization(
        audio_file_path=audio_file_path,
        language="en-US",
        transcribed_callback=on_transcribed,
        transcribing_callback=on_transcribing
    )

    if result['success']:
        print("\n" + "="*50)
        print("TRANSCRIPTION COMPLETE")
        print("="*50)
        print(f"Total Speakers: {result['total_speakers']}")
        print(f"Speakers: {result['speakers']}")
        print(f"Session ID: {result['session_id']}")
        print("\nFull Transcription:")
        print(result['combined_transcription'])
        print("\nDetailed Results:")
        for i, transcription in enumerate(result['transcriptions'], 1):
            print(f"{i}. [{transcription['speaker_id']}]: {transcription['text']}")
    else:
        print(f"❌ Transcription failed: {result['error']}")


def example_test_microphone():
    """Example: Test microphone and connection"""

    print("\n" + "="*60)
    print("MICROPHONE AND CONNECTION TEST")
    print("="*60)

    speech_service = AzureSpeechService()

    # Test connection
    print("🔗 Testing Azure Speech Service connection...")
    connection_test = speech_service.test_connection()

    if connection_test['success']:
        print("✅ Connection test successful!")
        print(f"   Endpoint: {connection_test['endpoint']}")
        print(f"   Region: {connection_test['region']}")
    else:
        print("❌ Connection test failed!")
        print(f"   Error: {connection_test['error']}")
        return

    # Test microphone with a quick recording
    print("\n🎤 Testing microphone (3 seconds)...")
    print("   Say something now!")

    mic_test = speech_service.convert_speech_to_text_simple_realtime(
        duration_seconds=3,
        language="en-US"
    )

    if mic_test['success']:
        print("✅ Microphone test successful!")
        if mic_test['combined_text']:
            print(f"   You said: '{mic_test['combined_text']}'")
        else:
            print("   No speech detected (check microphone volume)")
    else:
        print("❌ Microphone test failed!")
        print(f"   Error: {mic_test['error']}")


def example_multilanguage_transcription():
    """Example: Real-time transcription in different languages"""

    print("\n" + "="*60)
    print("MULTI-LANGUAGE TRANSCRIPTION")
    print("="*60)

    speech_service = AzureSpeechService()

    # Show supported languages
    languages = speech_service.get_supported_languages()
    print("Supported Languages:")
    for i, lang in enumerate(languages[:5], 1):  # Show first 5
        print(f"  {i}. {lang['name']} ({lang['code']})")
    print("  ... and more")

    # Example with Hindi
    print("\n🇮🇳 Hindi Transcription Example (5 seconds)")
    print("   बोलना शुरू करें (Start speaking in Hindi)...")

    def on_transcribed_hindi(transcription_data):
        print(f"✓ Hindi: {transcription_data['text']}")

    session = speech_service.start_realtime_transcription_from_microphone(
        language="hi-IN",
        transcribed_callback=on_transcribed_hindi,
        enable_diarization=False
    )

    if session['success']:
        if speech_service.start_continuous_recognition(session):
            time.sleep(5)  # Record for 5 seconds
            speech_service.stop_continuous_recognition(session)

            results = speech_service.get_session_results(session)
            if results:
                combined = ' '.join([r['text'] for r in results])
                print(f"📝 Hindi transcript: {combined}")
            else:
                print("   No Hindi speech detected")
        else:
            print("❌ Failed to start Hindi recording")
    else:
        print(f"❌ Hindi session failed: {session['error']}")


def example_session_monitoring():
    """Example: Monitor transcription session with statistics"""

    print("\n" + "="*60)
    print("SESSION MONITORING WITH STATISTICS")
    print("="*60)

    speech_service = AzureSpeechService()

    # Statistics tracking
    stats = {
        'start_time': time.time(),
        'word_count': 0,
        'segment_count': 0,
        'speakers': set(),
        'last_activity': time.time()
    }

    def on_transcribed_with_stats(transcription_data):
        stats['segment_count'] += 1
        stats['word_count'] += len(transcription_data['text'].split())
        stats['speakers'].add(transcription_data.get('speaker_id', 'Unknown'))
        stats['last_activity'] = time.time()

        duration = time.time() - stats['start_time']
        words_per_minute = (stats['word_count'] / duration * 60) if duration > 0 else 0

        print(f"✓ [{transcription_data.get('speaker_id', 'Speaker')}]: {transcription_data['text']}")
        print(f"   📊 Stats: {stats['segment_count']} segments, {stats['word_count']} words, "
              f"{words_per_minute:.1f} WPM, {len(stats['speakers'])} speakers")

    def on_transcribing_with_stats(transcription_data):
        if transcription_data['text'].strip():
            silence_duration = time.time() - stats['last_activity']
            if silence_duration > 2:  # Show silence duration if > 2 seconds
                print(f"   🔇 {silence_duration:.1f}s silence")
            print(f"... {transcription_data['text']}")

    session = speech_service.start_realtime_transcription_from_microphone(
        language="en-US",
        transcribed_callback=on_transcribed_with_stats,
        transcribing_callback=on_transcribing_with_stats,
        enable_diarization=True
    )

    if session['success']:
        print("📊 Session monitoring started!")
        print("   Speak naturally... Press Enter to stop")

        if speech_service.start_continuous_recognition(session):
            # Monitor session in a separate thread
            def monitor_session():
                while speech_service.is_session_active(session):
                    time.sleep(5)  # Check every 5 seconds
                    duration = time.time() - stats['start_time']
                    if duration > 10:  # Show periodic stats after 10 seconds
                        print(f"\n⏱️  Session running for {duration:.0f}s - "
                              f"Words: {stats['word_count']}, Segments: {stats['segment_count']}")

            monitor_thread = threading.Thread(target=monitor_session)
            monitor_thread.daemon = True
            monitor_thread.start()

            try:
                input()
            except KeyboardInterrupt:
                pass

            speech_service.stop_continuous_recognition(session)

            # Final statistics
            total_duration = time.time() - stats['start_time']
            print(f"\n📈 FINAL STATISTICS:")
            print(f"   Duration: {total_duration:.1f} seconds")
            print(f"   Segments: {stats['segment_count']}")
            print(f"   Words: {stats['word_count']}")
            print(f"   WPM: {(stats['word_count'] / total_duration * 60):.1f}")
            print(f"   Speakers: {len(stats['speakers'])}")
            if len(stats['speakers']) > 1:
                print(f"   Speaker IDs: {', '.join(stats['speakers'])}")
        else:
            print("❌ Failed to start monitored session")
    else:
        print(f"❌ Monitoring session failed: {session['error']}")


def main_menu():
    """Main menu for testing different features"""

    print("\n" + "="*60)
    print("AZURE SPEECH SERVICE - REAL-TIME TRANSCRIPTION EXAMPLES")
    print("="*60)

    options = [
        ("1", "Test Connection & Microphone", example_test_microphone),
        ("2", "Simple Real-time (10 seconds)", example_simple_realtime_transcription),
        ("3", "Continuous Real-time with Diarization", example_continuous_realtime_transcription),
        ("4", "Fast Real-time (No Diarization)", example_realtime_transcription_without_diarization),
        ("5", "Multi-language Transcription", example_multilanguage_transcription),
        ("6", "Session Monitoring", example_session_monitoring),
        ("7", "File Transcription with Diarization", example_file_transcription_with_diarization),
        ("0", "Exit", None)
    ]

    while True:
        print("\nChoose an example to run:")
        for option, description, _ in options:
            print(f"  {option}. {description}")

        try:
            choice = input("\nEnter choice (0-7): ").strip()

            if choice == "0":
                print("👋 Goodbye!")
                break

            # Find and execute the chosen option
            for option, description, func in options:
                if choice == option and func:
                    try:
                        func()
                    except KeyboardInterrupt:
                        print("\n⏹️  Example interrupted by user")
                    except Exception as e:
                        print(f"❌ Error running example: {str(e)}")
                    break
            else:
                print("❌ Invalid choice. Please try again.")

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    # Check environment variables
    if not os.getenv('AZURE_SPEECH_KEY'):
        print("❌ AZURE_SPEECH_KEY environment variable not set!")
        print("   Set it with: export AZURE_SPEECH_KEY='your-key-here'")
        print("   Or in Windows: set AZURE_SPEECH_KEY=your-key-here")
        exit(1)

    if not os.getenv('AZURE_SPEECH_REGION'):
        print("⚠️  AZURE_SPEECH_REGION not set, using default: centralindia")
        os.environ['AZURE_SPEECH_REGION'] = 'centralindia'

    # Configure logging
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Run main menu
    main_menu()