#!/bin/bash

# Install system dependencies for audio processing on Linux
echo "Installing system dependencies..."

# Update package list
apt-get update

# Install audio system libraries
apt-get install -y \
    libasound2 \
    libasound2-dev \
    alsa-utils \
    alsa-base \
    pulseaudio \
    libpulse-dev \
    libaudio-dev \
    libsndfile1 \
    libsndfile1-dev

echo "System dependencies installed successfully"

# Set environment variables for audio
export PULSE_RUNTIME_PATH=/tmp/pulse-socket
export ALSA_DEBUG=0

# Start the Flask application
echo "Starting Flask application..."
gunicorn --bind=0.0.0.0 --timeout 600 app:app